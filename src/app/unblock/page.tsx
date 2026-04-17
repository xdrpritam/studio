"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, ArrowRight, CheckCircle2, Wifi, Tablet, Tag, CreditCard, Clock, Lock, Loader2, AlertCircle, LayoutDashboard, DatabaseZap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { doc, collection, query, where, getDocs, collectionGroup } from 'firebase/firestore';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

const formSchema = z.object({
  macAddress: z.string().regex(macRegex, { message: "Invalid MAC Address format (XX:XX:XX:XX:XX:XX)" }),
  deviceName: z.string().min(2, { message: "Device name required" }),
  wifiProvider: z.enum(['Jio', 'Airtel', 'BSNL']),
  ssid: z.string().min(1, { message: "WiFi name (SSID) required" }),
  plan: z.enum(['trial', 'paid']),
});

export default function UnblockPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);

  // 1. Fetch user profile to check trial history
  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  // 2. Check for active requests to enforce one-at-a-time rule for the current user
  const requestsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'unblockRequests');
  }, [user, db]);

  const { data: requestsData, isLoading: isRequestsLoading } = useCollection(requestsQuery);
  
  const hasActiveRequest = useMemo(() => {
    return requestsData && requestsData.some(r => r.status === 'Pending' || r.status === 'Unblocked');
  }, [requestsData]);

  const hasUsedTrial = userProfile?.hasUsedTrial === true;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      macAddress: '',
      deviceName: '',
      wifiProvider: 'Jio',
      ssid: '',
      plan: 'paid', // Default to paid, trial becomes option if available
    },
  });

  // Sync plan choice with trial eligibility using useEffect to avoid render-phase state updates
  useEffect(() => {
    if (!isProfileLoading && !hasUsedTrial) {
      form.setValue('plan', 'trial');
    } else {
      form.setValue('plan', 'paid');
    }
  }, [hasUsedTrial, isProfileLoading, form]);

  const formatMacAddress = (value: string) => {
    const hexOnly = value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 12);
    const groups = hexOnly.match(/.{1,2}/g);
    return groups ? groups.join(':').toUpperCase() : hexOnly.toUpperCase();
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please login to submit an unblock request.",
      });
      router.push('/login');
      return;
    }

    if (hasActiveRequest) {
      toast({
        variant: "destructive",
        title: "Request Limit Reached",
        description: "You already have an active unblock request. Please manage it from your dashboard.",
      });
      return;
    }

    setLoading(true);

    try {
      const macToCheck = values.macAddress.toUpperCase();

      // 1. GLOBAL DUPLICATE MAC CHECK (Using Firestore collectionGroup)
      const globalMacQuery = query(
        collectionGroup(db, 'unblockRequests'),
        where('macAddress', '==', macToCheck),
        where('status', 'in', ['Pending', 'Unblocked'])
      );
      
      const macSnap = await getDocs(globalMacQuery);
      
      if (!macSnap.empty) {
        toast({
          variant: "destructive",
          title: "Registration Error",
          description: "This MAC address is already registered in an active session.",
        });
        setLoading(false);
        return;
      }

      // 2. GLOBAL TRIAL CHECK for the specific MAC address
      if (values.plan === 'trial') {
        const globalTrialQuery = query(
          collectionGroup(db, 'unblockRequests'),
          where('macAddress', '==', macToCheck),
          where('subscriptionId', '==', 'FREE_TRIAL')
        );
        const trialSnap = await getDocs(globalTrialQuery);
        if (!trialSnap.empty) {
          toast({
            variant: "destructive",
            title: "Hardware Conflict",
            description: "This device hardware has already utilized a trial. Please upgrade to Premium.",
          });
          setLoading(false);
          return;
        }

        // Check if the current user has used a trial (safety fallback)
        if (hasUsedTrial) {
          toast({
            variant: "destructive",
            title: "Trial Limit",
            description: "Your account has already utilized its free trial.",
          });
          setLoading(false);
          return;
        }
      }

      // If all checks pass, proceed with creation
      const requestId = `REQ_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const requestRef = doc(db, 'users', user.uid, 'unblockRequests', requestId);

      const trialDurationMs = 60 * 60 * 1000;
      const paidDurationMs = 30 * 24 * 60 * 60 * 1000;

      const expiresAt = values.plan === 'trial' 
        ? new Date(Date.now() + trialDurationMs).toISOString() 
        : new Date(Date.now() + paidDurationMs).toISOString();

      const initialStatus = values.plan === 'trial' ? 'Unblocked' : 'Pending';

      // Update user trial status in profile
      if (values.plan === 'trial') {
        updateDocumentNonBlocking(doc(db, 'users', user.uid), {
          hasUsedTrial: true,
          updatedAt: new Date().toISOString()
        });
      }

      setDocumentNonBlocking(requestRef, {
        id: requestId,
        userId: user.uid,
        subscriptionId: values.plan === 'trial' ? 'FREE_TRIAL' : 'PREMIUM',
        macAddress: macToCheck,
        deviceName: values.deviceName,
        wifiProvider: values.wifiProvider,
        wifiName: values.ssid,
        status: initialStatus,
        requestDate: new Date().toISOString(),
        expirationDate: expiresAt,
      }, { merge: true });

      setTimeout(() => {
        setLoading(false);
        if (values.plan === 'paid') {
          router.push(`/payment?requestId=${requestId}`);
        } else {
          toast({
            title: "Trial Activated!",
            description: "Your 1-hour trial session has been initialized.",
          });
          router.push('/dashboard');
        }
      }, 1000);

    } catch (error: any) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "System Error",
        description: "Could not verify hardware status. Please check your connection.",
      });
    }
  }

  if (isUserLoading || isRequestsLoading || isProfileLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse font-bold text-xs uppercase tracking-widest">Accessing Infrastructure...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <Card className="max-w-md mx-auto glass-morphism border-white/10 p-8 space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-headline">Authentication Required</h1>
            <p className="text-muted-foreground">Please log in to submit an unblock request.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/login" className="w-full">
              <Button size="lg" className="w-full h-14 text-lg font-bold rounded-xl neon-glow">
                Login
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (hasActiveRequest) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <Card className="max-w-xl mx-auto glass-morphism border-primary/20 p-12 space-y-8">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto neon-glow">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black font-headline tracking-tighter">Active Session</h1>
            <p className="text-muted-foreground text-lg">You already have an active unblock request. You can manage it or upgrade to premium from your dashboard.</p>
          </div>
          <div className="pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="h-16 px-12 text-xl font-black rounded-2xl neon-glow w-full flex items-center justify-center gap-3">
                <LayoutDashboard className="w-6 h-6" /> Go to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Unblock <span className="text-primary neon-text">Request</span></h1>
          <p className="text-muted-foreground">Submit your device details for network reinstatement.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="glass-morphism border-white/10">
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="macAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-primary" /> MAC Address
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="00:1A:2B:3C:4D:5E" 
                                {...field} 
                                onChange={(e) => {
                                  const formatted = formatMacAddress(e.target.value);
                                  field.onChange(formatted);
                                }}
                                className="bg-background/50 border-white/10 font-mono" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deviceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Tablet className="w-4 h-4 text-primary" /> Device Name
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. iPhone 15 Pro" {...field} className="bg-background/50 border-white/10" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="wifiProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Wifi className="w-4 h-4 text-primary" /> Provider
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50 border-white/10">
                                  <SelectValue placeholder="Select Provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Jio">Jio Fiber</SelectItem>
                                <SelectItem value="Airtel">Airtel Xstream</SelectItem>
                                <SelectItem value="BSNL">BSNL Bharat Fiber</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ssid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-primary" /> WiFi SSID
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. JioFiber_Home" {...field} className="bg-background/50 border-white/10" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="plan"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-primary" /> Selection Plan
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              <FormItem>
                                <FormControl>
                                  <RadioGroupItem value="trial" disabled={hasUsedTrial} className="sr-only" />
                                </FormControl>
                                <FormLabel className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${hasUsedTrial ? 'opacity-50 grayscale cursor-not-allowed' : (field.value === 'trial' ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5 hover:border-white/20')}`}>
                                  {hasUsedTrial && (
                                    <div className="absolute top-2 right-2 text-[8px] font-bold text-muted-foreground uppercase">Used</div>
                                  )}
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-sm">Free Trial</span>
                                    {field.value === 'trial' && !hasUsedTrial && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                  </div>
                                  <span className="text-muted-foreground text-[10px]">1 Hour Access</span>
                                  <span className="mt-2 font-headline font-bold text-lg">₹0</span>
                                </FormLabel>
                              </FormItem>

                              <FormItem>
                                <FormControl>
                                  <RadioGroupItem value="paid" className="sr-only" />
                                </FormControl>
                                <FormLabel className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${field.value === 'paid' ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-sm">Premium Plan</span>
                                    {field.value === 'paid' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                  </div>
                                  <span className="text-muted-foreground text-[10px]">30 Days Access</span>
                                  <span className="mt-2 font-headline font-bold text-lg">₹100</span>
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold neon-glow rounded-xl" disabled={loading}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (form.watch('plan') === 'trial' ? "Initialize Trial" : "Proceed to Premium")}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-morphism border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" /> Fair Use Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-4 text-muted-foreground leading-relaxed">
                <p>To ensure network availability for all users, hardware IDs are globally monitored via infrastructure logs.</p>
                <div className="flex gap-3 pt-2">
                   <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                   <p className="italic">A MAC address already registered in an active session or a previous trial cannot be resubmitted. Database verification is performed before each task.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

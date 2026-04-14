
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, ArrowRight, CheckCircle2, Wifi, Tablet, Tag, CreditCard, Clock, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      macAddress: '',
      deviceName: '',
      wifiProvider: 'Jio',
      ssid: '',
      plan: 'trial',
    },
  });

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

    setLoading(true);
    
    const requestId = `REQ_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const requestRef = doc(db, 'users', user.uid, 'unblockRequests', requestId);

    // Trial is set to exactly 1 hour (60 minutes)
    const trialDurationMs = 60 * 60 * 1000;
    const paidDurationMs = 30 * 24 * 60 * 60 * 1000;

    const expiresAt = values.plan === 'trial' 
      ? new Date(Date.now() + trialDurationMs).toISOString() 
      : new Date(Date.now() + paidDurationMs).toISOString();

    const initialStatus = values.plan === 'trial' ? 'Unblocked' : 'Pending';

    setDocumentNonBlocking(requestRef, {
      id: requestId,
      userId: user.uid,
      subscriptionId: values.plan === 'trial' ? 'FREE_TRIAL' : 'PREMIUM',
      macAddress: values.macAddress,
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
          description: "Your 1-hour free trial has started. Redirecting to dashboard...",
        });
        router.push('/dashboard');
      }
    }, 1500);
  }

  if (isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            <p className="text-muted-foreground">You must be logged in to submit an unblock request. This ensures your connection is securely managed.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/login" className="w-full">
              <Button size="lg" className="w-full h-14 text-lg font-bold rounded-xl neon-glow">
                Login to Continue
              </Button>
            </Link>
            <Link href="/signup" className="w-full">
              <Button variant="outline" size="lg" className="w-full h-14 text-lg font-bold rounded-xl border-white/10 bg-white/5">
                Create an Account
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Unblock Request</h1>
          <p className="text-muted-foreground">Fill in the details below to initialize the unblocking process.</p>
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
                            <FormDescription className="text-xs">Physical address of your device.</FormDescription>
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
                              <Input placeholder="iPhone 15 Pro" {...field} className="bg-background/50 border-white/10" />
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
                              <Wifi className="w-4 h-4 text-primary" /> WiFi Provider
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50 border-white/10">
                                  <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Jio">Jio Fiber</SelectItem>
                                <SelectItem value="Airtel">Airtel Xstream</SelectItem>
                                <SelectItem value="BSNL">BSNL Bharat AirFiber</SelectItem>
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
                              <Tag className="w-4 h-4 text-primary" /> WiFi Name (SSID)
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="My_Home_WiFi" {...field} className="bg-background/50 border-white/10" />
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
                            <CreditCard className="w-4 h-4 text-primary" /> Select Plan
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              <FormItem>
                                <FormControl>
                                  <RadioGroupItem value="trial" className="sr-only" />
                                </FormControl>
                                <FormLabel className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${field.value === 'trial' ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-lg">Free Trial</span>
                                    {field.value === 'trial' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                  </div>
                                  <span className="text-muted-foreground text-sm">1 hour access</span>
                                  <span className="mt-4 font-headline font-bold text-xl">₹0</span>
                                </FormLabel>
                              </FormItem>

                              <FormItem>
                                <FormControl>
                                  <RadioGroupItem value="paid" className="sr-only" />
                                </FormControl>
                                <FormLabel className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${field.value === 'paid' ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-lg">Premium Plan</span>
                                    {field.value === 'paid' && <CheckCircle2 className="font-bold text-primary" />}
                                  </div>
                                  <span className="text-muted-foreground text-sm">30 days full access</span>
                                  <span className="mt-4 font-headline font-bold text-xl">₹100</span>
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold neon-glow rounded-xl" disabled={loading}>
                      {loading ? "Processing..." : (form.watch('plan') === 'trial' ? "Start Free Trial" : "Proceed to Payment")}
                      {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-morphism border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Security Check</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4 text-muted-foreground">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-primary shrink-0" />
                  <p>Our backend validates your MAC address format and verifies the connection with the selected provider.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

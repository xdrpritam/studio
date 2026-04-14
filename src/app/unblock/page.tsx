
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, ArrowRight, CheckCircle2, Wifi, Tablet, Tag, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    // Simulate API storage and processing
    setTimeout(() => {
      // Save to local storage for persistence in this demo
      const requestData = {
        ...values,
        id: Math.random().toString(36).substr(2, 9),
        status: 'Processing',
        createdAt: new Date().toISOString(),
        expiresAt: values.plan === 'trial' 
          ? new Date(Date.now() + 15 * 60000).toISOString() 
          : new Date(Date.now() + 30 * 24 * 60 * 60000).toISOString(),
      };
      
      localStorage.setItem('unmac_active_request', JSON.stringify(requestData));

      setLoading(false);
      
      if (values.plan === 'paid') {
        router.push('/payment');
      } else {
        toast({
          title: "Trial Activated!",
          description: "Your 15-minute trial has started. Redirecting to dashboard...",
        });
        router.push('/dashboard');
      }
    }, 1500);
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
                              <Input placeholder="00:1A:2B:3C:4D:5E" {...field} className="bg-background/50 border-white/10" />
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
                                  <span className="text-muted-foreground text-sm">15 minutes access</span>
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
                                    {field.value === 'paid' && <CheckCircle2 className="w-5 h-5 text-primary" />}
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
                <div className="flex gap-3">
                  <Wifi className="w-5 h-5 text-secondary shrink-0" />
                  <p>Disclaimer: This service works only with supported networks: Jio, Airtel, and BSNL.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Trial Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>The free trial provides 15 minutes of unblocked access for a single device. After the trial expires, you must upgrade to a premium plan to continue using the service.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

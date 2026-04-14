
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ShieldCheck, ArrowRight, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentPage() {
  const router = useRouter();
  const [step, setStep] = useState<'paying' | 'success'>('paying');

  useEffect(() => {
    // Simulate payment processing time
    if (step === 'paying') {
      const timer = setTimeout(() => {
        setStep('success');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-md mx-auto">
        {step === 'paying' ? (
          <Card className="glass-morphism border-white/10 text-center py-12">
            <CardContent className="space-y-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <Loader2 className="w-16 h-16 text-primary animate-spin relative" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Processing Payment</h1>
                <p className="text-muted-foreground">Initializing secure transaction via UPI/Gateway...</p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-secondary" />
                <span>PCI-DSS Compliant Encryption</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-morphism border-primary/20 text-center py-12 animate-in zoom-in duration-500">
            <CardContent className="space-y-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl" />
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center relative neon-glow">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold font-headline">Payment Successful!</h1>
                <p className="text-muted-foreground">Your premium plan (₹100/mo) is now active.</p>
              </div>
              
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 text-left">
                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-primary">#UNM_{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-bold">₹100.00</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Validity</span>
                  <span className="font-bold">30 Days</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-6">
              <Link href="/dashboard" className="w-full">
                <Button size="lg" className="w-full neon-glow rounded-xl h-14 font-bold text-lg">
                  Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

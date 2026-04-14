
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ShieldCheck, ArrowRight, Loader2, Smartphone, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Image from 'next/image';

export default function PaymentPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const [step, setStep] = useState<'paying' | 'success'>('paying');
  const [transactionId, setTransactionId] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleVerify = () => {
    if (transactionId.length < 8) return;
    setIsValidating(true);
    
    // Simulate payment validation logic
    setTimeout(() => {
      if (user) {
        const paymentId = `PAY_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const paymentRef = doc(db, 'users', user.uid, 'payments', paymentId);
        
        setDocumentNonBlocking(paymentRef, {
          id: paymentId,
          userId: user.uid,
          subscriptionId: 'SUB_PREMIUM_MONTHLY',
          amount: 100,
          currency: 'INR',
          paymentDate: new Date().toISOString(),
          status: 'Completed',
          paymentMethod: 'UPI',
          transactionId: transactionId,
          upiApp: 'PhonePe',
        }, { merge: true });

        // Update user subscription (Simplified for MVP)
        const subRef = doc(db, 'users', user.uid, 'subscriptions', 'active_subscription');
        setDocumentNonBlocking(subRef, {
          id: 'active_subscription',
          userId: user.uid,
          planType: 'PaidMonthly',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60000).toISOString(),
          status: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      setIsValidating(false);
      setStep('success');
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-2xl mx-auto">
        {step === 'paying' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-morphism border-white/10 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <CardTitle className="text-xl flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" /> PhonePe UPI Scanner
              </CardTitle>
              <div className="relative w-full aspect-square bg-white rounded-2xl p-4 shadow-xl">
                <Image 
                  src="https://picsum.photos/seed/phonepe-qr/400/400" 
                  alt="UPI QR Code" 
                  fill
                  className="object-contain p-2"
                  data-ai-hint="QR code"
                />
              </div>
              <p className="text-sm text-muted-foreground">Scan this code using PhonePe App to pay ₹100</p>
              <div className="flex items-center gap-2 text-xs font-bold text-secondary">
                <ShieldCheck className="w-4 h-4" /> Secure Merchant Payment
              </div>
            </Card>

            <Card className="glass-morphism border-white/10 p-8 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Verify Payment</h2>
                <p className="text-sm text-muted-foreground">Enter the 12-digit UPI Transaction ID from PhonePe after successful payment.</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Transaction ID (UTR)</label>
                  <Input 
                    placeholder="Enter UTR Number" 
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="bg-background/50 border-white/10 h-12 font-mono"
                  />
                </div>
                <Button 
                  onClick={handleVerify} 
                  disabled={isValidating || transactionId.length < 8} 
                  className="w-full h-12 font-bold neon-glow"
                >
                  {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Activate"}
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs space-y-2">
                <p className="font-bold text-primary">Only PhonePe is Supported</p>
                <p className="text-muted-foreground">Ensure you use the PhonePe app for this transaction to avoid verification delays.</p>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="glass-morphism border-primary/20 text-center py-12 animate-in zoom-in duration-500 max-w-md mx-auto">
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
                  <span className="font-mono text-primary truncate ml-4">{transactionId}</span>
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

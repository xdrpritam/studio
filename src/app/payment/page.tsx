
"use client";

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck, ArrowRight, Loader2, Smartphone, AlertTriangle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const [step, setStep] = useState<'paying' | 'success'>('paying');
  const [transactionId, setTransactionId] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const requestId = searchParams.get('requestId');
  const qrImage = PlaceHolderImages.find(img => img.id === 'payment-qr');

  const handleVerify = () => {
    // 12-digit UPI transaction ID (UTR) validation
    if (transactionId.length !== 12 || !/^\d+$/.test(transactionId)) {
      return;
    }

    setIsValidating(true);
    
    // Simulate payment validation logic
    setTimeout(() => {
      if (user) {
        const paymentId = `PAY_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const paymentRef = doc(db, 'users', user.uid, 'payments', paymentId);
        
        // Save payment record
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
          upiApp: 'Paytm',
        }, { merge: true });

        // Update user subscription
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

        // Update the original request status to "Unblocked"
        if (requestId) {
          const requestRef = doc(db, 'users', user.uid, 'unblockRequests', requestId);
          updateDocumentNonBlocking(requestRef, {
            status: 'Unblocked',
            unblockedAt: new Date().toISOString()
          });
        }
      }

      setIsValidating(false);
      setStep('success');
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-4xl mx-auto">
        {step === 'paying' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card className="glass-morphism border-white/10 overflow-hidden">
              <div className="bg-[#00BAF2] p-4 text-center">
                <p className="text-white font-black tracking-tighter text-xl uppercase italic">Paytm</p>
                <p className="text-white/80 text-[10px] font-bold tracking-widest uppercase">Accepted Here</p>
              </div>
              <CardContent className="p-8 flex flex-col items-center space-y-6">
                <div className="relative w-full aspect-square bg-white rounded-2xl p-4 shadow-2xl border-4 border-white">
                  <Image 
                    src={qrImage?.imageUrl || "https://picsum.photos/seed/paytm-qr/400/400"} 
                    alt={qrImage?.description || "Paytm UPI QR Code"} 
                    width={400}
                    height={400}
                    className="object-contain p-2 w-full h-full"
                    data-ai-hint={qrImage?.imageHint || "Paytm QR"}
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase">UPI ID</p>
                  <p className="font-mono text-sm font-bold text-primary">paytmqr6u6kg9@ptys</p>
                </div>
                <div className="flex items-center gap-6 grayscale opacity-50">
                   <span className="font-black italic text-lg tracking-tighter">BHIM</span>
                   <span className="font-black italic text-lg tracking-tighter">UPI</span>
                </div>
              </CardContent>
              <div className="bg-white/5 p-3 text-center border-t border-white/10">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Secure Merchant Payment</p>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="glass-morphism border-white/10 p-8">
                <div className="space-y-2 mb-8">
                  <h2 className="text-3xl font-black font-headline">Verify <span className="text-primary">Payment</span></h2>
                  <p className="text-sm text-muted-foreground">Scan with any UPI app and enter the 12-digit UTR number below.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary">UTR Number (12 Digits)</label>
                      <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-1 rounded">{transactionId.length}/12</span>
                    </div>
                    <Input 
                      placeholder="0000 0000 0000" 
                      value={transactionId}
                      maxLength={12}
                      onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ''))}
                      className="bg-background/50 border-white/10 h-16 font-mono text-center text-2xl tracking-[0.2em] focus:border-primary transition-all rounded-xl"
                    />
                  </div>
                  <Button 
                    onClick={handleVerify} 
                    disabled={isValidating || transactionId.length !== 12} 
                    className="w-full h-16 text-lg font-black rounded-xl neon-glow uppercase tracking-widest"
                  >
                    {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Activate"}
                  </Button>
                </div>
              </Card>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">Important</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Please ensure you provide the correct UTR (Unique Transaction Reference) number found in your app's payment history. Manual verification may take up to 24 hours if the UTR is incorrect.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Card className="glass-morphism border-primary/20 text-center py-16 animate-in zoom-in duration-500 max-w-md mx-auto">
            <CardContent className="space-y-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl" />
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center relative neon-glow">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-black font-headline tracking-tight">Payment <span className="text-primary">Success!</span></h1>
                <p className="text-muted-foreground font-medium">Premium Plan Activated (₹100/mo)</p>
              </div>
              
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 text-left">
                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-4">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest">UTR Reference</span>
                  <span className="font-mono text-primary font-bold">{transactionId}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-4">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest">Status</span>
                  <span className="text-secondary font-black tracking-widest uppercase">Confirmed</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest">Validity</span>
                  <span className="font-bold">30 Days (Premium)</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-8">
              <Link href="/dashboard" className="w-full">
                <Button size="lg" className="w-full neon-glow rounded-xl h-16 font-black text-xl uppercase tracking-widest">
                  Open Dashboard <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-32 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
      <PaymentContent />
    </Suspense>
  );
}

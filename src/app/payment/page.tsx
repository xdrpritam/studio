
"use client";

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck, ArrowRight, Loader2, Smartphone, AlertTriangle, CreditCard, Copy, Info, Ticket, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { toast } from '@/hooks/use-toast';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const [step, setStep] = useState<'paying' | 'success'>('paying');
  const [transactionId, setTransactionId] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const requestId = searchParams.get('requestId');
  const qrImage = PlaceHolderImages.find(img => img.id === 'payment-qr');

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('paytmqr6u6kg9@ptys');
    toast({
      title: "Copied!",
      description: "UPI ID copied to clipboard.",
    });
  };

  const savePaymentRecord = (method: 'UPI' | 'VOUCHER', refId: string, isInstant: boolean) => {
    if (!user) return;

    const paymentId = `PAY_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const paymentRef = doc(db, 'users', user.uid, 'payments', paymentId);
    
    // Save payment record
    setDocumentNonBlocking(paymentRef, {
      id: paymentId,
      userId: user.uid,
      requestId: requestId,
      subscriptionId: 'SUB_PREMIUM_MONTHLY',
      amount: method === 'UPI' ? 100 : 0,
      currency: 'INR',
      paymentDate: new Date().toISOString(),
      status: isInstant ? 'Completed' : 'Pending',
      paymentMethod: method,
      transactionId: refId,
      upiApp: method === 'UPI' ? 'Verified_Scanner' : 'Voucher_Redeem',
    }, { merge: true });

    if (isInstant) {
      // Update user subscription immediately ONLY for vouchers
      const subRef = doc(db, 'users', user.uid, 'subscriptions', 'active_subscription');
      setDocumentNonBlocking(subRef, {
        id: 'active_subscription',
        userId: user.uid,
        planType: 'PaidMonthly',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
      setStep('success');
    } else {
      // For UPI, we tell them it's submitted but NOT yet active
      toast({
        title: "UTR Submitted",
        description: "Your payment is being verified by admin. Access will be granted shortly.",
      });
      setTimeout(() => router.push('/dashboard'), 2500);
    }
  };

  const handleVerify = () => {
    if (transactionId.length !== 12 || !/^\d+$/.test(transactionId)) {
      toast({
        variant: "destructive",
        title: "Invalid UTR",
        description: "Please enter a valid 12-digit UPI transaction number.",
      });
      return;
    }

    setIsValidating(true);
    // Simulate UTR submission
    setTimeout(() => {
      savePaymentRecord('UPI', transactionId, false);
      setIsValidating(false);
    }, 2000);
  };

  const handleRedeem = async () => {
    const codeToRedeem = redeemCode.toUpperCase().trim();
    if (!codeToRedeem || codeToRedeem.length < 3) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter a valid redeem code.",
      });
      return;
    }

    setIsValidating(true);
    try {
      const codeRef = doc(db, 'redeemCodes', codeToRedeem);
      const codeSnap = await getDoc(codeRef);

      if (codeSnap.exists()) {
        const codeData = codeSnap.data();
        
        if (codeData.isUsed && !codeData.multiUse) {
          toast({
            variant: "destructive",
            title: "Code Expired",
            description: "This code has already been used.",
          });
        } else {
          // Mark code as used if not multi-use
          if (!codeData.multiUse) {
            updateDocumentNonBlocking(codeRef, { isUsed: true });
          }
          
          savePaymentRecord('VOUCHER', codeToRedeem, true);
          toast({
            title: "Code Redeemed!",
            description: "Voucher applied successfully. Access granted.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Code",
          description: "This voucher code does not exist.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Redemption Failed",
        description: "An error occurred. Please try again later.",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-6xl">
        {step === 'paying' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <Card className="glass-morphism border-white/10 overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse" />
                <div className="bg-[#00BAF2]/10 p-6 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00BAF2] flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-black tracking-tighter text-xl uppercase italic leading-none">Paytm</p>
                      <p className="text-[8px] text-muted-foreground font-bold tracking-[0.2em] uppercase mt-1">Authorized Gateway</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full border border-secondary/30 text-secondary bg-secondary/5 text-[10px] font-black animate-pulse">
                    LIVE SCANNER
                  </div>
                </div>
                
                <CardContent className="p-8 flex flex-col items-center space-y-8">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="relative bg-white rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-8 border-white">
                      <Image 
                        src={qrImage?.imageUrl || "https://i.ibb.co/SXNgQ7Pv/Whats-App-Image-2026-04-02-at-11-09-29-AM.jpg"} 
                        alt="Secure UPI Payment QR" 
                        width={300}
                        height={300}
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </div>

                  <div className="w-full space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Merchant UPI ID</p>
                        <p className="font-mono text-sm font-bold text-primary">paytmqr6u6kg9@ptys</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={handleCopyUPI} className="hover:bg-primary/20 hover:text-primary">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-black font-headline tracking-tighter leading-none">
                  ACTIVATE <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary neon-text">ACCESS</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">Choose your preferred method to unlock high-speed network access.</p>
              </div>

              <Tabs defaultValue="upi" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 h-14 p-1 rounded-2xl">
                  <TabsTrigger value="upi" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold gap-2">
                    <Smartphone className="w-4 h-4" /> UPI Payment
                  </TabsTrigger>
                  <TabsTrigger value="redeem" className="rounded-xl data-[state=active]:bg-secondary data-[state=active]:text-black font-bold gap-2">
                    <Ticket className="w-4 h-4" /> Redeem Code
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upi" className="mt-6">
                  <Card className="glass-morphism border-white/10 p-8">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Transaction Reference (UTR)</label>
                            <p className="text-xs text-muted-foreground">Enter the 12-digit number from your app</p>
                          </div>
                        </div>
                        <div className="relative">
                          <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/50" />
                          <Input 
                            placeholder="0000 0000 0000" 
                            value={transactionId}
                            maxLength={12}
                            onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ''))}
                            className="bg-black/40 border-white/10 h-20 pl-16 font-mono text-center text-3xl tracking-[0.3em] focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded-2xl"
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={handleVerify} 
                        disabled={isValidating || transactionId.length !== 12} 
                        className="w-full h-20 text-xl font-black rounded-2xl neon-glow uppercase tracking-[0.2em]"
                      >
                        {isValidating ? <Loader2 className="w-6 h-6 animate-spin" /> : "SUBMIT FOR REVIEW"}
                      </Button>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="redeem" className="mt-6">
                  <Card className="glass-morphism border-white/10 p-8">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Voucher Code</label>
                          <p className="text-xs text-muted-foreground">Instant activation with a valid voucher.</p>
                        </div>
                        <div className="relative">
                          <Ticket className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-secondary/50" />
                          <Input 
                            placeholder="UNMAC-XXXX-XXXX" 
                            value={redeemCode}
                            onChange={(e) => setRedeemCode(e.target.value)}
                            className="bg-black/40 border-white/10 h-20 pl-16 font-mono text-center text-2xl tracking-[0.1em] focus:border-secondary focus:ring-1 focus:ring-secondary transition-all rounded-2xl"
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={handleRedeem} 
                        disabled={isValidating || !redeemCode} 
                        className="w-full h-20 text-xl font-black rounded-2xl bg-secondary text-black hover:bg-secondary/90 uppercase tracking-[0.2em]"
                      >
                        {isValidating ? <Loader2 className="w-6 h-6 animate-spin" /> : "ACTIVATE INSTANTLY"}
                      </Button>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-20">
            <Card className="glass-morphism border-primary/30 text-center py-20 px-12 max-w-xl w-full">
              <CardContent className="space-y-10">
                <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center mx-auto neon-glow">
                  <CheckCircle2 className="w-16 h-16 text-white" />
                </div>
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-7xl font-black font-headline tracking-tighter uppercase italic leading-none">
                    ACTIVATED <span className="text-primary">!</span>
                  </h1>
                  <p className="text-lg text-muted-foreground font-medium uppercase tracking-widest">Premium Service is Now Live</p>
                </div>
                <Link href="/dashboard" className="block pt-6">
                  <Button size="lg" className="w-full h-20 neon-glow rounded-2xl font-black text-2xl uppercase tracking-[0.3em]">
                    DASHBOARD <ArrowRight className="ml-3 w-8 h-8" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-16 h-16 animate-spin text-primary opacity-50" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}

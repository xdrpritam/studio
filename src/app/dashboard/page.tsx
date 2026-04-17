
"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, RefreshCcw, Smartphone, Zap, AlertTriangle, Loader2, Search, Timer, ArrowUpCircle } from 'lucide-react';
import { TroubleshootingAssistant } from '@/components/TroubleshootingAssistant';
import { Progress } from '@/components/ui/progress';
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  // 1. Fetch unblock requests
  const requestsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'unblockRequests');
  }, [user, db]);

  const { data: requestsData, isLoading: isRequestsLoading } = useCollection(requestsQuery);
  
  const requestData = useMemo(() => {
    if (!requestsData || requestsData.length === 0) return null;
    return [...requestsData].sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())[0];
  }, [requestsData]);

  // 2. Fetch associated payment
  const paymentsQuery = useMemoFirebase(() => {
    if (!user || !requestData) return null;
    return query(
      collection(db, 'users', user.uid, 'payments'),
      where('requestId', '==', requestData.id)
    );
  }, [user, db, requestData]);

  const { data: paymentsData, isLoading: isPaymentsLoading } = useCollection(paymentsQuery);
  const paymentData = paymentsData && paymentsData.length > 0 ? paymentsData[0] : null;

  const isManuallyApproved = requestData?.status === 'Pending' && paymentData?.status === 'Completed';
  const effectiveStatus = isManuallyApproved ? 'Unblocked' : (requestData?.status || 'Unknown');

  useEffect(() => {
    if (!requestData || effectiveStatus !== 'Unblocked') return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(requestData.expirationDate).getTime();
      const start = new Date(requestData.requestDate).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft(0);
        setProgress(100);
        clearInterval(interval);
      } else {
        setTimeLeft(distance);
        const total = end - start;
        const currentProgress = ((total - distance) / total) * 100;
        setProgress(currentProgress);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [requestData, effectiveStatus]);

  const handleRefreshConnection = () => {
    toast({
      title: "Re-initializing...",
      description: "Synchronizing with network infrastructure.",
    });
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleTerminateSession = () => {
    if (!requestData || !user) return;
    
    if (effectiveStatus === 'Pending') {
      const now = new Date().getTime();
      const requestTime = new Date(requestData.requestDate).getTime();
      const thirtyMinutesMs = 30 * 60 * 1000;
      
      if ((now - requestTime) < thirtyMinutesMs) {
        const remainingMs = thirtyMinutesMs - (now - requestTime);
        const remainingMins = Math.ceil(remainingMs / (1000 * 60));
        toast({
          variant: "destructive",
          title: "Termination Blocked",
          description: `Wait ${remainingMins} more minutes for admin review.`,
        });
        return;
      }
    }

    if (!confirm("Remove this unblock task from the infrastructure?")) return;

    const requestRef = doc(db, 'users', user.uid, 'unblockRequests', requestData.id);
    deleteDocumentNonBlocking(requestRef);
    
    toast({
      title: "Session Removed",
      description: "Request purged from active queue.",
    });
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  if (isUserLoading || isRequestsLoading || isPaymentsLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse font-bold text-xs uppercase tracking-widest">Accessing Node...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-md mx-auto space-y-6 glass-morphism p-8 rounded-2xl border-white/10">
          <Shield className="w-16 h-16 text-primary mx-auto opacity-50" />
          <h1 className="text-2xl font-bold">Portal Locked</h1>
          <p className="text-muted-foreground">Sign in to view your network session status.</p>
          <Link href="/login">
            <Button size="lg" className="w-full bg-primary font-bold h-14">Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-md mx-auto space-y-6 glass-morphism p-8 rounded-2xl border-white/10">
          <AlertTriangle className="w-16 h-16 text-primary mx-auto opacity-50" />
          <h1 className="text-2xl font-bold">No Active Tasks</h1>
          <p className="text-muted-foreground">You don't have any pending or active unblock sessions.</p>
          <Link href="/unblock">
            <Button size="lg" className="w-full bg-primary font-bold h-14">Start New Session</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPending = effectiveStatus === 'Pending';
  const isTrial = requestData.subscriptionId === 'FREE_TRIAL';
  const isExpired = timeLeft <= 0 && effectiveStatus === 'Unblocked';

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
              <p className="text-xs text-muted-foreground">Monitoring node status for {user.email}</p>
            </div>
            <Badge 
              variant={effectiveStatus === 'Unblocked' ? 'default' : 'secondary'} 
              className={`px-4 py-1.5 text-xs font-bold uppercase ${effectiveStatus === 'Unblocked' ? 'bg-primary animate-pulse' : 'bg-orange-500/20 text-orange-500 border-orange-500/30'}`}
            >
              {isExpired ? 'Expired' : effectiveStatus}
            </Badge>
          </div>

          <Card className="glass-morphism border-white/10 overflow-hidden relative">
            <div className={`h-1.5 w-full ${effectiveStatus === 'Unblocked' && !isExpired ? 'bg-primary animate-pulse shadow-[0_0_10px_rgba(108,99,255,0.5)]' : 'bg-orange-500'}`} />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {isPending ? 'Verification Queue' : 'Infrastructure Session'}
                </CardTitle>
                <Badge variant="outline" className="border-white/10 text-[10px] capitalize">
                  {isTrial ? 'Trial Mode' : 'Premium Access'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isPending ? (
                <div className="p-8 bg-orange-500/5 border border-orange-500/20 rounded-2xl space-y-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6 text-orange-500 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold">Awaiting Verification</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Administrator is verifying your UTR details. Access will activate automatically once confirmed.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Remaining Uplink</p>
                      <p className="text-3xl md:text-5xl font-headline font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary neon-text">
                        {timeLeft > 0 ? formatTime(timeLeft) : 'Session Ended'}
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-full border-2 border-primary/20 flex items-center justify-center">
                      <Clock className="w-7 h-7 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      <span>Uplink Intensity</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">MAC</p>
                  <p className="text-xs font-mono font-bold text-secondary truncate">{requestData.macAddress}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Device</p>
                  <p className="text-xs font-bold truncate">{requestData.deviceName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Node</p>
                  <p className="text-xs font-bold">{requestData.wifiProvider}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">SSID</p>
                  <p className="text-xs font-bold truncate">{requestData.wifiName}</p>
                </div>
              </div>

              {isTrial && (
                <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between group">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Trial Upgrade Available</p>
                    <p className="text-xs text-muted-foreground">Get 30 days of high-speed premium access.</p>
                  </div>
                  <Link href="/unblock">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 font-bold text-[10px] uppercase h-9">
                      Upgrade Now <ArrowUpCircle className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <TroubleshootingAssistant deviceName={requestData.deviceName} wifiProvider={requestData.wifiProvider as 'Jio' | 'Airtel' | 'BSNL'} />
        </div>

        <div className="space-y-6">
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="text-base text-white">System Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                onClick={handleRefreshConnection}
                className="w-full justify-start gap-3 bg-white/5 border-white/10 h-12 text-sm font-bold"
              >
                <RefreshCcw className="w-4 h-4 text-primary" /> Synchronize Node
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleTerminateSession}
                className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 h-12 text-sm font-bold"
              >
                <AlertTriangle className="w-4 h-4" /> Terminate Session
              </Button>
            </CardContent>
          </Card>
          
          <Card className="glass-morphism border-white/10 p-6">
             <div className="flex items-center gap-3 text-primary mb-4">
               <Shield className="w-5 h-5" />
               <span className="text-xs font-bold uppercase tracking-widest">Active Guard</span>
             </div>
             <p className="text-[11px] text-muted-foreground leading-relaxed">
               Your session is protected by regional network encryption. Terminating early will purge all uplink data and hardware validation logs.
             </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, RefreshCcw, Smartphone, Zap, AlertTriangle, Loader2, Search, Timer } from 'lucide-react';
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
          title: "Terminate Blocked",
          description: `Please wait. You can terminate after ${remainingMins} more minutes.`,
        });
        return;
      }
    }

    if (!confirm("Terminate this network task?")) return;

    const requestRef = doc(db, 'users', user.uid, 'unblockRequests', requestData.id);
    deleteDocumentNonBlocking(requestRef);
    
    toast({
      title: "Session Terminated",
      description: "Request removed from infrastructure.",
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
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 md:py-32 text-center">
        <div className="max-w-md mx-auto space-y-6 glass-morphism p-8 rounded-2xl border-white/10">
          <Shield className="w-16 h-16 text-primary mx-auto opacity-50" />
          <h1 className="text-2xl font-bold text-white">Login Required</h1>
          <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
          <Link href="/login">
            <Button size="lg" className="w-full bg-primary font-bold h-14">Login Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="container mx-auto px-4 py-24 md:py-32 text-center">
        <div className="max-w-md mx-auto space-y-6 glass-morphism p-8 rounded-2xl border-white/10">
          <AlertTriangle className="w-16 h-16 text-primary mx-auto opacity-50" />
          <h1 className="text-2xl font-bold text-white">No Active Requests</h1>
          <p className="text-muted-foreground">You don't have any active unblock requests at the moment.</p>
          <Link href="/unblock">
            <Button size="lg" className="w-full bg-primary font-bold h-14">Start New Request</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPending = effectiveStatus === 'Pending';

  return (
    <div className="container mx-auto px-4 py-24 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-2xl md:text-3xl font-bold text-white">Connection Dashboard</h1>
              <p className="text-xs md:text-sm text-muted-foreground">Monitoring network status for {user.email}.</p>
            </div>
            <Badge 
              variant={effectiveStatus === 'Unblocked' ? 'default' : 'secondary'} 
              className={`px-4 py-1.5 text-xs font-bold uppercase ${effectiveStatus === 'Unblocked' ? 'bg-primary animate-pulse' : 'bg-orange-500/20 text-orange-500 border-orange-500/30'}`}
            >
              {effectiveStatus}
            </Badge>
          </div>

          <Card className="glass-morphism border-white/10 overflow-hidden">
            <div className={`h-1.5 w-full ${effectiveStatus === 'Unblocked' ? 'bg-primary animate-pulse shadow-[0_0_10px_rgba(108,99,255,0.5)]' : 'bg-orange-500'}`} />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base md:text-lg text-white">
                  {isPending ? 'Verification in Progress' : 'Active Session'}
                </CardTitle>
                <Badge variant="outline" className="border-white/10 text-[10px] capitalize">
                  {requestData.subscriptionId === 'FREE_TRIAL' ? 'Trial' : 'Premium'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isPending ? (
                <div className="p-6 md:p-8 bg-orange-500/5 border border-orange-500/20 rounded-2xl space-y-6 text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 md:w-8 md:h-8 text-orange-500 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg md:text-xl font-bold text-white uppercase tracking-tighter">Verifying Transaction</h3>
                    <p className="text-xs md:text-sm text-muted-foreground max-w-sm mx-auto">
                      Our administrator is currently verifying your UTR details. This typically takes 5-30 minutes during business hours.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Time Remaining</p>
                      <p className="text-2xl md:text-4xl font-headline font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary neon-text">
                        {timeLeft > 0 ? formatTime(timeLeft) : 'Expired'}
                      </p>
                    </div>
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-primary/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Session Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">MAC Address</p>
                  <p className="text-xs font-mono font-bold text-secondary truncate">{requestData.macAddress}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Device</p>
                  <p className="text-xs font-bold text-white truncate">{requestData.deviceName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Provider</p>
                  <p className="text-xs font-bold text-white">{requestData.wifiProvider}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">SSID</p>
                  <p className="text-xs font-bold text-white truncate">{requestData.wifiName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <TroubleshootingAssistant deviceName={requestData.deviceName} wifiProvider={requestData.wifiProvider as 'Jio' | 'Airtel' | 'BSNL'} />
        </div>

        <div className="space-y-6">
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="text-base md:text-lg text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                onClick={handleRefreshConnection}
                className="w-full justify-start gap-3 bg-white/5 border-white/10 h-12 text-sm"
              >
                <RefreshCcw className="w-4 h-4 text-primary" /> Refresh Connection
              </Button>
              {requestData.subscriptionId === 'FREE_TRIAL' && (
                <Link href="/unblock">
                  <Button className="w-full justify-start gap-3 bg-primary h-12 text-sm font-bold">
                    <Zap className="w-4 h-4 text-white" /> Upgrade to Premium
                  </Button>
                </Link>
              )}
              <Button 
                variant="ghost" 
                onClick={handleTerminateSession}
                className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 h-12 text-sm font-bold"
              >
                <AlertTriangle className="w-4 h-4" /> Terminate Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

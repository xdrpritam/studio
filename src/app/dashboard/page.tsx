
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, Wifi, RefreshCcw, Smartphone, Zap, AlertTriangle, ArrowUpRight, Loader2, CheckCircle2, Search, Timer } from 'lucide-react';
import { TroubleshootingAssistant } from '@/components/TroubleshootingAssistant';
import { Progress } from '@/components/ui/progress';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  const requestsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'unblockRequests'),
      orderBy('requestDate', 'desc'),
      limit(1)
    );
  }, [user, db]);

  const { data: requests, isLoading: isRequestsLoading } = useCollection(requestsQuery);
  const data = requests && requests.length > 0 ? requests[0] : null;

  useEffect(() => {
    if (!data || data.status !== 'Unblocked') return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(data.expirationDate).getTime();
      const start = new Date(data.requestDate).getTime();
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
  }, [data]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  if (isUserLoading || isRequestsLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="max-w-md mx-auto space-y-6 glass-morphism p-8 rounded-2xl border-white/10">
          <Shield className="w-16 h-16 text-primary mx-auto opacity-50" />
          <h1 className="text-2xl font-bold text-white">Login Required</h1>
          <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
          <Link href="/login">
            <Button size="lg" className="w-full neon-glow rounded-xl font-bold">Login Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="max-w-md mx-auto space-y-6 glass-morphism p-8 rounded-2xl border-white/10">
          <AlertTriangle className="w-16 h-16 text-primary mx-auto opacity-50" />
          <h1 className="text-2xl font-bold text-white">No Active Requests</h1>
          <p className="text-muted-foreground">You don't have any active unblock requests at the moment.</p>
          <Link href="/unblock">
            <Button size="lg" className="w-full neon-glow rounded-xl font-bold">Start New Request</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPending = data.status === 'Pending' || data.status === 'Processing';

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-3xl font-bold text-white">Connection Dashboard</h1>
              <p className="text-muted-foreground">Monitoring network status for {user.email}.</p>
            </div>
            <Badge 
              variant={data.status === 'Unblocked' ? 'default' : 'secondary'} 
              className={`px-4 py-1 text-sm font-bold ${data.status === 'Unblocked' ? 'bg-primary animate-pulse' : 'bg-orange-500/20 text-orange-500 border-orange-500/30'}`}
            >
              {data.status.toUpperCase()}
            </Badge>
          </div>

          <Card className="glass-morphism border-white/10 overflow-hidden">
            <div className={`h-2 w-full ${data.status === 'Unblocked' ? 'bg-primary animate-pulse' : 'bg-orange-500'} shadow-[0_0_10px_rgba(97,85,255,0.5)]`} />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-white">
                  {isPending ? 'Request Under Review' : 'Active Session'}
                </CardTitle>
                <Badge variant="outline" className="border-white/10 capitalize">
                  {data.subscriptionId === 'FREE_TRIAL' ? 'Trial' : 'Premium'} Plan
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isPending ? (
                <div className="p-8 bg-orange-500/5 border border-orange-500/20 rounded-2xl space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-orange-500 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Verifying Transaction</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Our administrator is currently verifying your UTR details. This typically takes 5-30 minutes during business hours.
                    </p>
                  </div>
                  <div className="flex justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-orange-500">
                    <span className="flex items-center gap-1.5"><Timer className="w-3 h-3" /> Waiting for Approval</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Time Remaining</p>
                      <p className="text-4xl font-headline font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary neon-text">
                        {timeLeft > 0 ? formatTime(timeLeft) : 'Expired'}
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Session Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold">MAC Address</p>
                  <p className="text-sm font-mono font-bold text-secondary truncate">{data.macAddress}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold">Device</p>
                  <p className="text-sm font-bold text-white">{data.deviceName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold">Provider</p>
                  <p className="text-sm font-bold text-white">{data.wifiProvider}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold">Network (SSID)</p>
                  <p className="text-sm font-bold text-white">{data.wifiName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <TroubleshootingAssistant deviceName={data.deviceName} wifiProvider={data.wifiProvider as 'Jio' | 'Airtel' | 'BSNL'} />
        </div>

        <div className="space-y-6">
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3 bg-white/5 border-white/10 h-12 text-white">
                <RefreshCcw className="w-4 h-4 text-primary" /> Refresh Connection
              </Button>
              {data.subscriptionId === 'FREE_TRIAL' && (
                <Link href="/unblock">
                  <Button className="w-full justify-start gap-3 neon-glow h-12 font-bold">
                    <Zap className="w-4 h-4 text-white" /> Upgrade to Premium
                  </Button>
                </Link>
              )}
              <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 h-12 font-bold">
                <AlertTriangle className="w-4 h-4" /> Terminate Session
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-secondary/5 border-secondary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Shield className="w-24 h-24 text-secondary" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg text-secondary">Premium Perks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground font-medium">
              <div className="flex gap-3">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <p>30 Days Unlimited Access</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <p>Multi-device Support</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <p>Priority API Unblocking</p>
              </div>
              <Button variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary/10 mt-4 group font-bold">
                Learn More <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

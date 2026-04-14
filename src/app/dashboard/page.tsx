
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, Wifi, RefreshCcw, Smartphone, Zap, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { TroubleshootingAssistant } from '@/components/TroubleshootingAssistant';
import { Progress } from '@/components/ui/progress';

interface UnblockRequest {
  id: string;
  macAddress: string;
  deviceName: string;
  wifiProvider: 'Jio' | 'Airtel' | 'BSNL';
  ssid: string;
  plan: 'trial' | 'paid';
  status: 'Processing' | 'Unblocked';
  createdAt: string;
  expiresAt: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<UnblockRequest | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('unmac_active_request');
    if (saved) {
      const parsed = JSON.parse(saved);
      setData(parsed);

      // Simulate status transition if still processing
      if (parsed.status === 'Processing') {
        setTimeout(() => {
          const updated = { ...parsed, status: 'Unblocked' };
          setData(updated);
          localStorage.setItem('unmac_active_request', JSON.stringify(updated));
        }, 5000);
      }
    }
  }, []);

  useEffect(() => {
    if (!data) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(data.expiresAt).getTime();
      const start = new Date(data.createdAt).getTime();
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

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="max-w-md mx-auto space-y-6 glass-morphism p-8 rounded-2xl border-white/10">
          <AlertTriangle className="w-16 h-16 text-primary mx-auto opacity-50" />
          <h1 className="text-2xl font-bold">No Active Requests</h1>
          <p className="text-muted-foreground">You don't have any active unblock requests at the moment.</p>
          <Link href="/unblock">
            <Button size="lg" className="w-full neon-glow rounded-xl">Start New Request</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Status Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-3xl font-bold">Connection Dashboard</h1>
              <p className="text-muted-foreground">Monitoring active MAC unblock status.</p>
            </div>
            <Badge variant={data.status === 'Unblocked' ? 'default' : 'secondary'} className="px-4 py-1 text-sm font-bold animate-pulse">
              {data.status.toUpperCase()}
            </Badge>
          </div>

          <Card className="glass-morphism border-white/10 overflow-hidden">
            <div className={`h-2 w-full ${data.status === 'Unblocked' ? 'bg-primary' : 'bg-secondary'} animate-pulse shadow-[0_0_10px_rgba(97,85,255,0.5)]`} />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Active Session</CardTitle>
                <Badge variant="outline" className="border-white/10 capitalize">{data.plan} Plan</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">MAC Address</p>
                  <p className="text-sm font-mono font-bold truncate">{data.macAddress}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Device</p>
                  <p className="text-sm font-bold">{data.deviceName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Provider</p>
                  <p className="text-sm font-bold">{data.wifiProvider}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Network (SSID)</p>
                  <p className="text-sm font-bold">{data.ssid}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Troubleshooting Section */}
          <TroubleshootingAssistant deviceName={data.deviceName} wifiProvider={data.wifiProvider} />
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3 bg-white/5 border-white/10 h-12">
                <RefreshCcw className="w-4 h-4 text-primary" /> Refresh Connection
              </Button>
              {data.plan === 'trial' && (
                <Link href="/unblock">
                  <Button className="w-full justify-start gap-3 neon-glow h-12">
                    <Zap className="w-4 h-4 text-white" /> Upgrade to Premium
                  </Button>
                </Link>
              )}
              <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 h-12">
                <AlertTriangle className="w-4 h-4" /> Terminate Session
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-secondary/10 border-secondary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Shield className="w-24 h-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg text-secondary">Premium Perks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
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
              <Button variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary/10 mt-4 group">
                Learn More <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CheckCircle2({ className, ...props }: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

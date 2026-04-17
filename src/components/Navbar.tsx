"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, LayoutDashboard, HelpCircle, PhoneCall, Info, LogOut, Lock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@/firebase';

export function Navbar() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminVisible = mounted && !!user;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] h-20 flex items-center bg-background/50 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-primary/20 group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <span className="font-headline text-2xl font-black tracking-tighter uppercase italic">
            <span className="text-primary">Un</span><span className="text-white">Mac</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/#how-it-works" className="hover:text-primary transition-colors">Process</Link>
          <Link href="/#plans" className="hover:text-primary transition-colors">Pricing</Link>
          <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          {isAdminVisible && (
            <Link href="/admin" className="text-secondary hover:text-primary transition-colors flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {mounted && !isUserLoading && user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-wider text-white bg-white/5 border border-white/5 hover:bg-white/10 px-4">
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="icon" onClick={() => auth.signOut()} className="border-white/10 bg-white/5 h-9 w-9">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : mounted && !isUserLoading ? (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" className="font-bold text-xs uppercase tracking-wider">Login</Button>
              </Link>
              <Link href="/unblock">
                <Button size="sm" className="btn-primary font-black text-[10px] uppercase tracking-[0.2em] px-6 h-10 rounded-xl">
                  Submit a Request <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </>
          ) : (
            <div className="w-24 h-8" />
          )}
        </div>
      </div>
    </nav>
  );
}
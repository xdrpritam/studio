
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, LayoutDashboard, HelpCircle, PhoneCall, Info, LogOut, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useAuth, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase';

const HARDCODED_ADMIN_UID = 'gKJKDmDMZmg8RvUT119XStZ7Xpt1';

export function Navbar() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after the component has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  const adminRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'roles_admin', user.uid);
  }, [user, db]);

  const { data: adminData } = useDoc(adminRef);
  
  // Only calculate isAdmin and show dynamic auth UI after hydration
  const isAdmin = mounted ? (!!adminData || user?.uid === HARDCODED_ADMIN_UID) : false;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <span className="font-headline text-xl font-bold tracking-tight neon-text">
            Un<span className="text-secondary">Mac</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
          <Link href="/about" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Info className="w-4 h-4" /> About
          </Link>
          <Link href="/faq" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" /> FAQ
          </Link>
          <Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4" /> Contact
          </Link>
          <Link href="/admin" className={`${isAdmin ? 'text-secondary' : 'text-muted-foreground'} hover:text-primary transition-colors flex items-center gap-1.5 font-bold`}>
            <Lock className="w-4 h-4" /> Admin
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {mounted && !isUserLoading && user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => auth.signOut()} className="border-white/10">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : mounted && !isUserLoading ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/unblock">
                <Button size="sm" className="neon-glow font-semibold">
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            // Placeholder during loading/mounting to prevent layout shift
            <div className="w-24 h-8" />
          )}
        </div>
      </div>
    </nav>
  );
}

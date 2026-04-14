
"use client";

import Link from 'next/link';
import { Shield, LayoutDashboard, HelpCircle, PhoneCall, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
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

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/about" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Info className="w-4 h-4" /> About
          </Link>
          <Link href="/faq" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" /> FAQ
          </Link>
          <Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4" /> Contact
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Button>
          </Link>
          <Link href="/unblock">
            <Button size="sm" className="neon-glow font-semibold">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

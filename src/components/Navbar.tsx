"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, LayoutDashboard, LogOut, Lock, ChevronRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@/firebase';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdminVisible = mounted && !!user;

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[1000] transition-all duration-300",
      isScrolled ? "bg-background/95 backdrop-blur-xl border-b border-white/5 py-3 shadow-2xl" : "bg-transparent py-5"
    )}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Shield className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-headline text-2xl font-black tracking-tighter uppercase italic">
            <span className="text-white">Un</span><span className="text-primary neon-text">Mac</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/#how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
          <Link href="/#plans" className="hover:text-primary transition-colors">Plans</Link>
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
              <Link href="/dashboard" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-wider text-white bg-white/5 border border-white/5 hover:bg-white/10 px-4 h-10">
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="icon" onClick={() => auth.signOut()} className="border-white/10 bg-white/5 h-10 w-10">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : mounted && !isUserLoading ? (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" className="font-bold text-xs uppercase tracking-wider text-muted-foreground hover:text-white">Login</Button>
              </Link>
              <Link href="/unblock">
                <Button size="sm" className="btn-primary font-black text-[10px] uppercase tracking-[0.2em] px-6 h-10 rounded-full">
                  Submit a Request <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </>
          ) : (
            <div className="w-24 h-10" />
          )}

          {/* Hamburger Menu */}
          <button 
            className="lg:hidden text-white p-2" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-background/98 backdrop-blur-2xl z-[999] flex flex-col items-center justify-center gap-8 animate-in fade-in duration-300">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold">Home</Link>
          <Link href="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold">How It Works</Link>
          <Link href="/#plans" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold">Plans</Link>
          <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold">FAQ</Link>
          <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold">Contact</Link>
          {isAdminVisible && <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-secondary">Admin</Link>}
          <Link href="/unblock" onClick={() => setIsMobileMenuOpen(false)}>
            <Button size="lg" className="btn-primary px-10">Submit a Request</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
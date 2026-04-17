import Link from 'next/link';
import { Shield, Mail, Globe, Clock, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative z-10 pt-24 pb-12 border-t border-white/5 bg-background/40 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/5">
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <span className="font-headline text-3xl font-black tracking-tighter uppercase italic">
                <span className="text-primary">Un</span><span className="text-white">Mac</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              A legitimate network device access request portal. Authorized requests only. We mediate between users and network administrators, not bypass security.
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-primary uppercase tracking-[0.2em]">
               <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Pan-India</span>
               <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 24/7 Monitoring</span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Pages</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/unblock" className="hover:text-primary transition-colors">Submit Request</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium">
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link href="/#plans" className="hover:text-primary transition-colors">Plans</Link></li>
              <li><Link href="/legal" className="hover:text-primary transition-colors">Legal</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium">
              <li className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" /> support@unmac.rf.gd
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Mon–Sat, 9AM–6PM IST
              </li>
              <li className="flex items-center gap-2 text-primary font-bold">
                <ShieldCheck className="w-4 h-4" /> Official Support Center
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <p>© {new Date().getFullYear()} UnMac. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/legal" className="hover:text-white transition-colors">Legal Disclaimer</Link>
            <Link href="/legal#privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
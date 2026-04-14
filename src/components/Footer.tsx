
import Link from 'next/link';
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-headline text-xl font-bold tracking-tight">UnMac</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Unblocking digital boundaries. Your reliable partner for MAC address management on supported WiFi networks.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/unblock" className="hover:text-primary transition-colors">Unblock MAC</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Form</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">Stay updated with our latest network tools.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-background border border-border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-bold hover:bg-primary/90 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} UnMac. All rights reserved. Supported networks only.</p>
        </div>
      </div>
    </footer>
  );
}

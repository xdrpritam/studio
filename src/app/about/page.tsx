
import Image from 'next/image';
import { Shield, Zap, Globe, Lock } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-24 space-y-24">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="font-headline text-4xl md:text-6xl font-extrabold leading-tight">
            Our Mission: <br />
            <span className="text-primary neon-text">Seamless Connectivity</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            UnMac was born out of the frustration of arbitrary network blocks. We believe that everyone should have the right to manage their own device's network visibility. Our platform provides the bridge between your hardware and restricted WiFi networks.
          </p>
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <h3 className="font-bold text-3xl text-secondary">50k+</h3>
              <p className="text-sm text-muted-foreground">Requests Processed</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-3xl text-primary">99.9%</h3>
              <p className="text-sm text-muted-foreground">Uptime Guaranteed</p>
            </div>
          </div>
        </div>
        <div className="relative aspect-video md:aspect-square rounded-3xl overflow-hidden border border-white/10 glass-morphism p-4">
          <Image 
            src="https://picsum.photos/seed/unmac-about/600/400" 
            alt="Data center technology" 
            fill
            className="object-cover rounded-2xl opacity-70"
            data-ai-hint="server neon"
          />
        </div>
      </section>

      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="font-headline text-3xl md:text-5xl font-bold">The UnMac Advantage</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">We use advanced API integrations to communicate directly with supported network controllers.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Lock, title: "Military-Grade", desc: "Your MAC and identity are masked using high-level encryption standards." },
            { icon: Zap, title: "Lightning Fast", desc: "Our global edge network ensures unblocking requests are fulfilled in seconds." },
            { icon: Globe, title: "Regional Support", desc: "Optimized specifically for Indian network infrastructure including Jio, Airtel, and BSNL." },
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all">
              <item.icon className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

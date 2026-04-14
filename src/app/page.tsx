
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, ShieldCheck, Clock, Globe, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[140px] -z-10" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-morphism border-primary/20 text-primary text-xs font-bold uppercase tracking-widest animate-bounce">
              <Zap className="w-4 h-4" /> Next-Gen Network Control
            </div>
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight">
              UnBlock Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary neon-text bg-[length:200%_auto] animate-gradient">
                MAC Address
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Experience borderless connectivity. UnMac provides secure, lightning-fast unblocking for Jio, Airtel, and BSNL networks.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
              <Link href="/unblock">
                <Button size="lg" className="h-16 px-12 text-xl font-black rounded-2xl neon-glow transition-transform hover:scale-105">
                  Start Unblocking
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="h-16 px-12 text-xl font-bold rounded-2xl glass-morphism hover:bg-white/10 transition-all">
                  Technical Docs
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
               <span className="text-sm font-bold tracking-widest uppercase">Trusted By Users On:</span>
               <div className="flex gap-4 font-black italic text-lg">
                 <span>JIO</span>
                 <span>AIRTEL</span>
                 <span>BSNL</span>
               </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
            <div className="relative aspect-square rounded-[3rem] border border-white/10 overflow-hidden glass-morphism p-4 rotate-3 group-hover:rotate-0 transition-transform duration-700">
              <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/network-topology/1200/800"} 
                alt={heroImage?.description || "Network Topology Visualization"} 
                width={1200}
                height={800}
                className="object-cover rounded-[2rem] opacity-70 mix-blend-lighten w-full h-full transform group-hover:scale-110 transition-transform duration-1000"
                data-ai-hint="network technology"
              />
              {/* Removed overlay div as requested */}
            </div>
            {/* Visual Accents */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary/30 rounded-full blur-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/30 rounded-full blur-2xl -z-10" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: "Requests", value: "150K+" },
            { label: "Uptime", value: "99.9%" },
            { label: "Latency", value: "<20ms" },
            { label: "Support", value: "24/7" },
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <p className="text-4xl md:text-5xl font-black font-headline text-primary neon-text">{stat.value}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24 space-y-6">
            <h2 className="font-headline text-4xl md:text-6xl font-black">Why <span className="text-secondary neon-text-secondary">UnMac?</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Engineered for performance. Built for privacy.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { icon: Zap, title: "Hyper Speed", desc: "Get back online in under 60 seconds with our high-availability API endpoints.", color: "text-primary" },
              { icon: ShieldCheck, title: "Zero Trust", desc: "End-to-end encryption for all MAC metadata. We don't log your traffic.", color: "text-secondary" },
              { icon: Clock, title: "Free Tier", desc: "Test the infrastructure with a 15-minute high-priority trial session.", color: "text-primary" },
              { icon: Globe, title: "Edge Network", desc: "Global distribution ensures minimal delay regardless of your ISP.", color: "text-secondary" },
            ].map((f, i) => (
              <div key={i} className="group p-10 rounded-3xl glass-card relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-8 h-8 ${f.color}`} />
                </div>
                <h3 className="text-2xl font-black mb-4 font-headline">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-32">
        <div className="relative rounded-[3rem] p-12 md:p-24 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/10 border border-white/10 text-center">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <h2 className="text-4xl md:text-6xl font-black mb-8 font-headline leading-tight">Ready to reclaim your <br /> network freedom?</h2>
          <Link href="/unblock">
             <Button size="lg" className="h-16 px-16 text-xl font-black rounded-2xl neon-glow">
               Join Now <ArrowRight className="ml-3 w-6 h-6" />
             </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

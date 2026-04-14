
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, ShieldCheck, Clock, Globe } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <div className="relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -z-10" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-24 pb-32 text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3" /> Professional Network Tools
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
              UnBlock Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary neon-text">
                Mac Addresses
              </span> <br />
              With UnMac
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto md:mx-0 leading-relaxed">
              Fast, reliable, and secure MAC address unblocking for major WiFi providers. Take control of your connectivity in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/unblock">
                <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-xl neon-glow">
                  Unblock Now
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold rounded-xl bg-white/5 border-white/10 hover:bg-white/10">
                  How it Works
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground/60 italic">
              * This service works only with supported networks: Jio, Airtel, BSNL.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-2xl -z-10" />
            <div className="relative aspect-square md:aspect-[4/3] rounded-3xl border border-white/10 overflow-hidden glass-morphism p-4">
              <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/network-topology/1200/800"} 
                alt={heroImage?.description || "Tech visualization"} 
                width={1200}
                height={800}
                className="object-cover rounded-2xl opacity-60 mix-blend-screen w-full h-full"
                data-ai-hint={heroImage?.imageHint || "network technology"}
              />
              <div className="absolute bottom-8 left-8 right-8 glass-morphism p-6 rounded-2xl border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold">Status: Processing</h4>
                      <p className="text-xs text-muted-foreground">Secure connection established</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-code text-secondary">00:14:59</p>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-headline text-3xl md:text-5xl font-bold">Why Choose UnMac?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We provide the most streamlined and secure unblocking service available on the market.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Instant Access", desc: "Get back online in less than 60 seconds with our optimized workflows." },
              { icon: ShieldCheck, title: "Secure Protocol", desc: "Your data is encrypted and handled with extreme privacy throughout the process." },
              { icon: Clock, title: "Free Trial", desc: "Test our service with a 15-minute free trial before committing to a plan." },
              { icon: Globe, title: "Major Providers", desc: "Seamless integration with Jio, Airtel, and BSNL networks." },
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

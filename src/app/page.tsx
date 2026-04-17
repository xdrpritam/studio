"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Wifi, 
  Zap, 
  AlertTriangle,
  PenTool,
  Search,
  Unlock,
  MessageSquare
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Home() {
  return (
    <div className="relative">
      {/* ===== HERO SECTION ===== */}
      <section className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="fade-in inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full text-xs font-bold text-primary uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" /> Authorized Requests Only &nbsp;•&nbsp; No Hacking
          </div>

          <h1 className="fade-in fade-in-delay-1 font-headline text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter">
            Get Your Device<br />
            <span className="gradient-text">Back Online — Legitimately</span>
          </h1>

          <p className="fade-in fade-in-delay-2 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            UnMac is a network access support portal that helps you submit formal reinstatement requests for devices blocked from WiFi networks. Fast, transparent, and fully authorized.
          </p>

          <div className="fade-in fade-in-delay-2 flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/unblock">
              <Button size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl btn-primary">
                Submit a Request <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-bold rounded-2xl btn-outline">
                Learn How It Works
              </Button>
            </Link>
          </div>

          {/* Hero Visual Card */}
          <div className="fade-in fade-in-delay-3 pt-12 max-w-xl mx-auto">
            <div className="glass-card p-6 rounded-3xl text-left border-white/10 shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Latest Request</p>
                  <p className="font-bold text-white">#UNM-2024-01247 · Rohit's Laptop</p>
                  <p className="text-xs text-muted-foreground">ISP: Jio &nbsp;·&nbsp; Submitted: April 10, 2024</p>
                </div>
                <div className="badge-warning flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Under Review
                </div>
              </div>
              <div className="neon-divider mb-4" />
              <div className="flex gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Laptop</span>
                <span className="flex items-center gap-1.5"><Wifi className="w-3 h-3" /> SSID: JioFiber_Home</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Plan: Priority</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="container mx-auto px-4 py-20">
        <div className="fade-in grid grid-cols-2 md:grid-cols-4 gap-8 bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-sm">
          {[
            { label: "Requests Submitted", value: "1500+" },
            { label: "Review Rate", value: "98%" },
            { label: "Major ISPs", value: "3" },
            { label: "Support", value: "24/7" },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <p className="text-3xl md:text-4xl font-black font-headline text-white">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="container mx-auto px-4 py-32">
        <div className="text-center space-y-4 mb-20 fade-in">
          <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Process</p>
          <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter">
            Simple. <span className="gradient-text">Transparent.</span> Legitimate.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Our four-step process ensures your request is handled properly and reviewed by the right people.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { step: "01", icon: PenTool, title: "Fill the Form", desc: "Enter your device details and the network you need access reviewed for. All fields are verified." },
            { step: "02", icon: Search, title: "We Review", desc: "Our team reviews your request and contacts the relevant network administrator on your behalf." },
            { step: "03", icon: CheckCircle2, title: "Get Decision", desc: "You receive a status update: Approved, Pending Review, or Not Eligible — always communicated clearly." },
            { step: "04", icon: Unlock, title: "Reconnect", desc: "If approved, follow the steps emailed to you to restore network access — no guesswork involved." }
          ].map((item, i) => (
            <div key={i} className="fade-in-delay-1 glass-card p-8 rounded-3xl relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-6 text-4xl font-black text-white/5 group-hover:text-primary/10 transition-colors">Step {item.step}</div>
               <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 transition-transform">
                 <item.icon className="w-6 h-6 text-primary" />
               </div>
               <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
               <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SUPPORTED ISPs ===== */}
      <section className="bg-white/[0.02] border-y border-white/5 py-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-20">
            <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Coverage</p>
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter">
              <span className="gradient-text">Supported</span> Network Providers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {['Jio', 'Airtel', 'BSNL'].map((isp, i) => (
              <div key={i} className="glass-card p-10 rounded-[2.5rem] text-center space-y-4 hover:translate-y-[-5px] transition-all">
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto text-3xl">
                  {isp === 'Jio' ? '📡' : isp === 'Airtel' ? '📶' : '🌐'}
                </div>
                <h4 className="text-2xl font-black">{isp}</h4>
                <div className="text-primary text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" /> Active Support
                </div>
              </div>
            ))}
          </div>
          <p className="text-center mt-12 text-muted-foreground text-sm italic">
            Coverage expanding. <strong className="text-white">Submit a request even if your ISP is not listed</strong> — we'll evaluate it.
          </p>
        </div>
      </section>

      {/* ===== PLANS ===== */}
      <section id="plans" className="container mx-auto px-4 py-32">
        <div className="text-center space-y-4 mb-20 fade-in">
          <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Pricing</p>
          <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter">
            Choose Your <span className="gradient-text">Plan</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Transparent pricing with no hidden fees. Start free or get priority access.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="glass-card p-10 rounded-[3rem] space-y-8 flex flex-col">
            <div className="space-y-2">
              <h4 className="text-2xl font-bold">Free Review</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black font-headline">₹0</span>
                <span className="text-muted-foreground text-sm">/ one-time</span>
              </div>
            </div>
            <div className="space-y-4 flex-grow">
              {[
                "Single device request",
                "Standard review (5–7 business days)",
                "Email status updates",
                "Basic support"
              ].map((f, i) => (
                <div key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> {f}
                </div>
              ))}
            </div>
            <Link href="/unblock">
              <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-white/10 hover:bg-white/10">Get Started Free</Button>
            </Link>
          </div>

          {/* Priority Plan */}
          <div className="glass-card p-10 rounded-[3rem] space-y-8 flex flex-col border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-bl-3xl">⚡ Most Popular</div>
            <div className="space-y-2">
              <h4 className="text-2xl font-bold text-primary">Priority Plan</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black font-headline gradient-text">₹100</span>
                <span className="text-muted-foreground text-sm">/ month</span>
              </div>
            </div>
            <div className="space-y-4 flex-grow">
              {[
                "Up to 5 device requests",
                "Priority review (24–48 hours)",
                "SMS + Email status updates",
                "Dedicated support agent",
                "Request history dashboard"
              ].map((f, i) => (
                <div key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> {f}
                </div>
              ))}
            </div>
            <Link href="/unblock">
              <Button className="w-full h-14 rounded-2xl font-bold btn-primary">Upgrade to Priority</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="bg-white/[0.02] border-y border-white/5 py-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-20">
            <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Reviews</p>
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter">
              What Our <span className="gradient-text">Users Say</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Arjun S.", city: "Delhi", text: "UnMac helped me get my laptop reconnected after it was blocked by my hostel WiFi admin. The process was completely transparent and professional." },
              { name: "Priya M.", city: "Mumbai", text: "I submitted a request for my phone and got a response within 2 days on the Priority plan. The dedicated support was excellent. Highly recommend!" },
              { name: "Rahul K.", city: "Bangalore", text: "Finally a legitimate way to handle this. No shady tools, just a proper request system with real follow-through. Exactly what I needed." }
            ].map((t, i) => (
              <div key={i} className="glass-card p-10 rounded-[2.5rem] space-y-6">
                <div className="text-secondary text-xl font-bold">★★★★★</div>
                <p className="text-muted-foreground leading-relaxed italic">"{t.text}"</p>
                <div className="pt-4 border-t border-white/5">
                  <p className="font-bold text-white">— {t.name}, {t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="container mx-auto px-4 py-32">
        <div className="text-center space-y-4 mb-20">
          <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">FAQ</p>
          <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {[
              { q: "How does UnMac work?", a: "UnMac acts as a mediation portal. You submit a formal device reinstatement request with your device and network details. We verify the information, then forward your request to the relevant network administrator. You receive updates throughout the process." },
              { q: "Is network reconnection guaranteed?", a: "No. UnMac is a request mediation service. The final decision rests entirely with the network administrator or ISP. We ensure your request is properly submitted and reviewed." },
              { q: "What is the refund policy?", a: "Priority Plan payments are non-refundable once a request review has been initiated. If no action has been taken within 72 hours, a full refund may be requested." },
              { q: "What if my ISP is not listed?", a: "Submit your request anyway using 'Other' in the ISP dropdown. Our team will evaluate whether we can support your network provider." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass-card border-white/10 px-8 rounded-3xl overflow-hidden hover:bg-white/10 transition-colors">
                <AccordionTrigger className="font-bold py-6 hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ===== DISCLAIMER ===== */}
      <section className="container mx-auto px-4 py-10">
         <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl flex gap-4 items-start text-xs leading-relaxed text-orange-500 font-medium">
           <AlertTriangle className="w-5 h-5 shrink-0" />
           <p><strong>Disclaimer:</strong> UnMac is a request mediation service only. We do not access, modify, or bypass any network hardware or firmware. Approval of requests depends entirely on the network administrator's decision. This service is not a guarantee of reconnection.</p>
         </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="container mx-auto px-4 py-32">
        <div className="glass-card p-16 md:p-24 rounded-[4rem] text-center space-y-8 relative overflow-hidden border-primary/20">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
          <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter">
            Ready to Get <br />
            <span className="gradient-text">Back Online?</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Submit your device access request today. It takes less than 5 minutes and your request will be reviewed by our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/unblock">
              <Button size="lg" className="h-16 px-12 text-xl font-bold rounded-2xl btn-primary">Submit a Request →</Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="h-16 px-12 text-xl font-bold rounded-2xl btn-outline">Contact Support</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
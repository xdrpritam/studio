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
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Home() {
  return (
    <div className="relative">
      {/* ===== HERO SECTION ===== */}
      <section className="container mx-auto px-4 pt-48 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-5 py-2 rounded-full text-xs font-bold text-muted-foreground uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-700">
            <span>🔒</span> Authorized Requests Only &nbsp;•&nbsp; No Hacking &nbsp;•&nbsp; No Bypassing
          </div>

          <h1 className="font-headline text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-700">
            Get Your Device<br />
            <span className="gradient-text">Back Online — Legitimately</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700">
            UnMac is a network access support portal that helps you submit formal reinstatement requests for devices blocked from WiFi networks. Fast, transparent, and fully authorized.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Link href="/unblock">
              <Button size="lg" className="btn btn-primary h-16 px-12 text-lg font-bold rounded-full">
                Submit a Request <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="btn btn-outline h-16 px-12 text-lg font-bold rounded-full">
                Learn How It Works
              </Button>
            </Link>
          </div>

          {/* Hero Visual Card */}
          <div className="pt-16 max-w-xl mx-auto animate-in fade-in zoom-in duration-1000">
            <div className="glass-card p-8 rounded-[2rem] text-left border-white/10 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Latest Request</p>
                  <p className="font-bold text-white text-lg">#UNM-2024-01247 · Rohit's Laptop</p>
                  <p className="text-xs text-muted-foreground">ISP: Jio &nbsp;·&nbsp; Submitted: April 10, 2024</p>
                </div>
                <div className="badge-warning px-4 py-1.5 rounded-full text-[10px] font-bold">
                  🔄 Under Review
                </div>
              </div>
              <div className="neon-divider mb-6" />
              <div className="flex flex-wrap gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-2">📱 Laptop</span>
                <span className="flex items-center gap-2">📶 SSID: JioFiber_Home</span>
                <span className="flex items-center gap-2">⚡ Plan: Priority</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm animate-in fade-in duration-1000">
          {[
            { label: "Requests Submitted", value: "1200+" },
            { label: "Review Rate", value: "98%" },
            { label: "Major ISPs", value: "3" },
            { label: "Support", value: "24/7" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-10 border-r border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
              <p className="text-3xl md:text-4xl font-black font-headline gradient-text">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="container mx-auto px-4 py-32">
        <div className="section-header mb-20">
          <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3">Process</p>
          <h2 className="section-title">Simple. <span className="className-text">Transparent.</span> Legitimate.</h2>
          <p className="section-subtitle">Our four-step process ensures your request is handled properly and reviewed by the right people.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", icon: PenTool, title: "Fill the Form", desc: "Enter your device details and the network you need access reviewed for. All fields are verified.", emoji: "🖊️" },
            { step: "02", icon: Search, title: "We Review", desc: "Our team reviews your request and contacts the relevant network administrator on your behalf.", emoji: "📋" },
            { step: "03", icon: CheckCircle2, title: "Get Decision", desc: "You receive a status update: Approved, Pending Review, or Not Eligible — always communicated clearly.", emoji: "✅" },
            { step: "04", icon: Unlock, title: "Reconnect", desc: "If approved, follow the steps emailed to you to restore network access — no guesswork involved.", emoji: "🔓" }
          ].map((item, i) => (
            <div key={i} className="glass-card p-10 rounded-[2rem] relative group hover:scale-[1.02]">
               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-8 border border-white/5 text-3xl transition-transform group-hover:scale-110">
                 {item.emoji}
               </div>
               <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Step {item.step}</div>
               <h3 className="text-xl font-bold mb-4">{item.title}</h3>
               <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SUPPORTED ISPs ===== */}
      <section className="bg-white/[0.02] border-y border-white/5 py-32">
        <div className="container mx-auto px-4">
          <div className="section-header mb-20">
            <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3">Coverage</p>
            <h2 className="section-title"><span className="gradient-text">Supported</span> Network Providers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {['Jio', 'Airtel', 'BSNL'].map((isp, i) => (
              <div key={i} className="glass-card p-12 rounded-[2.5rem] text-center space-y-4 hover:translate-y-[-5px]">
                <div className="text-5xl mb-6">
                  {isp === 'Jio' ? '📡' : isp === 'Airtel' ? '📶' : '🌐'}
                </div>
                <h4 className="text-2xl font-black">{isp}</h4>
                <div className="text-success text-[10px] font-bold uppercase tracking-widest">
                  ✓ Active Support
                </div>
              </div>
            ))}
          </div>
          <p className="text-center mt-12 text-muted-foreground text-sm">
            Coverage expanding. <strong className="text-white">Submit a request even if your ISP is not listed</strong> — we'll evaluate it.
          </p>
        </div>
      </section>

      {/* ===== PLANS ===== */}
      <section id="plans" className="container mx-auto px-4 py-32">
        <div className="section-header mb-20">
          <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3">Pricing</p>
          <h2 className="section-title">Choose Your <span className="gradient-text">Plan</span></h2>
          <p className="section-subtitle">Transparent pricing with no hidden fees. Start free or get priority access.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="glass-card p-12 rounded-[3rem] space-y-8 flex flex-col">
            <div className="space-y-4">
              <h4 className="text-2xl font-bold">Free Review</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black font-headline">₹0</span>
              </div>
              <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">One-time request</p>
            </div>
            <div className="space-y-4 flex-grow border-t border-white/5 pt-8">
              {[
                "Single device request",
                "Standard review (5–7 business days)",
                "Email status updates",
                "Basic support"
              ].map((f, i) => (
                <div key={i} className="flex gap-4 text-sm text-muted-foreground items-center">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" /> {f}
                </div>
              ))}
            </div>
            <Link href="/unblock">
              <Button variant="outline" className="w-full h-14 rounded-full font-bold border-white/10 hover:bg-white/10">Get Started Free</Button>
            </Link>
          </div>

          {/* Priority Plan */}
          <div className="glass-card p-12 rounded-[3rem] space-y-8 flex flex-col border-primary/30 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white px-6 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">⚡ Most Popular</div>
            <div className="space-y-4">
              <h4 className="text-2xl font-bold text-primary">Priority Plan</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black font-headline gradient-text">₹100</span>
                <span className="text-muted-foreground text-sm">/ month</span>
              </div>
              <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Billed monthly</p>
            </div>
            <div className="space-y-4 flex-grow border-t border-white/5 pt-8">
              {[
                "Up to 5 device requests",
                "Priority review (24–48 hours)",
                "SMS + Email status updates",
                "Dedicated support agent",
                "Request history dashboard"
              ].map((f, i) => (
                <div key={i} className="flex gap-4 text-sm text-muted-foreground items-center">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" /> {f}
                </div>
              ))}
            </div>
            <Link href="/unblock?plan=priority">
              <Button className="w-full h-14 rounded-full font-bold btn btn-primary">Upgrade to Priority</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="bg-white/[0.02] border-y border-white/5 py-32">
        <div className="container mx-auto px-4">
          <div className="section-header mb-20">
            <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3">Reviews</p>
            <h2 className="section-title">What Our <span className="gradient-text">Users Say</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Arjun S.", city: "Delhi", text: "UnMac helped me get my laptop reconnected after it was blocked by my hostel WiFi admin. The process was completely transparent and professional.", stars: "★★★★★" },
              { name: "Priya M.", city: "Mumbai", text: "I submitted a request for my phone and got a response within 2 days on the Priority plan. The dedicated support was excellent. Highly recommend!", stars: "★★★★★" },
              { name: "Rahul K.", city: "Bangalore", text: "Finally a legitimate way to handle this. No shady tools, just a proper request system with real follow-through. Exactly what I needed.", stars: "★★★★☆" }
            ].map((t, i) => (
              <div key={i} className="glass-card p-10 rounded-[2.5rem] space-y-6">
                <div className="text-warning text-sm tracking-widest">{t.stars}</div>
                <p className="text-muted-foreground leading-relaxed italic text-sm">"{t.text}"</p>
                <div className="pt-6 border-t border-white/5 text-primary font-bold text-sm">
                  — {t.name}, {t.city}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="container mx-auto px-4 py-32">
        <div className="section-header mb-20">
          <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3">FAQ</p>
          <h2 className="section-title">Frequently Asked <span className="gradient-text">Questions</span></h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {[
              { q: "How does UnMac work?", a: "UnMac acts as a mediation portal. You submit a formal device reinstatement request with your device and network details. We verify the information, then forward your request to the relevant network administrator. You receive email/SMS updates throughout the process." },
              { q: "Is network reconnection guaranteed?", a: "No. UnMac is a request mediation service. The final decision rests entirely with the network administrator or ISP. We cannot guarantee reconnection but ensure your request is properly submitted and reviewed." },
              { q: "What is the refund policy?", a: "Priority Plan payments (₹100/month) are non-refundable once a request review has been initiated. If no review action has been taken within 72 hours of payment, a full refund may be requested." },
              { q: "What if my ISP is not listed?", a: "Submit your request anyway using 'Other' in the ISP dropdown. Our team will evaluate whether we can support your network provider. Coverage is continuously expanding." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass-card border-white/10 px-8 rounded-[1.5rem] overflow-hidden hover:bg-white/10 transition-colors">
                <AccordionTrigger className="font-bold py-6 hover:no-underline text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-sm">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ===== DISCLAIMER ===== */}
      <section className="container mx-auto px-4 py-10">
         <div className="disclaimer-banner flex gap-4 items-start animate-in fade-in duration-1000">
           <AlertTriangle className="w-6 h-6 shrink-0 mt-1" />
           <p className="text-sm font-medium"><strong>Disclaimer:</strong> UnMac is a request mediation service only. We do not access, modify, or bypass any network hardware or firmware. Approval of requests depends entirely on the network administrator's decision. This service is not a guarantee of reconnection.</p>
         </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="container mx-auto px-4 py-32">
        <div className="glass-card p-20 md:p-32 rounded-[4rem] text-center space-y-8 relative overflow-hidden border-primary/20">
          <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter">
            Ready to Get <br />
            <span className="gradient-text">Back Online?</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Submit your device access request today. It takes less than 5 minutes and your request will be reviewed by our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Link href="/unblock">
              <Button size="lg" className="h-16 px-14 text-xl font-bold rounded-full btn btn-primary">Submit a Request →</Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="h-16 px-14 text-xl font-bold rounded-full btn btn-outline">Contact Support</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

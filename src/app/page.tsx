"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  CheckCircle2, 
  PenTool,
  Search,
  Unlock,
  AlertTriangle,
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Home() {
  return (
    <div className="relative">
      {/* ===== HERO SECTION ===== */}
      <section className="container mx-auto px-4 pt-32 pb-16 md:pt-48 md:pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-5 py-2 rounded-full text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-700">
            <span>🔒</span> Authorized Requests Only &nbsp;•&nbsp; No Hacking
          </div>

          <h1 className="font-headline text-3xl md:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            Get Your Device<br />
            <span className="gradient-text">Back Online — Legitimately</span>
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 px-4">
            UnMac is a network access support portal that helps you submit formal reinstatement requests for devices blocked from WiFi networks. Fast, transparent, and fully authorized.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Link href="/unblock" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 md:h-16 px-12 text-lg font-bold rounded-full neon-glow">
                Submit a Request <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-14 md:h-16 px-12 text-lg font-bold rounded-full border-white/10 hover:bg-white/5">
                Learn How It Works
              </Button>
            </Link>
          </div>

          {/* Hero Visual Card */}
          <div className="pt-12 md:pt-16 max-w-xl mx-auto px-4 animate-in fade-in zoom-in duration-1000">
            <div className="glass-card p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] text-left border-white/10 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Latest Request</p>
                  <p className="font-bold text-white text-base md:text-lg">#UNM-2024-01247 · Rohit's Laptop</p>
                  <p className="text-xs text-muted-foreground">ISP: Jio &nbsp;·&nbsp; Submitted: April 10, 2024</p>
                </div>
                <div className="badge-warning px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap">
                  🔄 Under Review
                </div>
              </div>
              <div className="neon-divider mb-6" />
              <div className="flex flex-wrap gap-4 md:gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-2">📱 Laptop</span>
                <span className="flex items-center gap-2">📶 JioFiber_Home</span>
                <span className="flex items-center gap-2">⚡ Plan: Priority</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden backdrop-blur-sm animate-in fade-in duration-1000">
          {[
            { label: "Requests Submitted", value: "1200+" },
            { label: "Review Rate", value: "98%" },
            { label: "Major ISPs", value: "3" },
            { label: "Support", value: "24/7" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-6 md:p-10 border-r border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors border-b lg:border-b-0">
              <p className="text-2xl md:text-4xl font-bold font-headline gradient-text">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3">Process</p>
          <h2 className="section-title">Simple. <span className="gradient-text">Transparent.</span> Legitimate.</h2>
          <p className="section-subtitle">Our four-step process ensures your request is handled properly and reviewed by the right people.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Fill the Form", desc: "Enter your device details and the network you need access reviewed for. All fields are verified.", emoji: "🖊️" },
            { step: "02", title: "We Review", desc: "Our team reviews your request and contacts the relevant network administrator on your behalf.", emoji: "📋" },
            { step: "03", title: "Get Decision", desc: "You receive a status update: Approved, Pending Review, or Not Eligible — always communicated clearly.", emoji: "✅" },
            { step: "04", title: "Reconnect", desc: "If approved, follow the steps emailed to you to restore network access — no guesswork involved.", emoji: "🔓" }
          ].map((item, i) => (
            <div key={i} className="glass-card p-8 rounded-[1.5rem] md:rounded-[2rem] relative group hover:scale-[1.02]">
               <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-white/5 text-2xl transition-transform group-hover:scale-110">
                 {item.emoji}
               </div>
               <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Step {item.step}</div>
               <h3 className="text-lg font-bold mb-3">{item.title}</h3>
               <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SUPPORTED ISPs ===== */}
      <section className="bg-white/[0.02] border-y border-white/5 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Coverage</p>
            <h2 className="section-title"><span className="gradient-text">Supported</span> Network Providers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {['Jio', 'Airtel', 'BSNL'].map((isp, i) => (
              <div key={i} className="glass-card p-10 rounded-[1.5rem] md:rounded-[2.5rem] text-center space-y-4 hover:translate-y-[-5px]">
                <div className="text-4xl mb-4">
                  {isp === 'Jio' ? '📡' : isp === 'Airtel' ? '📶' : '🌐'}
                </div>
                <h4 className="text-xl font-bold">{isp}</h4>
                <div className="text-success text-[10px] font-bold uppercase tracking-widest">
                  ✓ Active Support
                </div>
              </div>
            ))}
          </div>
          <p className="text-center mt-10 text-muted-foreground text-xs md:text-sm px-4">
            Coverage expanding. <strong className="text-white">Submit a request even if your ISP is not listed</strong> — we'll evaluate it.
          </p>
        </div>
      </section>

      {/* ===== PLANS ===== */}
      <section id="plans" className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20 space-y-4">
          <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Pricing</p>
          <h2 className="section-title">Choose Your <span className="gradient-text">Plan</span></h2>
          <p className="text-muted-foreground text-sm">Transparent pricing with no hidden fees. Start free or get priority access.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="glass-card p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] space-y-8 flex flex-col">
            <div className="space-y-4">
              <h4 className="text-xl font-bold">Free Review</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-bold font-headline">₹0</span>
              </div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">One-time request</p>
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
          <div className="glass-card p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] space-y-8 flex flex-col border-primary/30 relative">
            <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white px-6 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg h-auto">
              ⚡ Most Popular
            </Badge>
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-primary">Priority Plan</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-bold font-headline gradient-text">₹100</span>
                <span className="text-muted-foreground text-sm">/ month</span>
              </div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Billed monthly</p>
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
              <Button className="w-full h-14 rounded-full font-bold bg-primary hover:bg-primary/90">Upgrade to Priority</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20 space-y-4">
          <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">FAQ</p>
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
              <AccordionItem key={i} value={`item-${i}`} className="glass-card border-white/10 px-6 md:px-8 rounded-[1.5rem] overflow-hidden hover:bg-white/10 transition-colors">
                <AccordionTrigger className="font-bold py-5 md:py-6 hover:no-underline text-left text-sm md:text-base">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-xs md:text-sm">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ===== DISCLAIMER ===== */}
      <section className="container mx-auto px-4 py-10">
         <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 flex gap-4 items-start animate-in fade-in duration-1000">
           <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 shrink-0 mt-1 text-orange-500" />
           <p className="text-xs md:text-sm font-medium text-muted-foreground"><strong>Disclaimer:</strong> UnMac is a request mediation service only. We do not access, modify, or bypass any network hardware or firmware. Approval of requests depends entirely on the network administrator's decision. This service is not a guarantee of reconnection.</p>
         </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="glass-card p-12 md:p-32 rounded-[2.5rem] md:rounded-[4rem] text-center space-y-8 relative overflow-hidden border-primary/20">
          <h2 className="text-3xl md:text-6xl font-bold font-headline tracking-tight">
            Ready to Get <br />
            <span className="gradient-text">Back Online?</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto">
            Submit your device access request today. It takes less than 5 minutes and your request will be reviewed by our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/unblock" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-16 px-14 text-xl font-bold rounded-full bg-primary hover:bg-primary/90">Submit a Request →</Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-16 px-14 text-xl font-bold rounded-full border-white/10">Contact Support</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


"use client";

import { useState } from 'react';
import { getFaqAnswer } from '@/ai/flows/ai-powered-faq-assistant-flow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const initialFaqs = [
  {
    q: "How does the unblocking work?",
    a: "UnMac uses proprietary API tunnels to communicate with network controllers and temporarily white-list your MAC address on their infrastructure."
  },
  {
    q: "Is it legal to use this service?",
    a: "UnMac is a diagnostic tool intended for users who have lost legitimate access to their networks. Please consult your local ISP's terms of service."
  },
  {
    q: "Which WiFi providers are supported?",
    a: "Currently, we fully support Jio Fiber, Airtel Xstream, and BSNL Bharat Fiber networks."
  },
  {
    q: "What is your refund policy?",
    a: "We offer a 15-minute free trial to ensure compatibility. Once a paid plan is activated, refunds are only issued if the service fails to perform as described."
  }
];

export default function FaqPage() {
  const [query, setQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setAiLoading(true);
    try {
      const response = await getFaqAnswer({ question: query });
      setAiResult(response.answer);
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h1 className="font-headline text-4xl md:text-6xl font-bold">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">Find quick answers or ask our AI assistant for specific help.</p>
        </div>

        {/* AI Assistant Search */}
        <Card className="glass-morphism border-primary/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" /> Smart FAQ Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAiAsk} className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Ask a specific question (e.g., 'Do you support 5GHz networks?')" 
                  className="pl-10 h-12 bg-background/50 border-white/10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={aiLoading} className="h-12 px-6 neon-glow">
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ask AI"}
              </Button>
            </form>

            {aiResult && (
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 text-xs font-bold text-primary mb-3 uppercase tracking-widest">
                  <MessageSquare className="w-3 h-3" /> AI Response
                </div>
                <p className="text-sm leading-relaxed text-foreground">{aiResult}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Static FAQs */}
        <div className="space-y-6">
          <h3 className="font-bold text-xl px-2">Common Questions</h3>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {initialFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-white/10 rounded-xl px-4 bg-white/5 hover:bg-white/10 transition-colors">
                <AccordionTrigger className="hover:no-underline font-semibold py-6">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

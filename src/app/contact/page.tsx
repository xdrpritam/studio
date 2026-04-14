
"use client";

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast({
        title: "Message Sent",
        description: "We'll get back to you within 24 hours.",
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="font-headline text-4xl md:text-6xl font-bold">Get in <span className="text-primary neon-text">Touch</span></h1>
            <p className="text-muted-foreground text-lg">Have questions about our service? Our technical team is here to assist you with any network queries.</p>
          </div>

          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold">Email Support</h4>
                <p className="text-muted-foreground">support@unmac.network</p>
                <p className="text-xs text-primary mt-1 font-bold">Response time: &lt; 2 hours</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h4 className="font-bold">Emergency Hotline</h4>
                <p className="text-muted-foreground">+91 (800) 123-4567</p>
                <p className="text-xs text-secondary mt-1 font-bold">Mon-Fri, 9am - 6pm IST</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-bold">Headquarters</h4>
                <p className="text-muted-foreground">Tech City Hub, Sector 62, Noida, UP, India</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          {sent ? (
            <Card className="glass-morphism border-primary/20 h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center neon-glow">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Message Received!</h2>
              <p className="text-muted-foreground">Our support engineers have been notified and will contact you shortly.</p>
              <Button onClick={() => setSent(false)} variant="outline" className="border-white/10">Send Another Message</Button>
            </Card>
          ) : (
            <Card className="glass-morphism border-white/10 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground px-1">Full Name</label>
                    <Input placeholder="John Doe" className="bg-background/50 border-white/10 h-12" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground px-1">Email Address</label>
                    <Input type="email" placeholder="john@example.com" className="bg-background/50 border-white/10 h-12" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground px-1">Subject</label>
                  <Input placeholder="Issue with Jio Fiber unblocking" className="bg-background/50 border-white/10 h-12" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground px-1">Message</label>
                  <Textarea placeholder="Please describe your issue in detail..." className="bg-background/50 border-white/10 min-h-[150px] resize-none" required />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-bold neon-glow rounded-xl">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="mr-2 w-5 h-5" /> Send Message</>}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState } from 'react';
import { smartTroubleshootingAssistant, SmartTroubleshootingAssistantOutput } from '@/ai/flows/smart-troubleshooting-assistant-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, MessageSquare, ChevronRight, Loader2, Info } from 'lucide-react';

interface Props {
  deviceName: string;
  wifiProvider: 'Jio' | 'Airtel' | 'BSNL';
}

export function TroubleshootingAssistant({ deviceName, wifiProvider }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartTroubleshootingAssistantOutput | null>(null);

  const handleConsult = async () => {
    setLoading(true);
    try {
      const output = await smartTroubleshootingAssistant({ deviceName, wifiProvider });
      setResult(output);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-morphism border-primary/20 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
      <CardHeader>
        <div className="flex items-center gap-2 text-primary mb-2">
          <Sparkles className="w-5 h-5 fill-primary" />
          <span className="text-xs font-bold uppercase tracking-widest">AI Powered</span>
        </div>
        <CardTitle>Smart Troubleshooting</CardTitle>
        <CardDescription>
          Our AI analyzes your {deviceName} on {wifiProvider} network to provide specific advice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!result && !loading ? (
          <Button onClick={handleConsult} className="w-full neon-glow h-12 font-bold group">
            Consult AI Assistant <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Analyzing network conditions...</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <h4 className="flex items-center gap-2 text-primary font-bold mb-2">
                <Info className="w-4 h-4" /> Potential Root Cause
              </h4>
              <p className="text-sm leading-relaxed">{result?.reasonForBlocking}</p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-bold text-sm">Recommended Steps:</h4>
              <ul className="space-y-3">
                {result?.troubleshootingSteps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground group">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold group-hover:bg-primary/20 group-hover:text-primary transition-colors border border-white/10">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={() => setResult(null)} variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground">
              Run New Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

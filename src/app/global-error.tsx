
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string; request?: any };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  const isPermissionError = error.name === 'FirebaseError' && error.request;

  return (
    <html>
      <body className="bg-background text-foreground antialiased min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/20">
              <ShieldAlert className="w-12 h-12 text-primary" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter uppercase">
              {isPermissionError ? 'ACCESS DENIED' : 'SYSTEM MALFUNCTION'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              {isPermissionError 
                ? "The security layer has rejected your request. This usually happens when administrative priority is required."
                : "An unexpected error occurred in the network infrastructure. Our team has been notified."}
            </p>
          </div>

          {isPermissionError && (
            <div className="p-6 bg-black/40 border border-white/10 rounded-2xl text-left space-y-4 overflow-hidden">
               <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                 <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Security Context
               </div>
               <pre className="text-[10px] font-mono text-muted-foreground overflow-auto max-h-60 p-2 leading-relaxed">
                 {JSON.stringify(error.request, null, 2)}
               </pre>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              onClick={() => reset()} 
              className="w-full sm:w-auto h-12 px-8 font-bold neon-glow"
            >
              <RefreshCcw className="mr-2 w-4 h-4" /> Try Again
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-12 px-8 font-bold border-white/10">
                <Home className="mr-2 w-4 h-4" /> Return Home
              </Button>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

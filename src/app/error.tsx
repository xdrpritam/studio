
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string; request?: any };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Error Boundary caught:', error);
  }, [error]);

  // Check if it's a specialized Firestore permission error
  const isPermissionError = error.name === 'FirebaseError' && (error as any).request;

  return (
    <div className="container mx-auto px-4 py-32 flex items-center justify-center min-h-[70vh]">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <ShieldAlert className="w-10 h-10 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter uppercase">
            {isPermissionError ? 'ACCESS DENIED' : 'SYSTEM OVERLOAD'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {isPermissionError 
              ? "The network security layer has rejected this request. Higher administrative priority may be required."
              : "An unexpected error occurred in the infrastructure. Our engineers have been alerted."}
          </p>
        </div>

        {isPermissionError && (
          <div className="p-6 bg-black/40 border border-white/10 rounded-2xl text-left space-y-4 overflow-hidden">
             <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
               <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Debugging Payload
             </div>
             <pre className="text-[10px] font-mono text-muted-foreground overflow-auto max-h-60 p-2 leading-relaxed">
               {JSON.stringify((error as any).request, null, 2)}
             </pre>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button 
            onClick={() => reset()} 
            className="w-full sm:w-auto h-12 px-8 font-bold neon-glow"
          >
            <RefreshCcw className="mr-2 w-4 h-4" /> Re-initialize
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto h-12 px-8 font-bold border-white/10">
              <Home className="mr-2 w-4 h-4" /> Exit to Safety
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

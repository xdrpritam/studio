"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserPlus, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';

const signupSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [loading, setLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user && !isUserLoading) {
      // Create user document if it doesn't exist
      const userRef = doc(db, 'users', user.uid);
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        email: user.email,
        firstName: form.getValues('firstName'),
        lastName: form.getValues('lastName'),
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router, db, form]);

  const onSubmit = (values: SignupFormValues) => {
    setLoading(true);
    initiateEmailSignUp(auth, values.email, values.password)
      .then(() => {
        // Success is handled by useUser hook and useEffect
      })
      .catch((error: any) => {
        setLoading(false);
        let message = "An error occurred during registration.";
        
        if (error.code === 'auth/email-already-in-use') {
          message = "This email is already registered. Please login instead.";
        } else if (error.code === 'auth/invalid-email') {
          message = "The email address is invalid.";
        } else if (error.code === 'auth/weak-password') {
          message = "The password is too weak.";
        }

        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: message,
        });
      });
  };

  return (
    <div className="container mx-auto px-4 py-24 flex justify-center">
      <Card className="w-full max-w-md glass-morphism border-white/10">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Join UnMac to start unblocking devices</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John" 
                          {...field} 
                          className="bg-background/50 border-white/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Doe" 
                          {...field} 
                          className="bg-background/50 border-white/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="name@example.com" 
                        {...field} 
                        className="bg-background/50 border-white/10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="bg-background/50 border-white/10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 font-bold neon-glow" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Sign Up
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center text-muted-foreground w-full">
            Already have an account? <Link href="/login" className="text-primary hover:underline font-bold">Login</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

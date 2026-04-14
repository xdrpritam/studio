
"use client";

import { useUser, useDoc, useFirestore, useCollection, useMemoFirebase, useAuth } from '@/firebase';
import { doc, collection, query, orderBy, collectionGroup } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Lock, Users, MessageSquare, AlertCircle, Loader2, Wifi, Zap, Clock, User, LogIn, Key, HelpCircle, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const HARDCODED_ADMIN_UID = 'UkGf3zzd3NdY0XzDhMyV1JbUi0X2';
const ADMIN_USERNAME = 'pd863253';
const ADMIN_PASSWORD = 'sd7gen3';

export default function AdminPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  // Simple Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSimpleAuthenticated, setIsSimpleAuthenticated] = useState(false);

  // Check Admin Privileges via Firestore DBAC
  const adminRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'roles_admin', user.uid);
  }, [user, db]);

  const { data: adminData, isLoading: isAdminLoading } = useDoc(adminRef);

  // Determine effective admin status based on UID
  const hasAdminUid = !!adminData || (user?.uid === HARDCODED_ADMIN_UID);

  // Fetch Inquiries - Guarded by admin check
  const inquiriesQuery = useMemoFirebase(() => {
    if (!user || !hasAdminUid || !isSimpleAuthenticated) return null;
    return query(collection(db, 'contactInquiries'), orderBy('submissionDate', 'desc'));
  }, [db, user, hasAdminUid, isSimpleAuthenticated]);

  const { data: inquiries, isLoading: isInquiriesLoading } = useCollection(inquiriesQuery);

  // Fetch All Unblock Requests using Collection Group - Guarded by admin check
  const allRequestsQuery = useMemoFirebase(() => {
    if (!user || !hasAdminUid || !isSimpleAuthenticated) return null;
    return query(collectionGroup(db, 'unblockRequests'), orderBy('requestDate', 'desc'));
  }, [db, user, hasAdminUid, isSimpleAuthenticated]);

  const { data: allRequests, isLoading: isRequestsLoading } = useCollection(allRequestsQuery);

  const handleSimpleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsSimpleAuthenticated(true);
      toast({ title: "Login Successful", description: "Dashboard unlocked." });
    } else {
      toast({ 
        variant: "destructive", 
        title: "Access Denied", 
        description: "Invalid credentials." 
      });
    }
  };

  if (isUserLoading || (user && isAdminLoading)) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Dashboard View (Authorized + Simple Logged In)
  if (isSimpleAuthenticated && user && hasAdminUid) {
    return (
      <div className="container mx-auto px-4 py-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-headline">Admin Control Panel</h1>
              <p className="text-muted-foreground">Authenticated as <span className="text-secondary font-bold">{user.email}</span></p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsSimpleAuthenticated(false)} className="border-white/10">
            Lock Console
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-morphism border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                <Zap className="w-4 h-4" /> Unblock Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{allRequests?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="glass-morphism border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Support Inquiries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{inquiries?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="glass-morphism border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                <Wifi className="w-4 h-4" /> Active Nodes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">3</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 mb-6">
            <TabsTrigger value="requests" className="data-[state=active]:bg-secondary">MAC Requests</TabsTrigger>
            <TabsTrigger value="inquiries" className="data-[state=active]:bg-secondary">Inquiries</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card className="glass-morphism border-white/10">
              <CardHeader>
                <CardTitle>Global MAC Unblock Requests</CardTitle>
                <CardDescription>Real-time list of all user-submitted MAC unblocking tasks.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>MAC Address</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isRequestsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : allRequests && allRequests.length > 0 ? (
                      allRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="text-xs">
                            {new Date(req.requestDate).toLocaleDateString()} <br />
                            <span className="text-muted-foreground">{new Date(req.requestDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold">{req.macAddress}</TableCell>
                          <TableCell className="font-medium">{req.deviceName}</TableCell>
                          <TableCell>{req.wifiProvider}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {req.subscriptionId === 'FREE_TRIAL' ? 'Trial' : 'Premium'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={req.status === 'Unblocked' ? 'default' : 'secondary'} className={req.status === 'Processing' ? 'animate-pulse' : ''}>
                              {req.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No requests found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries">
            <Card className="glass-morphism border-white/10">
              <CardHeader>
                <CardTitle>Recent Support Inquiries</CardTitle>
                <CardDescription>Messages submitted through the contact form.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isInquiriesLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : inquiries && inquiries.length > 0 ? (
                      inquiries.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                          <TableCell className="text-xs">{new Date(inquiry.submissionDate).toLocaleDateString()}</TableCell>
                          <TableCell className="font-bold">{inquiry.name}</TableCell>
                          <TableCell>{inquiry.email}</TableCell>
                          <TableCell>{inquiry.subject}</TableCell>
                          <TableCell>
                            <Badge variant={inquiry.status === 'New' ? 'default' : 'secondary'}>
                              {inquiry.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No inquiries found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Login Gateway (Unauthenticated or Unauthorized)
  return (
    <div className="container mx-auto px-4 py-24 flex justify-center">
      <div className="w-full max-w-md space-y-6">
        <Card className="glass-morphism border-white/10 overflow-hidden">
          <div className="h-1.5 w-full bg-secondary animate-pulse" />
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
              {(!user || !hasAdminUid) ? <ShieldAlert className="w-8 h-8 text-destructive" /> : <Lock className="w-8 h-8 text-secondary" />}
            </div>
            <CardTitle className="text-3xl font-bold font-headline">
              {(!user || !hasAdminUid) ? "Access Restricted" : "Admin Portal"}
            </CardTitle>
            <CardDescription>
              {(!user || !hasAdminUid) ? "Firebase authorization required" : "Secure Dashboard Access"}
            </CardDescription>
          </CardHeader>
          
          {(!user || !hasAdminUid) ? (
            <CardContent className="space-y-6">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl space-y-3">
                <p className="text-xs font-bold text-destructive uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" /> UID Authorization Needed
                </p>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase">Your Current UID</p>
                  <code className="block p-2 bg-black/30 rounded text-xs break-all border border-white/5 font-mono select-all">
                    {user?.uid || "NOT_LOGGED_IN"}
                  </code>
                </div>
                {!user && (
                  <p className="text-xs text-primary font-bold">Please login to the app first using Google or Email.</p>
                )}
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Your UID must be authorized in the <code className="text-foreground">roles_admin</code> collection for data access.
                </p>
              </div>
              {!user ? (
                <Link href="/login" className="block w-full">
                  <Button className="w-full h-12">Login to App</Button>
                </Link>
              ) : (
                <Button variant="ghost" className="w-full" onClick={() => auth.signOut()}>
                  Sign Out to Switch Account
                </Button>
              )}
            </CardContent>
          ) : (
            <form onSubmit={handleSimpleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Admin Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="pl-10 bg-background/50 border-white/10 h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Access Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 bg-background/50 border-white/10 h-12"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full h-14 text-lg font-bold bg-secondary hover:bg-secondary/90 text-white rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                  <LogIn className="mr-2 w-5 h-5" /> Unlock Dashboard
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" /> Login Info
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] space-y-3 text-muted-foreground leading-relaxed">
            <p>1. Ensure you are logged into the app with the authorized UID.</p>
            <p>2. Simple Login: <strong>pd863253</strong> / <strong>sd7gen3</strong>.</p>
            <p>3. This bypasses the need for a separate admin auth account.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

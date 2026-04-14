
"use client";

import { useUser, useDoc, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, collectionGroup } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Lock, Users, MessageSquare, AlertCircle, Loader2, Wifi, Zap, Clock, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [copied, setCopied] = useState(false);

  // Check Admin Privileges
  const adminRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'roles_admin', user.uid);
  }, [user, db]);

  const { data: adminData, isLoading: isAdminLoading } = useDoc(adminRef);

  // Fetch Inquiries - Guarded by admin check
  const inquiriesQuery = useMemoFirebase(() => {
    if (!user || isAdminLoading || !adminData) return null;
    return query(collection(db, 'contactInquiries'), orderBy('submissionDate', 'desc'));
  }, [db, user, isAdminLoading, adminData]);

  const { data: inquiries, isLoading: isInquiriesLoading } = useCollection(inquiriesQuery);

  // Fetch All Unblock Requests using Collection Group - Guarded by admin check
  const allRequestsQuery = useMemoFirebase(() => {
    if (!user || isAdminLoading || !adminData) return null;
    return query(collectionGroup(db, 'unblockRequests'), orderBy('requestDate', 'desc'));
  }, [db, user, isAdminLoading, adminData]);

  const { data: allRequests, isLoading: isRequestsLoading } = useCollection(allRequestsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const copyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      toast({
        title: "UID Copied",
        description: "Add this ID to the 'roles_admin' collection in Firebase Console.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isUserLoading || isAdminLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-6">
        <div className="max-w-md mx-auto glass-morphism p-8 rounded-2xl border-destructive/20 space-y-6">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">You do not have administrative privileges. To access this panel, add your UID to the <code className="text-primary">roles_admin</code> collection in the Firebase Console.</p>
          </div>
          
          <div className="p-4 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between gap-4">
            <div className="text-left overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Your User ID (UID)</p>
              <p className="text-xs font-mono truncate">{user?.uid}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={copyUid} className="shrink-0">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground italic">
            Note: Creating the 'roles_admin' collection and adding your UID as a document ID bypasses security rules for prototyping.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
          <Lock className="w-6 h-6 text-secondary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin Control Panel</h1>
          <p className="text-muted-foreground">Monitor system activity and manage user requests.</p>
        </div>
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
          <TabsTrigger value="requests" className="data-[state=active]:bg-primary">MAC Requests</TabsTrigger>
          <TabsTrigger value="inquiries" className="data-[state=active]:bg-primary">Inquiries</TabsTrigger>
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

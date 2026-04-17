
"use client";

import { useUser, useDoc, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, collectionGroup, writeBatch, serverTimestamp, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Lock, Zap, MessageSquare, Wifi, User, Key, LogIn, ShieldAlert, AlertCircle, Loader2, CreditCard, CheckCircle, ExternalLink, ShieldCheck, Plus, Ticket, Trash2, Database, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Link from 'next/link';

const HARDCODED_ADMIN_UID = 'gKJKDmDMZmg8RvUT119XStZ7Xpt1';
const ADMIN_USERNAME = 'pd863253';
const ADMIN_PASSWORD = 'sd7gen3';

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isSimpleAuthenticated, setIsSimpleAuthenticated] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Redeem Code Creation State
  const [newCode, setNewCode] = useState('');
  const [isMultiUse, setIsMultiUse] = useState(false);

  const adminRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'roles_admin', user.uid);
  }, [user, db]);

  const { data: adminData, isLoading: isAdminLoading } = useDoc(adminRef);
  
  // A user is an admin if they have a role document OR if they are the hardcoded primary admin.
  const isPrimaryAdmin = user?.uid === HARDCODED_ADMIN_UID;
  const hasAdminUid = !!adminData || isPrimaryAdmin;

  // Queries - Only active if simple auth is passed AND user has admin priority
  const inquiriesQuery = useMemoFirebase(() => {
    if (!user || !hasAdminUid || !isSimpleAuthenticated) return null;
    return query(collection(db, 'contactInquiries'), orderBy('submissionDate', 'desc'));
  }, [db, user, hasAdminUid, isSimpleAuthenticated]);

  const { data: inquiries, isLoading: isInquiriesLoading } = useCollection(inquiriesQuery);

  const allRequestsQuery = useMemoFirebase(() => {
    if (!user || !hasAdminUid || !isSimpleAuthenticated) return null;
    return query(collectionGroup(db, 'unblockRequests'), orderBy('requestDate', 'desc'));
  }, [db, user, hasAdminUid, isSimpleAuthenticated]);

  const { data: allRequests, isLoading: isRequestsLoading } = useCollection(allRequestsQuery);

  const allPaymentsQuery = useMemoFirebase(() => {
    if (!user || !hasAdminUid || !isSimpleAuthenticated) return null;
    return query(collectionGroup(db, 'payments'), orderBy('paymentDate', 'desc'));
  }, [db, user, hasAdminUid, isSimpleAuthenticated]);

  const { data: allPayments, isLoading: isPaymentsLoading } = useCollection(allPaymentsQuery);

  const redeemCodesQuery = useMemoFirebase(() => {
    if (!user || !hasAdminUid || !isSimpleAuthenticated) return null;
    return collection(db, 'redeemCodes');
  }, [db, user, hasAdminUid, isSimpleAuthenticated]);

  const { data: redeemCodes, isLoading: isCodesLoading } = useCollection(redeemCodesQuery);

  const handleSimpleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === ADMIN_USERNAME && passwordInput === ADMIN_PASSWORD) {
      setIsSimpleAuthenticated(true);
      toast({ title: "Access Granted", description: "Admin dashboard unlocked." });
    } else {
      toast({ 
        variant: "destructive", 
        title: "Login Failed", 
        description: "Invalid credentials." 
      });
    }
  };

  const handleApprovePayment = (payment: any) => {
    if (!payment.userId || !payment.id) return;
    setProcessingId(payment.id);

    const paymentRef = doc(db, 'users', payment.userId, 'payments', payment.id);
    const subRef = doc(db, 'users', payment.userId, 'subscriptions', 'active_subscription');
    
    updateDocumentNonBlocking(paymentRef, { 
      status: 'Completed',
      updatedAt: new Date().toISOString()
    });
    
    setDocumentNonBlocking(subRef, {
      id: 'active_subscription',
      userId: payment.userId,
      planType: 'PaidMonthly',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    if (payment.requestId) {
      const requestRef = doc(db, 'users', payment.userId, 'unblockRequests', payment.requestId);
      updateDocumentNonBlocking(requestRef, {
        status: 'Unblocked',
        unblockedAt: new Date().toISOString()
      });
    }

    toast({
      title: "Transaction Approved",
      description: "Access activated for the user.",
    });
    setProcessingId(null);
  };

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;

    const codeId = newCode.toUpperCase().trim();
    const codeRef = doc(db, 'redeemCodes', codeId);

    setDocumentNonBlocking(codeRef, {
      id: codeId,
      planType: 'PaidMonthly',
      isUsed: false,
      multiUse: isMultiUse,
      createdAt: new Date().toISOString(),
    }, { merge: true });

    toast({
      title: "Code Created",
      description: `Voucher ${codeId} is now active.`,
    });
    setNewCode('');
    setIsMultiUse(false);
  };

  const handleDeleteCode = (codeId: string) => {
    const codeRef = doc(db, 'redeemCodes', codeId);
    deleteDocumentNonBlocking(codeRef);
    toast({
      title: "Code Deleted",
      description: `Voucher ${codeId} has been removed.`,
    });
  };

  const handleSeedData = async () => {
    if (!user) return;
    setIsSeeding(true);
    
    const batch = writeBatch(db);
    
    const codes = [
      { id: 'WELCOME100', multiUse: true },
      { id: 'TRIAL2025', multiUse: false },
      { id: 'ADMIN_FREE', multiUse: true }
    ];

    codes.forEach(c => {
      const ref = doc(db, 'redeemCodes', c.id);
      batch.set(ref, {
        id: c.id,
        planType: 'PaidMonthly',
        isUsed: false,
        multiUse: c.multiUse,
        createdAt: new Date().toISOString()
      });
    });

    try {
      await batch.commit();
      toast({ title: "Database Seeded", description: "Sample codes populated." });
    } catch (e) {
      toast({ variant: "destructive", title: "Seeding Failed", description: "Check permissions." });
    } finally {
      setIsSeeding(false);
    }
  };

  if (isUserLoading || (user && isAdminLoading)) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isSimpleAuthenticated && user && hasAdminUid) {
    return (
      <div className="container mx-auto px-4 py-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-headline text-white">Admin Console</h1>
              <p className="text-muted-foreground">System Identity: <span className="text-primary font-mono text-xs">{user.uid}</span></p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSeedData} disabled={isSeeding} className="border-white/10 glass-morphism">
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
              Seed Sample Codes
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsSimpleAuthenticated(false)} className="border-white/10 glass-morphism">
              Lock Console
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                <Zap className="w-4 h-4" /> Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold font-headline text-white">{allRequests?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> UTR Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold font-headline text-white">{allPayments?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                <Ticket className="w-4 h-4" /> Active Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold font-headline text-white">{redeemCodes?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                <Wifi className="w-4 h-4" /> Global Nodes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold font-headline text-secondary">Active</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 mb-6 p-1 h-12 flex w-fit">
            <TabsTrigger value="requests" className="data-[state=active]:bg-primary h-full px-6">MAC Tasks</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-primary h-full px-6">UTR Verification</TabsTrigger>
            <TabsTrigger value="redeem" className="data-[state=active]:bg-primary h-full px-6">Vouchers</TabsTrigger>
            <TabsTrigger value="inquiries" className="data-[state=active]:bg-primary h-full px-6">Inquiries</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card className="glass-card overflow-hidden">
              <CardHeader>
                <CardTitle className="text-white">Global MAC Requests</CardTitle>
                <CardDescription>Real-time stream of all unblocking requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead>MAC Address</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isRequestsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : allRequests && allRequests.length > 0 ? (
                      allRequests.map((req) => (
                        <TableRow key={req.id} className="border-white/5 hover:bg-white/5">
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(req.requestDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold text-secondary">{req.macAddress}</TableCell>
                          <TableCell className="font-medium text-white">{req.deviceName}</TableCell>
                          <TableCell className="text-white">{req.wifiProvider}</TableCell>
                          <TableCell>
                            <Badge variant={req.status === 'Unblocked' ? 'default' : 'secondary'} className={req.status === 'Unblocked' ? 'bg-primary' : 'bg-orange-500'}>
                              {req.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          No requests found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="glass-card overflow-hidden">
              <CardHeader>
                <CardTitle className="text-white">UTR Verification Logs</CardTitle>
                <CardDescription>Approve UPI transactions to activate user access.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead>Transaction ID (UTR)</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isPaymentsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : allPayments && allPayments.length > 0 ? (
                      allPayments.map((pay) => (
                        <TableRow key={pay.id} className="border-white/5 hover:bg-white/5">
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(pay.paymentDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold text-primary select-all">
                            {pay.transactionId}
                          </TableCell>
                          <TableCell className="font-bold text-white">₹{pay.amount}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-white/10 uppercase text-[10px]">
                              {pay.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={pay.status === 'Completed' ? 'default' : 'secondary'} 
                              className={pay.status === 'Completed' ? 'bg-primary' : 'bg-orange-500'}
                            >
                              {pay.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {pay.status === 'Pending' && (
                              <Button 
                                size="sm" 
                                className="h-8 neon-glow bg-primary text-white font-bold px-4"
                                onClick={() => handleApprovePayment(pay)}
                                disabled={processingId === pay.id}
                              >
                                {processingId === pay.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3 mr-1.5" />}
                                Approve
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          No pending UTR logs found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redeem">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white">Create Voucher</CardTitle>
                  <CardDescription>Generate new redeemable codes.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCode} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-white">Code</Label>
                      <Input 
                        id="code"
                        placeholder="e.g., SAVE100"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        className="bg-background/50 border-white/10"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="multi" 
                        checked={isMultiUse} 
                        onCheckedChange={(checked) => setIsMultiUse(!!checked)}
                      />
                      <Label htmlFor="multi" className="text-sm font-medium text-white cursor-pointer">Multi-use code</Label>
                    </div>
                    <Button type="submit" className="w-full neon-glow font-bold">
                      <Plus className="w-4 h-4 mr-2" /> Activate Code
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 glass-card overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white">Active Vouchers</CardTitle>
                  <CardDescription>Manage available codes.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isCodesLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                          </TableCell>
                        </TableRow>
                      ) : redeemCodes && redeemCodes.length > 0 ? (
                        redeemCodes.map((code) => (
                          <TableRow key={code.id} className="border-white/5 hover:bg-white/5">
                            <TableCell className="font-mono font-bold text-primary">{code.id}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{code.multiUse ? 'Multi-use' : 'Single-use'}</TableCell>
                            <TableCell>
                              <Badge variant={code.isUsed && !code.multiUse ? 'secondary' : 'default'} className={code.isUsed && !code.multiUse ? 'bg-muted' : 'bg-green-500/20 text-green-500 border-green-500/30'}>
                                {code.isUsed && !code.multiUse ? 'Redeemed' : 'Available'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteCode(code.id)} className="text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                            No active vouchers found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inquiries">
            <Card className="glass-card overflow-hidden">
              <CardHeader>
                <CardTitle className="text-white">Contact Inquiries</CardTitle>
                <CardDescription>Messages from users.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isInquiriesLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : inquiries && inquiries.length > 0 ? (
                      inquiries.map((inquiry) => (
                        <TableRow key={inquiry.id} className="border-white/5 hover:bg-white/5">
                          <TableCell className="text-xs text-muted-foreground">{new Date(inquiry.submissionDate).toLocaleDateString()}</TableCell>
                          <TableCell className="font-bold text-white">{inquiry.name}</TableCell>
                          <TableCell className="text-primary">{inquiry.email}</TableCell>
                          <TableCell className="text-white">{inquiry.subject}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
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

  return (
    <div className="container mx-auto px-4 py-24 flex justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-md space-y-6">
        <Card className="glass-morphism border-white/10 overflow-hidden">
          <div className="h-1.5 w-full bg-primary animate-pulse" />
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              {(!user || !hasAdminUid) ? <ShieldAlert className="w-8 h-8 text-destructive" /> : <Lock className="w-8 h-8 text-primary" />}
            </div>
            <CardTitle className="text-3xl font-bold font-headline text-white">
              {(!user || !hasAdminUid) ? "Access Restricted" : "Secure Auth"}
            </CardTitle>
            <CardDescription>
              {(!user || !hasAdminUid) ? "Unauthorized session detected" : "Enter management credentials"}
            </CardDescription>
          </CardHeader>
          
          {(!user || !hasAdminUid) ? (
            <CardContent className="space-y-6">
              <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-2xl space-y-4">
                <p className="text-xs font-bold text-destructive uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> System Guard Active
                </p>
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Session Identity</p>
                  <code className="block p-3 bg-black/40 rounded-xl text-xs break-all border border-white/5 font-mono select-all text-destructive">
                    {user?.uid || "NOT_LOGGED_IN"}
                  </code>
                </div>
                {!user ? (
                  <Link href="/login" className="block w-full">
                    <Button className="w-full h-12 font-bold neon-glow">Sign In with Admin Account</Button>
                  </Link>
                ) : (
                  <p className="text-xs leading-relaxed text-muted-foreground text-center">
                    This account lacks administrative priority. Contact infrastructure support.
                  </p>
                )}
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSimpleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Admin ID</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="username"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Enter admin ID"
                      className="pl-10 bg-background/50 border-white/10 h-12 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Security Key</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="password"
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 bg-background/50 border-white/10 h-12 text-white"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button type="submit" className="w-full h-14 text-lg font-bold neon-glow rounded-xl">
                  <LogIn className="mr-2 w-5 h-5" /> Unlock Dashboard
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}


"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, collectionGroup, writeBatch } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Lock, Database, Trash2, Loader2, ShieldCheck, ShieldAlert, AlertCircle, Info } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Link from 'next/link';

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

  // Queries - Only active if simple auth is passed
  const inquiriesQuery = useMemoFirebase(() => {
    if (!user || !isSimpleAuthenticated) return null;
    return query(collection(db, 'contactInquiries'), orderBy('submissionDate', 'desc'));
  }, [db, user, isSimpleAuthenticated]);

  const { data: inquiries, isLoading: isInquiriesLoading } = useCollection(inquiriesQuery);

  const allRequestsQuery = useMemoFirebase(() => {
    if (!user || !isSimpleAuthenticated) return null;
    return query(collectionGroup(db, 'unblockRequests'), orderBy('requestDate', 'desc'));
  }, [db, user, isSimpleAuthenticated]);

  const { data: allRequests, isLoading: isRequestsLoading } = useCollection(allRequestsQuery);

  const allPaymentsQuery = useMemoFirebase(() => {
    if (!user || !isSimpleAuthenticated) return null;
    return query(collectionGroup(db, 'payments'), orderBy('paymentDate', 'desc'));
  }, [db, user, isSimpleAuthenticated]);

  const { data: allPayments, isLoading: isPaymentsLoading } = useCollection(allPaymentsQuery);

  const redeemCodesQuery = useMemoFirebase(() => {
    if (!user || !isSimpleAuthenticated) return null;
    return collection(db, 'redeemCodes');
  }, [db, user, isSimpleAuthenticated]);

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

  if (isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isSimpleAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-headline text-white">Admin Console</h1>
              <p className="text-muted-foreground">Session Active: <span className="text-primary font-mono text-xs">{ADMIN_USERNAME}</span></p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSeedData} disabled={isSeeding} className="border-white/10 glass-morphism">
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
              Seed Codes
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsSimpleAuthenticated(false)} className="border-white/10 glass-morphism">
              Lock Console
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold font-headline text-white">{allRequests?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase">UTR Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold font-headline text-white">{allPayments?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Vouchers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold font-headline text-white">{redeemCodes?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase">System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold font-headline text-secondary">Online</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 mb-6">
            <TabsTrigger value="requests">MAC Tasks</TabsTrigger>
            <TabsTrigger value="payments">UTR Verification</TabsTrigger>
            <TabsTrigger value="redeem">Vouchers</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>MAC Address</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isRequestsLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : allRequests?.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="text-xs">{new Date(req.requestDate).toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono text-xs text-secondary">{req.macAddress}</TableCell>
                      <TableCell>{req.deviceName}</TableCell>
                      <TableCell>
                        <Badge className={req.status === 'Unblocked' ? 'bg-primary' : 'bg-orange-500'}>{req.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>UTR</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPaymentsLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : allPayments?.map((pay) => (
                    <TableRow key={pay.id}>
                      <TableCell className="text-xs">{new Date(pay.paymentDate).toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono text-xs text-primary">{pay.transactionId}</TableCell>
                      <TableCell>₹{pay.amount}</TableCell>
                      <TableCell>{pay.status}</TableCell>
                      <TableCell className="text-right">
                        {pay.status === 'Pending' && (
                          <Button size="sm" onClick={() => handleApprovePayment(pay)} disabled={processingId === pay.id}>
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="redeem">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="glass-card p-6">
                <form onSubmit={handleCreateCode} className="space-y-4">
                  <Label>New Code</Label>
                  <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="e.g., SAVE100" />
                  <div className="flex items-center space-x-2">
                    <Checkbox id="multi" checked={isMultiUse} onCheckedChange={(c) => setIsMultiUse(!!c)} />
                    <Label htmlFor="multi">Multi-use</Label>
                  </div>
                  <Button type="submit" className="w-full">Create Voucher</Button>
                </form>
              </Card>
              <Card className="lg:col-span-2 glass-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isCodesLoading ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                    ) : redeemCodes?.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono font-bold text-primary">{code.id}</TableCell>
                        <TableCell className="text-xs">{code.multiUse ? 'Multi' : 'Single'}</TableCell>
                        <TableCell>{code.isUsed && !code.multiUse ? 'Redeemed' : 'Active'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteCode(code.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inquiries">
            <Card className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isInquiriesLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : inquiries?.map((inq) => (
                    <TableRow key={inq.id}>
                      <TableCell className="text-xs">{new Date(inq.submissionDate).toLocaleDateString()}</TableCell>
                      <TableCell>{inq.name}</TableCell>
                      <TableCell>{inq.email}</TableCell>
                      <TableCell>{inq.subject}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 flex justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-md space-y-6">
        <Card className="glass-morphism border-white/10">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Management Auth</CardTitle>
            <CardDescription>Enter security credentials to access the console</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSimpleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Admin ID</Label>
                <Input value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Username" />
              </div>
              <div className="space-y-2">
                <Label>Security Key</Label>
                <Input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••••••" />
              </div>
              {!user && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-xs text-destructive">
                   <ShieldAlert className="w-4 h-4" /> Please log in to your account first.
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" disabled={!user} className="w-full neon-glow">Unlock Dashboard</Button>
              {!user && <Link href="/login" className="w-full"><Button variant="outline" className="w-full">Sign In</Button></Link>}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

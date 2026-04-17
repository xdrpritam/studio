
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, collectionGroup, writeBatch, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Database, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  ShieldAlert, 
  AlertCircle, 
  Info, 
  BarChart3, 
  Users, 
  CreditCard, 
  Voucher, 
  MessageSquare,
  ChevronRight,
  Search,
  CheckCircle2,
  XCircle,
  Mail,
  Calendar
} from 'lucide-react';
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

  // Redeem Code Creation State
  const [newCode, setNewCode] = useState('');
  const [isMultiUse, setIsMultiUse] = useState(false);

  // Queries - Only active if simple auth is passed
  const usersQuery = useMemoFirebase(() => {
    if (!user || !isSimpleAuthenticated) return null;
    return query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  }, [db, user, isSimpleAuthenticated]);

  const { data: users, isLoading: isUsersLoading } = useCollection(usersQuery);

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
      toast({ title: "Access Granted", description: "Welcome to the command center." });
    } else {
      toast({ 
        variant: "destructive", 
        title: "Access Denied", 
        description: "Invalid administrator credentials." 
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
      title: "Payment Verified",
      description: "User subscription has been activated.",
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
      title: "Voucher Created",
      description: `${codeId} is now live in the system.`,
    });
    setNewCode('');
    setIsMultiUse(false);
  };

  const handleDeleteCode = (codeId: string) => {
    const codeRef = doc(db, 'redeemCodes', codeId);
    deleteDocumentNonBlocking(codeRef);
    toast({
      title: "Voucher Expired",
      description: `Code ${codeId} has been removed.`,
    });
  };

  if (isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Establishing secure connection...</p>
      </div>
    );
  }

  if (isSimpleAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Root Authorization Active
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter">
              Admin <span className="text-primary neon-text">Terminal</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Operator</p>
              <p className="text-sm font-mono text-white">{ADMIN_USERNAME}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsSimpleAuthenticated(false)} className="border-white/10 glass-morphism h-10 px-6 font-bold">
              Lock Terminal
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { label: "Users", value: users?.length || 0, icon: Users, color: "text-primary" },
            { label: "Network Tasks", value: allRequests?.length || 0, icon: Database, color: "text-secondary" },
            { label: "UTR Verified", value: allPayments?.filter(p => p.status === 'Completed').length || 0, icon: CreditCard, color: "text-primary" },
            { label: "Vouchers", value: redeemCodes?.length || 0, icon: ShieldCheck, color: "text-secondary" },
            { label: "Inquiries", value: inquiries?.length || 0, icon: MessageSquare, color: "text-primary" }
          ].map((stat, i) => (
            <Card key={i} className="glass-card group hover:scale-[1.02] transition-transform">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-black font-headline text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 mb-8 h-14 rounded-2xl overflow-x-auto justify-start">
            <TabsTrigger value="users" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full px-6">User Registry</TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full px-6">Network Tasks</TabsTrigger>
            <TabsTrigger value="verification" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full px-6">UTR Verification</TabsTrigger>
            <TabsTrigger value="vouchers" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full px-6">Voucher Mgmt</TabsTrigger>
            <TabsTrigger value="inquiries" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full px-6">User Support</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <CardTitle className="text-xl font-bold">User Database</CardTitle>
                <div className="relative w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input placeholder="Search users..." className="pl-10 h-10 bg-black/20 border-white/10 text-xs" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5">
                      <TableHead className="font-bold text-xs uppercase">Identity</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Email</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Role</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Joined</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isUsersLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                    ) : users?.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">No users found.</TableCell></TableRow>
                    ) : users?.map((u) => (
                      <TableRow key={u.id} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">{u.firstName} {u.lastName}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{u.id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] uppercase border-primary/30 text-primary">
                            {u.role || 'User'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="sm" className="text-xs font-bold hover:text-primary">Manage</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <CardTitle className="text-xl font-bold">Recent MAC Requests</CardTitle>
                <div className="relative w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input placeholder="Filter MAC..." className="pl-10 h-10 bg-black/20 border-white/10 text-xs" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5">
                      <TableHead className="font-bold text-xs uppercase">Timestamp</TableHead>
                      <TableHead className="font-bold text-xs uppercase">MAC Identity</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Infrastructure</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Plan</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isRequestsLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                    ) : allRequests?.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">No tasks found.</TableCell></TableRow>
                    ) : allRequests?.map((req) => (
                      <TableRow key={req.id} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell className="text-xs font-mono text-muted-foreground">{new Date(req.requestDate).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-secondary font-mono font-bold">{req.macAddress}</span>
                            <span className="text-[10px] text-muted-foreground">{req.deviceName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] h-5 bg-white/5 border-white/10">{req.wifiProvider}</Badge>
                            <span className="text-xs text-white/80">{req.wifiName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={req.subscriptionId === 'FREE_TRIAL' ? 'bg-muted text-muted-foreground' : 'bg-primary/20 text-primary border-primary/30'}>
                            {req.subscriptionId === 'FREE_TRIAL' ? 'Trial' : 'Premium'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             {req.status === 'Unblocked' ? (
                               <CheckCircle2 className="w-4 h-4 text-primary" />
                             ) : (
                               <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                             )}
                             <span className={`text-xs font-bold uppercase ${req.status === 'Unblocked' ? 'text-primary' : 'text-orange-500'}`}>{req.status}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="verification">
            <Card className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/5 flex flex-col gap-2">
                <CardTitle className="text-xl font-bold">UTR Approval Queue</CardTitle>
                <CardDescription>Manually verify transaction IDs from payment apps.</CardDescription>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5">
                      <TableHead className="font-bold text-xs uppercase">Payment Date</TableHead>
                      <TableHead className="font-bold text-xs uppercase">UTR Number</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Amount</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Status</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Operations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isPaymentsLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                    ) : allPayments?.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">Queue is empty.</TableCell></TableRow>
                    ) : allPayments?.map((pay) => (
                      <TableRow key={pay.id} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell className="text-xs">{new Date(pay.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono font-bold text-primary">{pay.transactionId}</TableCell>
                        <TableCell className="font-black text-white">₹{pay.amount}</TableCell>
                        <TableCell>
                          <Badge variant={pay.status === 'Completed' ? 'default' : 'outline'} className={pay.status === 'Pending' ? 'border-orange-500/50 text-orange-500' : ''}>
                            {pay.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {pay.status === 'Pending' ? (
                            <Button 
                              size="sm" 
                              onClick={() => handleApprovePayment(pay)} 
                              disabled={processingId === pay.id}
                              className="bg-primary hover:bg-primary/80 font-bold"
                            >
                              {processingId === pay.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Activate"}
                            </Button>
                          ) : (
                            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Fully Verified
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="vouchers">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="glass-card p-8 h-fit space-y-8">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Generate Voucher</h3>
                  <p className="text-xs text-muted-foreground">Create single or multi-use activation keys.</p>
                </div>
                <form onSubmit={handleCreateCode} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Voucher Code</Label>
                    <Input 
                      value={newCode} 
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())} 
                      placeholder="e.g. FREE100" 
                      className="bg-black/20 border-white/10 h-12 uppercase font-mono"
                    />
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <Checkbox id="multi" checked={isMultiUse} onCheckedChange={(c) => setIsMultiUse(!!c)} />
                    <div className="space-y-0.5">
                      <Label htmlFor="multi" className="text-sm font-bold cursor-pointer">Multi-use Token</Label>
                      <p className="text-[10px] text-muted-foreground">Allows redemption by multiple users.</p>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 font-black neon-glow uppercase tracking-widest">Generate Key</Button>
                </form>
              </Card>

              <Card className="lg:col-span-2 glass-card overflow-hidden">
                <div className="p-6 border-b border-white/5">
                   <CardTitle className="text-xl font-bold">Active Inventory</CardTitle>
                </div>
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5">
                      <TableHead className="font-bold text-xs uppercase">Voucher Key</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Usage Type</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Redemption Status</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isCodesLoading ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                    ) : redeemCodes?.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground">No active vouchers.</TableCell></TableRow>
                    ) : redeemCodes?.map((code) => (
                      <TableRow key={code.id} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell className="font-mono font-black text-secondary">{code.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 uppercase">
                            {code.multiUse ? 'Multi-Use' : 'Single-Use'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                           {code.isUsed && !code.multiUse ? (
                             <span className="text-xs text-muted-foreground flex items-center gap-1"><XCircle className="w-3 h-3" /> Exhausted</span>
                           ) : (
                             <span className="text-xs text-primary flex items-center gap-1 font-bold"><CheckCircle2 className="w-3 h-3" /> Active</span>
                           )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteCode(code.id)} 
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
              <div className="p-6 border-b border-white/5">
                <CardTitle className="text-xl font-bold">Support Inquiries</CardTitle>
              </div>
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5">
                    <TableHead className="font-bold text-xs uppercase">Date</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Sender</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Subject</TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isInquiriesLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : inquiries?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground">No inquiries found.</TableCell></TableRow>
                  ) : inquiries?.map((inq) => (
                    <TableRow key={inq.id} className="border-white/5 hover:bg-white/[0.02]">
                      <TableCell className="text-xs text-muted-foreground">{new Date(inq.submissionDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">{inq.name}</span>
                          <span className="text-[10px] text-muted-foreground">{inq.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{inq.subject}</TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">Details <ChevronRight className="ml-1 w-4 h-4" /></Button>
                      </TableCell>
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
    <div className="container mx-auto px-4 py-24 flex flex-col justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-lg space-y-12 text-center">
        <div className="space-y-4">
           <h1 className="text-5xl font-black font-headline tracking-tighter">Terminal <span className="text-primary neon-text">Lock</span></h1>
           <p className="text-muted-foreground text-lg">Administrative authorization is required to access the core infrastructure management systems.</p>
        </div>

        <Card className="glass-morphism border-white/10 p-8">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          
          <form onSubmit={handleSimpleLogin} className="space-y-6 text-left">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Admin Identifier</Label>
                <Input 
                  value={usernameInput} 
                  onChange={(e) => setUsernameInput(e.target.value)} 
                  placeholder="Enter Operator ID" 
                  className="bg-black/40 border-white/10 h-14 font-mono focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Security Phrase</Label>
                <Input 
                  type="password" 
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)} 
                  placeholder="••••••••" 
                  className="bg-black/40 border-white/10 h-14 font-mono focus:border-primary transition-all"
                />
              </div>
            </div>

            {!user && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3 text-sm text-destructive">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Authentication Required: Please <Link href="/login" className="font-bold underline">Login</Link> to your UnMac account before entering terminal credentials.</p>
              </div>
            )}

            <Button type="submit" disabled={!user} className="w-full h-16 text-xl font-black neon-glow rounded-2xl uppercase tracking-[0.2em] transition-transform hover:scale-105 active:scale-95">
              Unlock Terminal
            </Button>
          </form>
        </Card>

        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">System Status: <span className="text-primary animate-pulse">Operational</span></p>
      </div>
    </div>
  );
}

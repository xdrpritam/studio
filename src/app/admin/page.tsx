
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, collectionGroup } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Database, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  AlertCircle, 
  Users, 
  CreditCard, 
  MessageSquare,
  ChevronRight,
  Search,
  CheckCircle2,
  XCircle,
  Timer,
  RefreshCcw,
  Edit
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ADMIN_USERNAME = 'pd863253';
const ADMIN_PASSWORD = 'sd7gen3';

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isSimpleAuthenticated, setIsSimpleAuthenticated] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // User Editing State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Redeem Code Creation State
  const [newCode, setNewCode] = useState('');
  const [isMultiUse, setIsMultiUse] = useState(false);

  // 1. Queries - OrderBy removed to avoid index requirements in prototype
  const usersQuery = useMemoFirebase(() => {
    if (!user || !isSimpleAuthenticated) return null;
    return collection(db, 'users');
  }, [db, user, isSimpleAuthenticated]);

  const { data: usersData, isLoading: isUsersLoading } = useCollection(usersQuery);

  const inquiriesQuery = useMemoFirebase(() => {
    if (!user || !isSimpleAuthenticated) return null;
    return collection(db, 'contactInquiries');
  }, [db, user, isSimpleAuthenticated]);

  const { data: inquiriesData, isLoading: isInquiriesLoading } = useCollection(inquiriesQuery);

  const allRequestsQuery = useMemoFirebase(() => {
    if (!user || !isSimpleAuthenticated) return null;
    return collectionGroup(db, 'unblockRequests');
  }, [db, user, isSimpleAuthenticated]);

  const { data: allRequestsData, isLoading: isRequestsLoading } = useCollection(allRequestsQuery);

  const allPaymentsQuery = useMemoFirebase(() => {
    if (!user || !isSimpleAuthenticated) return null;
    return collectionGroup(db, 'payments');
  }, [db, user, isSimpleAuthenticated]);

  const { data: allPaymentsData, isLoading: isPaymentsLoading } = useCollection(allPaymentsQuery);

  const redeemCodesQuery = useMemoFirebase(() => {
    if (!user || !isSimpleAuthenticated) return null;
    return collection(db, 'redeemCodes');
  }, [db, user, isSimpleAuthenticated]);

  const { data: redeemCodes, isLoading: isCodesLoading } = useCollection(redeemCodesQuery);

  // 2. Client-side Sorting
  const sortedUsers = useMemo(() => {
    if (!usersData) return [];
    return [...usersData].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [usersData]);

  const sortedInquiries = useMemo(() => {
    if (!inquiriesData) return [];
    return [...inquiriesData].sort((a, b) => new Date(b.submissionDate || 0).getTime() - new Date(a.submissionDate || 0).getTime());
  }, [inquiriesData]);

  const sortedRequests = useMemo(() => {
    if (!allRequestsData) return [];
    return [...allRequestsData].sort((a, b) => new Date(b.requestDate || 0).getTime() - new Date(a.requestDate || 0).getTime());
  }, [allRequestsData]);

  const sortedPayments = useMemo(() => {
    if (!allPaymentsData) return [];
    return [...allPaymentsData].sort((a, b) => new Date(b.paymentDate || 0).getTime() - new Date(a.paymentDate || 0).getTime());
  }, [allPaymentsData]);

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
      description: "User subscription and MAC status updated.",
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

  const handleSaveUser = () => {
    if (!editingUser) return;
    
    const userRef = doc(db, 'users', editingUser.id);
    updateDocumentNonBlocking(userRef, {
      firstName: editingUser.firstName,
      lastName: editingUser.lastName,
      role: editingUser.role,
      updatedAt: new Date().toISOString()
    });

    toast({
      title: "Profile Updated",
      description: `Changes saved for ${editingUser.email}.`,
    });
    setIsEditDialogOpen(false);
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
            { label: "Users", value: sortedUsers.length, icon: Users, color: "text-primary" },
            { label: "Network Tasks", value: sortedRequests.length, icon: Database, color: "text-secondary" },
            { label: "UTR Pending", value: sortedPayments.filter(p => p.status === 'Pending').length, icon: Timer, color: "text-orange-500" },
            { label: "Vouchers", value: redeemCodes?.length || 0, icon: ShieldCheck, color: "text-secondary" },
            { label: "Inquiries", value: sortedInquiries.length, icon: MessageSquare, color: "text-primary" }
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

        <Tabs defaultValue="verification" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 mb-8 h-14 rounded-2xl overflow-x-auto justify-start">
            <TabsTrigger value="verification" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full px-6">UTR Verification</TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full px-6">Network Tasks</TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full px-6">User Registry</TabsTrigger>
            <TabsTrigger value="vouchers" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full px-6">Voucher Mgmt</TabsTrigger>
            <TabsTrigger value="inquiries" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full px-6">User Support</TabsTrigger>
          </TabsList>

          <TabsContent value="verification">
            <Card className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/5 flex flex-col gap-2">
                <CardTitle className="text-xl font-bold">UTR Approval Queue</CardTitle>
                <CardDescription>Verify 12-digit transaction IDs. Items appear here immediately after user submission.</CardDescription>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5">
                      <TableHead className="font-bold text-xs uppercase">Date</TableHead>
                      <TableHead className="font-bold text-xs uppercase">UTR Number</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Amount</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Status</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Operations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isPaymentsLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                    ) : sortedPayments.filter(p => p.paymentMethod === 'UPI').length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">Queue is empty. No UPI payments logged yet.</TableCell></TableRow>
                    ) : sortedPayments.filter(p => p.paymentMethod === 'UPI').map((pay) => (
                      <TableRow key={pay.id} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell className="text-xs">{pay.paymentDate ? new Date(pay.paymentDate).toLocaleDateString() : 'N/A'}</TableCell>
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
                    ) : sortedUsers.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">No users found.</TableCell></TableRow>
                    ) : sortedUsers.map((u) => (
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
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="text-xs font-bold hover:text-primary gap-1.5"
                             onClick={() => {
                               setEditingUser(u);
                               setIsEditDialogOpen(true);
                             }}
                           >
                             <Edit className="w-3 h-3" /> Edit
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="glass-morphism border-white/10 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold font-headline">Edit Profile</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Modifying authentication record for {editingUser?.email}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</Label>
                      <Input 
                        value={editingUser?.firstName || ''} 
                        onChange={(e) => setEditingUser(prev => prev ? {...prev, firstName: e.target.value} : null)}
                        className="bg-black/20 border-white/10 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</Label>
                      <Input 
                        value={editingUser?.lastName || ''} 
                        onChange={(e) => setEditingUser(prev => prev ? {...prev, lastName: e.target.value} : null)}
                        className="bg-black/20 border-white/10 h-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">User Role</Label>
                    <Select 
                      value={editingUser?.role || 'user'} 
                      onValueChange={(v) => setEditingUser(prev => prev ? {...prev, role: v} : null)}
                    >
                      <SelectTrigger className="bg-black/20 border-white/10 h-12">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/10 text-white">
                        <SelectItem value="user">Standard User</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-white/10 h-12 font-bold px-8">Cancel</Button>
                  <Button onClick={handleSaveUser} className="neon-glow font-black h-12 px-8 uppercase tracking-widest">Update Identity</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                    ) : sortedRequests.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">No tasks found.</TableCell></TableRow>
                    ) : sortedRequests.map((req) => (
                      <TableRow key={req.id} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell className="text-xs font-mono text-muted-foreground">{req.requestDate ? new Date(req.requestDate).toLocaleString() : 'N/A'}</TableCell>
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
                  ) : sortedInquiries.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground">No inquiries found.</TableCell></TableRow>
                  ) : sortedInquiries.map((inq) => (
                    <TableRow key={inq.id} className="border-white/5 hover:bg-white/[0.02]">
                      <TableCell className="text-xs text-muted-foreground">{inq.submissionDate ? new Date(inq.submissionDate).toLocaleDateString() : 'N/A'}</TableCell>
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
           <p className="text-muted-foreground text-lg">Administrative authorization is required to access core systems.</p>
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
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Security Key</Label>
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
                <p>Authentication Required: Please <Link href="/login" className="font-bold underline">Login</Link> to your account first.</p>
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
    
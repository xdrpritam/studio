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

  // 1. Queries
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

  const handleDeleteUser = (userId: string) => {
    if (!confirm("Are you sure? This will delete the user profile from the database.")) return;
    const userRef = doc(db, 'users', userId);
    deleteDocumentNonBlocking(userRef);
    toast({ title: "User Purged", description: "Record has been removed." });
  };

  const handleDeleteRequest = (userId: string, requestId: string) => {
    if (!confirm("Delete this network task?")) return;
    const ref = doc(db, 'users', userId, 'unblockRequests', requestId);
    deleteDocumentNonBlocking(ref);
    toast({ title: "Task Deleted" });
  };

  const handleDeletePayment = (userId: string, paymentId: string) => {
    if (!confirm("Delete this payment log?")) return;
    const ref = doc(db, 'users', userId, 'payments', paymentId);
    deleteDocumentNonBlocking(ref);
    toast({ title: "Log Deleted" });
  };

  const handleDeleteInquiry = (inquiryId: string) => {
    if (!confirm("Delete this support message?")) return;
    const ref = doc(db, 'contactInquiries', inquiryId);
    deleteDocumentNonBlocking(ref);
    toast({ title: "Message Deleted" });
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
      <div className="container mx-auto px-4 pt-32 pb-16 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Establishing secure connection...</p>
      </div>
    );
  }

  if (isSimpleAuthenticated) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12 md:pt-32 space-y-8 md:space-y-10">
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Root Authorization Active
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter">
              Admin <span className="text-primary neon-text">Terminal</span>
            </h1>
          </div>
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="text-left md:text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Operator</p>
              <p className="text-sm font-mono text-white">{ADMIN_USERNAME}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsSimpleAuthenticated(false)} className="border-white/10 glass-morphism h-10 px-6 font-bold">
              Lock Terminal
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {[
            { label: "Users", value: sortedUsers.length, icon: Users, color: "text-primary" },
            { label: "Tasks", value: sortedRequests.length, icon: Database, color: "text-secondary" },
            { label: "UTR Pending", value: sortedPayments.filter(p => p.status === 'Pending').length, icon: Timer, color: "text-orange-500" },
            { label: "Vouchers", value: redeemCodes?.length || 0, icon: ShieldCheck, color: "text-secondary" },
            { label: "Inquiries", value: sortedInquiries.length, icon: MessageSquare, color: "text-primary" }
          ].map((stat, i) => (
            <Card key={i} className="glass-card group transition-transform active:scale-95 sm:hover:scale-[1.02]">
              <CardContent className="p-4 md:p-6 flex items-center gap-3 md:gap-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg md:text-2xl font-black font-headline text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="verification" className="w-full">
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="bg-white/5 border border-white/10 p-1 mb-6 h-12 md:h-14 rounded-2xl flex w-max min-w-full">
              <TabsTrigger value="verification" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full px-4 md:px-6 text-xs md:text-sm">UTR Verification</TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full px-4 md:px-6 text-xs md:text-sm">Network Tasks</TabsTrigger>
              <TabsTrigger value="users" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full px-4 md:px-6 text-xs md:text-sm">User Registry</TabsTrigger>
              <TabsTrigger value="vouchers" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full px-4 md:px-6 text-xs md:text-sm">Voucher Mgmt</TabsTrigger>
              <TabsTrigger value="inquiries" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full px-4 md:px-6 text-xs md:text-sm">User Support</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="verification">
            <Card className="glass-card overflow-hidden">
              <div className="p-4 md:p-6 border-b border-white/5 flex flex-col gap-2">
                <CardTitle className="text-lg md:text-xl font-bold">UTR Approval Queue</CardTitle>
                <CardDescription className="text-xs">Verify 12-digit transaction IDs. Items appear here immediately.</CardDescription>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5">
                      <TableHead className="font-bold text-[10px] uppercase">Date</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase">UTR Number</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase">Amount</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase">Status</TableHead>
                      <TableHead className="text-right font-bold text-[10px] uppercase">Operations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isPaymentsLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                    ) : sortedPayments.filter(p => p.paymentMethod === 'UPI').length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">Queue is empty. No UPI payments logged yet.</TableCell></TableRow>
                    ) : sortedPayments.filter(p => p.paymentMethod === 'UPI').map((pay) => (
                      <TableRow key={pay.id} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell className="text-[10px]">{pay.paymentDate ? new Date(pay.paymentDate).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell className="font-mono font-bold text-primary text-xs">{pay.transactionId}</TableCell>
                        <TableCell className="font-black text-white text-xs">₹{pay.amount}</TableCell>
                        <TableCell>
                          <Badge variant={pay.status === 'Completed' ? 'default' : 'outline'} className={`text-[9px] uppercase ${pay.status === 'Pending' ? 'border-orange-500/50 text-orange-500' : ''}`}>
                            {pay.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <div className="flex justify-end items-center gap-2">
                            {pay.status === 'Pending' ? (
                              <Button 
                                size="sm" 
                                onClick={() => handleApprovePayment(pay)} 
                                disabled={processingId === pay.id}
                                className="bg-primary hover:bg-primary/80 font-bold h-8 text-[10px] md:text-xs"
                              >
                                {processingId === pay.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Verify"}
                              </Button>
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeletePayment(pay.userId, pay.id)}
                              className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                           </div>
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
              <div className="p-4 md:p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="text-lg md:text-xl font-bold">User Database</CardTitle>
                <div className="relative w-full md:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input placeholder="Search users..." className="pl-10 h-10 bg-black/20 border-white/10 text-xs w-full" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5">
                      <TableHead className="font-bold text-[10px] uppercase">Identity</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase">Email</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase">Role</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase">Joined</TableHead>
                      <TableHead className="text-right font-bold text-[10px] uppercase">Actions</TableHead>
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
                          <div className="flex flex-col max-w-[120px]">
                            <span className="text-xs font-bold text-white truncate">{u.firstName} {u.lastName}</span>
                            <span className="text-[9px] text-muted-foreground font-mono truncate">{u.id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] max-w-[150px] truncate">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] uppercase border-primary/30 text-primary">
                            {u.role || 'User'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                           <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 text-primary hover:bg-primary/10"
                              onClick={() => {
                                setEditingUser(u);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                           </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="glass-morphism border-white/10 text-white max-w-[95vw] md:max-w-md rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-xl md:text-2xl font-bold font-headline">Edit Profile</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-xs md:text-sm">
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
                        className="bg-black/20 border-white/10 h-11 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</Label>
                      <Input 
                        value={editingUser?.lastName || ''} 
                        onChange={(e) => setEditingUser(prev => prev ? {...prev, lastName: e.target.value} : null)}
                        className="bg-black/20 border-white/10 h-11 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">User Role</Label>
                    <Select 
                      value={editingUser?.role || 'user'} 
                      onValueChange={(v) => setEditingUser(prev => prev ? {...prev, role: v} : null)}
                    >
                      <SelectTrigger className="bg-black/20 border-white/10 h-11 text-sm">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/10 text-white">
                        <SelectItem value="user">Standard User</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="flex-row gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1 border-white/10 h-11 font-bold text-xs">Cancel</Button>
                  <Button onClick={handleSaveUser} className="flex-1 neon-glow font-black h-11 text-xs uppercase tracking-widest">Update</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="tasks">
            <Card className="glass-card overflow-hidden">
              <div className="p-4 md:p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="text-lg md:text-xl font-bold">Recent MAC Requests</CardTitle>
                <div className="relative w-full md:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input placeholder="Filter MAC..." className="pl-10 h-10 bg-black/20 border-white/10 text-xs w-full" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5">
                      <TableHead className="font-bold text-[10px] uppercase">MAC Identity</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase">Infra</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase">Plan</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase">Status</TableHead>
                      <TableHead className="text-right font-bold text-[10px] uppercase">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isRequestsLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                    ) : sortedRequests.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">No tasks found.</TableCell></TableRow>
                    ) : sortedRequests.map((req) => (
                      <TableRow key={req.id} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell>
                          <div className="flex flex-col max-w-[140px]">
                            <span className="text-secondary font-mono font-bold text-[11px] truncate">{req.macAddress}</span>
                            <span className="text-[9px] text-muted-foreground truncate">{req.deviceName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-white/80 font-bold">{req.wifiProvider}</span>
                            <span className="text-[9px] text-muted-foreground truncate max-w-[80px]">{req.wifiName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[9px] px-2 h-5 ${req.subscriptionId === 'FREE_TRIAL' ? 'bg-muted text-muted-foreground' : 'bg-primary/20 text-primary border-primary/30'}`}>
                            {req.subscriptionId === 'FREE_TRIAL' ? 'Trial' : 'Premium'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                           {req.status === 'Unblocked' ? (
                             <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                           ) : (
                             <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                           )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteRequest(req.userId, req.id)}
                            className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="vouchers">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <Card className="glass-card p-6 md:p-8 h-fit space-y-6 md:space-y-8">
                <div className="space-y-2">
                  <h3 className="text-lg md:text-xl font-bold">Generate Voucher</h3>
                  <p className="text-[11px] text-muted-foreground">Create single or multi-use activation keys.</p>
                </div>
                <form onSubmit={handleCreateCode} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Voucher Code</Label>
                    <Input 
                      value={newCode} 
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())} 
                      placeholder="e.g. FREE100" 
                      className="bg-black/20 border-white/10 h-11 md:h-12 uppercase font-mono text-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-3 p-3 md:p-4 bg-white/5 rounded-xl border border-white/10">
                    <Checkbox id="multi" checked={isMultiUse} onCheckedChange={(c) => setIsMultiUse(!!c)} />
                    <div className="space-y-0.5">
                      <Label htmlFor="multi" className="text-xs md:text-sm font-bold cursor-pointer">Multi-use Token</Label>
                      <p className="text-[9px] text-muted-foreground">Allows multiple redemptions.</p>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 md:h-12 font-black neon-glow uppercase tracking-widest text-xs">Generate Key</Button>
                </form>
              </Card>

              <Card className="lg:col-span-2 glass-card overflow-hidden">
                <div className="p-4 md:p-6 border-b border-white/5">
                   <CardTitle className="text-lg md:text-xl font-bold">Active Inventory</CardTitle>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="border-white/5">
                        <TableHead className="font-bold text-[10px] uppercase">Voucher Key</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase">Usage</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase">Status</TableHead>
                        <TableHead className="text-right font-bold text-[10px] uppercase">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isCodesLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                      ) : redeemCodes?.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground">No active vouchers.</TableCell></TableRow>
                      ) : redeemCodes?.map((code) => (
                        <TableRow key={code.id} className="border-white/5 hover:bg-white/[0.02]">
                          <TableCell className="font-mono font-black text-secondary text-xs">{code.id}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 uppercase">
                              {code.multiUse ? 'Multi' : 'Single'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                             {code.isUsed && !code.multiUse ? (
                               <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                             ) : (
                               <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                             )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteCode(code.id)} 
                              className="w-8 h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inquiries">
            <Card className="glass-card overflow-hidden">
              <div className="p-4 md:p-6 border-b border-white/5">
                <CardTitle className="text-lg md:text-xl font-bold">Support Inquiries</CardTitle>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5">
                      <TableHead className="font-bold text-[10px] uppercase">Date</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase">Sender</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase">Subject</TableHead>
                      <TableHead className="text-right font-bold text-[10px] uppercase">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isInquiriesLoading ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                    ) : sortedInquiries.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground">No inquiries found.</TableCell></TableRow>
                    ) : sortedInquiries.map((inq) => (
                      <TableRow key={inq.id} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell className="text-[10px] text-muted-foreground">{inq.submissionDate ? new Date(inq.submissionDate).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex flex-col max-w-[120px]">
                            <span className="text-xs font-bold text-white truncate">{inq.name}</span>
                            <span className="text-[9px] text-muted-foreground truncate">{inq.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] max-w-[150px] truncate">{inq.subject}</TableCell>
                        <TableCell className="text-right">
                           <div className="flex justify-end items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteInquiry(inq.id)}
                              className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                           </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-16 flex flex-col justify-center items-center min-h-screen">
      <div className="w-full max-w-lg space-y-8 md:space-y-12 text-center">
        <div className="space-y-4 px-4">
           <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter">Terminal <span className="text-primary neon-text">Lock</span></h1>
           <p className="text-muted-foreground text-base md:text-lg">Administrative authorization is required to access core systems.</p>
        </div>

        <Card className="glass-morphism border-white/10 p-6 md:p-8 rounded-3xl mx-4">
          <div className="mx-auto w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 md:mb-8 border border-primary/20">
            <Lock className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          </div>
          
          <form onSubmit={handleSimpleLogin} className="space-y-6 md:space-y-8 text-left">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Admin Identifier</Label>
                <Input 
                  value={usernameInput} 
                  onChange={(e) => setUsernameInput(e.target.value)} 
                  placeholder="Enter Operator ID" 
                  className="bg-black/40 border-white/10 h-12 md:h-14 font-mono focus:border-primary transition-all text-sm"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Security Key</Label>
                <Input 
                  type="password" 
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)} 
                  placeholder="••••••••" 
                  className="bg-black/40 border-white/10 h-12 md:h-14 font-mono focus:border-primary transition-all text-sm"
                />
              </div>
            </div>

            {!user && (
              <div className="p-3 md:p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3 text-xs text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Authentication Required: Please <Link href="/login" className="font-bold underline">Login</Link> first.</p>
              </div>
            )}

            <Button type="submit" disabled={!user} className="w-full h-14 md:h-16 text-lg font-bold neon-glow rounded-2xl uppercase tracking-[0.2em] transition-transform active:scale-95">
              Unlock Terminal
            </Button>
          </form>
        </Card>

        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest px-4">System Status: <span className="text-primary animate-pulse">Operational</span></p>
      </div>
    </div>
  );
}

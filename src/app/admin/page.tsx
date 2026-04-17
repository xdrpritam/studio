
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, collectionGroup } from 'firebase/firestore';
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
  MessageSquare,
  Search,
  CheckCircle2,
  XCircle,
  Timer,
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
  const usersQuery = useMemoFirebase(() => (user && isSimpleAuthenticated) ? collection(db, 'users') : null, [db, user, isSimpleAuthenticated]);
  const { data: usersData, isLoading: isUsersLoading } = useCollection(usersQuery);

  const inquiriesQuery = useMemoFirebase(() => (user && isSimpleAuthenticated) ? collection(db, 'contactInquiries') : null, [db, user, isSimpleAuthenticated]);
  const { data: inquiriesData, isLoading: isInquiriesLoading } = useCollection(inquiriesQuery);

  const allRequestsQuery = useMemoFirebase(() => (user && isSimpleAuthenticated) ? collectionGroup(db, 'unblockRequests') : null, [db, user, isSimpleAuthenticated]);
  const { data: allRequestsData, isLoading: isRequestsLoading } = useCollection(allRequestsQuery);

  const allPaymentsQuery = useMemoFirebase(() => (user && isSimpleAuthenticated) ? collectionGroup(db, 'payments') : null, [db, user, isSimpleAuthenticated]);
  const { data: allPaymentsData, isLoading: isPaymentsLoading } = useCollection(allPaymentsQuery);

  const redeemCodesQuery = useMemoFirebase(() => (user && isSimpleAuthenticated) ? collection(db, 'redeemCodes') : null, [db, user, isSimpleAuthenticated]);
  const { data: redeemCodes, isLoading: isCodesLoading } = useCollection(redeemCodesQuery);

  // Sorting
  const sortedUsers = useMemo(() => usersData ? [...usersData].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()) : [], [usersData]);
  const sortedInquiries = useMemo(() => inquiriesData ? [...inquiriesData].sort((a, b) => new Date(b.submissionDate || 0).getTime() - new Date(a.submissionDate || 0).getTime()) : [], [inquiriesData]);
  const sortedRequests = useMemo(() => allRequestsData ? [...allRequestsData].sort((a, b) => new Date(b.requestDate || 0).getTime() - new Date(a.requestDate || 0).getTime()) : [], [allRequestsData]);
  const sortedPayments = useMemo(() => allPaymentsData ? [...allPaymentsData].sort((a, b) => new Date(b.paymentDate || 0).getTime() - new Date(a.paymentDate || 0).getTime()) : [], [allPaymentsData]);

  const handleSimpleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === ADMIN_USERNAME && passwordInput === ADMIN_PASSWORD) {
      setIsSimpleAuthenticated(true);
      toast({ title: "Access Granted" });
    } else {
      toast({ variant: "destructive", title: "Access Denied" });
    }
  };

  const handleApprovePayment = (payment: any) => {
    if (!payment.userId || !payment.id) return;
    setProcessingId(payment.id);
    updateDocumentNonBlocking(doc(db, 'users', payment.userId, 'payments', payment.id), { status: 'Completed', updatedAt: new Date().toISOString() });
    
    if (payment.requestId) {
      updateDocumentNonBlocking(doc(db, 'users', payment.userId, 'unblockRequests', payment.requestId), { 
        status: 'Unblocked', 
        unblockedAt: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    toast({ title: "Payment Verified" });
    setProcessingId(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Purge user?")) deleteDocumentNonBlocking(doc(db, 'users', userId));
  };

  const handleDeleteRequest = (userId: string, requestId: string, mac: string) => {
    if (!confirm("Delete task?")) return;
    deleteDocumentNonBlocking(doc(db, 'activeMacs', mac));
    deleteDocumentNonBlocking(doc(db, 'users', userId, 'unblockRequests', requestId));
    toast({ title: "Task Purged" });
  };

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    const codeId = newCode.toUpperCase().trim();
    setDocumentNonBlocking(doc(db, 'redeemCodes', codeId), { id: codeId, planType: 'PaidMonthly', isUsed: false, multiUse: isMultiUse, createdAt: new Date().toISOString() }, { merge: true });
    toast({ title: "Voucher Created" });
    setNewCode('');
  };

  const handleDeleteCode = (codeId: string) => {
    deleteDocumentNonBlocking(doc(db, 'redeemCodes', codeId));
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    updateDocumentNonBlocking(doc(db, 'users', editingUser.id), { firstName: editingUser.firstName, lastName: editingUser.lastName, role: editingUser.role, updatedAt: new Date().toISOString() });
    setIsEditDialogOpen(false);
  };

  if (isUserLoading) return <div className="container mx-auto px-4 pt-32 flex flex-col items-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  if (isSimpleAuthenticated) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12 space-y-8">
        <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter">Admin <span className="text-primary">Terminal</span></h1>
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Users", value: sortedUsers.length, icon: Users, color: "text-primary" },
            { label: "Tasks", value: sortedRequests.length, icon: Database, color: "text-secondary" },
            { label: "Pending", value: sortedPayments.filter(p => p.status === 'Pending').length, icon: Timer, color: "text-orange-500" },
            { label: "Vouchers", value: redeemCodes?.length || 0, icon: ShieldCheck, color: "text-secondary" },
            { label: "Inquiries", value: sortedInquiries.length, icon: MessageSquare, color: "text-primary" }
          ].map((stat, i) => (
            <Card key={i} className="glass-card"><CardContent className="p-4 flex items-center gap-4"><stat.icon className={`w-6 h-6 ${stat.color}`} /><div><p className="text-[10px] font-bold text-muted-foreground uppercase">{stat.label}</p><p className="text-xl font-black">{stat.value}</p></div></CardContent></Card>
          ))}
        </div>

        <Tabs defaultValue="verification">
          <TabsList className="bg-white/5 p-1 mb-6 rounded-2xl flex overflow-x-auto"><TabsTrigger value="verification">Verification</TabsTrigger><TabsTrigger value="tasks">Tasks</TabsTrigger><TabsTrigger value="users">Registry</TabsTrigger><TabsTrigger value="vouchers">Vouchers</TabsTrigger><TabsTrigger value="inquiries">Inquiries</TabsTrigger></TabsList>
          
          <TabsContent value="verification">
            <Card className="glass-card"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>UTR</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>
              {sortedPayments.filter(p => p.paymentMethod === 'UPI').map(pay => (
                <TableRow key={pay.id}><TableCell className="text-xs">{new Date(pay.paymentDate).toLocaleDateString()}</TableCell><TableCell className="font-mono text-primary">{pay.transactionId}</TableCell><TableCell>₹{pay.amount}</TableCell><TableCell><Badge variant={pay.status === 'Completed' ? 'default' : 'outline'}>{pay.status}</Badge></TableCell><TableCell className="text-right">{pay.status === 'Pending' && <Button size="sm" onClick={() => handleApprovePayment(pay)} disabled={processingId === pay.id}>Approve</Button>}</TableCell></TableRow>
              ))}
            </TableBody></Table></div></Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card className="glass-card"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Identity</TableHead><TableHead>Infra</TableHead><TableHead>Plan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>
              {sortedRequests.map(req => (
                <TableRow key={req.id}><TableCell><div className="flex flex-col"><span className="text-xs font-bold">{req.macAddress}</span><span className="text-[10px] text-muted-foreground">{req.deviceName}</span></div></TableCell><TableCell className="text-xs">{req.wifiProvider}</TableCell><TableCell><Badge variant="outline">{req.subscriptionId}</Badge></TableCell><TableCell>{req.status}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDeleteRequest(req.userId, req.id, req.macAddress)}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
              ))}
            </TableBody></Table></div></Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="glass-card"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Identity</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>
              {sortedUsers.map(u => (
                <TableRow key={u.id}><TableCell><div className="flex flex-col"><span className="text-xs font-bold">{u.email}</span><span className="text-[10px] text-muted-foreground">{u.id}</span></div></TableCell><TableCell><Badge variant="outline">{u.role || 'user'}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => { setEditingUser(u); setIsEditDialogOpen(true); }}><Edit className="w-4 h-4" /></Button></TableCell></TableRow>
              ))}
            </TableBody></Table></div></Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-32 flex flex-col items-center min-h-screen">
      <Card className="w-full max-w-md glass-morphism p-8 space-y-8">
        <Lock className="w-12 h-12 text-primary mx-auto" />
        <form onSubmit={handleSimpleLogin} className="space-y-6">
          <Input value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Operator ID" className="bg-black/40 h-12" />
          <Input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Security Key" className="bg-black/40 h-12" />
          <Button type="submit" disabled={!user} className="w-full h-14 neon-glow uppercase font-bold">Unlock Terminal</Button>
        </form>
      </Card>
    </div>
  );
}

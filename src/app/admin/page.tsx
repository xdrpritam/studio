
"use client";

import { useUser, useDoc, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Lock, Users, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const adminRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'roles_admin', user.uid);
  }, [user, db]);

  const { data: adminData, isLoading: isAdminLoading } = useDoc(adminRef);

  const inquiriesQuery = useMemoFirebase(() => {
    return query(collection(db, 'contactInquiries'), orderBy('submissionDate', 'desc'));
  }, [db]);

  const { data: inquiries, isLoading: isInquiriesLoading } = useCollection(inquiriesQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isAdminLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have administrative privileges to view this page.</p>
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
              <Users className="w-4 h-4" /> Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">--</p>
          </CardContent>
        </Card>
        <Card className="glass-morphism border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Active Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">--</p>
          </CardContent>
        </Card>
        <Card className="glass-morphism border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> New Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{inquiries?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}

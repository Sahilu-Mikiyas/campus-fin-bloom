import { useParams } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, PiggyBank, CreditCard, History, FileText } from 'lucide-react';

export default function MemberProfile() {
  const { memberId } = useParams<{ memberId: string }>();
  const { members, colleges, institutions, getMemberSavings, getMemberLoans, getMemberRepayments, auditLogs } = useStore();

  const member = members.find(m => m.id === memberId);
  const college = colleges.find(c => c.id === member?.collegeId);
  const institution = institutions.find(i => i.id === member?.institutionId);
  const savings = memberId ? getMemberSavings(memberId) : [];
  const loans = memberId ? getMemberLoans(memberId) : [];
  const repayments = memberId ? getMemberRepayments(memberId) : [];
  const memberAuditLogs = auditLogs.filter(l => l.entityId === memberId);

  const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = { active: 'default', completed: 'secondary', overdue: 'destructive', defaulted: 'destructive' };

  if (!member) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Member not found</p></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{member.name}</h1>
          <p className="text-muted-foreground">{member.employeeId} • {institution?.name} • {college?.name}</p>
        </div>
        <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="capitalize ml-auto">{member.status}</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview"><User className="w-4 h-4 mr-2" />Overview</TabsTrigger>
          <TabsTrigger value="savings"><PiggyBank className="w-4 h-4 mr-2" />Savings</TabsTrigger>
          <TabsTrigger value="loans"><CreditCard className="w-4 h-4 mr-2" />Loans</TabsTrigger>
          <TabsTrigger value="repayments"><History className="w-4 h-4 mr-2" />Repayments</TabsTrigger>
          <TabsTrigger value="audit"><FileText className="w-4 h-4 mr-2" />Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-slide-up">
          <Card>
            <CardHeader><CardTitle>Member Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{member.email}</p></div>
              <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{member.phone}</p></div>
              <div><p className="text-sm text-muted-foreground">Join Date</p><p className="font-medium">{member.joinDate}</p></div>
              <div><p className="text-sm text-muted-foreground">Status</p><Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="capitalize">{member.status}</Badge></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings" className="animate-slide-up">
          <Card>
            <CardHeader><CardTitle>Savings History</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Year</TableHead><TableHead>Month</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Interest</TableHead><TableHead className="text-right">Balance</TableHead></TableRow></TableHeader>
                <TableBody>
                  {savings.map(s => (
                    <TableRow key={s.id} className="table-row-hover">
                      <TableCell>{s.year}</TableCell><TableCell>{s.month}</TableCell><TableCell className="text-right">${s.amount.toLocaleString()}</TableCell><TableCell className="text-right text-success">${s.interest.toLocaleString()}</TableCell><TableCell className="text-right font-medium">${s.balance.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans" className="animate-slide-up">
          <Card>
            <CardHeader><CardTitle>Loans</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Loan #</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Rate</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Paid</TableHead></TableRow></TableHeader>
                <TableBody>
                  {loans.map(l => (
                    <TableRow key={l.id} className="table-row-hover">
                      <TableCell className="font-medium">{l.loanNumber}</TableCell><TableCell className="text-right">${l.amount.toLocaleString()}</TableCell><TableCell className="text-right">{l.interestRate}%</TableCell><TableCell><Badge variant={statusVariants[l.status]} className="capitalize">{l.status}</Badge></TableCell><TableCell className="text-right">${l.amountPaid.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repayments" className="animate-slide-up">
          <Card>
            <CardHeader><CardTitle>Repayments</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Reference</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Method</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                <TableBody>
                  {repayments.map(r => (
                    <TableRow key={r.id} className="table-row-hover">
                      <TableCell className="font-medium">{r.reference}</TableCell><TableCell className="text-right">${r.amount.toLocaleString()}</TableCell><TableCell className="capitalize">{r.method.replace('_', ' ')}</TableCell><TableCell>{r.paidAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="animate-slide-up">
          <Card>
            <CardHeader><CardTitle>Audit Log</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Field</TableHead><TableHead>Old Value</TableHead><TableHead>New Value</TableHead><TableHead>Timestamp</TableHead></TableRow></TableHeader>
                <TableBody>
                  {memberAuditLogs.map(l => (
                    <TableRow key={l.id} className="table-row-hover">
                      <TableCell>{l.userName}</TableCell><TableCell><Badge variant="outline">{l.action}</Badge></TableCell><TableCell>{l.field}</TableCell><TableCell className="text-muted-foreground">{l.oldValue || '-'}</TableCell><TableCell>{l.newValue}</TableCell><TableCell className="text-muted-foreground">{new Date(l.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

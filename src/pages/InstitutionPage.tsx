import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, PiggyBank, CreditCard, AlertTriangle, Search, Building2 } from 'lucide-react';

export default function InstitutionPage() {
  const { institutionId } = useParams<{ institutionId: string }>();
  const navigate = useNavigate();
  const { institutions, members, getInstitutionStats } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const institution = institutions.find(i => i.id === institutionId);
  const instMembers = members.filter(m => m.institutionId === institutionId);
  const stats = institutionId ? getInstitutionStats(institutionId) : null;

  const filteredMembers = instMembers.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusVariants: Record<string, 'default' | 'secondary' | 'destructive'> = {
    active: 'default',
    inactive: 'secondary',
    suspended: 'destructive',
  };

  if (!institution) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Institution not found</p></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
          <Building2 className="w-6 h-6 text-secondary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{institution.name}</h1>
          <p className="text-muted-foreground">Code: {institution.code} • Head: {institution.head}</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Members" value={stats.memberCount} icon={Users} variant="primary" />
          <StatsCard title="Total Savings" value={stats.totalSavings} icon={PiggyBank} variant="secondary" prefix="$" />
          <StatsCard title="Active Loans" value={stats.activeLoans} icon={CreditCard} variant="primary" />
          <StatsCard title="Overdue" value={stats.overdueLoans} icon={AlertTriangle} variant="accent" />
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Members</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member, index) => (
                <TableRow key={member.id} className="table-row-hover cursor-pointer animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }} onClick={() => navigate(`/dashboard/members/${member.id}`)}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell><Badge variant="outline">{member.employeeId}</Badge></TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell><Badge variant={statusVariants[member.status]} className="capitalize">{member.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

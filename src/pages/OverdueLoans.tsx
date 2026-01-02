import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  AlertTriangle,
  AlertCircle,
  ArrowUpDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

export default function OverdueLoans() {
  const navigate = useNavigate();
  const { members, colleges, institutions, loans, repayments } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'outstanding' | 'dueDate' | 'daysOverdue'>('daysOverdue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Get overdue loans only
  const overdueLoansData = useMemo(() => {
    const overdueLoans = loans.filter(l => l.status === 'overdue' || l.status === 'defaulted');
    
    return overdueLoans.map(loan => {
      const member = members.find(m => m.id === loan.memberId);
      const loanRepayments = repayments.filter(r => r.loanId === loan.id);
      const outstanding = loan.totalPayable - loan.amountPaid;
      const daysOverdue = Math.max(0, Math.floor((Date.now() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
      
      return {
        loan,
        member,
        outstanding,
        daysOverdue,
        lastPayment: loanRepayments.length > 0 
          ? loanRepayments.reduce((latest, r) => 
              new Date(r.paidAt) > new Date(latest.paidAt) ? r : latest
            ).paidAt
          : null,
      };
    }).filter(d => d.member);
  }, [loans, members, repayments]);
  
  // Filter and sort
  const filteredData = useMemo(() => {
    let result = [...overdueLoansData];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.member?.name.toLowerCase().includes(query) ||
        d.member?.employeeId.toLowerCase().includes(query) ||
        d.loan.loanNumber.toLowerCase().includes(query)
      );
    }
    
    if (selectedCollege !== 'all') {
      result = result.filter(d => d.member?.collegeId === selectedCollege);
    }
    
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = (a.member?.name || '').localeCompare(b.member?.name || '');
          break;
        case 'outstanding':
          comparison = a.outstanding - b.outstanding;
          break;
        case 'dueDate':
          comparison = new Date(a.loan.dueDate).getTime() - new Date(b.loan.dueDate).getTime();
          break;
        case 'daysOverdue':
          comparison = a.daysOverdue - b.daysOverdue;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [overdueLoansData, searchQuery, selectedCollege, sortField, sortDirection]);
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const handleExport = () => {
    const headers = ['Loan Number', 'Employee ID', 'Name', 'Phone', 'Amount', 'Outstanding', 'Days Overdue', 'Due Date', 'Last Payment'];
    const rows = filteredData.map(d => [
      d.loan.loanNumber,
      d.member?.employeeId || '',
      d.member?.name || '',
      d.member?.phone || '',
      d.loan.amount,
      d.outstanding,
      d.daysOverdue,
      d.loan.dueDate,
      d.lastPayment || 'Never',
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'overdue-loans.csv';
    a.click();
    toast.success('Export completed');
  };
  
  // Summary stats
  const summaryStats = useMemo(() => {
    const totalOutstanding = filteredData.reduce((sum, d) => sum + d.outstanding, 0);
    const criticalCount = filteredData.filter(d => d.daysOverdue > 90).length;
    const avgDaysOverdue = filteredData.length > 0 
      ? Math.round(filteredData.reduce((sum, d) => sum + d.daysOverdue, 0) / filteredData.length)
      : 0;
    
    return { totalOutstanding, criticalCount, avgDaysOverdue, totalCount: filteredData.length };
  }, [filteredData]);
  
  const getSeverityColor = (daysOverdue: number) => {
    if (daysOverdue > 90) return 'text-destructive';
    if (daysOverdue > 30) return 'text-orange-500';
    return 'text-yellow-500';
  };
  
  const getSeverityBadge = (daysOverdue: number) => {
    if (daysOverdue > 90) return 'destructive';
    if (daysOverdue > 30) return 'default';
    return 'secondary';
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-destructive flex items-center gap-2">
            <AlertTriangle className="w-7 h-7" />
            Overdue Loans
          </h1>
          <p className="text-muted-foreground">Loans requiring immediate attention</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Overdue</p>
              <p className="text-2xl font-bold text-destructive">{summaryStats.totalCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-accent/20 border-accent/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding Amount</p>
              <p className="text-2xl font-bold">ETB {(summaryStats.totalOutstanding / 1000000).toFixed(1)}M</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Days Overdue</p>
              <p className="text-2xl font-bold">{summaryStats.avgDaysOverdue} days</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-900/20 border-red-900/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-900 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical (&gt;90 days)</p>
              <p className="text-2xl font-bold text-red-500">{summaryStats.criticalCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, employee ID, or loan number..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCollege} onValueChange={(v) => { setSelectedCollege(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Colleges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {colleges.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan Number</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    Member
                    {sortField === 'name' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('outstanding')}>
                  <div className="flex items-center gap-1">
                    Outstanding
                    {sortField === 'outstanding' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('daysOverdue')}>
                  <div className="flex items-center gap-1">
                    Days Overdue
                    {sortField === 'daysOverdue' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('dueDate')}>
                  <div className="flex items-center gap-1">
                    Due Date
                    {sortField === 'dueDate' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map(({ loan, member, outstanding, daysOverdue, lastPayment }) => {
                const dept = institutions.find(i => i.id === member?.institutionId);
                
                return (
                  <TableRow key={loan.id} className="table-row-hover">
                    <TableCell className="font-mono text-sm">{loan.loanNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{member?.name}</p>
                        <p className="text-xs text-muted-foreground">{member?.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell>{dept?.code || '-'}</TableCell>
                    <TableCell className="text-sm">{member?.phone}</TableCell>
                    <TableCell className="font-bold text-destructive">
                      ETB {outstanding.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityBadge(daysOverdue) as 'default' | 'secondary' | 'destructive'} className="gap-1">
                        <Clock className="w-3 h-3" />
                        {daysOverdue} days
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{loan.dueDate}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lastPayment || 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/dashboard/members/${member?.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredData.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No overdue loans found</p>
            </div>
          )}
          
          {filteredData.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} overdue loans
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

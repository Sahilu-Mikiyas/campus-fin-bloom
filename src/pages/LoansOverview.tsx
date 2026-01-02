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
  CreditCard,
  AlertTriangle,
  CheckCircle,
  ArrowUpDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

export default function LoansOverview() {
  const navigate = useNavigate();
  const { members, colleges, institutions, loans, repayments } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'amount' | 'outstanding' | 'dueDate'>('outstanding');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Calculate loan data
  const loanData = useMemo(() => {
    return loans.map(loan => {
      const member = members.find(m => m.id === loan.memberId);
      const loanRepayments = repayments.filter(r => r.loanId === loan.id);
      const outstanding = loan.totalPayable - loan.amountPaid;
      const progress = (loan.amountPaid / loan.totalPayable) * 100;
      
      return {
        loan,
        member,
        outstanding,
        progress,
        repaymentsCount: loanRepayments.length,
        totalRepaid: loanRepayments.reduce((sum, r) => sum + r.amount, 0),
      };
    }).filter(d => d.member);
  }, [loans, members, repayments]);
  
  // Filter and sort
  const filteredData = useMemo(() => {
    let result = [...loanData];
    
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
    
    if (selectedStatus !== 'all') {
      result = result.filter(d => d.loan.status === selectedStatus);
    }
    
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = (a.member?.name || '').localeCompare(b.member?.name || '');
          break;
        case 'amount':
          comparison = a.loan.amount - b.loan.amount;
          break;
        case 'outstanding':
          comparison = a.outstanding - b.outstanding;
          break;
        case 'dueDate':
          comparison = new Date(a.loan.dueDate).getTime() - new Date(b.loan.dueDate).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [loanData, searchQuery, selectedCollege, selectedStatus, sortField, sortDirection]);
  
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
    const headers = ['Loan Number', 'Employee ID', 'Name', 'Amount', 'Interest Rate', 'Tenure', 'Status', 'Outstanding', 'Due Date'];
    const rows = filteredData.map(d => [
      d.loan.loanNumber,
      d.member?.employeeId || '',
      d.member?.name || '',
      d.loan.amount,
      `${d.loan.interestRate}%`,
      `${d.loan.tenure} months`,
      d.loan.status,
      d.outstanding,
      d.loan.dueDate,
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loans-overview.csv';
    a.click();
    toast.success('Export completed');
  };
  
  // Summary stats
  const summaryStats = useMemo(() => {
    const totalDisbursed = filteredData.reduce((sum, d) => sum + d.loan.amount, 0);
    const totalOutstanding = filteredData.reduce((sum, d) => sum + d.outstanding, 0);
    const activeLoans = filteredData.filter(d => d.loan.status === 'active').length;
    const overdueLoans = filteredData.filter(d => d.loan.status === 'overdue' || d.loan.status === 'defaulted').length;
    
    return { totalDisbursed, totalOutstanding, activeLoans, overdueLoans, totalLoans: filteredData.length };
  }, [filteredData]);
  
  const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    completed: 'secondary',
    overdue: 'destructive',
    defaulted: 'destructive',
  };
  
  const statusIcons: Record<string, React.ReactNode> = {
    active: <CreditCard className="w-3 h-3" />,
    completed: <CheckCircle className="w-3 h-3" />,
    overdue: <AlertTriangle className="w-3 h-3" />,
    defaulted: <AlertTriangle className="w-3 h-3" />,
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Loans Overview</h1>
          <p className="text-muted-foreground">Complete overview of all member loans</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Disbursed</p>
              <p className="text-2xl font-bold">ETB {(summaryStats.totalDisbursed / 1000000).toFixed(1)}M</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-accent/20 border-accent/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold">ETB {(summaryStats.totalOutstanding / 1000000).toFixed(1)}M</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Loans</p>
              <p className="text-2xl font-bold">{summaryStats.activeLoans}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue Loans</p>
              <p className="text-2xl font-bold">{summaryStats.overdueLoans}</p>
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
            
            <Select value={selectedStatus} onValueChange={(v) => { setSelectedStatus(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="defaulted">Defaulted</SelectItem>
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
                <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                  <div className="flex items-center gap-1">
                    Amount
                    {sortField === 'amount' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </TableHead>
                <TableHead>Interest</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('outstanding')}>
                  <div className="flex items-center gap-1">
                    Outstanding
                    {sortField === 'outstanding' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('dueDate')}>
                  <div className="flex items-center gap-1">
                    Due Date
                    {sortField === 'dueDate' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map(({ loan, member, outstanding, progress }) => {
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
                    <TableCell className="font-medium">ETB {loan.amount.toLocaleString()}</TableCell>
                    <TableCell>{loan.interestRate}%</TableCell>
                    <TableCell className={outstanding > 0 ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                      {outstanding > 0 ? `ETB ${outstanding.toLocaleString()}` : 'Paid'}
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}%</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[loan.status]} className="capitalize gap-1">
                        {statusIcons[loan.status]}
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{loan.dueDate}</TableCell>
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
          
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} loans
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
        </CardContent>
      </Card>
    </div>
  );
}

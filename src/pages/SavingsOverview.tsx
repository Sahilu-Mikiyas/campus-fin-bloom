import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  PiggyBank,
  TrendingUp,
  ArrowUpDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SavingsOverview() {
  const navigate = useNavigate();
  const { members, colleges, institutions, savings } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'balance' | 'monthlyAmount'>('balance');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Calculate savings data for each member
  const memberSavingsData = useMemo(() => {
    return members.map(member => {
      const memberSavings = savings.filter(s => s.memberId === member.id);
      const latestSaving = memberSavings.reduce((latest, s) => {
        if (!latest || new Date(s.createdAt) > new Date(latest.createdAt)) return s;
        return latest;
      }, null as typeof memberSavings[0] | null);
      
      const avgMonthlyAmount = memberSavings.length > 0 
        ? memberSavings.reduce((sum, s) => sum + s.amount, 0) / memberSavings.length 
        : 0;
      
      const totalInterestEarned = memberSavings.reduce((sum, s) => sum + s.interest, 0);
      
      return {
        member,
        balance: latestSaving?.balance || 0,
        monthlyAmount: avgMonthlyAmount,
        totalInterest: totalInterestEarned,
        savingsCount: memberSavings.length,
      };
    }).filter(m => m.balance > 0);
  }, [members, savings]);
  
  // Filter and sort
  const filteredData = useMemo(() => {
    let result = [...memberSavingsData];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.member.name.toLowerCase().includes(query) ||
        d.member.employeeId.toLowerCase().includes(query)
      );
    }
    
    if (selectedCollege !== 'all') {
      result = result.filter(d => d.member.collegeId === selectedCollege);
    }
    
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.member.name.localeCompare(b.member.name);
          break;
        case 'balance':
          comparison = a.balance - b.balance;
          break;
        case 'monthlyAmount':
          comparison = a.monthlyAmount - b.monthlyAmount;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [memberSavingsData, searchQuery, selectedCollege, sortField, sortDirection]);
  
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
    const headers = ['Employee ID', 'Name', 'College', 'Department', 'Balance', 'Avg Monthly', 'Total Interest'];
    const rows = filteredData.map(d => {
      const college = colleges.find(c => c.id === d.member.collegeId);
      const dept = institutions.find(i => i.id === d.member.institutionId);
      return [
        d.member.employeeId,
        d.member.name,
        college?.name || '',
        dept?.name || '',
        d.balance,
        Math.round(d.monthlyAmount),
        d.totalInterest,
      ];
    });
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'savings-overview.csv';
    a.click();
    toast.success('Export completed');
  };
  
  // Summary stats
  const summaryStats = useMemo(() => {
    const totalBalance = filteredData.reduce((sum, d) => sum + d.balance, 0);
    const totalInterest = filteredData.reduce((sum, d) => sum + d.totalInterest, 0);
    const avgBalance = filteredData.length > 0 ? totalBalance / filteredData.length : 0;
    
    return { totalBalance, totalInterest, avgBalance, memberCount: filteredData.length };
  }, [filteredData]);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Savings Overview</h1>
          <p className="text-muted-foreground">Complete overview of all member savings</p>
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
              <PiggyBank className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Savings</p>
              <p className="text-2xl font-bold">ETB {(summaryStats.totalBalance / 1000000).toFixed(1)}M</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/10 border-secondary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Interest Earned</p>
              <p className="text-2xl font-bold">ETB {summaryStats.totalInterest.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Balance</p>
              <p className="text-2xl font-bold">ETB {Math.round(summaryStats.avgBalance).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Savers</p>
              <p className="text-2xl font-bold">{summaryStats.memberCount.toLocaleString()}</p>
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
                  placeholder="Search by name or employee ID..."
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
                <TableHead>Employee ID</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    Name
                    {sortField === 'name' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </TableHead>
                <TableHead>Department</TableHead>
                <TableHead>College</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('balance')}>
                  <div className="flex items-center gap-1">
                    Balance
                    {sortField === 'balance' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('monthlyAmount')}>
                  <div className="flex items-center gap-1">
                    Avg Monthly
                    {sortField === 'monthlyAmount' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </TableHead>
                <TableHead>Interest Earned</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map(({ member, balance, monthlyAmount, totalInterest }) => {
                const college = colleges.find(c => c.id === member.collegeId);
                const dept = institutions.find(i => i.id === member.institutionId);
                
                return (
                  <TableRow key={member.id} className="table-row-hover">
                    <TableCell className="font-mono text-sm">{member.employeeId}</TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{dept?.code || '-'}</TableCell>
                    <TableCell>{college?.code || '-'}</TableCell>
                    <TableCell className="text-primary font-bold">
                      ETB {balance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ETB {Math.round(monthlyAmount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-secondary font-medium">
                      ETB {totalInterest.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/dashboard/members/${member.id}`)}
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} savers
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

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Users,
  Filter,
  ArrowUpDown,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  Download,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  CreditCard,
} from 'lucide-react';
import { PasswordModal } from '@/components/modals/PasswordModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function MembersDirectory() {
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const { members, colleges, institutions, savings, loans, updateMember, deleteMember } = useStore();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'employeeId' | 'joinDate' | 'savings' | 'loans'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<typeof members[0] | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });
  
  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});
  
  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingMember, setDeletingMember] = useState<typeof members[0] | null>(null);
  
  // Get departments filtered by selected college
  const filteredDepartments = useMemo(() => {
    if (selectedCollege === 'all') return institutions;
    return institutions.filter(i => i.collegeId === selectedCollege);
  }, [selectedCollege, institutions]);
  
  // Calculate member statistics
  const getMemberStats = (memberId: string) => {
    const memberSavings = savings.filter(s => s.memberId === memberId);
    const memberLoans = loans.filter(l => l.memberId === memberId);
    
    const latestSaving = memberSavings.reduce((latest, s) => {
      if (!latest || new Date(s.createdAt) > new Date(latest.createdAt)) return s;
      return latest;
    }, null as typeof memberSavings[0] | null);
    
    const totalSavings = latestSaving?.balance || 0;
    const activeLoans = memberLoans.filter(l => l.status === 'active' || l.status === 'overdue');
    const totalLoanBalance = activeLoans.reduce((sum, l) => sum + (l.totalPayable - l.amountPaid), 0);
    
    return { totalSavings, totalLoanBalance, activeLoansCount: activeLoans.length };
  };
  
  // Filter and sort members
  const filteredMembers = useMemo(() => {
    let result = [...members];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.employeeId.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.phone.includes(query)
      );
    }
    
    // Apply college filter
    if (selectedCollege !== 'all') {
      result = result.filter(m => m.collegeId === selectedCollege);
    }
    
    // Apply department filter
    if (selectedDepartment !== 'all') {
      result = result.filter(m => m.institutionId === selectedDepartment);
    }
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      result = result.filter(m => m.status === selectedStatus);
    }
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'employeeId':
          comparison = a.employeeId.localeCompare(b.employeeId);
          break;
        case 'joinDate':
          comparison = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
          break;
        case 'savings':
          comparison = getMemberStats(a.id).totalSavings - getMemberStats(b.id).totalSavings;
          break;
        case 'loans':
          comparison = getMemberStats(a.id).totalLoanBalance - getMemberStats(b.id).totalLoanBalance;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [members, searchQuery, selectedCollege, selectedDepartment, selectedStatus, sortField, sortDirection]);
  
  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset to first page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };
  
  // Toggle sort
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Password protected action
  const requirePassword = (action: () => void) => {
    setPendingAction(() => action);
    setShowPasswordModal(true);
  };
  
  const handlePasswordConfirm = () => {
    setShowPasswordModal(false);
    pendingAction();
  };
  
  // Edit member
  const handleEditClick = (member: typeof members[0]) => {
    setEditingMember(member);
    setEditForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      status: member.status,
    });
    requirePassword(() => setShowEditModal(true));
  };
  
  const handleSaveEdit = () => {
    if (!editingMember) return;
    updateMember(editingMember.id, editForm);
    setShowEditModal(false);
    setEditingMember(null);
    toast.success('Member updated successfully');
  };
  
  // Delete member
  const handleDeleteClick = (member: typeof members[0]) => {
    setDeletingMember(member);
    requirePassword(() => setShowDeleteDialog(true));
  };
  
  const handleConfirmDelete = () => {
    if (!deletingMember) return;
    deleteMember(deletingMember.id);
    setShowDeleteDialog(false);
    setDeletingMember(null);
    toast.success('Member deleted successfully');
  };
  
  // Export to CSV
  const handleExport = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Phone', 'College', 'Department', 'Status', 'Join Date', 'Total Savings', 'Loan Balance'];
    const rows = filteredMembers.map(m => {
      const college = colleges.find(c => c.id === m.collegeId);
      const dept = institutions.find(i => i.id === m.institutionId);
      const stats = getMemberStats(m.id);
      return [
        m.employeeId,
        m.name,
        m.email,
        m.phone,
        college?.name || '',
        dept?.name || '',
        m.status,
        m.joinDate,
        stats.totalSavings,
        stats.totalLoanBalance,
      ];
    });
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'members-directory.csv';
    a.click();
    toast.success('Export completed');
  };
  
  const statusVariants: Record<string, 'default' | 'secondary' | 'destructive'> = {
    active: 'default',
    inactive: 'secondary',
    suspended: 'destructive',
  };
  
  // Summary stats
  const summaryStats = useMemo(() => {
    const activeCount = filteredMembers.filter(m => m.status === 'active').length;
    const totalSavings = filteredMembers.reduce((sum, m) => sum + getMemberStats(m.id).totalSavings, 0);
    const totalLoans = filteredMembers.reduce((sum, m) => sum + getMemberStats(m.id).totalLoanBalance, 0);
    
    return { total: filteredMembers.length, activeCount, totalSavings, totalLoans };
  }, [filteredMembers]);
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Members Directory</h1>
          <p className="text-muted-foreground">Complete list of all savings and loan members</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold">{summaryStats.total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Members</p>
              <p className="text-2xl font-bold">{summaryStats.activeCount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Savings</p>
              <p className="text-2xl font-bold">ETB {(summaryStats.totalSavings / 1000000).toFixed(1)}M</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding Loans</p>
              <p className="text-2xl font-bold">ETB {(summaryStats.totalLoans / 1000000).toFixed(1)}M</p>
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
                  placeholder="Search by name, ID, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange(); }}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCollege} onValueChange={(v) => { setSelectedCollege(v); setSelectedDepartment('all'); handleFilterChange(); }}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Colleges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {colleges.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedDepartment} onValueChange={(v) => { setSelectedDepartment(v); handleFilterChange(); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {filteredDepartments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.code} - {d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={(v) => { setSelectedStatus(v); handleFilterChange(); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
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
                <TableHead className="cursor-pointer" onClick={() => handleSort('employeeId')}>
                  <div className="flex items-center gap-1">
                    Employee ID
                    {sortField === 'employeeId' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    Name
                    {sortField === 'name' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </TableHead>
                <TableHead>Department</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('savings')}>
                  <div className="flex items-center gap-1">
                    Savings
                    {sortField === 'savings' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('loans')}>
                  <div className="flex items-center gap-1">
                    Loan Balance
                    {sortField === 'loans' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('joinDate')}>
                  <div className="flex items-center gap-1">
                    Join Date
                    {sortField === 'joinDate' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.map(member => {
                const college = colleges.find(c => c.id === member.collegeId);
                const dept = institutions.find(i => i.id === member.institutionId);
                const stats = getMemberStats(member.id);
                
                return (
                  <TableRow key={member.id} className="table-row-hover">
                    <TableCell className="font-mono text-sm">{member.employeeId}</TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{dept?.code || '-'}</TableCell>
                    <TableCell>{college?.code || '-'}</TableCell>
                    <TableCell className="text-sm">{member.phone}</TableCell>
                    <TableCell className="text-success font-medium">
                      ETB {stats.totalSavings.toLocaleString()}
                    </TableCell>
                    <TableCell className={stats.totalLoanBalance > 0 ? 'text-warning font-medium' : 'text-muted-foreground'}>
                      {stats.totalLoanBalance > 0 ? `ETB ${stats.totalLoanBalance.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[member.status]} className="capitalize">
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{member.joinDate}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/members/${member.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          {canEdit && (
                            <>
                              <DropdownMenuItem onClick={() => handleEditClick(member)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Member
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(member)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Member
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
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
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
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
      
      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>Update member information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(v: 'active' | 'inactive' | 'suspended') => setEditForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Password Modal */}
      <PasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordConfirm}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingMember?.name}</strong>? 
              This action cannot be undone and will remove all associated savings, loans, and repayment records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingMember(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

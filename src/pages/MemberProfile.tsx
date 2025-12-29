import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, PiggyBank, CreditCard, History, FileText, Edit, Plus, Trash2, Save, X } from 'lucide-react';
import { PasswordModal } from '@/components/modals/PasswordModal';
import { toast } from 'sonner';

export default function MemberProfile() {
  const { memberId } = useParams<{ memberId: string }>();
  const { canEdit } = useAuth();
  const {
    members,
    colleges,
    institutions,
    getMemberSavings,
    getMemberLoans,
    getMemberRepayments,
    auditLogs,
    updateMember,
    addSaving,
    updateSaving,
    deleteSaving,
    addLoan,
    updateLoan,
    addRepayment,
  } = useStore();

  const member = members.find(m => m.id === memberId);
  const college = colleges.find(c => c.id === member?.collegeId);
  const institution = institutions.find(i => i.id === member?.institutionId);
  const savings = memberId ? getMemberSavings(memberId) : [];
  const loans = memberId ? getMemberLoans(memberId) : [];
  const repayments = memberId ? getMemberRepayments(memberId) : [];
  const memberAuditLogs = auditLogs.filter(l => l.entityId === memberId);

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});

  // Edit member state
  const [editingMember, setEditingMember] = useState(false);
  const [memberForm, setMemberForm] = useState({
    name: member?.name || '',
    email: member?.email || '',
    phone: member?.phone || '',
    status: member?.status || 'active',
  });

  // Add saving modal state
  const [showAddSavingModal, setShowAddSavingModal] = useState(false);
  const [savingForm, setSavingForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    amount: 0,
    interest: 0,
  });

  // Editing saving state
  const [editingSavingId, setEditingSavingId] = useState<string | null>(null);
  const [editSavingForm, setEditSavingForm] = useState({
    amount: 0,
    interest: 0,
  });

  // Add loan modal state
  const [showAddLoanModal, setShowAddLoanModal] = useState(false);
  const [loanForm, setLoanForm] = useState({
    amount: 0,
    interestRate: 5,
    tenure: 12,
  });

  // Add repayment modal state
  const [showAddRepaymentModal, setShowAddRepaymentModal] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [repaymentForm, setRepaymentForm] = useState({
    amount: 0,
    method: 'bank_transfer' as 'cash' | 'bank_transfer' | 'salary_deduction',
  });

  const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    completed: 'secondary',
    overdue: 'destructive',
    defaulted: 'destructive',
    inactive: 'secondary',
    suspended: 'destructive',
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Password protected action wrapper
  const requirePassword = (action: () => void) => {
    setPendingAction(() => action);
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = () => {
    setShowPasswordModal(false);
    pendingAction();
  };

  // Member edit handlers
  const handleEditMember = () => {
    if (!canEdit || !member) return;
    setMemberForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      status: member.status,
    });
    requirePassword(() => setEditingMember(true));
  };

  const handleSaveMember = () => {
    if (!memberId) return;
    updateMember(memberId, memberForm);
    setEditingMember(false);
    toast.success('Member updated successfully');
  };

  // Saving handlers
  const handleAddSaving = () => {
    if (!memberId) return;
    addSaving({
      id: `sav-${Date.now()}`,
      memberId,
      ...savingForm,
      balance: savingForm.amount + savingForm.interest,
      createdAt: new Date().toISOString(),
    });
    setShowAddSavingModal(false);
    setSavingForm({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, amount: 0, interest: 0 });
    toast.success('Saving added successfully');
  };

  const handleEditSaving = (saving: typeof savings[0]) => {
    setEditSavingForm({ amount: saving.amount, interest: saving.interest });
    requirePassword(() => setEditingSavingId(saving.id));
  };

  const handleSaveSaving = (savingId: string) => {
    updateSaving(savingId, {
      ...editSavingForm,
      balance: editSavingForm.amount + editSavingForm.interest,
    });
    setEditingSavingId(null);
    toast.success('Saving updated successfully');
  };

  const handleDeleteSaving = (savingId: string) => {
    requirePassword(() => {
      deleteSaving(savingId);
      toast.success('Saving deleted successfully');
    });
  };

  // Loan handlers
  const handleAddLoan = () => {
    if (!memberId) return;
    addLoan({
      id: `loan-${Date.now()}`,
      memberId,
      loanNumber: `LN-${Date.now().toString(36).toUpperCase()}`,
      amount: loanForm.amount,
      interestRate: loanForm.interestRate,
      tenure: loanForm.tenure,
      status: 'active',
      amountPaid: 0,
    });
    setShowAddLoanModal(false);
    setLoanForm({ amount: 0, interestRate: 5, tenure: 12 });
    toast.success('Loan added successfully');
  };

  // Repayment handlers
  const handleAddRepayment = () => {
    if (!selectedLoanId || !memberId) {
      toast.error('Please select a loan');
      return;
    }
    addRepayment({
      id: `rep-${Date.now()}`,
      memberId,
      loanId: selectedLoanId,
      ...repaymentForm,
      reference: `REP-${Date.now().toString(36).toUpperCase()}`,
      paidAt: new Date().toISOString().split('T')[0],
    });
    // Update loan amountPaid
    const loan = loans.find(l => l.id === selectedLoanId);
    if (loan) {
      updateLoan(selectedLoanId, { amountPaid: loan.amountPaid + repaymentForm.amount });
    }
    setShowAddRepaymentModal(false);
    setRepaymentForm({ amount: 0, method: 'bank_transfer' });
    setSelectedLoanId('');
    toast.success('Repayment recorded successfully');
  };

  if (!member) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Member not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{member.name}</h1>
          <p className="text-muted-foreground">
            {member.employeeId} • {institution?.name} • {college?.name}
          </p>
        </div>
        <Badge variant={statusVariants[member.status]} className="capitalize">
          {member.status}
        </Badge>
        {canEdit && (
          <Button variant="outline" onClick={handleEditMember} className="hover-scale">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <User className="w-4 h-4 mr-2" />Overview
          </TabsTrigger>
          <TabsTrigger value="savings">
            <PiggyBank className="w-4 h-4 mr-2" />Savings
          </TabsTrigger>
          <TabsTrigger value="loans">
            <CreditCard className="w-4 h-4 mr-2" />Loans
          </TabsTrigger>
          <TabsTrigger value="repayments">
            <History className="w-4 h-4 mr-2" />Repayments
          </TabsTrigger>
          <TabsTrigger value="audit">
            <FileText className="w-4 h-4 mr-2" />Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="animate-slide-up">
          <Card>
            <CardHeader>
              <CardTitle>Member Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{member.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{member.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Join Date</p>
                <p className="font-medium">{member.joinDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={statusVariants[member.status]} className="capitalize">
                  {member.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Savings Tab */}
        <TabsContent value="savings" className="animate-slide-up">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Savings History</CardTitle>
              {canEdit && (
                <Button
                  size="sm"
                  onClick={() => requirePassword(() => setShowAddSavingModal(true))}
                  className="hover-scale"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Saving
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    {canEdit && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savings.map(s => (
                    <TableRow key={s.id} className="table-row-hover">
                      <TableCell>{s.year}</TableCell>
                      <TableCell>{s.month}</TableCell>
                      <TableCell className="text-right">
                        {editingSavingId === s.id ? (
                          <Input
                            type="number"
                            value={editSavingForm.amount}
                            onChange={(e) => setEditSavingForm({ ...editSavingForm, amount: Number(e.target.value) })}
                            className="w-24 text-right"
                          />
                        ) : (
                          `$${s.amount.toLocaleString()}`
                        )}
                      </TableCell>
                      <TableCell className="text-right text-success">
                        {editingSavingId === s.id ? (
                          <Input
                            type="number"
                            value={editSavingForm.interest}
                            onChange={(e) => setEditSavingForm({ ...editSavingForm, interest: Number(e.target.value) })}
                            className="w-24 text-right"
                          />
                        ) : (
                          `$${s.interest.toLocaleString()}`
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${(editingSavingId === s.id
                          ? editSavingForm.amount + editSavingForm.interest
                          : s.balance
                        ).toLocaleString()}
                      </TableCell>
                      {canEdit && (
                        <TableCell className="text-right">
                          {editingSavingId === s.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => handleSaveSaving(s.id)}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingSavingId(null)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => handleEditSaving(s)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteSaving(s.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loans Tab */}
        <TabsContent value="loans" className="animate-slide-up">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Loans</CardTitle>
              {canEdit && (
                <Button
                  size="sm"
                  onClick={() => requirePassword(() => setShowAddLoanModal(true))}
                  className="hover-scale"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Loan
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan #</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map(l => {
                    const totalDue = l.amount * (1 + l.interestRate / 100);
                    const balance = totalDue - l.amountPaid;
                    return (
                      <TableRow key={l.id} className="table-row-hover">
                        <TableCell className="font-medium">{l.loanNumber}</TableCell>
                        <TableCell className="text-right">${l.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{l.interestRate}%</TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[l.status]} className="capitalize">
                            {l.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">${l.amountPaid.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">${balance.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Repayments Tab */}
        <TabsContent value="repayments" className="animate-slide-up">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Repayments</CardTitle>
              {canEdit && loans.length > 0 && (
                <Button
                  size="sm"
                  onClick={() => requirePassword(() => setShowAddRepaymentModal(true))}
                  className="hover-scale"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Repayment
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repayments.map(r => (
                    <TableRow key={r.id} className="table-row-hover">
                      <TableCell className="font-medium">{r.reference}</TableCell>
                      <TableCell className="text-right">${r.amount.toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{r.method.replace('_', ' ')}</TableCell>
                      <TableCell>{r.paidAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="animate-slide-up">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Old Value</TableHead>
                    <TableHead>New Value</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberAuditLogs.map(l => (
                    <TableRow key={l.id} className="table-row-hover">
                      <TableCell>{l.userName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{l.action}</Badge>
                      </TableCell>
                      <TableCell>{l.field}</TableCell>
                      <TableCell className="text-muted-foreground">{l.oldValue || '-'}</TableCell>
                      <TableCell>{l.newValue}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(l.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Member Modal */}
      <Dialog open={editingMember} onOpenChange={setEditingMember}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>Update member information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={memberForm.email}
                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={memberForm.phone}
                onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={memberForm.status}
                onValueChange={(value: 'active' | 'inactive' | 'suspended') =>
                  setMemberForm({ ...memberForm, status: value })
                }
              >
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
            <Button variant="outline" onClick={() => setEditingMember(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMember} className="hover-scale">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Saving Modal */}
      <Dialog open={showAddSavingModal} onOpenChange={setShowAddSavingModal}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>Add Saving</DialogTitle>
            <DialogDescription>Record a new savings entry for this member.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={savingForm.year}
                  onChange={(e) => setSavingForm({ ...savingForm, year: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Month</Label>
                <Select
                  value={savingForm.month}
                  onValueChange={(value) => setSavingForm({ ...savingForm, month: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  value={savingForm.amount}
                  onChange={(e) => setSavingForm({ ...savingForm, amount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Interest ($)</Label>
                <Input
                  type="number"
                  value={savingForm.interest}
                  onChange={(e) => setSavingForm({ ...savingForm, interest: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSavingModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSaving} className="hover-scale">
              Add Saving
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Loan Modal */}
      <Dialog open={showAddLoanModal} onOpenChange={setShowAddLoanModal}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>Add Loan</DialogTitle>
            <DialogDescription>Create a new loan for this member.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                value={loanForm.amount}
                onChange={(e) => setLoanForm({ ...loanForm, amount: Number(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Interest Rate (%)</Label>
                <Input
                  type="number"
                  value={loanForm.interestRate}
                  onChange={(e) => setLoanForm({ ...loanForm, interestRate: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Term (months)</Label>
                <Input
                  type="number"
                  value={loanForm.term}
                  onChange={(e) => setLoanForm({ ...loanForm, term: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLoanModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLoan} className="hover-scale">
              Create Loan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Repayment Modal */}
      <Dialog open={showAddRepaymentModal} onOpenChange={setShowAddRepaymentModal}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>Add Repayment</DialogTitle>
            <DialogDescription>Record a loan repayment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Loan</Label>
              <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a loan" />
                </SelectTrigger>
                <SelectContent>
                  {loans.filter(l => l.status === 'active').map(l => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.loanNumber} - ${l.amount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                value={repaymentForm.amount}
                onChange={(e) => setRepaymentForm({ ...repaymentForm, amount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={repaymentForm.method}
                onValueChange={(value: 'cash' | 'bank_transfer' | 'salary_deduction') =>
                  setRepaymentForm({ ...repaymentForm, method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="salary_deduction">Salary Deduction</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRepaymentModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRepayment} className="hover-scale">
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Modal */}
      <PasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordConfirm}
      />
    </div>
  );
}

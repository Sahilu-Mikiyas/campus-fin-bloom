import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, PiggyBank, CreditCard, AlertTriangle, Edit, Search, Building } from 'lucide-react';
import { PasswordModal } from '@/components/modals/PasswordModal';

export default function CollegePage() {
  const { collegeId } = useParams<{ collegeId: string }>();
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  
  const {
    colleges,
    institutions,
    getCollegeStats,
    updateInstitution,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingInstitution, setEditingInstitution] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', head: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});

  const college = colleges.find(c => c.id === collegeId);
  const collegeInstitutions = institutions.filter(i => i.collegeId === collegeId);
  const stats = collegeId ? getCollegeStats(collegeId) : null;

  const filteredInstitutions = collegeInstitutions.filter(inst =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (inst: typeof institutions[0]) => {
    if (!canEdit) return;
    setEditForm({ name: inst.name, head: inst.head });
    setPendingAction(() => () => setEditingInstitution(inst.id));
    setShowPasswordModal(true);
  };

  const handleSaveEdit = () => {
    if (editingInstitution) {
      updateInstitution(editingInstitution, editForm);
      setEditingInstitution(null);
    }
  };

  const handlePasswordConfirm = () => {
    setShowPasswordModal(false);
    pendingAction();
  };

  if (!college) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">College not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{college.name}</h1>
              <p className="text-muted-foreground">Code: {college.code} • Head: {college.head}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Members"
            value={stats.memberCount}
            icon={Users}
            variant="primary"
          />
          <StatsCard
            title="Total Savings"
            value={stats.totalSavings}
            icon={PiggyBank}
            variant="secondary"
            prefix="$"
          />
          <StatsCard
            title="Active Loans"
            value={stats.activeLoans}
            icon={CreditCard}
            variant="primary"
          />
          <StatsCard
            title="Overdue Loans"
            value={stats.overdueLoans}
            icon={AlertTriangle}
            variant="accent"
          />
        </div>
      )}

      {/* Institutions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Institutions</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search institutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Head</TableHead>
                <TableHead className="text-right">Members</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstitutions.map((inst, index) => (
                <TableRow
                  key={inst.id}
                  className="table-row-hover cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => navigate(`/dashboard/institutions/${inst.id}`)}
                >
                  <TableCell className="font-medium">{inst.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{inst.code}</Badge>
                  </TableCell>
                  <TableCell>{inst.head}</TableCell>
                  <TableCell className="text-right">{inst.memberCount}</TableCell>
                  <TableCell className="text-right">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(inst);
                        }}
                        className="hover-scale"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={!!editingInstitution} onOpenChange={() => setEditingInstitution(null)}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>Edit Institution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Institution Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Head</Label>
              <Input
                value={editForm.head}
                onChange={(e) => setEditForm({ ...editForm, head: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingInstitution(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="hover-scale">
              Save Changes
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

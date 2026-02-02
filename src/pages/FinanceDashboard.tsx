import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Bell, CheckCircle, AlertCircle, Edit2, Save, X, MessageSquare, Search, Calendar, RefreshCw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';
import { ChangeDetailModal } from '@/components/finance/ChangeDetailModal';

interface MonthlyData {
  id: string;
  member_id: string;
  month: string;
  total_savings: number;
  total_loans: number;
  loan_balance: number;
  monthly_contribution: number;
  monthly_repayment: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  related_change_id: string | null;
}

interface ChangeLog {
  id: string;
  monthly_data_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  status: string;
  created_at: string;
  changed_by?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}

interface Comment {
  id: string;
  change_log_id: string;
  content: string;
  created_at: string;
  author_id?: string | null;
}

export default function FinanceDashboard() {
  const { user, role } = useAuth();
  const { members, colleges, institutions } = useStore();
  
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<MonthlyData>>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedChangeLog, setSelectedChangeLog] = useState<ChangeLog | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [monthlyDataMap, setMonthlyDataMap] = useState<Record<string, MonthlyData>>({});

  const isFinance = role === 'finance';
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (user && (isFinance || isAdmin)) {
      fetchData();
      subscribeToNotifications();
    }
  }, [user, selectedMonth]);

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          toast.info(newNotification.title, { description: newNotification.message });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Calculate proper month end date
      const monthStart = startOfMonth(new Date(`${selectedMonth}-01`));
      const monthEnd = endOfMonth(monthStart);
      const monthEndStr = format(monthEnd, 'yyyy-MM-dd');
      
      // Fetch monthly data
      const { data: monthlyDataResult, error: monthlyError } = await supabase
        .from('monthly_member_data')
        .select('*')
        .gte('month', `${selectedMonth}-01`)
        .lte('month', monthEndStr)
        .order('member_id');

      if (monthlyError) throw monthlyError;
      setMonthlyData(monthlyDataResult || []);
      
      // Build monthly data map for member info lookup
      const dataMap: Record<string, MonthlyData> = {};
      (monthlyDataResult || []).forEach(item => {
        dataMap[item.id] = item;
      });
      setMonthlyDataMap(dataMap);

      // Fetch notifications
      const { data: notificationsResult, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (notifError) throw notifError;
      setNotifications(notificationsResult || []);
      setUnreadCount(notificationsResult?.filter(n => !n.read).length || 0);

      // Fetch change logs for this month
      const { data: changeLogsResult, error: logsError } = await supabase
        .from('change_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;
      setChangeLogs(changeLogsResult || []);

      // Fetch comments
      const { data: commentsResult, error: commentsError } = await supabase
        .from('change_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;
      setComments(commentsResult || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

const getMemberInfo = (memberId: string) => {
    const member = members.find(m => m.id === memberId || m.employeeId === memberId);
    if (!member) return { name: 'Unknown', employeeId: memberId, college: 'Unknown', department: 'Unknown', collegeCode: '', deptCode: '', status: 'active' as const };
    
    const institution = institutions.find(i => i.id === member.institutionId);
    const college = colleges.find(c => c.id === member.collegeId);
    
    return {
      name: member.name,
      employeeId: member.employeeId,
      college: college?.name || 'Unknown',
      collegeCode: college?.code || '',
      department: institution?.name || 'Unknown',
      deptCode: institution?.code || '',
      status: member.status
    };
  };

  const initializeMonthlyData = async () => {
    const monthDate = `${selectedMonth}-01`;
    const existingMemberIds = monthlyData.map(d => d.member_id);
    const missingMembers = members.filter(m => !existingMemberIds.includes(m.employeeId) && m.status === 'active');

    if (missingMembers.length === 0) {
      toast.info('All active members already have data for this month');
      return;
    }

    try {
      // Get existing savings and loans data from store for each member
      const { savings, loans } = useStore.getState();
      
      const newData = missingMembers.map(member => {
        // Calculate member's current savings
        const memberSavings = savings.filter(s => s.memberId === member.id);
        const latestSaving = memberSavings.reduce((latest, s) => {
          if (!latest || new Date(s.createdAt) > new Date(latest.createdAt)) return s;
          return latest;
        }, null as typeof memberSavings[0] | null);
        const totalSavings = latestSaving?.balance || 0;
        
        // Calculate member's loan info
        const memberLoans = loans.filter(l => l.memberId === member.id);
        const activeLoans = memberLoans.filter(l => l.status === 'active' || l.status === 'overdue');
        const totalLoans = memberLoans.reduce((sum, l) => sum + l.amount, 0);
        const loanBalance = activeLoans.reduce((sum, l) => sum + (l.totalPayable - l.amountPaid), 0);
        
        return {
          member_id: member.employeeId, // Use employeeId as the reference
          month: monthDate,
          total_savings: totalSavings,
          total_loans: totalLoans,
          loan_balance: loanBalance,
          monthly_contribution: latestSaving?.amount || 0,
          monthly_repayment: 0,
          status: 'pending',
          created_by: user?.id
        };
      });

      const { error } = await supabase
        .from('monthly_member_data')
        .upsert(newData, { onConflict: 'member_id,month' });

      if (error) throw error;

      toast.success(`Initialized data for ${missingMembers.length} members`);
      fetchData();
    } catch (error) {
      console.error('Error initializing data:', error);
      toast.error('Failed to initialize monthly data');
    }
  };

  const handleEdit = (data: MonthlyData) => {
    setEditingId(data.id);
    setEditFormData({
      total_savings: data.total_savings,
      total_loans: data.total_loans,
      loan_balance: data.loan_balance,
      monthly_contribution: data.monthly_contribution,
      monthly_repayment: data.monthly_repayment
    });
  };

  const handleSave = async (data: MonthlyData) => {
    try {
      // Create change logs for modified fields
      const changes: Array<{ field: string; old: string; new: string }> = [];
      
      if (editFormData.total_savings !== data.total_savings) {
        changes.push({ field: 'total_savings', old: String(data.total_savings), new: String(editFormData.total_savings) });
      }
      if (editFormData.total_loans !== data.total_loans) {
        changes.push({ field: 'total_loans', old: String(data.total_loans), new: String(editFormData.total_loans) });
      }
      if (editFormData.loan_balance !== data.loan_balance) {
        changes.push({ field: 'loan_balance', old: String(data.loan_balance), new: String(editFormData.loan_balance) });
      }
      if (editFormData.monthly_contribution !== data.monthly_contribution) {
        changes.push({ field: 'monthly_contribution', old: String(data.monthly_contribution), new: String(editFormData.monthly_contribution) });
      }
      if (editFormData.monthly_repayment !== data.monthly_repayment) {
        changes.push({ field: 'monthly_repayment', old: String(data.monthly_repayment), new: String(editFormData.monthly_repayment) });
      }

      if (changes.length === 0) {
        setEditingId(null);
        return;
      }

      // Update the monthly data
      const { error: updateError } = await supabase
        .from('monthly_member_data')
        .update({
          ...editFormData,
          status: 'updated'
        })
        .eq('id', data.id);

      if (updateError) throw updateError;

      // Insert change logs
      const changeLogEntries = changes.map(change => ({
        monthly_data_id: data.id,
        changed_by: user?.id,
        field_name: change.field,
        old_value: change.old,
        new_value: change.new,
        status: 'pending'
      }));

      const { data: insertedLogs, error: logError } = await supabase
        .from('change_logs')
        .insert(changeLogEntries)
        .select();

      if (logError) throw logError;

      // Notify admins
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const memberInfo = getMemberInfo(data.member_id);
        const notificationEntries = admins.map(admin => ({
          user_id: admin.user_id,
          title: 'Monthly Data Updated',
          message: `Finance user updated data for ${memberInfo.name} (${changes.length} field${changes.length > 1 ? 's' : ''} changed)`,
          type: 'update',
          related_change_id: insertedLogs?.[0]?.id
        }));

        await supabase.from('notifications').insert(notificationEntries);
      }

      toast.success('Data updated successfully');
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save changes');
    }
  };

  const handleApprove = async (changeLog: ChangeLog) => {
    try {
      const { error } = await supabase
        .from('change_logs')
        .update({ 
          status: 'approved', 
          reviewed_by: user?.id, 
          reviewed_at: new Date().toISOString() 
        })
        .eq('id', changeLog.id);

      if (error) throw error;

      // Notify the finance user
      const { data: monthlyDataItem } = await supabase
        .from('monthly_member_data')
        .select('created_by')
        .eq('id', changeLog.monthly_data_id)
        .single();

      if (monthlyDataItem?.created_by) {
        await supabase.from('notifications').insert({
          user_id: monthlyDataItem.created_by,
          title: 'Change Approved',
          message: `Your update to ${changeLog.field_name} has been approved`,
          type: 'success',
          related_change_id: changeLog.id
        });
      }

      toast.success('Change approved');
      fetchData();
    } catch (error) {
      console.error('Error approving change:', error);
      toast.error('Failed to approve change');
    }
  };

  const handleAddComment = async (content: string) => {
    if (!selectedChangeLog || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('change_comments')
        .insert({
          change_log_id: selectedChangeLog.id,
          author_id: user?.id,
          content
        });

      if (error) throw error;

      // Update change log status
      await supabase
        .from('change_logs')
        .update({ status: 'needs_revision' })
        .eq('id', selectedChangeLog.id);

      // Notify the finance user
      const { data: monthlyDataItem } = await supabase
        .from('monthly_member_data')
        .select('created_by')
        .eq('id', selectedChangeLog.monthly_data_id)
        .single();

      if (monthlyDataItem?.created_by) {
        await supabase.from('notifications').insert({
          user_id: monthlyDataItem.created_by,
          title: 'Comment on Your Change',
          message: `Admin commented on your ${selectedChangeLog.field_name} update: "${content.substring(0, 50)}..."`,
          type: 'warning',
          related_change_id: selectedChangeLog.id
        });
      }

      toast.success('Comment added');
      setShowCommentModal(false);
      setSelectedChangeLog(null);
      fetchData();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const filteredData = monthlyData.filter(data => {
    const memberInfo = getMemberInfo(data.member_id);
    const searchLower = searchTerm.toLowerCase();
    return (
      memberInfo.employeeId.toLowerCase().includes(searchLower) ||
      memberInfo.name.toLowerCase().includes(searchLower) ||
      memberInfo.college.toLowerCase().includes(searchLower) ||
      memberInfo.department.toLowerCase().includes(searchLower) ||
      data.member_id.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'needs_revision':
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Revision</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      case 'updated':
        return <Badge className="bg-purple-100 text-purple-800">Updated</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!isFinance && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {isFinance ? 'Finance Dashboard' : 'Monthly Data Review'}
          </h1>
          <p className="text-muted-foreground">
            {isFinance ? 'Update and manage monthly member financial data' : 'Review and approve financial updates'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={() => setShowNotifications(true)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
          <Button onClick={fetchData} variant="outline" size="icon">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Members</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, college, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            {isFinance && (
              <div className="flex items-end">
                <Button onClick={initializeMonthlyData}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Initialize Month
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="data" className="space-y-4">
        <TabsList>
          <TabsTrigger value="data">Monthly Data</TabsTrigger>
          <TabsTrigger value="changes">
            Change History
            {changeLogs.filter(c => c.status === 'pending').length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {changeLogs.filter(c => c.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Member Financial Data - {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</CardTitle>
              <CardDescription>
                {isFinance ? 'Click edit to update member data' : 'Review submitted financial updates'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No data for this month yet.</p>
                  {isFinance && (
                    <Button variant="link" onClick={initializeMonthlyData}>
                      Initialize monthly data
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>College</TableHead>
                        <TableHead className="text-right">Savings</TableHead>
                        <TableHead className="text-right">Loan Balance</TableHead>
                        <TableHead className="text-right">Monthly Contribution</TableHead>
                        <TableHead className="text-right">Monthly Repayment</TableHead>
                        <TableHead>Status</TableHead>
                        {isFinance && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((data) => {
                        const memberInfo = getMemberInfo(data.member_id);
                        const isEditing = editingId === data.id;

                        return (
                          <TableRow key={data.id}>
                            <TableCell className="font-mono text-sm">{memberInfo.employeeId}</TableCell>
                            <TableCell className="font-medium">{memberInfo.name}</TableCell>
                            <TableCell>{memberInfo.deptCode || memberInfo.department}</TableCell>
                            <TableCell>{memberInfo.collegeCode || memberInfo.college}</TableCell>
                            <TableCell className="text-right text-green-600 font-medium">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  value={editFormData.total_savings}
                                  onChange={(e) => setEditFormData({ ...editFormData, total_savings: parseFloat(e.target.value) || 0 })}
                                  className="w-28 text-right"
                                />
                              ) : (
                                `ETB ${data.total_savings.toLocaleString()}`
                              )}
                            </TableCell>
                            <TableCell className="text-right text-amber-600 font-medium">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  value={editFormData.loan_balance}
                                  onChange={(e) => setEditFormData({ ...editFormData, loan_balance: parseFloat(e.target.value) || 0 })}
                                  className="w-28 text-right"
                                />
                              ) : (
                                `ETB ${data.loan_balance.toLocaleString()}`
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  value={editFormData.monthly_contribution}
                                  onChange={(e) => setEditFormData({ ...editFormData, monthly_contribution: parseFloat(e.target.value) || 0 })}
                                  className="w-28 text-right"
                                />
                              ) : (
                                `ETB ${data.monthly_contribution.toLocaleString()}`
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  value={editFormData.monthly_repayment}
                                  onChange={(e) => setEditFormData({ ...editFormData, monthly_repayment: parseFloat(e.target.value) || 0 })}
                                  className="w-28 text-right"
                                />
                              ) : (
                                `ETB ${data.monthly_repayment.toLocaleString()}`
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(data.status)}</TableCell>
                            {isFinance && (
                              <TableCell>
                                {isEditing ? (
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleSave(data)}>
                                      <Save className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button size="sm" variant="outline" onClick={() => handleEdit(data)}>
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changes">
          <Card>
            <CardHeader>
              <CardTitle>Change History</CardTitle>
              <CardDescription>
                {isAdmin ? 'Review and approve changes made by finance users' : 'Track your submitted changes'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {changeLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No changes recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {changeLogs.map((log) => {
                    const relatedComments = comments.filter(c => c.change_log_id === log.id);
                    const relatedMonthlyData = monthlyDataMap[log.monthly_data_id];
                    const memberInfo = relatedMonthlyData ? getMemberInfo(relatedMonthlyData.member_id) : null;
                    
                    return (
                      <Card 
                        key={log.id} 
                        className="border cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          setSelectedChangeLog(log);
                          setShowDetailModal(true);
                        }}
                      >
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium capitalize">{log.field_name.replace('_', ' ')}</span>
                                {getStatusBadge(log.status)}
                                {memberInfo && (
                                  <span className="text-sm text-muted-foreground">
                                    • {memberInfo.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Changed from <span className="font-mono bg-muted px-1">ETB {log.old_value}</span> to{' '}
                                <span className="font-mono bg-muted px-1">ETB {log.new_value}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(log.created_at), 'PPp')}
                              </p>
                            </div>
                            {isAdmin && log.status === 'pending' && (
                              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button size="sm" onClick={() => handleApprove(log)}>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedChangeLog(log);
                                    setShowCommentModal(true);
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Comment
                                </Button>
                              </div>
                            )}
                          </div>
                          {relatedComments.length > 0 && (
                            <div className="mt-4 pt-4 border-t space-y-2" onClick={(e) => e.stopPropagation()}>
                              <h4 className="text-sm font-medium">Comments ({relatedComments.length})</h4>
                              {relatedComments.slice(0, 2).map((comment) => (
                                <div key={comment.id} className="bg-muted p-3 rounded-lg">
                                  <p className="text-sm">{comment.content}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {format(new Date(comment.created_at), 'PPp')}
                                  </p>
                                </div>
                              ))}
                              {relatedComments.length > 2 && (
                                <p className="text-xs text-muted-foreground">
                                  +{relatedComments.length - 2} more comments
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>Your recent notifications</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    notification.read ? 'bg-background' : 'bg-muted'
                  }`}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {notification.type === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : notification.type === 'warning' ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    ) : (
                      <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.created_at), 'PPp')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Comment Modal */}
      <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>
              Provide feedback on this change. The finance user will be notified.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddComment(formData.get('comment') as string);
            }}
          >
            <Textarea
              name="comment"
              placeholder="Enter your comment or feedback..."
              className="min-h-[100px]"
              required
            />
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowCommentModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Comment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Detail Modal */}
      <ChangeDetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedChangeLog(null);
        }}
        changeLog={selectedChangeLog}
        memberInfo={selectedChangeLog && monthlyDataMap[selectedChangeLog.monthly_data_id] 
          ? getMemberInfo(monthlyDataMap[selectedChangeLog.monthly_data_id].member_id) 
          : null}
        comments={comments}
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, MessageSquare, RefreshCw, History, Calendar } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { toast } from 'sonner';
import { ChangeDetailModal } from '@/components/finance/ChangeDetailModal';

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

interface MonthlyData {
  id: string;
  member_id: string;
  month: string;
}

export default function OrganizationFinances() {
  const { user, role } = useAuth();
  const { members, colleges, institutions } = useStore();
  
  const [allChangeLogs, setAllChangeLogs] = useState<ChangeLog[]>([]);
  const [monthlyChangeLogs, setMonthlyChangeLogs] = useState<ChangeLog[]>([]);
  const [monthlyDataMap, setMonthlyDataMap] = useState<Record<string, MonthlyData>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChangeLog, setSelectedChangeLog] = useState<ChangeLog | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [commentTarget, setCommentTarget] = useState<{ changeLog: ChangeLog; type: 'row' | 'field' } | null>(null);

  const isAdmin = role === 'admin';

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const currentMonthStart = startOfMonth(new Date());
      
      // Fetch all change logs (general history)
      const { data: allLogsResult, error: allLogsError } = await supabase
        .from('change_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (allLogsError) throw allLogsError;
      setAllChangeLogs(allLogsResult || []);

      // Filter for current month (monthly history)
      const monthlyLogs = (allLogsResult || []).filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= currentMonthStart;
      });
      setMonthlyChangeLogs(monthlyLogs);

      // Fetch monthly data for member info
      const { data: monthlyDataResult, error: monthlyError } = await supabase
        .from('monthly_member_data')
        .select('id, member_id, month');

      if (monthlyError) throw monthlyError;
      
      const dataMap: Record<string, MonthlyData> = {};
      (monthlyDataResult || []).forEach(item => {
        dataMap[item.id] = item;
      });
      setMonthlyDataMap(dataMap);

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
    if (!member) return { name: 'Unknown', employeeId: memberId, college: 'Unknown', department: 'Unknown', collegeCode: '', deptCode: '' };
    
    const institution = institutions.find(i => i.id === member.institutionId);
    const college = colleges.find(c => c.id === member.collegeId);
    
    return {
      name: member.name,
      employeeId: member.employeeId,
      college: college?.name || 'Unknown',
      collegeCode: college?.code || '',
      department: institution?.name || 'Unknown',
      deptCode: institution?.code || '',
    };
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
      const monthlyData = monthlyDataMap[changeLog.monthly_data_id];
      if (monthlyData) {
        const { data: monthlyDataItem } = await supabase
          .from('monthly_member_data')
          .select('created_by')
          .eq('id', changeLog.monthly_data_id)
          .maybeSingle();

        if (monthlyDataItem?.created_by) {
          await supabase.from('notifications').insert({
            user_id: monthlyDataItem.created_by,
            title: 'Change Approved',
            message: `Your update to ${changeLog.field_name} has been approved`,
            type: 'success',
            related_change_id: changeLog.id
          });
        }
      }

      toast.success('Change approved');
      fetchData();
    } catch (error) {
      console.error('Error approving change:', error);
      toast.error('Failed to approve change');
    }
  };

  const handleAddComment = async (content: string, isRowComment: boolean = false) => {
    if (!commentTarget || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('change_comments')
        .insert({
          change_log_id: commentTarget.changeLog.id,
          author_id: user?.id,
          content: isRowComment ? `[Row Comment] ${content}` : content
        });

      if (error) throw error;

      // Update change log status
      await supabase
        .from('change_logs')
        .update({ status: 'needs_revision' })
        .eq('id', commentTarget.changeLog.id);

      // Notify the finance user
      const { data: monthlyDataItem } = await supabase
        .from('monthly_member_data')
        .select('created_by')
        .eq('id', commentTarget.changeLog.monthly_data_id)
        .maybeSingle();

      if (monthlyDataItem?.created_by) {
        const memberInfo = getMemberInfoFromChangeLog(commentTarget.changeLog);
        await supabase.from('notifications').insert({
          user_id: monthlyDataItem.created_by,
          title: isRowComment ? 'Row Comment from Admin' : 'Comment on Your Change',
          message: `Admin commented on ${memberInfo?.name || 'member'}'s ${commentTarget.changeLog.field_name}: "${content.substring(0, 50)}..."`,
          type: 'warning',
          related_change_id: commentTarget.changeLog.id
        });
      }

      toast.success('Comment added');
      setShowCommentModal(false);
      setCommentTarget(null);
      fetchData();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const getMemberInfoFromChangeLog = (changeLog: ChangeLog) => {
    const monthlyData = monthlyDataMap[changeLog.monthly_data_id];
    if (!monthlyData) return null;
    return getMemberInfo(monthlyData.member_id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'needs_revision':
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Revision</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderChangeCard = (log: ChangeLog, showActions: boolean = true) => {
    const memberInfo = getMemberInfoFromChangeLog(log);
    const relatedComments = comments.filter(c => c.change_log_id === log.id);

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
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium capitalize">{log.field_name.replace('_', ' ')}</span>
                {getStatusBadge(log.status)}
                {memberInfo && (
                  <span className="text-sm text-muted-foreground">
                    • {memberInfo.name} ({memberInfo.employeeId})
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
            {showActions && log.status === 'pending' && (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" onClick={() => handleApprove(log)}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCommentTarget({ changeLog: log, type: 'field' });
                    setShowCommentModal(true);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Comment
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setCommentTarget({ changeLog: log, type: 'row' });
                    setShowCommentModal(true);
                  }}
                  title="Add comment for entire row/member"
                >
                  <MessageSquare className="h-4 w-4" />
                  Row
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
  };

  if (!isAdmin) {
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
          <h1 className="text-3xl font-bold">Organization Finances</h1>
          <p className="text-muted-foreground">
            Track and review all financial changes made by the finance team
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="icon">
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly" className="gap-2">
            <Calendar className="h-4 w-4" />
            Monthly Finances
            {monthlyChangeLogs.filter(c => c.status === 'pending').length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {monthlyChangeLogs.filter(c => c.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2">
            <History className="h-4 w-4" />
            General History
            <Badge variant="outline" className="ml-1">{allChangeLogs.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Changes - {format(new Date(), 'MMMM yyyy')}</CardTitle>
              <CardDescription>
                Changes made this month. These will be archived to general history at month end.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : monthlyChangeLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No changes this month yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {monthlyChangeLogs.map((log) => renderChangeCard(log))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Change History</CardTitle>
              <CardDescription>
                Complete history of all changes from the start of the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : allChangeLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No changes recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allChangeLogs.map((log) => renderChangeCard(log, log.status === 'pending'))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Detail Modal */}
      <ChangeDetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedChangeLog(null);
        }}
        changeLog={selectedChangeLog}
        memberInfo={selectedChangeLog ? getMemberInfoFromChangeLog(selectedChangeLog) : null}
        comments={comments}
      />

      {/* Comment Modal */}
      <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {commentTarget?.type === 'row' ? 'Add Row Comment' : 'Add Field Comment'}
            </DialogTitle>
            <DialogDescription>
              {commentTarget?.type === 'row' 
                ? 'Add a comment for the entire member row. The finance user will be notified.'
                : 'Provide feedback on this specific field change. The finance user will be notified.'}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddComment(formData.get('comment') as string, commentTarget?.type === 'row');
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
    </div>
  );
}

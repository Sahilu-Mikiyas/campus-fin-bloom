import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { User, Calendar, ArrowRight, FileText, MessageSquare } from 'lucide-react';

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

interface MemberInfo {
  name: string;
  employeeId: string;
  college: string;
  department: string;
  collegeCode: string;
  deptCode: string;
}

interface ChangeDetailModalProps {
  open: boolean;
  onClose: () => void;
  changeLog: ChangeLog | null;
  memberInfo?: MemberInfo | null;
  comments: Comment[];
  changedByName?: string;
  reviewedByName?: string;
}

export function ChangeDetailModal({
  open,
  onClose,
  changeLog,
  memberInfo,
  comments,
  changedByName,
  reviewedByName,
}: ChangeDetailModalProps) {
  if (!changeLog) return null;

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

  const formatFieldName = (fieldName: string) => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const relatedComments = comments.filter(c => c.change_log_id === changeLog.id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Change Details
          </DialogTitle>
          <DialogDescription>
            Detailed view of the change made to member data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Change Info */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Field Changed</span>
                <span className="font-semibold">{formatFieldName(changeLog.field_name)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(changeLog.status)}
              </div>
            </CardContent>
          </Card>

          {/* Value Change */}
          <Card>
            <CardContent className="pt-4">
              <h4 className="text-sm font-medium mb-3">Value Change</h4>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Previous Value</p>
                  <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg font-mono font-semibold">
                    ETB {Number(changeLog.old_value || 0).toLocaleString()}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">New Value</p>
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-mono font-semibold">
                    ETB {Number(changeLog.new_value || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Member Info */}
          {memberInfo && (
            <Card>
              <CardContent className="pt-4 space-y-2">
                <h4 className="text-sm font-medium mb-3">Member Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                  </div>
                  <div className="font-medium">{memberInfo.name}</div>
                  <div>
                    <span className="text-muted-foreground">Employee ID:</span>
                  </div>
                  <div className="font-mono">{memberInfo.employeeId}</div>
                  <div>
                    <span className="text-muted-foreground">College:</span>
                  </div>
                  <div>{memberInfo.collegeCode || memberInfo.college}</div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                  </div>
                  <div>{memberInfo.deptCode || memberInfo.department}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Change Metadata */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <h4 className="text-sm font-medium mb-3">Change Metadata</h4>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Changed by:</span>
                <span className="font-medium">{changedByName || 'Finance User'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Changed at:</span>
                <span className="font-medium">{format(new Date(changeLog.created_at), 'PPp')}</span>
              </div>
              {changeLog.reviewed_by && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Reviewed by:</span>
                    <span className="font-medium">{reviewedByName || 'Admin'}</span>
                  </div>
                  {changeLog.reviewed_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Reviewed at:</span>
                      <span className="font-medium">{format(new Date(changeLog.reviewed_at), 'PPp')}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          {relatedComments.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Admin Comments ({relatedComments.length})
                </h4>
                <div className="space-y-2">
                  {relatedComments.map((comment) => (
                    <div key={comment.id} className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(comment.created_at), 'PPp')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

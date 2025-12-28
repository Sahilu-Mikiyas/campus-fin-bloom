import { useStore } from '@/store/useStore';
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
import { formatDistanceToNow } from 'date-fns';
import { Activity, CreditCard, PiggyBank, User, Edit } from 'lucide-react';

const typeIcons = {
  saving: PiggyBank,
  loan: CreditCard,
  repayment: Activity,
  member: User,
  edit: Edit,
};

const typeBadgeVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  saving: 'secondary',
  loan: 'default',
  repayment: 'outline',
  member: 'default',
  edit: 'outline',
};

export function RecentActivityTable() {
  const { recentActivity } = useStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentActivity.slice(0, 10).map((activity, index) => {
              const Icon = typeIcons[activity.type];
              return (
                <TableRow
                  key={activity.id}
                  className="table-row-hover animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <Badge variant={typeBadgeVariants[activity.type]} className="capitalize">
                        {activity.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {activity.description}
                  </TableCell>
                  <TableCell>{activity.user}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

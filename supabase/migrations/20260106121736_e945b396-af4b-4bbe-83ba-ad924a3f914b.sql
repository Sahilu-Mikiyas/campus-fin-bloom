-- Create monthly_member_data table for finance to update
CREATE TABLE public.monthly_member_data (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id TEXT NOT NULL,
    month DATE NOT NULL,
    total_savings NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_loans NUMERIC(12,2) NOT NULL DEFAULT 0,
    loan_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    monthly_contribution NUMERIC(12,2) NOT NULL DEFAULT 0,
    monthly_repayment NUMERIC(12,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(member_id, month)
);

-- Create change_logs table to track what finance users change
CREATE TABLE public.change_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    monthly_data_id UUID REFERENCES public.monthly_member_data(id) ON DELETE CASCADE NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table for admin feedback
CREATE TABLE public.change_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    change_log_id UUID REFERENCES public.change_logs(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    read BOOLEAN NOT NULL DEFAULT false,
    related_change_id UUID REFERENCES public.change_logs(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.monthly_member_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- monthly_member_data policies
CREATE POLICY "Admins can do everything with monthly data"
ON public.monthly_member_data FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Finance can view monthly data"
ON public.monthly_member_data FOR SELECT
USING (has_role(auth.uid(), 'finance'::app_role));

CREATE POLICY "Finance can insert monthly data"
ON public.monthly_member_data FOR INSERT
WITH CHECK (has_role(auth.uid(), 'finance'::app_role));

CREATE POLICY "Finance can update monthly data"
ON public.monthly_member_data FOR UPDATE
USING (has_role(auth.uid(), 'finance'::app_role));

-- change_logs policies
CREATE POLICY "Admins can do everything with change logs"
ON public.change_logs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Finance can view change logs"
ON public.change_logs FOR SELECT
USING (has_role(auth.uid(), 'finance'::app_role));

CREATE POLICY "Finance can insert change logs"
ON public.change_logs FOR INSERT
WITH CHECK (has_role(auth.uid(), 'finance'::app_role));

-- change_comments policies
CREATE POLICY "Admins can do everything with comments"
ON public.change_comments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Finance can view comments"
ON public.change_comments FOR SELECT
USING (has_role(auth.uid(), 'finance'::app_role));

-- notifications policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Finance can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (has_role(auth.uid(), 'finance'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_monthly_member_data_updated_at
BEFORE UPDATE ON public.monthly_member_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
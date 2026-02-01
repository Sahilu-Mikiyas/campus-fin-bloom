-- Add RLS policy for finance users to insert comments on change logs they created
CREATE POLICY "Finance can insert comments on own changes"
ON public.change_comments FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'finance'::app_role)
  AND author_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.change_logs cl
    WHERE cl.id = change_log_id
    AND cl.changed_by = auth.uid()
  )
);
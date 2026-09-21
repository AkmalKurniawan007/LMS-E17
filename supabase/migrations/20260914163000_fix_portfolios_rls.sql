-- Drop the old update policy
DROP POLICY IF EXISTS "Users can update their portfolio_projects" ON public.portfolio_projects;

-- Create the new, correct update policy
CREATE POLICY "Users can update their portfolio_projects" ON public.portfolio_projects
  FOR UPDATE 
  USING (
    (auth.uid() = user_id) 
    OR 
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'mentor' OR role = 'admin')
    )
  );

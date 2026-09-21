-- Create portfolio_projects table (since portfolios already exists for profile)
CREATE TABLE public.portfolio_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  project_url text,
  status text DEFAULT 'draft',
  batch_id uuid,
  feedback text,
  validated_by uuid,
  validated_at timestamp with time zone,
  is_showcase boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT portfolio_projects_pkey PRIMARY KEY (id),
  CONSTRAINT portfolio_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT portfolio_projects_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id),
  CONSTRAINT portfolio_projects_validated_by_fkey FOREIGN KEY (validated_by) REFERENCES public.users(id)
);

-- RLS Policies
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Students can read their own portfolios, and everyone can read validated showcases
CREATE POLICY "Users can view portfolio_projects" ON public.portfolio_projects
  FOR SELECT USING (
    auth.uid() = user_id 
    OR 
    is_showcase = true 
    OR 
    status = 'validated' 
    OR
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'mentor' OR role = 'admin')
    )
  );

-- Students can insert their own portfolios
CREATE POLICY "Users can create their own portfolio_projects" ON public.portfolio_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Students can update their own portfolios if they are drafts
-- Mentors/Admins can update (to validate)
CREATE POLICY "Users can update their portfolio_projects" ON public.portfolio_projects
  FOR UPDATE USING (
    (auth.uid() = user_id AND status = 'draft') 
    OR 
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'mentor' OR role = 'admin')
    )
  );

-- Students can delete their own draft portfolios
CREATE POLICY "Users can delete their draft portfolio_projects" ON public.portfolio_projects
  FOR DELETE USING (auth.uid() = user_id AND status = 'draft');

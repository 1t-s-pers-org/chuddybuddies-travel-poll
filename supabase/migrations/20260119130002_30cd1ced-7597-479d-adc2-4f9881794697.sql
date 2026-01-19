-- Enable RLS on votes table
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Create policy allowing only authenticated users to read votes
CREATE POLICY "Authenticated users can read votes"
ON public.votes
FOR SELECT
TO authenticated
USING (true);

-- Create policy allowing only authenticated users to insert votes
CREATE POLICY "Authenticated users can insert votes"
ON public.votes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy allowing only authenticated users to update votes
CREATE POLICY "Authenticated users can update votes"
ON public.votes
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy allowing only authenticated users to delete votes
CREATE POLICY "Authenticated users can delete votes"
ON public.votes
FOR DELETE
TO authenticated
USING (true);

-- Also enable RLS on votes_backup table for complete protection
ALTER TABLE public.votes_backup ENABLE ROW LEVEL SECURITY;

-- Create policy allowing only authenticated users to access votes_backup
CREATE POLICY "Authenticated users can read votes_backup"
ON public.votes_backup
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage votes_backup"
ON public.votes_backup
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
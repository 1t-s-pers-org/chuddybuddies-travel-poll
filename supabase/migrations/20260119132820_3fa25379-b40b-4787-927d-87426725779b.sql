-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow service_role access to votes" ON public.votes;
DROP POLICY IF EXISTS "Deny anon access to votes" ON public.votes;
DROP POLICY IF EXISTS "Deny authenticated access to votes" ON public.votes;
DROP POLICY IF EXISTS "Allow service_role access to config" ON public.config;
DROP POLICY IF EXISTS "Deny anon access to config" ON public.config;
DROP POLICY IF EXISTS "Deny authenticated access to config" ON public.config;

-- Add missing columns to votes table to match app's Vote interface
ALTER TABLE public.votes 
ADD COLUMN IF NOT EXISTS is_excluded boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Rename columns to match app naming (r1, r2, r3 -> more descriptive)
-- Keep existing columns but add new ones for compatibility
ALTER TABLE public.votes 
ADD COLUMN IF NOT EXISTS first_choice text,
ADD COLUMN IF NOT EXISTS second_choice text,
ADD COLUMN IF NOT EXISTS third_choice text;

-- Create poll_rounds table for archived polls
CREATE TABLE IF NOT EXISTS public.poll_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  votes_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  results_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  weight_config jsonb NOT NULL
);

-- Enable RLS on poll_rounds
ALTER TABLE public.poll_rounds ENABLE ROW LEVEL SECURITY;

-- RLS policies for votes table
-- Allow anyone (anon) to insert votes (public poll submission)
CREATE POLICY "Anyone can submit votes"
ON public.votes
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated users to read all votes (admin access)
CREATE POLICY "Authenticated users can read votes"
ON public.votes
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update votes (admin: exclude/include)
CREATE POLICY "Authenticated users can update votes"
ON public.votes
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete votes (admin action)
CREATE POLICY "Authenticated users can delete votes"
ON public.votes
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);

-- RLS policies for config table
-- Allow authenticated users full access to config
CREATE POLICY "Authenticated users can manage config"
ON public.config
AS PERMISSIVE
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS policies for poll_rounds table
-- Allow authenticated users full access to poll_rounds
CREATE POLICY "Authenticated users can manage poll_rounds"
ON public.poll_rounds
AS PERMISSIVE
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_votes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on votes
DROP TRIGGER IF EXISTS update_votes_timestamp ON public.votes;
CREATE TRIGGER update_votes_timestamp
BEFORE UPDATE ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.update_votes_updated_at();
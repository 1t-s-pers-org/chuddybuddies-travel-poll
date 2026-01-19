-- Fix 1: Add explicit policy to deny anonymous SELECT on votes table
CREATE POLICY "Deny anonymous read access"
  ON public.votes
  FOR SELECT
  TO anon
  USING (false);

-- Fix 2: Add unique constraint on voter name to prevent duplicate voting
ALTER TABLE public.votes ADD CONSTRAINT unique_voter_name UNIQUE (name);

-- Fix 3: Update trigger function with explicit SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.update_votes_updated_at()
RETURNS TRIGGER
SECURITY INVOKER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
-- Fix vote_insert_auth_bypass: Restrict INSERT to anon role only for public submissions
-- This prevents authenticated admins from pre-emptively blocking voter names

-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can submit votes" ON public.votes;

-- Create anon-only insert policy for public vote submission
CREATE POLICY "Public can submit votes"
  ON public.votes
  FOR INSERT
  TO anon
  WITH CHECK (true);
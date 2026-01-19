-- Drop existing overly permissive policies on votes table
DROP POLICY IF EXISTS "Authenticated users can read votes" ON public.votes;
DROP POLICY IF EXISTS "Authenticated users can insert votes" ON public.votes;
DROP POLICY IF EXISTS "Authenticated users can update votes" ON public.votes;
DROP POLICY IF EXISTS "Authenticated users can delete votes" ON public.votes;

-- Drop existing overly permissive policies on votes_backup table
DROP POLICY IF EXISTS "Authenticated users can read votes_backup" ON public.votes_backup;
DROP POLICY IF EXISTS "Authenticated users can manage votes_backup" ON public.votes_backup;

-- Drop existing overly permissive policies on config table
DROP POLICY IF EXISTS "Authenticated users can read config" ON public.config;
DROP POLICY IF EXISTS "Authenticated users can modify config" ON public.config;

-- Create restrictive policies that deny all access via anon/authenticated roles
-- Access will only be possible via service_role (server-side)

-- Votes table: No public access (service_role only)
CREATE POLICY "Service role only access for votes"
ON public.votes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Votes backup table: No public access (service_role only)
CREATE POLICY "Service role only access for votes_backup"
ON public.votes_backup
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Config table: No public access (service_role only)
CREATE POLICY "Service role only access for config"
ON public.config
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
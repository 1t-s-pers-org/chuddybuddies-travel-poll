-- Drop existing RESTRICTIVE policies (they don't block access on their own)
DROP POLICY IF EXISTS "Service role only access for votes" ON public.votes;
DROP POLICY IF EXISTS "Service role only access for votes_backup" ON public.votes_backup;
DROP POLICY IF EXISTS "Service role only access for config" ON public.config;

-- Create PERMISSIVE policies that deny anon/authenticated but allow service_role
-- For votes table
CREATE POLICY "Deny anon access to votes"
ON public.votes
AS PERMISSIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny authenticated access to votes"
ON public.votes
AS PERMISSIVE
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Allow service_role access to votes"
ON public.votes
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- For votes_backup table
CREATE POLICY "Deny anon access to votes_backup"
ON public.votes_backup
AS PERMISSIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny authenticated access to votes_backup"
ON public.votes_backup
AS PERMISSIVE
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Allow service_role access to votes_backup"
ON public.votes_backup
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- For config table
CREATE POLICY "Deny anon access to config"
ON public.config
AS PERMISSIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny authenticated access to config"
ON public.config
AS PERMISSIVE
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Allow service_role access to config"
ON public.config
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
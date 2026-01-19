-- Step 1: Create role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Step 3: Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Only service_role can manage user_roles (prevents privilege escalation)
CREATE POLICY "Only service_role can manage user_roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Step 5: Create security definer function to check admin status (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Step 6: Drop existing overly permissive policies on votes table
DROP POLICY IF EXISTS "Authenticated users can read votes" ON public.votes;
DROP POLICY IF EXISTS "Authenticated users can update votes" ON public.votes;
DROP POLICY IF EXISTS "Authenticated users can delete votes" ON public.votes;

-- Step 7: Create admin-only policies for votes table
CREATE POLICY "Admins can read votes"
ON public.votes
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can update votes"
ON public.votes
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete votes"
ON public.votes
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Step 8: Drop existing overly permissive policy on config table
DROP POLICY IF EXISTS "Authenticated users can manage config" ON public.config;

-- Step 9: Create admin-only policies for config table
CREATE POLICY "Admins can manage config"
ON public.config
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Step 10: Drop existing overly permissive policy on poll_rounds table
DROP POLICY IF EXISTS "Authenticated users can manage poll_rounds" ON public.poll_rounds;

-- Step 11: Create admin-only policies for poll_rounds table
CREATE POLICY "Admins can manage poll_rounds"
ON public.poll_rounds
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
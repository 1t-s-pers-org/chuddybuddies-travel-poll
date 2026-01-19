-- Enable RLS on config table
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

-- Create policy allowing only authenticated users to read config
CREATE POLICY "Authenticated users can read config"
ON public.config
FOR SELECT
TO authenticated
USING (true);

-- Create policy allowing only authenticated users to modify config
CREATE POLICY "Authenticated users can modify config"
ON public.config
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
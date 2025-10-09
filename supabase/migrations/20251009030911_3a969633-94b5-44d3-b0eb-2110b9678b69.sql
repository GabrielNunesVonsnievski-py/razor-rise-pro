-- Create email_logs table
CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id integer REFERENCES public.barbershops(id),
  recipient_email text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Barbers can view their barbershop email logs
CREATE POLICY "Barbers can view their barbershop email logs"
ON public.email_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.barbershops
    WHERE barbershops.id = email_logs.barbershop_id
    AND barbershops.owner_id = auth.uid()
  )
);

-- Create index for better performance
CREATE INDEX idx_email_logs_barbershop_id ON public.email_logs(barbershop_id);
CREATE INDEX idx_email_logs_created_at ON public.email_logs(created_at DESC);
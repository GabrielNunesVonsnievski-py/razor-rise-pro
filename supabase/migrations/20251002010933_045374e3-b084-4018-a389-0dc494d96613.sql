-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'barbeiro', 'cliente');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update ensure_profile_exists to also assign default role
CREATE OR REPLACE FUNCTION public.ensure_profile_exists()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update profile
  INSERT INTO public.profiles (user_id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(profiles.full_name, ''), EXCLUDED.full_name),
    phone = COALESCE(NULLIF(profiles.phone, ''), EXCLUDED.phone),
    updated_at = NOW();
  
  -- Assign default role 'cliente' if user has no role yet
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cliente')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Update sync_user_profile to also ensure role exists
CREATE OR REPLACE FUNCTION public.sync_user_profile(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_data RECORD;
BEGIN
  -- Get user data from auth.users
  SELECT id, email, raw_user_meta_data
  INTO user_data
  FROM auth.users
  WHERE id = user_id_param;
  
  -- Insert or update profile
  INSERT INTO public.profiles (user_id, email, full_name, phone)
  VALUES (
    user_data.id,
    user_data.email,
    COALESCE(user_data.raw_user_meta_data->>'full_name', user_data.raw_user_meta_data->>'name', ''),
    COALESCE(user_data.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(profiles.full_name, ''), EXCLUDED.full_name),
    phone = COALESCE(NULLIF(profiles.phone, ''), EXCLUDED.phone),
    updated_at = NOW();
  
  -- Ensure user has at least the default 'cliente' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_data.id, 'cliente')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
-- Function to ensure profile exists (create if doesn't exist)
CREATE OR REPLACE FUNCTION public.ensure_profile_exists()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile if it doesn't exist
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
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger for both signup and login
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_profile_exists();

-- Also create a function to sync profile on login (for existing users)
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
    updated_at = NOW();
END;
$$;
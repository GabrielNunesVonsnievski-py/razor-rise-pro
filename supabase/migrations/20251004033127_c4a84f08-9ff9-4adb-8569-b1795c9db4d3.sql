-- Corrigir função com search_path seguro
CREATE OR REPLACE FUNCTION validate_appointment_date()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Não é possível agendar para datas passadas';
  END IF;
  RETURN NEW;
END;
$$;
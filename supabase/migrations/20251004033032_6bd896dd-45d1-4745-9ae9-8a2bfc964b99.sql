-- Adicionar status completed e no_show ao enum de status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
        CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'no_show', 'cancelled');
    ELSE
        ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'completed';
        ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'no_show';
    END IF;
END $$;

-- Adicionar horário de expediente à tabela barbershops
ALTER TABLE barbershops 
ADD COLUMN IF NOT EXISTS horario_abertura TIME DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS horario_fechamento TIME DEFAULT '18:00:00',
ADD COLUMN IF NOT EXISTS dias_funcionamento TEXT[] DEFAULT ARRAY['1', '2', '3', '4', '5', '6'];

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_appointments_barbershop_date ON appointments(barbershop_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Trigger para validar data de agendamento
CREATE OR REPLACE FUNCTION validate_appointment_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Não é possível agendar para datas passadas';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_appointment_date ON appointments;
CREATE TRIGGER check_appointment_date
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION validate_appointment_date();
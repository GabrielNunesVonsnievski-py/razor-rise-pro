-- Criar tabela de barbeiros
CREATE TABLE public.barbers (
  id SERIAL PRIMARY KEY,
  barbershop_id INTEGER NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para barbeiros
CREATE POLICY "Barbers can manage their barbershop barbers"
ON public.barbers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.barbershops
    WHERE barbershops.id = barbers.barbershop_id
    AND barbershops.owner_id = auth.uid()
  )
);

CREATE POLICY "Public can view active barbers"
ON public.barbers
FOR SELECT
USING (status = 'ativo');

-- Adicionar coluna barber_id na tabela appointments
ALTER TABLE public.appointments
ADD COLUMN barber_id INTEGER REFERENCES public.barbers(id);

-- Criar tabela de horários flexíveis por dia da semana
CREATE TABLE public.barbershop_schedules (
  id SERIAL PRIMARY KEY,
  barbershop_id INTEGER NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  intervalo_inicio TIME,
  intervalo_fim TIME,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(barbershop_id, dia_semana)
);

-- Enable RLS
ALTER TABLE public.barbershop_schedules ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para horários
CREATE POLICY "Barbers can manage their barbershop schedules"
ON public.barbershop_schedules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.barbershops
    WHERE barbershops.id = barbershop_schedules.barbershop_id
    AND barbershops.owner_id = auth.uid()
  )
);

CREATE POLICY "Public can view active schedules"
ON public.barbershop_schedules
FOR SELECT
USING (ativo = true);

-- Trigger para updated_at
CREATE TRIGGER update_barbers_updated_at
  BEFORE UPDATE ON public.barbers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.barbershop_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- ==========================
-- Tabela de Barbearias
-- ==========================
CREATE TABLE IF NOT EXISTS public.barbershops (
    id SERIAL PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    endereco TEXT,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================
-- Tabela de Serviços / Cortes
-- ==========================
CREATE TABLE IF NOT EXISTS public.services (
    id SERIAL PRIMARY KEY,
    barbershop_id INTEGER NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    duracao INTEGER NOT NULL, -- duração em minutos
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================
-- Tabela de Clientes vinculados a Barbearias
-- ==========================
CREATE TABLE IF NOT EXISTS public.barbershop_clients (
    id SERIAL PRIMARY KEY,
    barbershop_id INTEGER NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(barbershop_id, client_user_id)
);

-- ==========================
-- Atualizar tabela de Agendamentos
-- ==========================
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS barbershop_id INTEGER REFERENCES public.barbershops(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS service_id INTEGER REFERENCES public.services(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS valor DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- ==========================
-- Tabela de Promoções
-- ==========================
CREATE TABLE IF NOT EXISTS public.promotions (
    id SERIAL PRIMARY KEY,
    barbershop_id INTEGER NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    desconto DECIMAL(5,2) NOT NULL, -- desconto em %
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================
-- Tabela de Registros Financeiros
-- ==========================
CREATE TABLE IF NOT EXISTS public.financial_records (
    id SERIAL PRIMARY KEY,
    barbershop_id INTEGER NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    tipo VARCHAR(50) NOT NULL, -- 'agendamento', 'produto', 'outros'
    descricao TEXT,
    valor DECIMAL(10,2) NOT NULL,
    metodo_pagamento VARCHAR(50), -- 'dinheiro', 'cartao', 'pix'
    data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================
-- Índices para Performance
-- ==========================
CREATE INDEX IF NOT EXISTS idx_barbershops_owner ON public.barbershops(owner_id);
CREATE INDEX IF NOT EXISTS idx_barbershops_slug ON public.barbershops(slug);
CREATE INDEX IF NOT EXISTS idx_services_barbershop ON public.services(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_barbershop_clients_barbershop ON public.barbershop_clients(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_barbershop_clients_client ON public.barbershop_clients(client_user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_barbershop ON public.appointments(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_promotions_barbershop ON public.promotions(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_financial_barbershop ON public.financial_records(barbershop_id);

-- ==========================
-- Triggers para updated_at
-- ==========================
CREATE TRIGGER update_barbershops_updated_at
    BEFORE UPDATE ON public.barbershops
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
    BEFORE UPDATE ON public.promotions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================
-- Row Level Security (RLS)
-- ==========================

-- Barbershops
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbers can view their own barbershop"
    ON public.barbershops FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Barbers can create their own barbershop"
    ON public.barbershops FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Barbers can update their own barbershop"
    ON public.barbershops FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view barbershops by slug"
    ON public.barbershops FOR SELECT
    USING (true);

-- Services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbers can manage their barbershop services"
    ON public.services FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.barbershops
            WHERE barbershops.id = services.barbershop_id
            AND barbershops.owner_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view active services"
    ON public.services FOR SELECT
    USING (ativo = true);

-- Barbershop Clients
ALTER TABLE public.barbershop_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbers can view their barbershop clients"
    ON public.barbershop_clients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.barbershops
            WHERE barbershops.id = barbershop_clients.barbershop_id
            AND barbershops.owner_id = auth.uid()
        )
    );

CREATE POLICY "Clients can be added when booking"
    ON public.barbershop_clients FOR INSERT
    WITH CHECK (auth.uid() = client_user_id);

-- Promotions
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbers can manage their barbershop promotions"
    ON public.promotions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.barbershops
            WHERE barbershops.id = promotions.barbershop_id
            AND barbershops.owner_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view active promotions"
    ON public.promotions FOR SELECT
    USING (ativo = true AND data_fim >= CURRENT_DATE);

-- Financial Records
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbers can manage their financial records"
    ON public.financial_records FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.barbershops
            WHERE barbershops.id = financial_records.barbershop_id
            AND barbershops.owner_id = auth.uid()
        )
    );

-- Update Appointments RLS
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;

CREATE POLICY "Users can view their own appointments"
    ON public.appointments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Barbers can view their barbershop appointments"
    ON public.appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.barbershops
            WHERE barbershops.id = appointments.barbershop_id
            AND barbershops.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments"
    ON public.appointments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Barbers can update their barbershop appointments"
    ON public.appointments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.barbershops
            WHERE barbershops.id = appointments.barbershop_id
            AND barbershops.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own appointments"
    ON public.appointments FOR DELETE
    USING (auth.uid() = user_id);
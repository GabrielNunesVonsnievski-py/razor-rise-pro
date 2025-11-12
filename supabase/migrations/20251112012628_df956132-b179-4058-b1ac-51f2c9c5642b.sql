-- Criar tabela para armazenar assinaturas de usuários
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT,
  subscription_id TEXT,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL, -- MONTHLY, QUARTERLY, etc
  status TEXT NOT NULL DEFAULT 'pending', -- active, pending, canceled, expired
  next_charge_date TIMESTAMP WITH TIME ZONE,
  charge_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Criar tabela para armazenar webhooks recebidos da Asaas
CREATE TABLE IF NOT EXISTS public.webhook_pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  ip_cliente TEXT,
  taxa NUMERIC(10, 2),
  nome_plano TEXT,
  frequencia_cobranca TEXT,
  numero_cobranca INTEGER,
  proxima_data_cobranca TIMESTAMP WITH TIME ZONE,
  tipo_evento TEXT NOT NULL,
  status_pagamento TEXT,
  payload_completo JSONB NOT NULL,
  processado BOOLEAN DEFAULT FALSE,
  erro TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_pagamentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas RLS para webhook_pagamentos (apenas admin pode ver)
CREATE POLICY "Service role can manage webhooks"
  ON public.webhook_pagamentos FOR ALL
  USING (auth.role() = 'service_role');

-- Criar índices para melhor performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_subscription_id ON public.subscriptions(subscription_id);
CREATE INDEX idx_webhook_pagamentos_subscription_id ON public.webhook_pagamentos(subscription_id);
CREATE INDEX idx_webhook_pagamentos_tipo_evento ON public.webhook_pagamentos(tipo_evento);
CREATE INDEX idx_webhook_pagamentos_created_at ON public.webhook_pagamentos(created_at DESC);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
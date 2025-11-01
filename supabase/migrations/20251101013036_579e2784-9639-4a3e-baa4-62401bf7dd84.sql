-- Adicionar campos de personalização à tabela barbershops
ALTER TABLE barbershops 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS foto_perfil_url TEXT,
ADD COLUMN IF NOT EXISTS cor_fundo TEXT DEFAULT '#1a1a1a';

-- Comentários para documentação
COMMENT ON COLUMN barbershops.logo_url IS 'URL da logo da barbearia armazenada no Supabase Storage';
COMMENT ON COLUMN barbershops.foto_perfil_url IS 'URL da foto de perfil da barbearia';
COMMENT ON COLUMN barbershops.cor_fundo IS 'Cor de fundo personalizada para a página pública (formato hex)';
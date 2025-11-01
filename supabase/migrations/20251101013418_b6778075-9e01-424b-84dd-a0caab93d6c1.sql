-- Criar bucket de storage para imagens das barbearias
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'barbershop-images',
  'barbershop-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para o bucket barbershop-images
CREATE POLICY "Barbeiros podem fazer upload de imagens da sua barbearia"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'barbershop-images' AND
  EXISTS (
    SELECT 1 FROM barbershops
    WHERE barbershops.owner_id = auth.uid()
  )
);

CREATE POLICY "Imagens das barbearias são públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'barbershop-images');

CREATE POLICY "Barbeiros podem atualizar imagens da sua barbearia"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'barbershop-images' AND
  EXISTS (
    SELECT 1 FROM barbershops
    WHERE barbershops.owner_id = auth.uid()
  )
);

CREATE POLICY "Barbeiros podem deletar imagens da sua barbearia"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'barbershop-images' AND
  EXISTS (
    SELECT 1 FROM barbershops
    WHERE barbershops.owner_id = auth.uid()
  )
);
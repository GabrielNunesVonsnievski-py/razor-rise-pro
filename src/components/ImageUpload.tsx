import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (url: string) => void;
  label: string;
  accept?: string;
  barbershopId: number;
  folder: 'logo' | 'perfil';
}

export function ImageUpload({ 
  currentImageUrl, 
  onImageUpload, 
  label, 
  accept = "image/*",
  barbershopId,
  folder
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentImageUrl);
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${barbershopId}/${folder}-${Math.random()}.${fileExt}`;

      // Upload para o Storage
      const { error: uploadError, data } = await supabase.storage
        .from('barbershop-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('barbershop-images')
        .getPublicUrl(fileName);

      setPreview(publicUrl);
      onImageUpload(publicUrl);

      toast({
        title: 'Sucesso',
        description: 'Imagem enviada com sucesso!',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (preview) {
      try {
        // Extrair o caminho do arquivo da URL
        const url = new URL(preview);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(pathParts.indexOf('barbershop-images') + 1).join('/');
        
        await supabase.storage
          .from('barbershop-images')
          .remove([filePath]);
        
        setPreview(undefined);
        onImageUpload('');
        
        toast({
          title: 'Sucesso',
          description: 'Imagem removida com sucesso!',
        });
      } catch (error: any) {
        toast({
          title: 'Erro',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {preview ? (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt={label} 
            className="w-32 h-32 object-cover rounded-lg border border-border"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-4">
            Clique para fazer upload da imagem
          </p>
          <Input
            type="file"
            accept={accept}
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            id={`upload-${folder}`}
          />
          <Label 
            htmlFor={`upload-${folder}`}
            className="cursor-pointer"
          >
            <Button 
              variant="outline" 
              disabled={uploading}
              onClick={() => document.getElementById(`upload-${folder}`)?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Selecionar Imagem'
              )}
            </Button>
          </Label>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useBarbershop } from "@/hooks/useBarbershop";
import { Store, Link as LinkIcon, Copy, CheckCircle } from "lucide-react";

const BarbershopSettings = () => {
  const { toast } = useToast();
  const { barbershop, loading, createBarbershop, updateBarbershop } = useBarbershop();
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: "",
    slug: "",
    telefone: "",
    endereco: "",
    descricao: ""
  });

  useEffect(() => {
    if (barbershop) {
      setFormData({
        nome: barbershop.nome || "",
        slug: barbershop.slug || "",
        telefone: barbershop.telefone || "",
        endereco: barbershop.endereco || "",
        descricao: barbershop.descricao || ""
      });
    }
  }, [barbershop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.slug) {
      toast({
        title: "Erro",
        description: "Nome e slug são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const result = barbershop 
      ? await updateBarbershop(formData)
      : await createBarbershop(formData);

    if (result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso",
        description: barbershop ? "Barbearia atualizada!" : "Barbearia criada!"
      });
    }
  };

  const generateSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({ ...prev, slug }));
  };

  const copyLink = () => {
    const link = `${window.location.origin}/${formData.slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link copiado!",
      description: "O link da sua barbearia foi copiado para a área de transferência"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  const barbershopLink = formData.slug ? `${window.location.origin}/${formData.slug}` : "";

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5 text-accent" />
          Configurações da Barbearia
        </CardTitle>
        <CardDescription>
          Configure as informações da sua barbearia e gere um link único para seus clientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Barbearia *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, nome: e.target.value }));
                if (!barbershop) generateSlug(e.target.value);
              }}
              placeholder="Winix Barbearia"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Link da Barbearia *</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="winix-barbearia"
                required
                disabled={!!barbershop}
              />
              {barbershop && (
                <Button type="button" variant="outline" onClick={copyLink}>
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>
            {barbershopLink && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm">
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{barbershopLink}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              placeholder="Rua das Flores, 123 - Centro"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Barbearia premium com atendimento personalizado..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" variant="hero">
            {barbershop ? "Atualizar Barbearia" : "Criar Barbearia"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BarbershopSettings;

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useBarbershop } from "@/hooks/useBarbershop";
import { Store, Link as LinkIcon, Copy, CheckCircle, Users, Clock, Palette } from "lucide-react";
import { BarbersManagement } from "@/components/BarbersManagement";
import { ScheduleManagement } from "@/components/ScheduleManagement";
import { ImageUpload } from "@/components/ImageUpload";

const BarbershopSettings = () => {
  const { toast } = useToast();
  const { barbershop, loading, createBarbershop, updateBarbershop } = useBarbershop();
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: "",
    slug: "",
    telefone: "",
    endereco: "",
    descricao: "",
    horario_abertura: "09:00",
    horario_fechamento: "18:00",
    dias_funcionamento: ["1", "2", "3", "4", "5", "6"],
    logo_url: "",
    foto_perfil_url: "",
    cor_fundo: "#1a1a1a"
  });

  useEffect(() => {
    if (barbershop) {
      setFormData({
        nome: barbershop.nome || "",
        slug: barbershop.slug || "",
        telefone: barbershop.telefone || "",
        endereco: barbershop.endereco || "",
        descricao: barbershop.descricao || "",
        horario_abertura: (barbershop as any).horario_abertura?.slice(0, 5) || "09:00",
        horario_fechamento: (barbershop as any).horario_fechamento?.slice(0, 5) || "18:00",
        dias_funcionamento: (barbershop as any).dias_funcionamento || ["1", "2", "3", "4", "5", "6"],
        logo_url: (barbershop as any).logo_url || "",
        foto_perfil_url: (barbershop as any).foto_perfil_url || "",
        cor_fundo: (barbershop as any).cor_fundo || "#1a1a1a"
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
    const link = `${window.location.origin}/b/${formData.slug}`;
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

  const barbershopLink = formData.slug ? `${window.location.origin}/b/${formData.slug}` : "";

  return (
    <div className="space-y-6">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            Informações
          </TabsTrigger>
          <TabsTrigger value="barbers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Barbeiros
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Horários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Informações da Barbearia</CardTitle>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horario_abertura">Horário de Abertura</Label>
              <Input
                id="horario_abertura"
                type="time"
                value={formData.horario_abertura}
                onChange={(e) => setFormData(prev => ({ ...prev, horario_abertura: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horario_fechamento">Horário de Fechamento</Label>
              <Input
                id="horario_fechamento"
                type="time"
                value={formData.horario_fechamento}
                onChange={(e) => setFormData(prev => ({ ...prev, horario_fechamento: e.target.value }))}
              />
            </div>
          </div>

          {barbershop?.id && (
            <>
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Palette className="w-5 h-5 text-accent" />
                  Personalização da Página Pública
                </h3>
                
                <ImageUpload
                  currentImageUrl={formData.logo_url}
                  onImageUpload={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                  label="Logo da Barbearia"
                  barbershopId={barbershop.id}
                  folder="logo"
                />
                
                <div className="space-y-2">
                  <Label htmlFor="cor_fundo">Cor de Fundo da Página Pública</Label>
                  <div className="flex gap-4 items-center">
                    <Input
                      id="cor_fundo"
                      type="color"
                      value={formData.cor_fundo}
                      onChange={(e) => setFormData(prev => ({ ...prev, cor_fundo: e.target.value }))}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.cor_fundo}
                      onChange={(e) => setFormData(prev => ({ ...prev, cor_fundo: e.target.value }))}
                      placeholder="#1a1a1a"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Esta cor será aplicada como tema principal da página de agendamento
                  </p>
                </div>
              </div>
            </>
          )}

          <Button type="submit" className="w-full">
            {barbershop ? "Atualizar Barbearia" : "Criar Barbearia"}
          </Button>
        </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="barbers">
          <BarbersManagement />
        </TabsContent>

        <TabsContent value="schedule">
          <ScheduleManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BarbershopSettings;

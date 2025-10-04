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
    descricao: "",
    horario_abertura: "09:00",
    horario_fechamento: "18:00",
    dias_funcionamento: ["1", "2", "3", "4", "5", "6"]
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
        dias_funcionamento: (barbershop as any).dias_funcionamento || ["1", "2", "3", "4", "5", "6"]
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

          <div className="space-y-2">
            <Label>Dias de Funcionamento</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "1", label: "Seg" },
                { value: "2", label: "Ter" },
                { value: "3", label: "Qua" },
                { value: "4", label: "Qui" },
                { value: "5", label: "Sex" },
                { value: "6", label: "Sáb" },
                { value: "0", label: "Dom" }
              ].map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={formData.dias_funcionamento.includes(day.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const dias = formData.dias_funcionamento.includes(day.value)
                      ? formData.dias_funcionamento.filter(d => d !== day.value)
                      : [...formData.dias_funcionamento, day.value];
                    setFormData(prev => ({ ...prev, dias_funcionamento: dias }));
                  }}
                >
                  {day.label}
                </Button>
              ))}
            </div>
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

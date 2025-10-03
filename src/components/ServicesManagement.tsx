import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBarbershop } from "@/hooks/useBarbershop";
import { Scissors, Plus, Trash2, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Service {
  id: number;
  nome: string;
  valor: number;
  duracao: number;
  ativo: boolean;
}

const ServicesManagement = () => {
  const { toast } = useToast();
  const { barbershop } = useBarbershop();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    nome: "",
    valor: "",
    duracao: ""
  });

  useEffect(() => {
    if (barbershop) {
      fetchServices();
    }
  }, [barbershop]);

  const fetchServices = async () => {
    if (!barbershop) return;
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('barbershop_id', barbershop.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os serviços",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barbershop) return;

    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from('services')
          .update({
            nome: formData.nome,
            valor: parseFloat(formData.valor),
            duracao: parseInt(formData.duracao)
          })
          .eq('id', editing);

        if (error) throw error;
        toast({ title: "Serviço atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('services')
          .insert({
            barbershop_id: barbershop.id,
            nome: formData.nome,
            valor: parseFloat(formData.valor),
            duracao: parseInt(formData.duracao)
          });

        if (error) throw error;
        toast({ title: "Serviço criado com sucesso!" });
      }

      setFormData({ nome: "", valor: "", duracao: "" });
      setEditing(null);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o serviço",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditing(service.id);
    setFormData({
      nome: service.nome,
      valor: service.valor.toString(),
      duracao: service.duracao.toString()
    });
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Serviço removido com sucesso!" });
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o serviço",
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (id: number, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ ativo: !ativo })
        .eq('id', id);

      if (error) throw error;
      fetchServices();
    } catch (error) {
      console.error('Error toggling service:', error);
    }
  };

  if (!barbershop) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="p-6">
          <p className="text-muted-foreground">Configure sua barbearia primeiro na aba de Configurações</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-accent" />
            {editing ? "Editar Serviço" : "Adicionar Novo Serviço"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Serviço</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Corte Masculino"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                  placeholder="50.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (min)</Label>
                <Input
                  id="duracao"
                  type="number"
                  value={formData.duracao}
                  onChange={(e) => setFormData(prev => ({ ...prev, duracao: e.target.value }))}
                  placeholder="30"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                {editing ? "Atualizar" : "Adicionar"}
              </Button>
              {editing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditing(null);
                    setFormData({ nome: "", valor: "", duracao: "" });
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Serviços Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.nome}</TableCell>
                  <TableCell>R$ {service.valor.toFixed(2)}</TableCell>
                  <TableCell>{service.duracao} min</TableCell>
                  <TableCell>
                    <Badge 
                      variant={service.ativo ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleActive(service.id, service.ativo)}
                    >
                      {service.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {services.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum serviço cadastrado ainda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicesManagement;

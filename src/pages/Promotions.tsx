import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Tag, TrendingUp, Users, Plus, Edit, Trash2 } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Promotion {
  id: number;
  titulo: string;
  descricao: string | null;
  desconto: number;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
}

const Promotions = () => {
  const { toast } = useToast();
  const { barbershop } = useBarbershop();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    desconto: "",
    data_inicio: "",
    data_fim: ""
  });

  useEffect(() => {
    if (barbershop) {
      fetchPromotions();
    }
  }, [barbershop]);

  const fetchPromotions = async () => {
    if (!barbershop) return;
    
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('barbershop_id', barbershop.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as promoções",
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
          .from('promotions')
          .update({
            titulo: formData.titulo,
            descricao: formData.descricao,
            desconto: parseFloat(formData.desconto),
            data_inicio: formData.data_inicio,
            data_fim: formData.data_fim
          })
          .eq('id', editing);

        if (error) throw error;
        toast({ title: "Promoção atualizada com sucesso!" });
      } else {
        const { error } = await supabase
          .from('promotions')
          .insert({
            barbershop_id: barbershop.id,
            titulo: formData.titulo,
            descricao: formData.descricao,
            desconto: parseFloat(formData.desconto),
            data_inicio: formData.data_inicio,
            data_fim: formData.data_fim
          });

        if (error) throw error;
        toast({ title: "Promoção criada com sucesso!" });
      }

      setFormData({ titulo: "", descricao: "", desconto: "", data_inicio: "", data_fim: "" });
      setEditing(null);
      fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a promoção",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (promo: Promotion) => {
    setEditing(promo.id);
    setFormData({
      titulo: promo.titulo,
      descricao: promo.descricao || "",
      desconto: promo.desconto.toString(),
      data_inicio: promo.data_inicio,
      data_fim: promo.data_fim
    });
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Promoção removida com sucesso!" });
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a promoção",
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (id: number, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ ativo: !ativo })
        .eq('id', id);

      if (error) throw error;
      fetchPromotions();
    } catch (error) {
      console.error('Error toggling promotion:', error);
    }
  };

  const activePromotions = promotions.filter(p => p.ativo && new Date(p.data_fim) >= new Date());

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Promoções</h1>
                <p className="text-sm text-muted-foreground">Gerencie suas ofertas especiais</p>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Promoções Ativas</CardTitle>
                  <Tag className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{activePromotions.length}</div>
                  <p className="text-xs text-muted-foreground">em andamento</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Promoções</CardTitle>
                  <Users className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{promotions.length}</div>
                  <p className="text-xs text-muted-foreground">cadastradas</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Desconto Médio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {promotions.length > 0 
                      ? `${(promotions.reduce((acc, p) => acc + p.desconto, 0) / promotions.length).toFixed(1)}%`
                      : "0%"
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">média geral</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próxima Expiração</CardTitle>
                  <Calendar className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {activePromotions.length > 0
                      ? format(new Date(activePromotions[0].data_fim), 'dd/MM', { locale: ptBR })
                      : "-"
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">próxima promoção a expirar</p>
                </CardContent>
              </Card>
            </div>

            {/* Form */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-accent" />
                  {editing ? "Editar Promoção" : "Nova Promoção"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título</Label>
                      <Input
                        id="titulo"
                        value={formData.titulo}
                        onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                        placeholder="Desconto Especial"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desconto">Desconto (%)</Label>
                      <Input
                        id="desconto"
                        type="number"
                        step="0.01"
                        value={formData.desconto}
                        onChange={(e) => setFormData(prev => ({ ...prev, desconto: e.target.value }))}
                        placeholder="20"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Válido para todos os cortes..."
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data_inicio">Data de Início</Label>
                      <Input
                        id="data_inicio"
                        type="date"
                        value={formData.data_inicio}
                        onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data_fim">Data de Término</Label>
                      <Input
                        id="data_fim"
                        type="date"
                        value={formData.data_fim}
                        onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} variant="hero">
                      <Plus className="w-4 h-4 mr-2" />
                      {editing ? "Atualizar" : "Criar"}
                    </Button>
                    {editing && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setEditing(null);
                          setFormData({ titulo: "", descricao: "", desconto: "", data_inicio: "", data_fim: "" });
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Promotions List */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Todas as Promoções</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotions.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell className="font-medium">{promo.titulo}</TableCell>
                        <TableCell>{promo.desconto}%</TableCell>
                        <TableCell>
                          {format(new Date(promo.data_inicio), 'dd/MM/yy', { locale: ptBR })} - {format(new Date(promo.data_fim), 'dd/MM/yy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={promo.ativo ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => toggleActive(promo.id, promo.ativo)}
                          >
                            {promo.ativo && new Date(promo.data_fim) >= new Date() ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(promo)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(promo.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {promotions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Nenhuma promoção cadastrada ainda
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Promotions;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { useBarbershop } from "@/hooks/useBarbershop";

interface Barber {
  id: number;
  nome: string;
  status: 'ativo' | 'inativo';
}

export const BarbersManagement = () => {
  const { barbershop } = useBarbershop();
  const { toast } = useToast();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newBarber, setNewBarber] = useState<{ nome: string; status: 'ativo' | 'inativo' }>({ nome: "", status: "ativo" });
  const [editForm, setEditForm] = useState<{ nome: string; status: 'ativo' | 'inativo' }>({ nome: "", status: "ativo" });

  useEffect(() => {
    if (barbershop?.id) {
      fetchBarbers();
    }
  }, [barbershop?.id]);

  const fetchBarbers = async () => {
    if (!barbershop?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("barbers")
        .select("*")
        .eq("barbershop_id", barbershop.id)
        .order("nome");

      if (error) throw error;
      setBarbers((data || []).map(b => ({
        id: b.id,
        nome: b.nome,
        status: b.status as 'ativo' | 'inativo'
      })));
    } catch (error) {
      console.error("Erro ao carregar barbeiros:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os barbeiros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!barbershop?.id || !newBarber.nome.trim()) {
      toast({
        title: "Atenção",
        description: "Preencha o nome do barbeiro",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("barbers").insert({
        barbershop_id: barbershop.id,
        nome: newBarber.nome.trim(),
        status: newBarber.status,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Barbeiro cadastrado com sucesso",
      });

      setNewBarber({ nome: "", status: "ativo" });
      fetchBarbers();
    } catch (error) {
      console.error("Erro ao criar barbeiro:", error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o barbeiro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editForm.nome.trim()) {
      toast({
        title: "Atenção",
        description: "Preencha o nome do barbeiro",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("barbers")
        .update({
          nome: editForm.nome.trim(),
          status: editForm.status,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Barbeiro atualizado com sucesso",
      });

      setEditingId(null);
      fetchBarbers();
    } catch (error) {
      console.error("Erro ao atualizar barbeiro:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o barbeiro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir este barbeiro?")) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("barbers").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Barbeiro excluído com sucesso",
      });

      fetchBarbers();
    } catch (error) {
      console.error("Erro ao excluir barbeiro:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o barbeiro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (barber: Barber) => {
    setEditingId(barber.id);
    setEditForm({ nome: barber.nome, status: barber.status as 'ativo' | 'inativo' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ nome: "", status: "ativo" as 'ativo' | 'inativo' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Barbeiros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário de criação */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h3 className="text-sm font-semibold">Adicionar Novo Barbeiro</h3>
          <div className="grid gap-4 md:grid-cols-[1fr,200px,auto]">
            <div className="space-y-2">
              <Label htmlFor="new-nome">Nome Completo *</Label>
              <Input
                id="new-nome"
                value={newBarber.nome}
                onChange={(e) => setNewBarber({ ...newBarber, nome: e.target.value })}
                placeholder="Digite o nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-status">Status</Label>
              <Select
                value={newBarber.status}
                onValueChange={(value) => setNewBarber({ ...newBarber, status: value as any })}
              >
                <SelectTrigger id="new-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreate} disabled={loading} className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de barbeiros */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Barbeiros Cadastrados</h3>
          {loading && barbers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : barbers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum barbeiro cadastrado</p>
          ) : (
            <div className="space-y-2">
              {barbers.map((barber) => (
                <div
                  key={barber.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  {editingId === barber.id ? (
                    <>
                      <div className="flex-1 grid gap-3 md:grid-cols-[1fr,150px]">
                        <Input
                          value={editForm.nome}
                          onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                          placeholder="Nome completo"
                        />
                        <Select
                          value={editForm.status}
                          onValueChange={(value) =>
                            setEditForm({ ...editForm, status: value as any })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleUpdate(barber.id)}
                          disabled={loading}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                          disabled={loading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-medium">{barber.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          Status:{" "}
                          <span
                            className={
                              barber.status === "ativo"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }
                          >
                            {barber.status === "ativo" ? "Ativo" : "Inativo"}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(barber)}
                          disabled={loading}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(barber.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

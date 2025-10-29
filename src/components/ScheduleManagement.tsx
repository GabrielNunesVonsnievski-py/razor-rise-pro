import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { useBarbershop } from "@/hooks/useBarbershop";

interface DaySchedule {
  id?: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  intervalo_inicio: string;
  intervalo_fim: string;
  ativo: boolean;
}

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export const ScheduleManagement = () => {
  const { barbershop } = useBarbershop();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (barbershop?.id) {
      fetchSchedules();
    }
  }, [barbershop?.id]);

  const fetchSchedules = async () => {
    if (!barbershop?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("barbershop_schedules")
        .select("*")
        .eq("barbershop_id", barbershop.id)
        .order("dia_semana");

      if (error) throw error;

      // Criar schedules padrão para dias sem configuração
      const existingDays = data?.map((s) => s.dia_semana) || [];
      const defaultSchedules: DaySchedule[] = [];

      for (let i = 0; i < 7; i++) {
        const existing = data?.find((s) => s.dia_semana === i);
        if (existing) {
          defaultSchedules.push({
            id: existing.id,
            dia_semana: existing.dia_semana,
            hora_inicio: existing.hora_inicio,
            hora_fim: existing.hora_fim,
            intervalo_inicio: existing.intervalo_inicio || "",
            intervalo_fim: existing.intervalo_fim || "",
            ativo: existing.ativo,
          });
        } else {
          defaultSchedules.push({
            dia_semana: i,
            hora_inicio: "09:00",
            hora_fim: "18:00",
            intervalo_inicio: "",
            intervalo_fim: "",
            ativo: i >= 1 && i <= 6, // Segunda a sábado ativos por padrão
          });
        }
      }

      setSchedules(defaultSchedules);
    } catch (error) {
      console.error("Erro ao carregar horários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os horários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (dia: number, field: keyof DaySchedule, value: any) => {
    setSchedules((prev) =>
      prev.map((s) => (s.dia_semana === dia ? { ...s, [field]: value } : s))
    );
  };

  const validateSchedule = (schedule: DaySchedule): string | null => {
    if (!schedule.ativo) return null;

    const inicio = schedule.hora_inicio;
    const fim = schedule.hora_fim;
    const intInicio = schedule.intervalo_inicio;
    const intFim = schedule.intervalo_fim;

    if (!inicio || !fim) {
      return "Horário de início e fim são obrigatórios para dias ativos";
    }

    if (inicio >= fim) {
      return "Horário de início deve ser menor que horário de fim";
    }

    // Se tem intervalo, validar
    if (intInicio || intFim) {
      if (!intInicio || !intFim) {
        return "Intervalo incompleto: defina início e fim do intervalo";
      }

      if (intInicio <= inicio) {
        return "Início do intervalo deve ser após o horário de início";
      }

      if (intFim >= fim) {
        return "Fim do intervalo deve ser antes do horário de fim";
      }

      if (intInicio >= intFim) {
        return "Início do intervalo deve ser antes do fim";
      }
    }

    return null;
  };

  const handleSave = async () => {
    if (!barbershop?.id) return;

    // Validar todos os horários
    for (const schedule of schedules) {
      const error = validateSchedule(schedule);
      if (error) {
        toast({
          title: "Erro de Validação",
          description: `${DIAS_SEMANA[schedule.dia_semana]}: ${error}`,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      // Deletar todos os horários existentes
      await supabase
        .from("barbershop_schedules")
        .delete()
        .eq("barbershop_id", barbershop.id);

      // Inserir apenas os ativos
      const activeSchedules = schedules
        .filter((s) => s.ativo)
        .map((s) => ({
          barbershop_id: barbershop.id,
          dia_semana: s.dia_semana,
          hora_inicio: s.hora_inicio,
          hora_fim: s.hora_fim,
          intervalo_inicio: s.intervalo_inicio || null,
          intervalo_fim: s.intervalo_fim || null,
          ativo: true,
        }));

      if (activeSchedules.length > 0) {
        const { error } = await supabase
          .from("barbershop_schedules")
          .insert(activeSchedules);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Horários atualizados com sucesso",
      });

      fetchSchedules();
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os horários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Horários e Intervalos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-6">
          {schedules.map((schedule) => (
            <div
              key={schedule.dia_semana}
              className="p-4 border rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{DIAS_SEMANA[schedule.dia_semana]}</h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`ativo-${schedule.dia_semana}`} className="text-sm">
                    Ativo
                  </Label>
                  <Switch
                    id={`ativo-${schedule.dia_semana}`}
                    checked={schedule.ativo}
                    onCheckedChange={(checked) =>
                      handleUpdate(schedule.dia_semana, "ativo", checked)
                    }
                  />
                </div>
              </div>

              {schedule.ativo && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`inicio-${schedule.dia_semana}`}>
                      Hora de Início *
                    </Label>
                    <Input
                      id={`inicio-${schedule.dia_semana}`}
                      type="time"
                      value={schedule.hora_inicio}
                      onChange={(e) =>
                        handleUpdate(schedule.dia_semana, "hora_inicio", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`fim-${schedule.dia_semana}`}>
                      Hora de Fim *
                    </Label>
                    <Input
                      id={`fim-${schedule.dia_semana}`}
                      type="time"
                      value={schedule.hora_fim}
                      onChange={(e) =>
                        handleUpdate(schedule.dia_semana, "hora_fim", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`int-inicio-${schedule.dia_semana}`}>
                      Início do Intervalo (Opcional)
                    </Label>
                    <Input
                      id={`int-inicio-${schedule.dia_semana}`}
                      type="time"
                      value={schedule.intervalo_inicio}
                      onChange={(e) =>
                        handleUpdate(
                          schedule.dia_semana,
                          "intervalo_inicio",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`int-fim-${schedule.dia_semana}`}>
                      Fim do Intervalo (Opcional)
                    </Label>
                    <Input
                      id={`int-fim-${schedule.dia_semana}`}
                      type="time"
                      value={schedule.intervalo_fim}
                      onChange={(e) =>
                        handleUpdate(schedule.dia_semana, "intervalo_fim", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Horários
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, Clock, AlertCircle } from "lucide-react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { Badge } from "@/components/ui/badge";

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
  { num: 0, nome: "Domingo", short: "Dom" },
  { num: 1, nome: "Segunda-feira", short: "Seg" },
  { num: 2, nome: "Terça-feira", short: "Ter" },
  { num: 3, nome: "Quarta-feira", short: "Qua" },
  { num: 4, nome: "Quinta-feira", short: "Qui" },
  { num: 5, nome: "Sexta-feira", short: "Sex" },
  { num: 6, nome: "Sábado", short: "Sáb" },
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
            ativo: i >= 1 && i <= 6,
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

    for (const schedule of schedules) {
      const error = validateSchedule(schedule);
      if (error) {
        toast({
          title: "Erro de Validação",
          description: `${DIAS_SEMANA[schedule.dia_semana].nome}: ${error}`,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      await supabase
        .from("barbershop_schedules")
        .delete()
        .eq("barbershop_id", barbershop.id);

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

  const activeDays = schedules.filter(s => s.ativo).length;

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Gestão de Horários
            </CardTitle>
            <CardDescription>
              Configure os horários de funcionamento e intervalos para cada dia da semana
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {activeDays} {activeDays === 1 ? 'dia ativo' : 'dias ativos'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <Card
              key={schedule.dia_semana}
              className={`transition-all ${schedule.ativo ? 'border-accent/50 bg-accent/5' : 'opacity-60'}`}
            >
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${schedule.ativo ? 'bg-gradient-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {DIAS_SEMANA[schedule.dia_semana].short}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {DIAS_SEMANA[schedule.dia_semana].nome}
                      </h3>
                      {schedule.ativo && (
                        <p className="text-sm text-muted-foreground">
                          {schedule.hora_inicio} - {schedule.hora_fim}
                          {schedule.intervalo_inicio && schedule.intervalo_fim && 
                            ` (Intervalo: ${schedule.intervalo_inicio} - ${schedule.intervalo_fim})`
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`ativo-${schedule.dia_semana}`} className="text-sm font-medium">
                      {schedule.ativo ? 'Aberto' : 'Fechado'}
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
                  <div className="space-y-3 pt-3 border-t">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`inicio-${schedule.dia_semana}`} className="text-xs font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Abertura *
                        </Label>
                        <Input
                          id={`inicio-${schedule.dia_semana}`}
                          type="time"
                          value={schedule.hora_inicio}
                          onChange={(e) =>
                            handleUpdate(schedule.dia_semana, "hora_inicio", e.target.value)
                          }
                          className="font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`fim-${schedule.dia_semana}`} className="text-xs font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Fechamento *
                        </Label>
                        <Input
                          id={`fim-${schedule.dia_semana}`}
                          type="time"
                          value={schedule.hora_fim}
                          onChange={(e) =>
                            handleUpdate(schedule.dia_semana, "hora_fim", e.target.value)
                          }
                          className="font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dashed">
                      <div className="space-y-2">
                        <Label htmlFor={`int-inicio-${schedule.dia_semana}`} className="text-xs font-medium text-muted-foreground">
                          Início do Intervalo (opcional)
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
                          className="font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`int-fim-${schedule.dia_semana}`} className="text-xs font-medium text-muted-foreground">
                          Fim do Intervalo (opcional)
                        </Label>
                        <Input
                          id={`int-fim-${schedule.dia_semana}`}
                          type="time"
                          value={schedule.intervalo_fim}
                          onChange={(e) =>
                            handleUpdate(schedule.dia_semana, "intervalo_fim", e.target.value)
                          }
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>Configure os horários de cada dia e salve as alterações</span>
          </div>
          <Button onClick={handleSave} disabled={loading} size="lg" variant="hero">
            <Save className="w-4 h-4 mr-2" />
            Salvar Horários
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
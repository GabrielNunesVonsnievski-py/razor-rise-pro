import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Calendar, Clock, Scissors, TrendingUp, Users, Star, Plus } from "lucide-react";

// Tipagem para agendamentos
interface Appointment {
  id: number;
  client: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  status: "pending" | "confirmed";
  user_id: string; // id do usuário logado
}

const BarberDashboard = () => {
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    client: "",
    phone: "",
    date: "",
    time: "",
    service: "",
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Pega o usuário logado
  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) setUserId(data.user.id);
  };

  // Buscar agendamentos do usuário logado
  const fetchTodayAppointments = async () => {
    if (!userId) return;
    const today = dayjs().format("YYYY-MM-DD");
    const { data, error } = await supabase
      .from<Appointment>("appointments")
      .select("*")
      .eq("date", today)
      .eq("user_id", userId) // filtra pelo usuário logado
      .order("time", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar agendamentos",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setTodayAppointments(data);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTodayAppointments();
      const interval = setInterval(fetchTodayAppointments, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // Criar novo agendamento
  const handleCreateAppointment = async () => {
    const { client, phone, date, time, service } = newAppointment;
    if (!userId) return;

    if (!client || !phone || !date || !time || !service) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar um agendamento.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("appointments").insert([
      {
        client,
        phone,
        date,
        time,
        service,
        status: "pending",
        user_id: userId, // associa ao usuário logado
      },
    ]);

    if (error) {
      toast({
        title: "Erro ao criar agendamento",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Agendamento criado",
        description: `Agendamento para ${client} criado com sucesso!`,
      });
      setNewAppointment({
        client: "",
        phone: "",
        date: "",
        time: "",
        service: "",
      });
      setIsDialogOpen(false);
      fetchTodayAppointments();
    }
  };

  // Estatísticas dinâmicas
  const stats = [
    { title: "Agendamentos Hoje", value: todayAppointments.length.toString(), icon: Calendar, trend: "+2" },
    { title: "Receita do Mês", value: "R$ 3.240", icon: TrendingUp, trend: "+15%" },
    { title: "Clientes Ativos", value: "89", icon: Users, trend: "+8" },
    { title: "Avaliação", value: "4.9", icon: Star, trend: "★★★★★" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Bem-vindo de volta!</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4" />
                Ver Agenda
              </Button>
              <Button variant="hero" size="sm">
                <Scissors className="w-4 h-4" />
                Nova Promoção
              </Button>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="shadow-elegant hover:shadow-glow transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <p className="text-xs text-accent font-medium">{stat.trend}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Today's Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    Agendamentos de Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todayAppointments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">Nenhum agendamento para hoje.</p>
                  ) : (
                    todayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                            <Scissors className="w-6 h-6 text-accent-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium text-primary">{appointment.client}</h3>
                            <p className="text-sm text-muted-foreground">{appointment.service}</p>
                            <p className="text-xs text-muted-foreground">{appointment.phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-primary">{appointment.time}</p>
                          <Badge variant={appointment.status === "confirmed" ? "default" : "destructive"}>
                            {appointment.status === "confirmed" ? "Confirmado" : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                  <Button
                    variant="accent"
                    className="w-full"
                    onClick={() => toast({ title: "Funcionalidade não implementada" })}
                  >
                    Ver Todos os Agendamentos
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="hero">
                        <Plus className="w-4 h-4" />
                        Novo Agendamento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Novo Agendamento</DialogTitle>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="client">Nome do Cliente</Label>
                          <Input
                            id="client"
                            value={newAppointment.client}
                            onChange={(e) =>
                              setNewAppointment({ ...newAppointment, client: e.target.value })
                            }
                            placeholder="Digite o nome do cliente"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            value={newAppointment.phone}
                            onChange={(e) =>
                              setNewAppointment({ ...newAppointment, phone: e.target.value })
                            }
                            placeholder="(11) 99999-9999"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="date">Data</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newAppointment.date}
                            onChange={(e) =>
                              setNewAppointment({ ...newAppointment, date: e.target.value })
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="time">Horário</Label>
                          <Input
                            id="time"
                            type="time"
                            value={newAppointment.time}
                            onChange={(e) =>
                              setNewAppointment({ ...newAppointment, time: e.target.value })
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="service">Serviço</Label>
                          <Select
                            value={newAppointment.service}
                            onValueChange={(value) =>
                              setNewAppointment({ ...newAppointment, service: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o serviço" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="corte">Corte</SelectItem>
                              <SelectItem value="barba">Barba</SelectItem>
                              <SelectItem value="corte-barba">Corte + Barba</SelectItem>
                              <SelectItem value="corte-barba-sobrancelha">
                                Corte + Barba + Sobrancelha
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateAppointment}>Criar Agendamento</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="premium" className="w-full justify-start">
                    <Star className="w-4 h-4" />
                    Criar Promoção
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4" />
                    Relatório Financeiro
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4" />
                    Gerenciar Clientes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default BarberDashboard;

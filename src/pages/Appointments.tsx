import { useEffect, useState } from "react";
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

import { Calendar, Clock, User, Phone, Plus } from "lucide-react";

interface Appointment {
  id: number;
  client: string;
  phone: string;
  time: string;
  service: string;
  date: string;
  status: "pending" | "confirmed";
  user_id: string;
}

const Appointments = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    client: "",
    phone: "",
    time: "",
    service: "",
    date: "",
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const { toast } = useToast();

  // Pega usuário logado
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    };
    fetchUser();
  }, []);

  // Buscar agendamentos do usuário logado
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from<Appointment>("appointments")
        .select("*")
        .eq("user_id", userId)
        .order("date");
      if (error) {
        console.error(error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os agendamentos.",
          variant: "destructive",
        });
      } else {
        setAppointments(data || []);
      }
    };
    fetchAppointments();
  }, [userId]);

  // Criar novo agendamento
  const handleCreateAppointment = async () => {
    if (!userId) return;

    if (!newAppointment.client || !newAppointment.phone || !newAppointment.time || !newAppointment.service || !newAppointment.date) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert([{ ...newAppointment, status: "pending", user_id: userId }])
      .select();

    if (error) {
      console.error(error);
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }

    if (data && data.length > 0) setAppointments((prev) => [...prev, data[0]]);

    toast({
      title: "Agendamento criado",
      description: `Agendamento para ${newAppointment.client} criado com sucesso!`,
    });

    setNewAppointment({ client: "", phone: "", time: "", service: "", date: "" });
    setIsDialogOpen(false);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Agendamentos</h1>
                <p className="text-sm text-muted-foreground">Gerencie seus horários</p>
              </div>
            </div>
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
                      onChange={(e) => setNewAppointment({ ...newAppointment, client: e.target.value })}
                      placeholder="Digite o nome do cliente"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={newAppointment.phone}
                      onChange={(e) => setNewAppointment({ ...newAppointment, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Horário</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="service">Serviço</Label>
                    <Select
                      value={newAppointment.service}
                      onValueChange={(value) => setNewAppointment({ ...newAppointment, service: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corte">Corte</SelectItem>
                        <SelectItem value="barba">Barba</SelectItem>
                        <SelectItem value="corte-barba">Corte + Barba</SelectItem>
                        <SelectItem value="corte-barba-sobrancelha">Corte + Barba + Sobrancelha</SelectItem>
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
          </header>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Hoje</CardTitle>
                  <Calendar className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{appointments.length}</div>
                  <p className="text-xs text-accent font-medium">agendamentos</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Próximos Agendamentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium text-primary">{appointment.client}</h3>
                        <p className="text-sm text-muted-foreground">{appointment.service}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {appointment.phone}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">{appointment.time}</p>
                      <p className="text-sm text-muted-foreground">{appointment.date}</p>
                      <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                        {appointment.status === "confirmed" ? "Confirmado" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Appointments;

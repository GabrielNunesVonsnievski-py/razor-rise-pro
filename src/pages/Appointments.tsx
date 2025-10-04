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
  id: string;
  client: string;
  phone: string;
  time: string;
  service: string;
  date: string;
  status: "pending" | "confirmed" | "completed" | "no_show";
  user_id: string;
  valor: number;
  barbershop_id?: number;
  created_at?: string;
}

const Appointments = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    client: "",
    phone: "",
    time: "",
    service: "",
    serviceId: "",
    date: "",
    valor: 0,
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [barbershopId, setBarbershopId] = useState<number | null>(null);

  const { toast } = useToast();

  // Pega usuário logado
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    };
    fetchUser();
  }, []);

  // Buscar barbearia e serviços
  useEffect(() => {
    const fetchBarbershopAndServices = async () => {
      if (!userId) return;
      
      // Buscar barbearia do usuário
      const { data: barbershopData } = await supabase
        .from('barbershops')
        .select('id')
        .eq('owner_id', userId)
        .single();

      if (!barbershopData) return;
      
      setBarbershopId(barbershopData.id);

      // Buscar serviços da barbearia
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('barbershop_id', barbershopData.id)
        .eq('ativo', true);

      setServices(servicesData || []);
    };
    fetchBarbershopAndServices();
  }, [userId]);

  // Buscar agendamentos da barbearia do usuário
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!barbershopId) return;

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("barbershop_id", barbershopId)
        .order("date", { ascending: true })
        .order("time", { ascending: true });
        
      if (error) {
        console.error(error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os agendamentos.",
          variant: "destructive",
        });
      } else {
        setAppointments((data as Appointment[]) || []);
      }
    };
    fetchAppointments();
  }, [barbershopId]);

  const handleUpdateStatus = async (appointmentId: string, newStatus: "completed" | "no_show") => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive'
      });
      return;
    }

    // Se concluído, registrar nas finanças
    if (newStatus === 'completed') {
      const { data: barbershopData } = await supabase
        .from('barbershops')
        .select('id')
        .eq('owner_id', userId)
        .single();

      if (barbershopData) {
        await supabase
          .from('financial_records')
          .insert({
            barbershop_id: barbershopData.id,
            appointment_id: appointmentId,
            tipo: 'receita',
            valor: appointment.valor,
            descricao: `Serviço: ${appointment.service} - Cliente: ${appointment.client}`,
            metodo_pagamento: 'dinheiro' // Padrão, pode ser editado depois
          });
      }

      toast({
        title: 'Concluído!',
        description: 'Agendamento marcado como concluído e registrado nas finanças.'
      });
    } else {
      toast({
        title: 'Status atualizado',
        description: 'Agendamento marcado como "Não compareceu".'
      });
    }

    // Atualizar lista
    setAppointments(prev => 
      prev.map(a => a.id === appointmentId ? { ...a, status: newStatus } : a)
    );
  };

  // Criar novo agendamento
  const handleCreateAppointment = async () => {
    if (!userId || !barbershopId) return;

    if (!newAppointment.client || !newAppointment.phone || !newAppointment.time || !newAppointment.serviceId || !newAppointment.date) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const selectedService = services.find(s => s.id === parseInt(newAppointment.serviceId));

    const { data, error } = await supabase
      .from("appointments")
      .insert([{ 
        client: newAppointment.client,
        phone: newAppointment.phone,
        time: newAppointment.time,
        service: selectedService?.nome || '',
        service_id: parseInt(newAppointment.serviceId),
        date: newAppointment.date,
        valor: selectedService?.valor || 0,
        status: "pending", 
        user_id: userId,
        barbershop_id: barbershopId
      }])
      .select();

    if (error) {
      console.error(error);
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }

    if (data && data.length > 0) setAppointments((prev) => [...prev, data[0] as Appointment]);

    toast({
      title: "Agendamento criado",
      description: `Agendamento para ${newAppointment.client} criado com sucesso!`,
    });

    setNewAppointment({ client: "", phone: "", time: "", service: "", serviceId: "", date: "", valor: 0 });
    setIsDialogOpen(false);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-40 hidden md:flex">
            <div className="flex items-center gap-4">
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
              <DialogContent className="sm:max-w-[425px] mx-4">
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
                      value={newAppointment.serviceId}
                      onValueChange={(value) => setNewAppointment({ ...newAppointment, serviceId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.nome} - R$ {service.valor.toFixed(2)}
                          </SelectItem>
                        ))}
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

          {/* Mobile Header */}
          <div className="md:hidden h-14 flex items-center justify-between px-4 border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="mobile-sidebar-trigger">
                <Calendar className="w-5 h-5" />
              </SidebarTrigger>
              <div>
                <h1 className="text-lg font-bold text-primary">Agendamentos</h1>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] mx-4">
                <DialogHeader>
                  <DialogTitle>Novo Agendamento</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="client-mobile">Nome do Cliente</Label>
                    <Input
                      id="client-mobile"
                      value={newAppointment.client}
                      onChange={(e) => setNewAppointment({ ...newAppointment, client: e.target.value })}
                      placeholder="Digite o nome do cliente"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone-mobile">Telefone</Label>
                    <Input
                      id="phone-mobile"
                      value={newAppointment.phone}
                      onChange={(e) => setNewAppointment({ ...newAppointment, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date-mobile">Data</Label>
                    <Input
                      id="date-mobile"
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time-mobile">Horário</Label>
                    <Input
                      id="time-mobile"
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="service-mobile">Serviço</Label>
                    <Select
                      value={newAppointment.serviceId}
                      onValueChange={(value) => setNewAppointment({ ...newAppointment, serviceId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.nome} - R$ {service.valor.toFixed(2)}
                          </SelectItem>
                        ))}
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
          </div>

          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <Card className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Hoje</CardTitle>
                  <Calendar className="h-3 w-3 md:h-4 md:w-4 text-accent" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-lg md:text-2xl font-bold text-primary">{appointments.length}</div>
                  <p className="text-xs text-accent font-medium">agendamentos</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Próximos Agendamentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 md:w-6 md:h-6 text-accent-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium text-primary text-sm md:text-base">{appointment.client}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">{appointment.service}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {appointment.phone}
                        </div>
                        <p className="text-sm font-medium text-accent mt-1">R$ {appointment.valor?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-right">
                        <p className="font-medium text-primary text-sm md:text-base">{appointment.time}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{appointment.date}</p>
                        <Badge 
                          variant={
                            appointment.status === "completed" ? "default" : 
                            appointment.status === "no_show" ? "destructive" : 
                            "secondary"
                          } 
                          className="text-xs mt-1"
                        >
                          {appointment.status === "completed" ? "Concluído" : 
                           appointment.status === "no_show" ? "Não compareceu" :
                           appointment.status === "confirmed" ? "Confirmado" : "Pendente"}
                        </Badge>
                      </div>
                      {(appointment.status === "pending" || appointment.status === "confirmed") && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                            className="text-xs"
                          >
                            Concluir
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleUpdateStatus(appointment.id, 'no_show')}
                            className="text-xs"
                          >
                            Não compareceu
                          </Button>
                        </div>
                      )}
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

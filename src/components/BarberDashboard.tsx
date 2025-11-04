import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardStats } from "@/components/DashboardStats";

import { Calendar, Clock, Scissors } from "lucide-react";

// Tipagem para agendamentos
interface Appointment {
  id: string;
  client: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  status: "pending" | "confirmed";
  user_id: string;
  created_at?: string;
}

const BarberDashboard = () => {
  const { toast } = useToast();
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
      .from("appointments")
      .select("*")
      .eq("date", today)
      .eq("user_id", userId)
      .order("time", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar agendamentos",
        description: error.message,
        variant: "destructive",
      });
      } else if (data) {
        setTodayAppointments(data as Appointment[]);
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-40 hidden md:flex">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Bem-vindo de volta!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4" />
                Ver Agenda
              </Button>
            </div>
          </header>

          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Mobile Header */}
            <div className="md:hidden mb-4">
              <div className="flex items-center justify-between">
                <SidebarTrigger className="mobile-sidebar-trigger">
                  <Calendar className="w-5 h-5" />
                </SidebarTrigger>
                <h1 className="text-lg font-bold text-primary">Dashboard</h1>
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <DashboardStats />

            {/* Today's Appointments */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                  Agendamentos de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {todayAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum agendamento para hoje.</p>
                ) : (
                  todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 md:p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors appointment-card"
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                          <Scissors className="w-4 h-4 md:w-6 md:h-6 text-accent-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium text-primary text-sm md:text-base">{appointment.client}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground">{appointment.service}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{appointment.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary text-sm md:text-base">{appointment.time}</p>
                        <Badge variant={appointment.status === "confirmed" ? "default" : "destructive"} className="text-xs">
                          {appointment.status === "confirmed" ? "Confirmado" : "Pendente"}
                        </Badge>
                        <p className="text-xs text-muted-foreground hidden md:block">{appointment.phone}</p>
                      </div>
                    </div>
                  ))
                )}
                <Button
                  variant="accent"
                  className="w-full text-sm md:text-base"
                  onClick={() => window.location.href = '/appointments'}
                >
                  Ver Todos os Agendamentos
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default BarberDashboard;

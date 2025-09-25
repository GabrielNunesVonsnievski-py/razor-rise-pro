import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Plus } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Appointments = () => {
  const appointments = [
    { 
      id: 1, 
      client: "João Silva", 
      phone: "(11) 99999-9999",
      time: "09:00", 
      service: "Corte + Barba", 
      status: "confirmed",
      date: "2024-01-15"
    },
    { 
      id: 2, 
      client: "Pedro Santos", 
      phone: "(11) 88888-8888",
      time: "10:30", 
      service: "Corte", 
      status: "confirmed",
      date: "2024-01-15"
    },
    { 
      id: 3, 
      client: "Carlos Lima", 
      phone: "(11) 77777-7777",
      time: "14:00", 
      service: "Barba", 
      status: "pending",
      date: "2024-01-15"
    },
    { 
      id: 4, 
      client: "Roberto Costa", 
      phone: "(11) 66666-6666",
      time: "16:30", 
      service: "Corte + Barba + Sobrancelha", 
      status: "confirmed",
      date: "2024-01-16"
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Agendamentos</h1>
                <p className="text-sm text-muted-foreground">Gerencie seus horários</p>
              </div>
            </div>
            <Button variant="hero">
              <Plus className="w-4 h-4" />
              Novo Agendamento
            </Button>
          </header>

          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Hoje
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">8</div>
                  <p className="text-xs text-accent font-medium">agendamentos</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Amanhã
                  </CardTitle>
                  <Clock className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">12</div>
                  <p className="text-xs text-accent font-medium">agendamentos</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pendentes
                  </CardTitle>
                  <User className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">3</div>
                  <p className="text-xs text-accent font-medium">confirmações</p>
                </CardContent>
              </Card>
            </div>

            {/* Appointments List */}
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
                      <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                        {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
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
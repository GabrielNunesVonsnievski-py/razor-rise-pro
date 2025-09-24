import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Scissors, TrendingUp, Users, Star, Clock } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const BarberDashboard = () => {
  const todayAppointments = [
    { id: 1, client: "João Silva", time: "09:00", service: "Corte + Barba", status: "confirmed" },
    { id: 2, client: "Pedro Santos", time: "10:30", service: "Corte", status: "confirmed" },
    { id: 3, client: "Carlos Lima", time: "14:00", service: "Barba", status: "pending" },
  ];

  const stats = [
    { title: "Agendamentos Hoje", value: "12", icon: Calendar, trend: "+2" },
    { title: "Receita do Mês", value: "R$ 3.240", icon: TrendingUp, trend: "+15%" },
    { title: "Clientes Ativos", value: "89", icon: Users, trend: "+8" },
    { title: "Avaliação", value: "4.9", icon: Star, trend: "★★★★★" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          {/* Header with Sidebar Trigger */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
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

          {/* Main Content */}
          <div className="p-6 space-y-6">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-elegant hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <p className="text-xs text-accent font-medium">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <Card className="lg:col-span-2 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Agendamentos de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAppointments.map((appointment) => (
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
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">{appointment.time}</p>
                  <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                    {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="accent" className="w-full">
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
            <Button variant="hero" className="w-full justify-start">
              <Calendar className="w-4 h-4" />
              Novo Agendamento
            </Button>
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

      {/* Recent Promotions */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Promoções Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 gradient-accent rounded-lg text-accent-foreground">
              <h3 className="font-bold text-lg">Corte + Barba</h3>
              <p className="text-sm opacity-90">De R$ 45 por R$ 35</p>
              <p className="text-xs opacity-80 mt-2">Válido até 30/12</p>
            </div>
            <div className="p-4 gradient-primary rounded-lg text-primary-foreground">
              <h3 className="font-bold text-lg">Pacote Noivo</h3>
              <p className="text-sm opacity-90">Corte + Barba + Sobrancelha</p>
              <p className="text-xs opacity-80 mt-2">R$ 80,00</p>
            </div>
            <div className="p-4 border-2 border-accent rounded-lg">
              <h3 className="font-bold text-lg text-accent">+ Nova Promoção</h3>
              <p className="text-sm text-muted-foreground">Clique para criar</p>
            </div>
          </div>
        </CardContent>
      </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default BarberDashboard;
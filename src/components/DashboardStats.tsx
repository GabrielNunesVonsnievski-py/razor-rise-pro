import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, Users, Star } from "lucide-react";

interface StatsData {
  todayAppointments: number;
  monthlyRevenue: number;
  activeClients: number;
  averageRating: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    todayAppointments: 0,
    monthlyRevenue: 0,
    activeClients: 0,
    averageRating: 0,
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      const today = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Agendamentos de hoje
      const { count: todayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('date', today);

      // Receita do mês (agendamentos concluídos)
      const { data: monthlyAppointments } = await supabase
        .from('appointments')
        .select('valor')
        .eq('user_id', userId)
        .eq('status', 'confirmed')
        .gte('date', firstDayOfMonth);

      const monthlyRevenue = monthlyAppointments?.reduce((acc, app) => acc + (Number(app.valor) || 0), 0) || 0;

      // Clientes ativos (últimos 30 dias)
      const { data: recentAppointments } = await supabase
        .from('appointments')
        .select('user_id')
        .eq('user_id', userId)
        .gte('date', thirtyDaysAgo);

      const uniqueClients = new Set(recentAppointments?.map(app => app.user_id));
      const activeClients = uniqueClients.size;

      // Avaliação média (últimos 30 dias) - Placeholder
      // TODO: Implementar tabela de avaliações
      const averageRating = 4.9;

      setStats({
        todayAppointments: todayCount || 0,
        monthlyRevenue,
        activeClients,
        averageRating,
      });
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Atualiza a cada minuto
    return () => clearInterval(interval);
  }, [userId]);

  const statsDisplay = [
    { 
      title: "Agendamentos Hoje", 
      value: stats.todayAppointments.toString(), 
      icon: Calendar, 
      trend: `${stats.todayAppointments > 0 ? '+' : ''}${stats.todayAppointments}` 
    },
    { 
      title: "Receita do Mês", 
      value: `R$ ${stats.monthlyRevenue.toFixed(2)}`, 
      icon: TrendingUp, 
      trend: stats.monthlyRevenue > 0 ? "+" : "" 
    },
    { 
      title: "Clientes Ativos", 
      value: stats.activeClients.toString(), 
      icon: Users, 
      trend: `${stats.activeClients} últimos 30d` 
    },
    { 
      title: "Avaliação", 
      value: stats.averageRating.toFixed(1), 
      icon: Star, 
      trend: "★★★★★" 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 dashboard-grid">
      {statsDisplay.map((stat, index) => (
        <Card key={index} className="shadow-elegant hover:shadow-glow transition-all duration-300 stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-3 w-3 md:h-4 md:w-4 text-accent" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg md:text-2xl font-bold text-primary">{stat.value}</div>
            <p className="text-xs text-accent font-medium">{stat.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

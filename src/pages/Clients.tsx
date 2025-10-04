import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Phone, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  total_appointments: number;
}

const Clients = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar barbearia do usuário
      const { data: barbershopData } = await supabase
        .from('barbershops')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!barbershopData) {
        setLoading(false);
        return;
      }

      // Buscar clientes da barbearia
      const { data: barbershopClients, error: clientsError } = await supabase
        .from('barbershop_clients')
        .select('client_user_id, created_at')
        .eq('barbershop_id', barbershopData.id);

      if (clientsError) throw clientsError;

      if (!barbershopClients || barbershopClients.length === 0) {
        setLoading(false);
        return;
      }

      // Buscar perfis dos clientes
      const clientIds = barbershopClients.map(c => c.client_user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, phone')
        .in('user_id', clientIds);

      if (profilesError) throw profilesError;

      // Buscar total de agendamentos por cliente
      const { data: appointments } = await supabase
        .from('appointments')
        .select('user_id')
        .eq('barbershop_id', barbershopData.id);

      // Montar lista de clientes
      const clientsData: Client[] = profiles?.map(profile => {
        const clientData = barbershopClients.find(c => c.client_user_id === profile.user_id);
        const totalAppointments = appointments?.filter(a => a.user_id === profile.user_id).length || 0;

        return {
          id: profile.user_id,
          full_name: profile.full_name || 'Sem nome',
          email: profile.email || 'Sem email',
          phone: profile.phone || 'Sem telefone',
          created_at: clientData?.created_at || '',
          total_appointments: totalAppointments
        };
      }) || [];

      setClients(clientsData);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os clientes.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Clientes</h1>
                <p className="text-sm text-muted-foreground">Gerencie seus clientes</p>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Clientes
                  </CardTitle>
                  <Users className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{clients.length}</div>
                  <p className="text-xs text-muted-foreground">clientes cadastrados</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Novos este Mês
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {clients.filter(c => {
                      const clientDate = new Date(c.created_at);
                      const now = new Date();
                      return clientDate.getMonth() === now.getMonth() && 
                             clientDate.getFullYear() === now.getFullYear();
                    }).length}
                  </div>
                  <p className="text-xs text-muted-foreground">novos clientes</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Atendimentos
                  </CardTitle>
                  <Users className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {clients.reduce((sum, c) => sum + c.total_appointments, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">serviços realizados</p>
                </CardContent>
              </Card>
            </div>

            {/* Clients List */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Lista de Clientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Carregando...</p>
                ) : clients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum cliente cadastrado ainda
                  </p>
                ) : (
                  clients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-accent text-accent-foreground font-semibold">
                            {client.full_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-primary">{client.full_name}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            {client.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {client.phone}
                              </span>
                            )}
                            {client.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {client.email}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Cliente desde {format(new Date(client.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">{client.total_appointments}</p>
                        <p className="text-xs text-muted-foreground">agendamentos</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Clients;

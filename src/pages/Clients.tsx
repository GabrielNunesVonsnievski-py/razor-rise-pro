import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Phone, Mail, Calendar, Search, Plus } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Clients = () => {
  const clients = [
    { 
      id: 1, 
      name: "João Silva", 
      phone: "(11) 99999-9999",
      email: "joao@email.com",
      lastVisit: "2024-01-10",
      totalVisits: 15,
      status: "ativo"
    },
    { 
      id: 2, 
      name: "Pedro Santos", 
      phone: "(11) 88888-8888",
      email: "pedro@email.com",
      lastVisit: "2024-01-08",
      totalVisits: 8,
      status: "ativo"
    },
    { 
      id: 3, 
      name: "Carlos Lima", 
      phone: "(11) 77777-7777",
      email: "carlos@email.com",
      lastVisit: "2023-12-20",
      totalVisits: 3,
      status: "inativo"
    },
    { 
      id: 4, 
      name: "Roberto Costa", 
      phone: "(11) 66666-6666",
      email: "roberto@email.com",
      lastVisit: "2024-01-12",
      totalVisits: 22,
      status: "vip"
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
                <h1 className="text-2xl font-bold text-primary">Clientes</h1>
                <p className="text-sm text-muted-foreground">Gerencie sua base de clientes</p>
              </div>
            </div>
            <Button variant="hero">
              <Plus className="w-4 h-4" />
              Novo Cliente
            </Button>
          </header>

          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Clientes
                  </CardTitle>
                  <Users className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">89</div>
                  <p className="text-xs text-accent font-medium">+8 este mês</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Clientes Ativos
                  </CardTitle>
                  <Users className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">67</div>
                  <p className="text-xs text-accent font-medium">75% do total</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Clientes VIP
                  </CardTitle>
                  <Users className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">12</div>
                  <p className="text-xs text-accent font-medium">+20% visitas</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Novos este Mês
                  </CardTitle>
                  <Users className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">8</div>
                  <p className="text-xs text-accent font-medium">+33% vs anterior</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Lista de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar clientes..." className="pl-10" />
                  </div>
                  <Button variant="outline">Filtros</Button>
                </div>

                <div className="space-y-4">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-accent-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-primary">{client.name}</h3>
                            <Badge variant={
                              client.status === 'vip' ? 'default' : 
                              client.status === 'ativo' ? 'secondary' : 
                              'destructive'
                            }>
                              {client.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">{client.totalVisits} visitas</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Última: {client.lastVisit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Clients;
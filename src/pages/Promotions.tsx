import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, TrendingUp, Plus, Users, DollarSign } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Promotions = () => {
  const promotions = [
    { 
      id: 1, 
      title: "Corte + Barba", 
      description: "Promoção especial para novos clientes",
      originalPrice: 45.00,
      promotionalPrice: 35.00,
      validUntil: "2024-01-30",
      usedCount: 12,
      status: "ativa"
    },
    { 
      id: 2, 
      title: "Pacote Noivo", 
      description: "Corte + Barba + Sobrancelha para o grande dia",
      originalPrice: 100.00,
      promotionalPrice: 80.00,
      validUntil: "2024-02-14",
      usedCount: 5,
      status: "ativa"
    },
    { 
      id: 3, 
      title: "Desconto Fidelidade", 
      description: "10ª visita com 50% de desconto",
      originalPrice: 30.00,
      promotionalPrice: 15.00,
      validUntil: "2024-12-31",
      usedCount: 8,
      status: "ativa"
    },
    { 
      id: 4, 
      title: "Black Friday", 
      description: "Todos os serviços com 30% de desconto",
      originalPrice: 40.00,
      promotionalPrice: 28.00,
      validUntil: "2023-11-30",
      usedCount: 45,
      status: "expirada"
    },
  ];

  const activePromotions = promotions.filter(p => p.status === 'ativa');
  const totalSavings = promotions
    .filter(p => p.status === 'ativa')
    .reduce((sum, p) => sum + ((p.originalPrice - p.promotionalPrice) * p.usedCount), 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Promoções</h1>
                <p className="text-sm text-muted-foreground">Gerencie suas ofertas especiais</p>
              </div>
            </div>
            <Button variant="hero">
              <Plus className="w-4 h-4" />
              Nova Promoção
            </Button>
          </header>

          <div className="p-6 space-y-6">
            {/* Promotion Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Promoções Ativas
                  </CardTitle>
                  <Star className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{activePromotions.length}</div>
                  <p className="text-xs text-accent font-medium">Atualmente disponíveis</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Usos Este Mês
                  </CardTitle>
                  <Users className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">25</div>
                  <p className="text-xs text-accent font-medium">+67% vs mês anterior</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Economia Gerada
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">R$ {totalSavings.toFixed(2)}</div>
                  <p className="text-xs text-accent font-medium">Desconto dado aos clientes</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Conversão
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">78%</div>
                  <p className="text-xs text-accent font-medium">Taxa de uso das promoções</p>
                </CardContent>
              </Card>
            </div>

            {/* Active Promotions */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Promoções Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activePromotions.map((promotion) => (
                    <div key={promotion.id} className="p-4 gradient-accent rounded-lg text-accent-foreground">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg">{promotion.title}</h3>
                        <Badge variant="secondary" className="bg-accent-foreground/20 text-accent-foreground">
                          Ativa
                        </Badge>
                      </div>
                      <p className="text-sm opacity-90 mb-3">{promotion.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm line-through opacity-70">
                            De R$ {promotion.originalPrice.toFixed(2)}
                          </span>
                          <span className="font-bold text-lg">
                            Por R$ {promotion.promotionalPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs opacity-80">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Até {promotion.validUntil}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {promotion.usedCount} usos
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Promotion Card */}
                  <div className="p-4 border-2 border-dashed border-accent rounded-lg flex flex-col items-center justify-center text-center min-h-[200px] hover:bg-accent/5 transition-colors cursor-pointer">
                    <Plus className="w-8 h-8 text-accent mb-2" />
                    <h3 className="font-bold text-lg text-accent mb-1">Nova Promoção</h3>
                    <p className="text-sm text-muted-foreground">Clique para criar uma nova oferta especial</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Promotions List */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Histórico de Promoções</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {promotions.map((promotion) => (
                  <div
                    key={promotion.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium text-primary">{promotion.title}</h3>
                        <p className="text-sm text-muted-foreground">{promotion.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Até {promotion.validUntil}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {promotion.usedCount} usos
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm line-through text-muted-foreground">
                          R$ {promotion.originalPrice.toFixed(2)}
                        </span>
                        <span className="font-bold text-primary">
                          R$ {promotion.promotionalPrice.toFixed(2)}
                        </span>
                      </div>
                      <Badge variant={promotion.status === 'ativa' ? 'default' : 'secondary'}>
                        {promotion.status === 'ativa' ? 'Ativa' : 'Expirada'}
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

export default Promotions;
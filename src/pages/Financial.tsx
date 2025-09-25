import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Calendar, CreditCard, Banknote } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Financial = () => {
  const transactions = [
    { 
      id: 1, 
      client: "João Silva", 
      service: "Corte + Barba",
      value: 45.00,
      paymentMethod: "Cartão",
      date: "2024-01-15",
      status: "pago"
    },
    { 
      id: 2, 
      client: "Pedro Santos", 
      service: "Corte",
      value: 25.00,
      paymentMethod: "Dinheiro",
      date: "2024-01-15",
      status: "pago"
    },
    { 
      id: 3, 
      client: "Carlos Lima", 
      service: "Barba",
      value: 20.00,
      paymentMethod: "PIX",
      date: "2024-01-14",
      status: "pendente"
    },
    { 
      id: 4, 
      client: "Roberto Costa", 
      service: "Pacote Noivo",
      value: 80.00,
      paymentMethod: "Cartão",
      date: "2024-01-14",
      status: "pago"
    },
  ];

  const totalReceived = transactions
    .filter(t => t.status === 'pago')
    .reduce((sum, t) => sum + t.value, 0);

  const totalPending = transactions
    .filter(t => t.status === 'pendente')
    .reduce((sum, t) => sum + t.value, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Financeiro</h1>
                <p className="text-sm text-muted-foreground">Controle suas receitas e despesas</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4" />
                Relatório
              </Button>
              <Button variant="hero" size="sm">
                <DollarSign className="w-4 h-4" />
                Registrar Pagamento
              </Button>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Financial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Receita do Mês
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">R$ 3.240</div>
                  <p className="text-xs text-accent font-medium">+15% vs mês anterior</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Receita Hoje
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">R$ {totalReceived.toFixed(2)}</div>
                  <p className="text-xs text-accent font-medium">4 serviços realizados</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Valores Pendentes
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">R$ {totalPending.toFixed(2)}</div>
                  <p className="text-xs text-accent font-medium">1 pagamento pendente</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ticket Médio
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">R$ 42,50</div>
                  <p className="text-xs text-accent font-medium">+8% vs mês anterior</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                        {transaction.paymentMethod === 'Cartão' ? (
                          <CreditCard className="w-6 h-6 text-accent-foreground" />
                        ) : (
                          <Banknote className="w-6 h-6 text-accent-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-primary">{transaction.client}</h3>
                        <p className="text-sm text-muted-foreground">{transaction.service}</p>
                        <p className="text-xs text-muted-foreground">{transaction.paymentMethod} • {transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">R$ {transaction.value.toFixed(2)}</p>
                      <Badge variant={transaction.status === 'pago' ? 'default' : 'secondary'}>
                        {transaction.status === 'pago' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Methods Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-accent" />
                    Cartão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">R$ 125,00</div>
                  <p className="text-sm text-muted-foreground">2 transações hoje</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-accent" />
                    Dinheiro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">R$ 25,00</div>
                  <p className="text-sm text-muted-foreground">1 transação hoje</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-accent" />
                    PIX
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">R$ 20,00</div>
                  <p className="text-sm text-muted-foreground">1 transação pendente</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Financial;
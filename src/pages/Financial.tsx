import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Calendar, CreditCard, Banknote, FileText } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { generateMonthlyReport } from "@/utils/pdfGenerator";
import dayjs from "dayjs";

interface FinancialRecord {
  id: number;
  tipo: string;
  descricao: string | null;
  valor: number;
  metodo_pagamento: string | null;
  data_registro: string;
  appointment_id: string | null;
}

const Financial = () => {
  const { toast } = useToast();
  const { barbershop } = useBarbershop();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (barbershop) {
      fetchRecords();
    }
  }, [barbershop]);

  const fetchRecords = async () => {
    if (!barbershop) return;
    
    try {
      const { data, error } = await supabase
        .from('financial_records')
        .select('*')
        .eq('barbershop_id', barbershop.id)
        .order('data_registro', { ascending: false })
        .limit(50);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching financial records:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os registros financeiros",
        variant: "destructive"
      });
    }
  };

  const totalReceived = records.reduce((sum, r) => sum + r.valor, 0);
  const todayRecords = records.filter(r => {
    const recordDate = new Date(r.data_registro);
    const today = new Date();
    return recordDate.toDateString() === today.toDateString();
  });
  const todayTotal = todayRecords.reduce((sum, r) => sum + r.valor, 0);

  const cardTotal = records
    .filter(r => r.metodo_pagamento?.toLowerCase() === 'cartao')
    .reduce((sum, r) => sum + r.valor, 0);
  
  const cashTotal = records
    .filter(r => r.metodo_pagamento?.toLowerCase() === 'dinheiro')
    .reduce((sum, r) => sum + r.valor, 0);
  
  const pixTotal = records
    .filter(r => r.metodo_pagamento?.toLowerCase() === 'pix')
    .reduce((sum, r) => sum + r.valor, 0);

  const avgTicket = records.length > 0 ? totalReceived / records.length : 0;

  const handleGenerateReport = async () => {
    if (!barbershop) return;

    const startDate = dayjs().startOf('month').format('YYYY-MM-DD');
    const endDate = dayjs().endOf('month').format('YYYY-MM-DD');

    const { data: reportRecords } = await supabase
      .from('financial_records')
      .select('*')
      .eq('barbershop_id', barbershop.id)
      .eq('tipo', 'receita')
      .gte('data_registro', startDate)
      .lte('data_registro', endDate);

    if (reportRecords) {
      generateMonthlyReport({
        records: reportRecords,
        startDate,
        endDate,
        barbershopName: barbershop.nome
      });

      toast({
        title: 'Relatório gerado!',
        description: 'O PDF foi baixado com sucesso.'
      });
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
                <h1 className="text-2xl font-bold text-primary">Financeiro</h1>
                <p className="text-sm text-muted-foreground">Controle suas receitas e despesas</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={handleGenerateReport}>
                <FileText className="w-4 h-4" />
                Gerar Relatório PDF
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
                    Receita Total
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">R$ {totalReceived.toFixed(2)}</div>
                  <p className="text-xs text-accent font-medium">{records.length} transações</p>
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
                  <div className="text-2xl font-bold text-primary">R$ {todayTotal.toFixed(2)}</div>
                  <p className="text-xs text-accent font-medium">{todayRecords.length} serviços realizados</p>
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
                  <div className="text-2xl font-bold text-primary">R$ {avgTicket.toFixed(2)}</div>
                  <p className="text-xs text-accent font-medium">por serviço</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Métodos de Pagamento
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">3</div>
                  <p className="text-xs text-accent font-medium">formas disponíveis</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {records.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum registro financeiro ainda
                  </p>
                ) : (
                  records.slice(0, 10).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                          {record.metodo_pagamento?.toLowerCase() === 'cartao' ? (
                            <CreditCard className="w-6 h-6 text-accent-foreground" />
                          ) : (
                            <Banknote className="w-6 h-6 text-accent-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-primary">{record.tipo}</h3>
                          <p className="text-sm text-muted-foreground">{record.descricao || "Sem descrição"}</p>
                          <p className="text-xs text-muted-foreground">
                            {record.metodo_pagamento || "Não especificado"} • {format(new Date(record.data_registro), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">R$ {record.valor.toFixed(2)}</p>
                        <Badge variant="default">Pago</Badge>
                      </div>
                    </div>
                  ))
                )}
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
                  <div className="text-2xl font-bold text-primary">R$ {cardTotal.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">
                    {records.filter(r => r.metodo_pagamento?.toLowerCase() === 'cartao').length} transações
                  </p>
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
                  <div className="text-2xl font-bold text-primary">R$ {cashTotal.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">
                    {records.filter(r => r.metodo_pagamento?.toLowerCase() === 'dinheiro').length} transações
                  </p>
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
                  <div className="text-2xl font-bold text-primary">R$ {pixTotal.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">
                    {records.filter(r => r.metodo_pagamento?.toLowerCase() === 'pix').length} transações
                  </p>
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

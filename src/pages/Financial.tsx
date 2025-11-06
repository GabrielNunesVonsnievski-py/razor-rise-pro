import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, DollarSign, Calendar, CreditCard, Banknote, FileText, Plus, Filter } from "lucide-react";
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
  categoria: string | null;
}

const CATEGORIAS_DESPESA = [
  "Luz",
  "Água",
  "Aluguel",
  "Produtos",
  "Salário",
  "Manutenção",
  "Marketing",
  "Outros"
];

const Financial = () => {
  const { toast } = useToast();
  const { barbershop } = useBarbershop();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  
  // Filtros
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [filterCategory, setFilterCategory] = useState("all");
  
  // Formulário de despesa
  const [expenseForm, setExpenseForm] = useState({
    descricao: "",
    valor: "",
    categoria: "",
    metodo_pagamento: "dinheiro",
    observacoes: ""
  });

  useEffect(() => {
    if (barbershop) {
      fetchRecords();
    }
  }, [barbershop, filterPeriod]);

  const fetchRecords = async () => {
    if (!barbershop) return;
    
    try {
      let query = supabase
        .from('financial_records')
        .select('*')
        .eq('barbershop_id', barbershop.id)
        .order('data_registro', { ascending: false });

      // Aplicar filtro de período
      const now = dayjs();
      if (filterPeriod === "today") {
        query = query.gte('data_registro', now.startOf('day').toISOString());
      } else if (filterPeriod === "week") {
        query = query.gte('data_registro', now.startOf('week').toISOString());
      } else if (filterPeriod === "month") {
        query = query.gte('data_registro', now.startOf('month').toISOString());
      }

      const { data, error } = await query.limit(100);

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

  const handleAddExpense = async () => {
    if (!barbershop) return;

    if (!expenseForm.descricao || !expenseForm.valor || !expenseForm.categoria) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha descrição, valor e categoria",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('financial_records')
        .insert({
          barbershop_id: barbershop.id,
          tipo: 'despesa',
          descricao: expenseForm.descricao + (expenseForm.observacoes ? ` - ${expenseForm.observacoes}` : ''),
          valor: parseFloat(expenseForm.valor),
          categoria: expenseForm.categoria,
          metodo_pagamento: expenseForm.metodo_pagamento
        });

      if (error) throw error;

      toast({
        title: "Despesa registrada!",
        description: "A despesa foi adicionada com sucesso"
      });

      setExpenseForm({
        descricao: "",
        valor: "",
        categoria: "",
        metodo_pagamento: "dinheiro",
        observacoes: ""
      });
      setIsExpenseDialogOpen(false);
      fetchRecords();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a despesa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Cálculos financeiros
  const receitas = records.filter(r => r.tipo === 'receita');
  const despesas = records.filter(r => r.tipo === 'despesa');
  
  const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0);
  const totalDespesas = despesas.reduce((sum, r) => sum + r.valor, 0);
  const lucroLiquido = totalReceitas - totalDespesas;

  // Filtrar por categoria
  const filteredRecords = filterCategory === "all" 
    ? records 
    : records.filter(r => r.categoria === filterCategory || (filterCategory === "receita" && r.tipo === "receita"));

  const todayRecords = records.filter(r => {
    const recordDate = new Date(r.data_registro);
    const today = new Date();
    return recordDate.toDateString() === today.toDateString();
  });
  const todayTotal = todayRecords.filter(r => r.tipo === 'receita').reduce((sum, r) => sum + r.valor, 0);

  const cardTotal = receitas
    .filter(r => r.metodo_pagamento?.toLowerCase() === 'cartao')
    .reduce((sum, r) => sum + r.valor, 0);
  
  const cashTotal = receitas
    .filter(r => r.metodo_pagamento?.toLowerCase() === 'dinheiro')
    .reduce((sum, r) => sum + r.valor, 0);
  
  const pixTotal = receitas
    .filter(r => r.metodo_pagamento?.toLowerCase() === 'pix')
    .reduce((sum, r) => sum + r.valor, 0);

  const avgTicket = receitas.length > 0 ? totalReceitas / receitas.length : 0;

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
                <p className="text-sm text-muted-foreground">Controle completo das suas finanças</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleGenerateReport}>
                <FileText className="w-4 h-4 mr-2" />
                Gerar Relatório PDF
              </Button>
              <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Despesa
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Registrar Despesa</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="descricao">Descrição *</Label>
                      <Input
                        id="descricao"
                        value={expenseForm.descricao}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, descricao: e.target.value }))}
                        placeholder="Ex: Conta de luz"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="valor">Valor (R$) *</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        value={expenseForm.valor}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, valor: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="categoria">Categoria *</Label>
                      <Select
                        value={expenseForm.categoria}
                        onValueChange={(value) => setExpenseForm(prev => ({ ...prev, categoria: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIAS_DESPESA.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="metodo">Método de Pagamento</Label>
                      <Select
                        value={expenseForm.metodo_pagamento}
                        onValueChange={(value) => setExpenseForm(prev => ({ ...prev, metodo_pagamento: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="cartao">Cartão</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        value={expenseForm.observacoes}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, observacoes: e.target.value }))}
                        placeholder="Informações adicionais..."
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddExpense} disabled={loading}>
                      Adicionar Despesa
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Resumo Financeiro Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Receitas
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">R$ {totalReceitas.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">{receitas.length} transações</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Despesas
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">R$ {totalDespesas.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">{despesas.length} despesas</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Lucro Líquido
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {lucroLiquido.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lucroLiquido >= 0 ? 'Positivo' : 'Negativo'}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Receita Hoje
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">R$ {todayTotal.toFixed(2)}</div>
                  <p className="text-xs text-accent font-medium">
                    {todayRecords.filter(r => r.tipo === 'receita').length} serviços
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filtros */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-accent" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="period">Período</Label>
                  <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger id="period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="week">Esta Semana</SelectItem>
                      <SelectItem value="month">Este Mês</SelectItem>
                      <SelectItem value="all">Tudo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="receita">Receitas</SelectItem>
                      {CATEGORIAS_DESPESA.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Transações Recentes */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredRecords.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum registro financeiro encontrado
                  </p>
                ) : (
                  filteredRecords.slice(0, 15).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${record.tipo === 'receita' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          {record.tipo === 'receita' ? (
                            <TrendingUp className="w-6 h-6 text-green-600" />
                          ) : (
                            <TrendingDown className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-primary capitalize">{record.tipo}</h3>
                          <p className="text-sm text-muted-foreground">{record.descricao || "Sem descrição"}</p>
                          {record.categoria && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {record.categoria}
                            </Badge>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {record.metodo_pagamento || "Não especificado"} • {format(new Date(record.data_registro), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${record.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                          {record.tipo === 'receita' ? '+' : '-'} R$ {record.valor.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Payment Methods Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="w-5 h-5 text-accent" />
                    Cartão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">R$ {cardTotal.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">
                    {receitas.filter(r => r.metodo_pagamento?.toLowerCase() === 'cartao').length} transações
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Banknote className="w-5 h-5 text-accent" />
                    Dinheiro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">R$ {cashTotal.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">
                    {receitas.filter(r => r.metodo_pagamento?.toLowerCase() === 'dinheiro').length} transações
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="w-5 h-5 text-accent" />
                    PIX
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">R$ {pixTotal.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">
                    {receitas.filter(r => r.metodo_pagamento?.toLowerCase() === 'pix').length} transações
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    Ticket Médio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">R$ {avgTicket.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">por serviço</p>
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
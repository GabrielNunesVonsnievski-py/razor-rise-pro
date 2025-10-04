import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

interface FinancialRecord {
  valor: number;
  data_registro: string;
  descricao: string;
  metodo_pagamento: string;
}

interface ReportData {
  records: FinancialRecord[];
  startDate: string;
  endDate: string;
  barbershopName: string;
}

export const generateMonthlyReport = (data: ReportData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text(`Relatório Financeiro - ${data.barbershopName}`, 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Período: ${dayjs(data.startDate).format('DD/MM/YYYY')} a ${dayjs(data.endDate).format('DD/MM/YYYY')}`, 14, 30);
  
  // Calcular estatísticas
  const totalReceita = data.records.reduce((sum, record) => sum + Number(record.valor), 0);
  const paymentMethods = data.records.reduce((acc, record) => {
    const method = record.metodo_pagamento || 'Não especificado';
    acc[method] = (acc[method] || 0) + Number(record.valor);
    return acc;
  }, {} as Record<string, number>);
  
  // Dias mais lucrativos
  const dayEarnings = data.records.reduce((acc, record) => {
    const day = dayjs(record.data_registro).format('DD/MM/YYYY');
    acc[day] = (acc[day] || 0) + Number(record.valor);
    return acc;
  }, {} as Record<string, number>);
  
  const topDays = Object.entries(dayEarnings)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  // Serviços mais vendidos
  const services = data.records.reduce((acc, record) => {
    const service = record.descricao.split(' - ')[0].replace('Serviço: ', '');
    acc[service] = (acc[service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topServices = Object.entries(services)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  // Resumo financeiro
  doc.setFontSize(14);
  doc.text('Resumo Financeiro', 14, 45);
  doc.setFontSize(12);
  doc.text(`Total Faturado: R$ ${totalReceita.toFixed(2)}`, 14, 55);
  doc.text(`Total de Transações: ${data.records.length}`, 14, 62);
  
  // Métodos de pagamento
  let yPos = 75;
  doc.setFontSize(14);
  doc.text('Métodos de Pagamento', 14, yPos);
  yPos += 7;
  
  doc.setFontSize(12);
  Object.entries(paymentMethods).forEach(([method, amount]) => {
    doc.text(`${method}: R$ ${amount.toFixed(2)}`, 20, yPos);
    yPos += 7;
  });
  
  // Dias mais lucrativos
  yPos += 5;
  doc.setFontSize(14);
  doc.text('Top 5 Dias Mais Lucrativos', 14, yPos);
  yPos += 7;
  
  doc.setFontSize(12);
  topDays.forEach(([day, amount]) => {
    doc.text(`${day}: R$ ${amount.toFixed(2)}`, 20, yPos);
    yPos += 7;
  });
  
  // Serviços mais vendidos
  yPos += 5;
  doc.setFontSize(14);
  doc.text('Top 5 Serviços Mais Vendidos', 14, yPos);
  yPos += 7;
  
  doc.setFontSize(12);
  topServices.forEach(([service, count]) => {
    doc.text(`${service}: ${count} vendas`, 20, yPos);
    yPos += 7;
  });
  
  // Nova página para transações detalhadas
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Transações Detalhadas', 14, 20);
  
  // Tabela de transações
  autoTable(doc, {
    startY: 30,
    head: [['Data', 'Descrição', 'Método', 'Valor']],
    body: data.records.map(record => [
      dayjs(record.data_registro).format('DD/MM/YYYY HH:mm'),
      record.descricao,
      record.metodo_pagamento || 'Não especificado',
      `R$ ${Number(record.valor).toFixed(2)}`
    ]),
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [99, 102, 241] }
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Salvar PDF
  doc.save(`relatorio-${dayjs(data.startDate).format('YYYY-MM')}.pdf`);
};

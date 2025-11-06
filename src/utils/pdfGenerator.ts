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
  
  // Cores do tema
  const primaryColor: [number, number, number] = [99, 102, 241];
  const accentColor: [number, number, number] = [245, 158, 11];
  const textColor: [number, number, number] = [31, 41, 55];
  const lightGray: [number, number, number] = [243, 244, 246];
  
  // Header com design melhorado
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(data.barbershopName, 14, 18);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório Financeiro Mensal', 14, 28);
  
  doc.setFontSize(11);
  doc.text(`Período: ${dayjs(data.startDate).format('DD/MM/YYYY')} a ${dayjs(data.endDate).format('DD/MM/YYYY')}`, 14, 35);
  
  // Reset cor do texto
  doc.setTextColor(...textColor);
  
  // Calcular estatísticas
  const totalReceita = data.records.reduce((sum, record) => sum + Number(record.valor), 0);
  const paymentMethods = data.records.reduce((acc, record) => {
    const method = record.metodo_pagamento || 'Não especificado';
    acc[method] = (acc[method] || 0) + Number(record.valor);
    return acc;
  }, {} as Record<string, number>);
  
  const dayEarnings = data.records.reduce((acc, record) => {
    const day = dayjs(record.data_registro).format('DD/MM/YYYY');
    acc[day] = (acc[day] || 0) + Number(record.valor);
    return acc;
  }, {} as Record<string, number>);
  
  const topDays = Object.entries(dayEarnings)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  const services = data.records.reduce((acc, record) => {
    const service = record.descricao.split(' - ')[0].replace('Serviço: ', '');
    acc[service] = (acc[service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topServices = Object.entries(services)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  // Cards de resumo financeiro
  let yPos = 50;
  
  // Card de Receita Total
  doc.setFillColor(...lightGray);
  doc.roundedRect(14, yPos, 90, 25, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Total Faturado', 20, yPos + 8);
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(`R$ ${totalReceita.toFixed(2)}`, 20, yPos + 18);
  
  // Card de Total de Transações
  doc.setFillColor(...lightGray);
  doc.roundedRect(110, yPos, 90, 25, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Total de Transações', 116, yPos + 8);
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(data.records.length.toString(), 116, yPos + 18);
  
  yPos += 35;
  
  // Métodos de pagamento com visual melhorado
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Métodos de Pagamento', 14, yPos);
  yPos += 8;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  Object.entries(paymentMethods).forEach(([method, amount]) => {
    // Barra de progresso
    const percentage = (amount / totalReceita) * 100;
    const barWidth = (percentage / 100) * 150;
    
    doc.setFillColor(...lightGray);
    doc.rect(14, yPos - 3, 150, 8, 'F');
    
    doc.setFillColor(...accentColor);
    doc.rect(14, yPos - 3, barWidth, 8, 'F');
    
    doc.text(`${method}:`, 168, yPos + 3);
    doc.setFont('helvetica', 'bold');
    doc.text(`R$ ${amount.toFixed(2)}`, 168, yPos + 3, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    
    yPos += 12;
  });
  
  yPos += 5;
  
  // Dias mais lucrativos
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Top 5 Dias Mais Lucrativos', 14, yPos);
  yPos += 8;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  topDays.forEach(([day, amount], index) => {
    // Medalhas para top 3
    if (index < 3) {
      doc.setFillColor(...accentColor);
      doc.circle(18, yPos - 1, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text((index + 1).toString(), 18, yPos + 1, { align: 'center' });
      doc.setTextColor(...textColor);
      doc.setFontSize(11);
    }
    
    doc.text(`${day}:`, 25, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`R$ ${amount.toFixed(2)}`, 90, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 8;
  });
  
  yPos += 5;
  
  // Serviços mais vendidos
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Top 5 Serviços Mais Vendidos', 14, yPos);
  yPos += 8;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  topServices.forEach(([service, count]) => {
    doc.text(`${service}:`, 20, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`${count} vendas`, 90, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 8;
  });
  
  // Nova página para transações detalhadas
  doc.addPage();
  
  // Header da segunda página
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Transações Detalhadas', 14, 16);
  
  doc.setTextColor(...textColor);
  
  // Tabela de transações com estilo melhorado
  autoTable(doc, {
    startY: 35,
    head: [['Data', 'Descrição', 'Método', 'Valor']],
    body: data.records.map(record => [
      dayjs(record.data_registro).format('DD/MM/YYYY HH:mm'),
      record.descricao,
      record.metodo_pagamento || 'Não especificado',
      `R$ ${Number(record.valor).toFixed(2)}`
    ]),
    theme: 'striped',
    styles: { 
      fontSize: 9,
      cellPadding: 4,
      textColor: textColor,
    },
    headStyles: { 
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 80 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
    }
  });
  
  // Footer em todas as páginas
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    
    // Linha decorativa
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, doc.internal.pageSize.getHeight() - 15, 196, doc.internal.pageSize.getHeight() - 15);
    
    // Número da página
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    
    // Data de geração
    doc.text(
      `Gerado em ${dayjs().format('DD/MM/YYYY HH:mm')}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }
  
  // Salvar PDF
  doc.save(`relatorio-financeiro-${dayjs(data.startDate).format('YYYY-MM')}.pdf`);
};
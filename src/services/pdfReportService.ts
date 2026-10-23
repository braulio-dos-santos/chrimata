import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Account, FinancialGoal, Transaction, CategorySpending, FinancialSummary } from '../types/finance';
import { formatKz, formatDatePt, getTermLabel } from '../utils/currency';

export interface ReportData {
  userName: string;
  userEmail: string;
  userProfile: 'student' | 'worker';
  periodLabel: string;
  summary: FinancialSummary;
  accounts: Account[];
  goals: FinancialGoal[];
  categorySpending: CategorySpending[];
  transactions: Transaction[];
  options?: {
    includeAccounts?: boolean;
    includeGoals?: boolean;
    includeCategories?: boolean;
    includeTransactions?: boolean;
    reportType?: 'full' | 'savings_goals' | 'accounts' | 'transactions';
  };
}

export function generateFinancialPDF(data: ReportData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = margin;

  const primaryColor: [number, number, number] = [5, 150, 105]; // Emerald 600
  const darkTextColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const secondaryTextColor: [number, number, number] = [100, 116, 139]; // Slate 500
  const lightBg: [number, number, number] = [248, 250, 252]; // Slate 50

  // 1. Cabeçalho Institucional Branded
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, 12, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Ch', margin + 2.5, currentY + 8.5);

  doc.setTextColor(...darkTextColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Chrímata', margin + 16, currentY + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryTextColor);
  doc.text('Gestão Financeira & Literacia Pessoal', margin + 16, currentY + 11.5);

  // Informações de Emissão (Alinhadas à Direita)
  const reportCode = `CHR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  doc.setFontSize(8);
  doc.text(`Ref: ${reportCode}`, pageWidth - margin, currentY + 4, { align: 'right' });
  doc.text(`Emitido a: ${new Date().toLocaleDateString('pt-PT')} ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - margin, currentY + 8, { align: 'right' });
  doc.text(`Período: ${data.periodLabel}`, pageWidth - margin, currentY + 12, { align: 'right' });

  currentY += 16;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  // 2. Banner de Identificação do Utilizador
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 16, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`Titular: ${data.userName}`, margin + 4, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryTextColor);
  doc.text(`E-mail: ${data.userEmail}`, margin + 4, currentY + 11);

  const profileLabel = data.userProfile === 'student' ? 'Estudante Universitário / Ensino Médio' : 'Profissional / Trabalhador';
  doc.text(`Perfil: ${profileLabel}`, pageWidth - margin - 4, currentY + 6, { align: 'right' });
  doc.text('Moeda: Kwanza Angolano (Kz / AOA)', pageWidth - margin - 4, currentY + 11, { align: 'right' });

  currentY += 21;

  // 3. Bloco de Indicadores Executivos (KPIs)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkTextColor);
  doc.text('1. Síntese Financeira & Balanço Patrimonial', margin, currentY);
  currentY += 4;

  const boxWidth = (pageWidth - margin * 2 - 6) / 3;
  const boxHeight = 18;

  // KPI 1: Saldo Disponível Operacional (Carteira + Corrente - Poupança não inclusa)
  doc.setFillColor(240, 253, 244); // Green 50
  doc.roundedRect(margin, currentY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(21, 128, 61);
  doc.text('Saldo Geral Disponível (Líquido)', margin + 3, currentY + 5);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatKz(data.summary.totalBalance), margin + 3, currentY + 12);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('*Exclui poupança protegida', margin + 3, currentY + 15.5);

  // KPI 2: Reserva de Poupança Protegida
  const kpi2X = margin + boxWidth + 3;
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.roundedRect(kpi2X, currentY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(4, 120, 87);
  doc.text('Poupança Protegida (Isolada)', kpi2X + 3, currentY + 5);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatKz(data.summary.totalSavingsBalance), kpi2X + 3, currentY + 12);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Reserva acumulada e intocável', kpi2X + 3, currentY + 15.5);

  // KPI 3: Cobertura de Objectivos de Consumo
  const kpi3X = margin + (boxWidth + 3) * 2;
  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.roundedRect(kpi3X, currentY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(67, 56, 202);
  doc.text('Cobertura das Metas de Consumo', kpi3X + 3, currentY + 5);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.summary.goalsCoverageRate}% almejado`, kpi3X + 3, currentY + 12);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatKz(data.summary.totalGoalsSaved)} de ${formatKz(data.summary.totalGoalsTarget)}`, kpi3X + 3, currentY + 15.5);

  currentY += boxHeight + 4;

  // Segunda Linha de KPIs: Receitas vs Despesas do Mês
  const row2Width = (pageWidth - margin * 2 - 3) / 2;
  const row2Height = 14;

  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, currentY, row2Width, row2Height, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Receitas do Período', margin + 3, currentY + 4.5);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(formatKz(data.summary.monthlyIncome), margin + 3, currentY + 10.5);

  const row2Col2X = margin + row2Width + 3;
  doc.setFillColor(...lightBg);
  doc.roundedRect(row2Col2X, currentY, row2Width, row2Height, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Despesas do Período', row2Col2X + 3, currentY + 4.5);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72);
  doc.text(formatKz(data.summary.monthlyExpense), row2Col2X + 3, currentY + 10.5);

  currentY += row2Height + 7;

  // 4. Tabela de Contas & Carteiras
  const includeAccounts = data.options?.includeAccounts !== false;
  if (includeAccounts) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...darkTextColor);
    doc.text('2. Posição de Contas & Carteiras Físicas', margin, currentY);
    currentY += 2;

    const accountsTableBody = data.accounts.map((acc) => {
      let tipoStr = 'Conta Corrente';
      if (acc.type === 'cash') tipoStr = 'Minha Carteira (Físico)';
      if (acc.isSavings) tipoStr = 'Conta Poupança';
      if (acc.type === 'custom') tipoStr = 'Personalizada';

      const papelStr = acc.isSavings 
        ? 'Poupança Protegida (Isolada do geral)' 
        : 'Disponível no Saldo Geral';

      return [
        acc.name,
        tipoStr,
        acc.institution || 'Presencial / Físico',
        papelStr,
        formatKz(acc.balance),
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Nome da Conta', 'Tipo', 'Instituição', 'Finalidade', 'Saldo Atual']],
      body: accountsTableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [5, 150, 105],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        4: { halign: 'right', fontStyle: 'bold' },
      },
    });

    // @ts-expect-error - jspdf-autotable adds lastAutoTable to jsPDF instance
    currentY = doc.lastAutoTable.finalY + 7;
  }

  // 5. Tabela de Metas de Consumo & Poupança
  const includeGoals = data.options?.includeGoals !== false;
  if (includeGoals && data.goals.length > 0) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...darkTextColor);
    doc.text('3. Objectivos de Consumo (Curto, Médio e Longo Prazo)', margin, currentY);
    currentY += 2;

    const goalsTableBody = data.goals.map((g) => {
      const remaining = Math.max(0, g.targetAmount - g.currentAmount);
      const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
      const linkedAcc = data.accounts.find((a) => a.id === g.savingsAccountId);

      return [
        g.title,
        getTermLabel(g.term),
        g.category.toUpperCase(),
        formatKz(g.targetAmount),
        formatKz(g.currentAmount),
        formatKz(remaining),
        `${pct}%`,
        linkedAcc ? linkedAcc.name : 'Poupança Padrão',
        g.status === 'completed' ? 'Concluído' : 'Activo',
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Objectivo', 'Prazo', 'Categoria', 'Alvo', 'Poupado', 'Falta', 'Progresso', 'Conta Poupança', 'Estado']],
      body: goalsTableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229], // Indigo 600
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'center', fontStyle: 'bold' },
        8: { halign: 'center' },
      },
    });

    // @ts-expect-error - jspdf-autotable adds lastAutoTable to jsPDF instance
    currentY = doc.lastAutoTable.finalY + 7;
  }

  // 6. Despesas por Categoria e Orçamentos
  const includeCategories = data.options?.includeCategories !== false;
  if (includeCategories && data.categorySpending.length > 0) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...darkTextColor);
    doc.text('4. Execução de Despesas por Categoria & Orçamentos', margin, currentY);
    currentY += 2;

    const catTableBody = data.categorySpending.map((c) => {
      const budgetLimit = c.budget ? formatKz(c.budget.amountLimit) : 'Sem tecto';
      const pctStr = c.budget ? `${c.percentage}%` : 'N/A';
      const balance = c.budget ? formatKz(c.budget.amountLimit - c.spent) : 'N/A';

      return [
        c.category.name,
        formatKz(c.spent),
        budgetLimit,
        pctStr,
        balance,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Categoria', 'Total Gasto', 'Limite Orçado', 'Taxa de Consumo', 'Saldo Orçamental']],
      body: catTableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [14, 165, 233], // Sky 500
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        1: { halign: 'right', fontStyle: 'bold' },
        2: { halign: 'right' },
        3: { halign: 'center' },
        4: { halign: 'right' },
      },
    });

    // @ts-expect-error - jspdf-autotable adds lastAutoTable to jsPDF instance
    currentY = doc.lastAutoTable.finalY + 7;
  }

  // 7. Extrato de Transacções
  const includeTransactions = data.options?.includeTransactions !== false;
  if (includeTransactions && data.transactions.length > 0) {
    if (currentY > pageHeight - 55) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...darkTextColor);
    doc.text('5. Extrato Analítico de Transacções & Movimentos', margin, currentY);
    currentY += 2;

    const txTableBody = data.transactions.slice(0, 40).map((t) => {
      const typeLabel = t.type === 'income' ? 'Receita' : t.type === 'expense' ? 'Despesa' : 'Transferência';
      const fromAcc = data.accounts.find((a) => a.id === t.accountId)?.name || 'Conta Geral';
      const toAcc = t.toAccountId ? data.accounts.find((a) => a.id === t.toAccountId)?.name : '';
      const accDetail = toAcc ? `${fromAcc} → ${toAcc}` : fromAcc;

      return [
        formatDatePt(t.date),
        t.description || t.title || 'Sem descrição',
        typeLabel,
        accDetail,
        (t.type === 'income' ? '+ ' : t.type === 'expense' ? '- ' : '') + formatKz(t.amount),
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Data', 'Descrição', 'Tipo', 'Conta / Movimento', 'Valor']],
      body: txTableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [51, 65, 85], // Slate 700
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { halign: 'center' },
        2: { halign: 'center' },
        4: { halign: 'right', fontStyle: 'bold' },
      },
    });

    // @ts-expect-error - jspdf-autotable adds lastAutoTable to jsPDF instance
    currentY = doc.lastAutoTable.finalY + 7;
  }

  // 8. Rodapé de autenticidade em todas as páginas
  // @ts-expect-error - jsPDF internal pages count
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...secondaryTextColor);
    doc.text(
      'Chrímata — Sistema de Gestão Financeira Pessoal & Poupança Protegida',
      margin,
      pageHeight - 8
    );
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: 'right' }
    );
  }

  return doc;
}

export function downloadFinancialPDF(data: ReportData, filenamePrefix = 'chrimata-relatorio'): void {
  const doc = generateFinancialPDF(data);
  const cleanDate = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}-${cleanDate}.pdf`;
  doc.save(filename);
}

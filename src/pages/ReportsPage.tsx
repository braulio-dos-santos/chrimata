import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { formatKz } from '../utils/currency';
import { 
  CashflowBarChart, 
  CategoryDonutChart, 
  GoalsHorizonChart, 
  AccountsLiquidityChart 
} from '../components/charts/InteractiveCharts';
import { ReportModal } from '../components/reports/ReportModal';
import { downloadFinancialPDF, ReportData } from '../services/pdfReportService';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Target, 
  Wallet, 
  ShieldCheck, 
  Calendar, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  PieChart
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    accounts, 
    transactions, 
    goals, 
    categorySpending, 
    summary, 
    selectedMonthYear, 
    setSelectedMonthYear 
  } = useFinance();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  if (!user) return null;

  const currentMonthTransactions = transactions.filter((t) => 
    t.date.startsWith(selectedMonthYear)
  );

  const handleQuickDownload = (type: 'full' | 'savings_goals' | 'accounts' | 'transactions') => {
    setDownloadingType(type);
    try {
      const reportData: ReportData = {
        userName: user.name,
        userEmail: user.email,
        userProfile: user.profileType,
        periodLabel: `Mensal (${selectedMonthYear})`,
        summary,
        accounts,
        goals,
        categorySpending,
        transactions: currentMonthTransactions,
        options: {
          includeAccounts: type === 'full' || type === 'accounts' || type === 'savings_goals',
          includeGoals: type === 'full' || type === 'savings_goals',
          includeCategories: type === 'full',
          includeTransactions: type === 'full' || type === 'transactions',
          reportType: type,
        },
      };

      const prefix = type === 'savings_goals'
        ? 'chrimata-relatorio-poupanca-metas'
        : type === 'accounts'
        ? 'chrimata-extrato-contas'
        : type === 'transactions'
        ? 'chrimata-extrato-transaccoes'
        : 'chrimata-relatorio-financeiro';

      downloadFinancialPDF(reportData, prefix);
    } catch (err) {
      console.error('Erro ao descarregar PDF:', err);
    } finally {
      setTimeout(() => setDownloadingType(null), 1000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* 1. Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
              Módulo de Inteligência Financeira
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Exportação & Visualizações Gráficas
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Relatórios em PDF & Gráficos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Visualize fluxos de caixa, metas de consumo por horizonte e distribuição de contas. 
            Gere e descarregue documentos oficiais em formato PDF.
          </p>
        </div>

        {/* Controlos de Período e Botão de Exportação */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Gerar Relatório em PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Cartões de Resumo Executivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Saldo Disponível Operacional */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Saldo Geral Disponível</span>
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {formatKz(summary.totalBalance)}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Minha Carteira + Contas Correntes
          </p>
        </div>

        {/* KPI 2: Poupança Protegida */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Poupança Protegida</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-xl font-bold font-mono text-indigo-700 dark:text-indigo-300">
            {formatKz(summary.totalSavingsBalance)}
          </p>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
            Isolada e intocável no geral
          </p>
        </div>

        {/* KPI 3: Metas de Consumo */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Cobertura de Metas</span>
            <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {summary.goalsCoverageRate}%
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {goals.length} objectivos definidos
          </p>
        </div>

        {/* KPI 4: Fluxo Líquido do Mês */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Resultado Operacional</span>
            {summary.monthlyIncome >= summary.monthlyExpense ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <p className={`text-xl font-bold font-mono ${
            summary.monthlyIncome >= summary.monthlyExpense 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatKz(summary.monthlyIncome - summary.monthlyExpense, true)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Receitas: {formatKz(summary.monthlyIncome)}
          </p>
        </div>
      </div>

      {/* 3. Painel de Exportação Rápida em PDF */}
      <div className="bg-linear-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold mb-3">
            <FileText className="w-3.5 h-3.5" />
            Central de Emissão de Relatórios em PDF
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Documentos Oficiais Prontos para Impressão & Arquivo
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
            Gere extratos bancários pessoais, relatórios de prestação de contas, acompanhamento de metas 
            e auditoria patrimonial em PDF formatado com carimbo institucional do Chrímata.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Relatório Completo */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Relatório Completo</h3>
              <p className="text-xs text-slate-300 mt-1">
                Balanço geral, contas físicas e bancárias, metas de consumo, orçamentos e extrato analítico.
              </p>
            </div>
            <button
              onClick={() => handleQuickDownload('full')}
              disabled={downloadingType === 'full'}
              className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingType === 'full' ? 'A exportar...' : 'Baixar PDF Completo'}</span>
            </button>
          </div>

          {/* Card 2: Metas & Poupança */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-3">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Metas & Poupança</h3>
              <p className="text-xs text-slate-300 mt-1">
                Dossiê das metas de consumo (curto, médio e longo prazo), taxas de progresso e contas poupança vinculadas.
              </p>
            </div>
            <button
              onClick={() => handleQuickDownload('savings_goals')}
              disabled={downloadingType === 'savings_goals'}
              className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-400 text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingType === 'savings_goals' ? 'A exportar...' : 'Baixar PDF de Metas'}</span>
            </button>
          </div>

          {/* Card 3: Extrato de Transacções */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center mb-3">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Extrato de Movimentos</h3>
              <p className="text-xs text-slate-300 mt-1">
                Lista detalhada de receitas, despesas e transferências com data, descrição, categorias e contas.
              </p>
            </div>
            <button
              onClick={() => handleQuickDownload('transactions')}
              disabled={downloadingType === 'transactions'}
              className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingType === 'transactions' ? 'A exportar...' : 'Baixar Extrato PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Grade de Gráficos Financeiros */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Análise Visual & Gráficos Interativos
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Métricas calculadas em tempo real com base no período seleccionado
            </p>
          </div>
        </div>

        {/* Linha 1 de Gráficos: Fluxo de Caixa & Categorias Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CashflowBarChart
            income={summary.monthlyIncome}
            expense={summary.monthlyExpense}
            savings={summary.totalSavingsBalance}
          />
          <CategoryDonutChart categories={categorySpending} />
        </div>

        {/* Linha 2 de Gráficos: Metas por Horizonte & Alocação de Saldos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GoalsHorizonChart
            goals={goals}
            totalSavingsBalance={summary.totalSavingsBalance}
          />
          <AccountsLiquidityChart accounts={accounts} />
        </div>
      </div>

      {/* Modal de Configuração e Exportação de Relatório PDF */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};

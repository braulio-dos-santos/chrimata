import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { FinancialGoal } from '../types/finance';
import { formatKz } from '../utils/currency';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalModal } from '../components/goals/GoalModal';
import { ContributeGoalModal } from '../components/goals/ContributeGoalModal';
import { downloadFinancialPDF, ReportData } from '../services/pdfReportService';
import { ReportModal } from '../components/reports/ReportModal';
import { 
  Target, 
  Plus, 
  PiggyBank, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Search, 
  Lightbulb,
  FileText
} from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const { user } = useAuth();
  const { goals, summary, deleteGoal, accounts, categorySpending, transactions, selectedMonthYear } = useFinance();

  const [termFilter, setTermFilter] = useState<'all' | 'short' | 'medium' | 'long' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<FinancialGoal | null>(null);

  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      // Filtro de termo / status
      if (termFilter === 'completed') {
        if (g.status !== 'completed' && g.currentAmount < g.targetAmount) return false;
      } else if (termFilter !== 'all') {
        if (g.term !== termFilter) return false;
      }

      // Filtro de pesquisa
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = g.title.toLowerCase().includes(query);
        const matchesCategory = g.category.toLowerCase().includes(query);
        const matchesNotes = g.notes?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesCategory && !matchesNotes) return false;
      }

      return true;
    });
  }, [goals, termFilter, searchQuery]);

  const handleOpenNewGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleDeleteGoal = (goal: FinancialGoal) => {
    if (confirm(`Tem a certeza que deseja eliminar o objectivo "${goal.title}"?`)) {
      deleteGoal(goal.id);
    }
  };

  const handleContribute = (goal: FinancialGoal) => {
    setContributingGoal(goal);
  };

  const handleExportGoalsPDF = () => {
    if (!user) return;
    const reportData: ReportData = {
      userName: user.name,
      userEmail: user.email,
      userProfile: user.profileType,
      periodLabel: `Objectivos & Poupança (${selectedMonthYear})`,
      summary,
      accounts,
      goals,
      categorySpending,
      transactions,
      options: {
        includeAccounts: true,
        includeGoals: true,
        includeCategories: false,
        includeTransactions: false,
        reportType: 'savings_goals',
      },
    };
    downloadFinancialPDF(reportData, 'chrimata-metas-poupanca');
  };

  const shortTermCount = goals.filter((g) => g.term === 'short' && g.status === 'active').length;
  const mediumTermCount = goals.filter((g) => g.term === 'medium' && g.status === 'active').length;
  const longTermCount = goals.filter((g) => g.term === 'long' && g.status === 'active').length;
  const completedCount = goals.filter((g) => g.status === 'completed' || g.currentAmount >= g.targetAmount).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Objectivos de Consumo & Poupança
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Poupança Vinculada</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Defina metas de curto, médio e longo prazo e relacione-as directamente com as suas contas de poupança
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportGoalsPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors cursor-pointer"
            title="Exportar Relatório em PDF"
          >
            <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Relatório PDF</span>
          </button>
          <button
            onClick={handleOpenNewGoal}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Objectivo</span>
          </button>
        </div>
      </div>

      {/* Cartões de Métricas Consolidadas (Relação com a Poupança) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Meta Global Almejada */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Meta Global Almejada
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
            {formatKz(summary.totalGoalsTarget)}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Soma de todos os objectivos activos
          </p>
        </div>

        {/* Total Já Poupado para Metas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Total Poupado em Metas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatKz(summary.totalGoalsSaved)}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Aportes acumulados em objectivos
          </p>
        </div>

        {/* Saldo de Poupança Protegida */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-teal-200 dark:border-teal-900/60 p-5 shadow-xs bg-teal-50/20 dark:bg-teal-950/20">
          <div className="flex items-center justify-between text-teal-800 dark:text-teal-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>Poupança Total</span>
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-900 dark:text-teal-200 tracking-tight">
            {formatKz(summary.totalSavingsBalance)}
          </div>
          <p className="mt-1 text-[11px] text-teal-800 dark:text-teal-400 font-medium">
            🔒 Saldo protegido em conta(s) poupança
          </p>
        </div>

        {/* Cobertura pela Poupança */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Taxa de Cobertura
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-700 dark:text-indigo-300 tracking-tight">
            {summary.goalsCoverageRate}%
          </div>
          <div className="mt-2 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
              style={{ width: `${Math.min(100, summary.goalsCoverageRate)}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Poupança actual cobrindo as metas
          </p>
        </div>
      </div>

      {/* Caixa de Educação Financeira sobre Prazos */}
      <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-slate-900 dark:text-white">
              Literacia Financeira: Como equilibrar os 3 horizontes de consumo
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Curto Prazo (&lt; 1 ano):</strong> Equipamentos e pequenas despesas sem recorrer a dívidas · 
              <strong> Médio Prazo (1-3 anos):</strong> Formação, carro ou caução · 
              <strong> Longo Prazo (&gt; 3 anos):</strong> Habitação e segurança patrimonial.
              Ao vincular à sua conta Poupança, o dinheiro não se mistura com a carteira diária!
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filtros de Prazos */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setTermFilter('all')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              termFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white font-bold'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Todos ({goals.length})
          </button>

          <button
            onClick={() => setTermFilter('short')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              termFilter === 'short'
                ? 'bg-sky-600 text-white border-sky-600 font-bold'
                : 'bg-white dark:bg-slate-900 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/40'
            }`}
          >
            Curto Prazo ({shortTermCount})
          </button>

          <button
            onClick={() => setTermFilter('medium')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              termFilter === 'medium'
                ? 'bg-amber-600 text-white border-amber-600 font-bold'
                : 'bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            Médio Prazo ({mediumTermCount})
          </button>

          <button
            onClick={() => setTermFilter('long')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              termFilter === 'long'
                ? 'bg-purple-600 text-white border-purple-600 font-bold'
                : 'bg-white dark:bg-slate-900 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            Longo Prazo ({longTermCount})
          </button>

          <button
            onClick={() => setTermFilter('completed')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              termFilter === 'completed'
                ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                : 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            Concluídos ({completedCount})
          </button>
        </div>

        {/* Campo de Busca */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar objectivo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Grid de Objectivos */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Nenhum objectivo encontrado
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-5">
            {searchQuery
              ? 'Não foram encontrados resultados para a sua pesquisa. Tente outro termo.'
              : 'Defina os seus objectivos de consumo e poupe com disciplina a curto, médio e longo prazo.'}
          </p>
          <button
            onClick={handleOpenNewGoal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Objectivo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onContribute={handleContribute}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      )}

      {/* Modais */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        editingGoal={editingGoal}
      />

      <ContributeGoalModal
        isOpen={!!contributingGoal}
        onClose={() => setContributingGoal(null)}
        goal={contributingGoal}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};

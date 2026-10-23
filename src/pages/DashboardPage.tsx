import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { MetricCards } from '../components/dashboard/MetricCards';
import { AccountsPreview } from '../components/dashboard/AccountsPreview';
import { GoalsPreview } from '../components/dashboard/GoalsPreview';
import { CashflowChart } from '../components/dashboard/CashflowChart';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { QuickEducationCard } from '../components/dashboard/QuickEducationCard';
import { AccountModal } from '../components/accounts/AccountModal';
import { TransferModal } from '../components/accounts/TransferModal';
import { GoalModal } from '../components/goals/GoalModal';
import { ContributeGoalModal } from '../components/goals/ContributeGoalModal';
import { ReportModal } from '../components/reports/ReportModal';
import { FinancialGoal } from '../types/finance';
import { 
  Plus, 
  Calendar, 
  GraduationCap, 
  Briefcase, 
  Calculator, 
  PieChart, 
  ArrowLeftRight, 
  Target,
  FileText,
  BarChart3
} from 'lucide-react';

interface DashboardPageProps {
  onOpenNewTransaction: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenNewTransaction,
  onNavigateTab,
}) => {
  const { user } = useAuth();
  const { selectedMonthYear, setSelectedMonthYear } = useFinance();

  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [contributingGoal, setContributingGoal] = useState<FinancialGoal | null>(null);
  const [selectedFromAccId, setSelectedFromAccId] = useState<string | undefined>(undefined);

  const handleOpenTransfer = (fromId?: string) => {
    setSelectedFromAccId(fromId);
    setTransferModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Top Banner de Boas-vindas & Seletor de Período */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Olá, {user?.name.split(' ')[0]} 👋
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {user?.profileType === 'student' ? (
                <><GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Perfil Estudante</>
              ) : (
                <><Briefcase className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Perfil Trabalhador</>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user?.institutionOrCompany} · Visão consolidada das suas finanças
          </p>
        </div>

        {/* Controlos Rápidos: Filtro Mês, Transferência, Exportar PDF e Nova Transacção */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors cursor-pointer border border-emerald-200/60 dark:border-emerald-800/60"
            title="Exportar Relatório PDF"
          >
            <FileText className="w-4 h-4" />
            <span>Relatório PDF</span>
          </button>

          <button
            onClick={() => handleOpenTransfer()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors cursor-pointer border border-indigo-200/60 dark:border-indigo-800/60"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Transferir</span>
          </button>

          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Transacção</span>
          </button>
        </div>
      </div>

      {/* Cartões de Métricas (KPIs Tabulares) com Poupança Isolada */}
      <MetricCards />

      {/* Módulo de Contas & Carteiras (Minha Carteira, Conta Corrente, Poupança) */}
      <AccountsPreview
        onOpenTransfer={handleOpenTransfer}
        onOpenNewAccount={() => setAccountModalOpen(true)}
        onGoToAccounts={() => onNavigateTab('accounts')}
      />

      {/* Módulo de Objectivos de Consumo & Relação com a Poupança */}
      <GoalsPreview
        onGoToGoals={() => onNavigateTab('goals')}
        onOpenNewGoal={() => setGoalModalOpen(true)}
        onContributeGoal={(g) => setContributingGoal(g)}
      />

      {/* Dica Diária de Literacia Financeira Integrada */}
      <QuickEducationCard onGoToEducation={() => onNavigateTab('education')} />

      {/* Gráficos de Fluxo de Caixa e Destino de Despesas */}
      <CashflowChart />

      {/* Transacções Recentes e Atalhos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions
            onViewAll={() => onNavigateTab('transactions')}
            onOpenNew={onOpenNewTransaction}
          />
        </div>

        {/* Painel Lateral de Ferramentas Rápidas */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Acções Rápidas</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Acesso directo a ferramentas chave</p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('reports')}
                className="w-full text-left p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-emerald-200 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 transition-colors">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Relatórios & Gráficos</p>
                    <p className="text-[11px] text-slate-400">Exportar em PDF e ver métricas</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('accounts')}
                className="w-full text-left p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-indigo-200 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 transition-colors">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Minhas Contas</p>
                    <p className="text-[11px] text-slate-400">Ver saldos e transferências</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('goals')}
                className="w-full text-left p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-teal-200 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900/60 transition-colors">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Objectivos de Consumo</p>
                    <p className="text-[11px] text-slate-400">Metas de curto, médio e longo prazo</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('budgets')}
                className="w-full text-left p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-emerald-200 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 transition-colors">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Gerir Orçamentos</p>
                    <p className="text-[11px] text-slate-400">Ajuste limites de gastos</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('education')}
                className="w-full text-left p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-teal-200 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900/60 transition-colors">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Simulador 50 / 30 / 20</p>
                    <p className="text-[11px] text-slate-400">Calcule a divisão do seu salário</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Dica rápida de estudante/trabalhador */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {user?.profileType === 'student' ? '💡 Dica para Estudantes' : '💼 Dica Profissional'}
            </p>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {user?.profileType === 'student'
                ? 'Levante uma quantia semanal para a sua carteira física. Ao separar o dinheiro do táxi da conta corrente, evita gastar a bolsa com supérfluos!'
                : 'Mantenha a conta Poupança estritamente intocada. Transfira o seu aporte no dia 1 e viva apenas com o saldo da Conta Corrente e da Carteira.'}
            </p>
          </div>
        </div>
      </div>

      {/* Modais de Conta e Transferência */}
      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
      />

      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        defaultFromAccountId={selectedFromAccId}
      />

      {/* Modais de Objectivos */}
      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
      />

      <ContributeGoalModal
        isOpen={!!contributingGoal}
        onClose={() => setContributingGoal(null)}
        goal={contributingGoal}
      />

      {/* Modal de Relatório PDF */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
};

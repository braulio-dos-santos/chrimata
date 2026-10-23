import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFinance } from '../../contexts/FinanceContext';
import { downloadFinancialPDF, ReportData } from '../../services/pdfReportService';
import { formatKz } from '../../utils/currency';
import { 
  X, 
  FileText, 
  Download, 
  Calendar, 
  Check, 
  Target, 
  Wallet, 
  PieChart, 
  Receipt,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
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

  const [includeAccounts, setIncludeAccounts] = useState(true);
  const [includeGoals, setIncludeGoals] = useState(true);
  const [includeCategories, setIncludeCategories] = useState(true);
  const [includeTransactions, setIncludeTransactions] = useState(true);
  const [reportType, setReportType] = useState<'full' | 'savings_goals' | 'accounts' | 'transactions'>('full');
  const [periodFilter, setPeriodFilter] = useState<'selected' | 'all'>('selected');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen || !user) return null;

  // Filtrar transacções se o utilizador escolheu o mês corrente
  const filteredTransactions = periodFilter === 'selected'
    ? transactions.filter((t) => t.date.startsWith(selectedMonthYear))
    : transactions;

  const handleGenerateAndDownload = () => {
    setIsExporting(true);

    try {
      const periodLabel = periodFilter === 'selected' 
        ? `Mensal (${selectedMonthYear})` 
        : 'Histórico Global Consolidado';

      const reportData: ReportData = {
        userName: user.name,
        userEmail: user.email,
        userProfile: user.profileType,
        periodLabel,
        summary,
        accounts,
        goals,
        categorySpending,
        transactions: filteredTransactions,
        options: {
          includeAccounts: reportType === 'full' || reportType === 'accounts' ? includeAccounts : false,
          includeGoals: reportType === 'full' || reportType === 'savings_goals' ? includeGoals : false,
          includeCategories: reportType === 'full' ? includeCategories : false,
          includeTransactions: reportType === 'full' || reportType === 'transactions' ? includeTransactions : false,
          reportType,
        },
      };

      const prefix = reportType === 'savings_goals'
        ? 'chrimata-relatorio-poupanca-metas'
        : reportType === 'accounts'
        ? 'chrimata-extrato-contas'
        : reportType === 'transactions'
        ? 'chrimata-extrato-transaccoes'
        : 'chrimata-relatorio-financeiro';

      downloadFinancialPDF(reportData, prefix);

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        setIsExporting(false);
      }, 2000);
    } catch (err) {
      console.error('Erro ao gerar relatório PDF:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Cabeçalho do Modal */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Exportar Relatório em PDF
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gere um documento formal com balanço, contas, metas e extrato
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* 1. Escolha do Modelo de Relatório */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Tipo de Relatório
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setReportType('full');
                  setIncludeAccounts(true);
                  setIncludeGoals(true);
                  setIncludeCategories(true);
                  setIncludeTransactions(true);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  reportType === 'full'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold">Relatório Completo</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  Balanço geral, contas, metas, categorias e extrato analítico.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setReportType('savings_goals');
                  setIncludeAccounts(true);
                  setIncludeGoals(true);
                  setIncludeCategories(false);
                  setIncludeTransactions(false);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  reportType === 'savings_goals'
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold">Metas & Poupança</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  Objectivos de curto, médio e longo prazo e contas vinculadas.
                </p>
              </button>
            </div>
          </div>

          {/* 2. Seleção de Período */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Período de Referência
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="periodFilter"
                  checked={periodFilter === 'selected'}
                  onChange={() => setPeriodFilter('selected')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>Mês Selecionado ({selectedMonthYear})</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="periodFilter"
                  checked={periodFilter === 'all'}
                  onChange={() => setPeriodFilter('all')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>Todo o Histórico</span>
              </label>
            </div>
          </div>

          {/* 3. Seções Personalizáveis */}
          {reportType === 'full' && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Secções Incluídas no Documento
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer">
                  <div className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-200">
                    <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Contas & Carteiras (Minha Carteira, Poupança, Corrente)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeAccounts}
                    onChange={(e) => setIncludeAccounts(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer">
                  <div className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-200">
                    <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Metas de Consumo (Curto, Médio e Longo Prazo)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeGoals}
                    onChange={(e) => setIncludeGoals(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer">
                  <div className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-200">
                    <PieChart className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>Despesas por Categoria & Execução Orçamental</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeCategories}
                    onChange={(e) => setIncludeCategories(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer">
                  <div className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-200">
                    <Receipt className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>Extrato Analítico de Transacções ({filteredTransactions.length} movimentos)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeTransactions}
                    onChange={(e) => setIncludeTransactions(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Prévia Resumida dos Dados */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Titular da Conta:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Saldo Geral (Disponível):</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {formatKz(summary.totalBalance)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Poupança Protegida (Isolada):</span>
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {formatKz(summary.totalSavingsBalance)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Metas de Consumo Cadastradas:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {goals.length} ({summary.goalsCoverageRate}% de cobertura)
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé com Botão de Acção */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleGenerateAndDownload}
            disabled={isExporting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-sm transition-all cursor-pointer ${
              exportSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
            }`}
          >
            {exportSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>PDF Descarregado com Sucesso!</span>
              </>
            ) : isExporting ? (
              <span>A gerar PDF...</span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Descarregar Relatório PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

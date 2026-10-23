import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { Transaction, TransactionType } from '../types/finance';
import { formatKz, formatDatePt } from '../utils/currency';
import { downloadFinancialPDF, ReportData } from '../services/pdfReportService';
import { ReportModal } from '../components/reports/ReportModal';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Download, 
  Receipt,
  FileText
} from 'lucide-react';

interface TransactionsPageProps {
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenNewTransaction,
  onEditTransaction,
}) => {
  const { user } = useAuth();
  const { 
    transactions, 
    categories, 
    accounts, 
    goals, 
    categorySpending, 
    summary, 
    selectedMonthYear, 
    deleteTransaction 
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filtro de pesquisa
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = tx.title.toLowerCase().includes(query);
        const matchDesc = tx.description?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }

      // Filtro de tipo
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }

      // Filtro de categoria
      if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
        return false;
      }

      // Filtro de conta
      if (selectedAccount !== 'all') {
        if (tx.accountId !== selectedAccount && tx.toAccountId !== selectedAccount) {
          return false;
        }
      }

      // Filtro de método
      if (selectedMethod !== 'all' && tx.paymentMethod !== selectedMethod) {
        return false;
      }

      return true;
    });
  }, [transactions, searchQuery, typeFilter, selectedCategory, selectedAccount, selectedMethod]);

  const filteredTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    let transfer = 0;
    filteredTransactions.forEach((tx) => {
      if (tx.type === 'income') income += tx.amount;
      else if (tx.type === 'expense') expense += tx.amount;
      else if (tx.type === 'transfer') transfer += tx.amount;
    });
    return { income, expense, transfer, balance: income - expense };
  }, [filteredTransactions]);

  const getCategory = (catId: string) => {
    return categories.find((c) => c.id === catId);
  };

  const getAccount = (accId?: string) => {
    if (!accId) return null;
    return accounts.find((a) => a.id === accId);
  };

  const handleExportCSV = () => {
    const headers = ['Data', 'Título', 'Tipo', 'Categoria', 'Conta', 'Valor (Kz)', 'Método', 'Descrição'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      t.type === 'income' ? 'Receita' : t.type === 'expense' ? 'Despesa' : 'Transferência',
      `"${getCategory(t.categoryId)?.name || ''}"`,
      `"${getAccount(t.accountId)?.name || ''}"`,
      t.amount,
      t.paymentMethod,
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chrimata_transaccoes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!user) return;
    const reportData: ReportData = {
      userName: user.name,
      userEmail: user.email,
      userProfile: user.profileType,
      periodLabel: `Extrato Filtrado (${filteredTransactions.length} movimentos)`,
      summary,
      accounts,
      goals,
      categorySpending,
      transactions: filteredTransactions,
      options: {
        includeAccounts: true,
        includeGoals: false,
        includeCategories: true,
        includeTransactions: true,
        reportType: 'transactions',
      },
    };
    downloadFinancialPDF(reportData, 'chrimata-extrato-transaccoes');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Header & Botão Nova Transacção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Livro de Transacções
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registo completo de todos os movimentos e transferências em Kwanza
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-2xs cursor-pointer"
            title="Exportar para formato PDF"
          >
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Exportar PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Transacção</span>
          </button>
        </div>
      </div>

      {/* Faixa de Totais do Filtro Actual */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Entradas Filtradas</span>
          <span className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatKz(filteredTotals.income, true)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Saídas Filtradas</span>
          <span className="text-lg font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
            {formatKz(filteredTotals.expense)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Saldo do Período</span>
          <span className={`text-lg font-bold font-mono tabular-nums ${
            filteredTotals.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatKz(filteredTotals.balance, true)}
          </span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Campo de Pesquisa */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por título ou descrição..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Filtro de Conta */}
          <div>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-900 dark:text-white"
            >
              <option value="all">Todas as Contas</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Categoria */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Segmented Control para Tipo (Todas / Receitas / Despesas / Transferências) */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-2">
            Tipo:
          </span>
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Todas ({transactions.length})
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              typeFilter === 'income'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Receitas
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              typeFilter === 'expense'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Despesas
          </button>
          <button
            onClick={() => setTypeFilter('transfer')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              typeFilter === 'transfer'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Transferências
          </button>
        </div>
      </div>

      {/* Lista / Tabela de Transacções */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Nenhuma transacção encontrada
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
              Não existem movimentos para os filtros seleccionados. Altere os filtros ou adicione uma nova transacção.
            </p>
            <button
              onClick={onOpenNewTransaction}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
            >
              Criar Transacção
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Data</th>
                  <th className="px-5 py-3.5">Título / Descrição</th>
                  <th className="px-5 py-3.5">Categoria / Conta</th>
                  <th className="px-5 py-3.5">Canal</th>
                  <th className="px-5 py-3.5 text-right">Montante (Kz)</th>
                  <th className="px-5 py-3.5 text-center">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredTransactions.map((tx) => {
                  const cat = getCategory(tx.categoryId);
                  const acc = getAccount(tx.accountId);
                  const isIncome = tx.type === 'income';
                  const isTransfer = tx.type === 'transfer';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-600 dark:text-slate-400">
                        {formatDatePt(tx.date)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{tx.title}</div>
                        {tx.description && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-xs">
                            {tx.description}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: cat?.color || '#94A3B8' }}
                            />
                            <span>{cat?.name || 'Geral'}</span>
                          </div>
                          {acc && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                              Conta: {acc.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap capitalize text-slate-500 dark:text-slate-400">
                        {tx.paymentMethod}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span
                          className={`font-mono tabular-nums font-bold text-xs ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isTransfer
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {isIncome
                            ? `+ ${formatKz(tx.amount)}`
                            : isTransfer
                            ? `⇄ ${formatKz(tx.amount)}`
                            : `- ${formatKz(tx.amount)}`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Editar transacção"
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Pretende eliminar a transacção "${tx.title}"?`)) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            title="Eliminar transacção"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};

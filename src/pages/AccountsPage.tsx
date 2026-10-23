import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { Account, AccountType } from '../types/finance';
import { formatKz, formatDatePt } from '../utils/currency';
import { AccountModal } from '../components/accounts/AccountModal';
import { TransferModal } from '../components/accounts/TransferModal';
import { downloadFinancialPDF, ReportData } from '../services/pdfReportService';
import { 
  Wallet, 
  Landmark, 
  PiggyBank, 
  PlusCircle, 
  Plus, 
  ArrowLeftRight, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  ArrowRight,
  Receipt,
  Target,
  FileText
} from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const { user } = useAuth();
  const { accounts, transactions, goals, categorySpending, deleteAccount, summary, selectedMonthYear } = useFinance();

  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedFromAccId, setSelectedFromAccId] = useState<string | undefined>(undefined);

  const transferTransactions = transactions.filter((t) => t.type === 'transfer');

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'checking':
        return <Landmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'cash':
        return <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'savings':
        return <PiggyBank className="w-5 h-5 text-teal-700 dark:text-teal-400" />;
      default:
        return <PlusCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" />;
    }
  };

  const handleEditAccount = (acc: Account) => {
    setEditingAccount(acc);
    setAccountModalOpen(true);
  };

  const handleCreateAccount = () => {
    setEditingAccount(null);
    setAccountModalOpen(true);
  };

  const handleStartTransfer = (fromId?: string) => {
    setSelectedFromAccId(fromId);
    setTransferModalOpen(true);
  };

  const handleDeleteAccount = (acc: Account) => {
    if (acc.balance > 0) {
      if (
        !confirm(
          `Esta conta possui saldo de ${formatKz(
            acc.balance
          )}. Recomendamos transferir o valor para outra conta antes de a apagar. Deseja mesmo eliminar?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm(`Pretende eliminar a conta "${acc.name}"?`)) {
        return;
      }
    }
    deleteAccount(acc.id);
  };

  const getAccountName = (accId?: string) => {
    if (!accId) return 'Conta Desconhecida';
    const acc = accounts.find((a) => a.id === accId);
    return acc ? acc.name : 'Conta Removida';
  };

  const handleExportAccountsPDF = () => {
    if (!user) return;
    const reportData: ReportData = {
      userName: user.name,
      userEmail: user.email,
      userProfile: user.profileType,
      periodLabel: `Posição de Contas (${selectedMonthYear})`,
      summary,
      accounts,
      goals,
      categorySpending,
      transactions,
      options: {
        includeAccounts: true,
        includeGoals: true,
        includeCategories: false,
        includeTransactions: true,
        reportType: 'accounts',
      },
    };
    downloadFinancialPDF(reportData, 'chrimata-balanco-contas');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gestão de Contas & Carteiras
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Controle separado para Conta Corrente, Dinheiro em Carteira e Poupança Protegida
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportAccountsPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
            title="Exportar Balanço de Contas em PDF"
          >
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Relatório PDF</span>
          </button>
          <button
            onClick={() => handleStartTransfer()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Transferir</span>
          </button>
          <button
            onClick={handleCreateAccount}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Conta</span>
          </button>
        </div>
      </div>

      {/* Faixas Informativas de Saldo Geral vs Poupança */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Saldo Geral Operacional */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Saldo Geral Operacional
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {formatKz(summary.totalAvailableBalance)}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Contas Correntes + Minha Carteira (Dinheiro Vivo)
          </p>
        </div>

        {/* Poupança (Isolada do Geral) */}
        <div className="bg-teal-50/50 dark:bg-teal-950/30 p-5 rounded-2xl border border-teal-200 dark:border-teal-900/60 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>Poupança Protegida</span>
            </span>
            <span className="text-[10px] font-semibold bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200 px-2 py-0.5 rounded">
              Isolada
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-950 dark:text-teal-100">
            {formatKz(summary.totalSavingsBalance)}
          </div>
          <p className="mt-1 text-xs text-teal-800 dark:text-teal-300">
            O dinheiro não é contabilizado no geral para evitar gastos involuntários
          </p>
        </div>

        {/* Património Líquido Total */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Património Líquido Total
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-950 dark:text-indigo-200">
            {formatKz(summary.totalNetWorth)}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Total combinado de todos os activos e reservas
          </p>
        </div>
      </div>

      {/* Lista Detalhada de Contas Cadastradas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          As Suas Contas Cadastradas ({accounts.length})
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Pode adicionar novas contas bancárias, cofres ou carteiras físicas
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accounts.map((acc) => {
            return (
              <div
                key={acc.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  acc.isSavings
                    ? 'border-teal-200 dark:border-teal-900/60 bg-teal-50/30 dark:bg-teal-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        {getAccountIcon(acc.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {acc.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                          {acc.type === 'checking'
                            ? 'Conta Corrente'
                            : acc.type === 'cash'
                            ? 'Minha Carteira (Físico)'
                            : acc.type === 'savings'
                            ? 'Poupança / Reserva'
                            : 'Conta Adicional'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditAccount(acc)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Editar conta"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(acc)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar conta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="my-4">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Saldo Actual
                    </span>
                    <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                      {formatKz(acc.balance)}
                    </div>
                  </div>

                  {/* Metas de Consumo Vinculadas à Poupança */}
                  {acc.isSavings && (
                    <div className="mb-3 pt-2 border-t border-teal-200/60 dark:border-teal-900/60">
                      {(() => {
                        const linkedGoals = goals.filter((g) => g.savingsAccountId === acc.id);
                        return (
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-900 dark:text-teal-200 mb-1">
                              <Target className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                              <span>{linkedGoals.length} Objectivo(s) Vinculado(s):</span>
                            </div>
                            {linkedGoals.length > 0 ? (
                              <div className="space-y-1">
                                {linkedGoals.slice(0, 2).map((g) => (
                                  <div key={g.id} className="text-[10px] text-teal-800 dark:text-teal-300 flex items-center justify-between">
                                    <span className="truncate max-w-[140px]">· {g.title}</span>
                                    <span className="font-mono tabular-nums font-semibold">
                                      {Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))}%
                                    </span>
                                  </div>
                                ))}
                                {linkedGoals.length > 2 && (
                                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                                    + {linkedGoals.length - 2} outro(s) objectivo(s)
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-[10px] text-teal-700/80 dark:text-teal-400/80">Nenhum objectivo atribuído ainda</p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {acc.isSavings ? '🛡️ Poupança Isolada' : 'Operacional'}
                  </span>
                  <button
                    onClick={() => handleStartTransfer(acc.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 cursor-pointer"
                  >
                    <span>Mover fundos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Histórico de Transferências Internas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Histórico de Transferências entre Contas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Movimentações internas entre carteira física, conta corrente e poupança
            </p>
          </div>
        </div>

        {transferTransactions.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Ainda não realizou transferências entre as suas contas.
            </p>
            <button
              onClick={() => handleStartTransfer()}
              className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors cursor-pointer"
            >
              Realizar Primeira Transferência
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transferTransactions.map((tx) => (
              <div
                key={tx.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 px-2 -mx-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {getAccountName(tx.accountId)}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                        {getAccountName(tx.toAccountId)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{formatDatePt(tx.date)}</span>
                      {tx.description && (
                        <>
                          <span>·</span>
                          <span className="text-slate-500 dark:text-slate-400">{tx.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                    {formatKz(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modais */}
      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        editingAccount={editingAccount}
      />

      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        defaultFromAccountId={selectedFromAccId}
      />
    </div>
  );
};

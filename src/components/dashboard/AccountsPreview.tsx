import React from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Account } from '../../types/finance';
import { formatKz } from '../../utils/currency';
import { 
  Wallet, 
  Landmark, 
  PiggyBank, 
  PlusCircle, 
  ArrowLeftRight, 
  ArrowRight,
  Plus
} from 'lucide-react';

interface AccountsPreviewProps {
  onOpenTransfer: (fromAccountId?: string) => void;
  onOpenNewAccount: () => void;
  onGoToAccounts: () => void;
}

export const AccountsPreview: React.FC<AccountsPreviewProps> = ({
  onOpenTransfer,
  onOpenNewAccount,
  onGoToAccounts,
}) => {
  const { accounts } = useFinance();

  const getAccountIcon = (account: Account) => {
    switch (account.type) {
      case 'checking':
        return <Landmark className="w-4 h-4 text-blue-600" />;
      case 'cash':
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      case 'savings':
        return <PiggyBank className="w-4 h-4 text-teal-700" />;
      default:
        return <PlusCircle className="w-4 h-4 text-violet-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            As Minhas Contas & Carteiras
          </h3>
          <p className="text-xs text-slate-500">
            Saldos em Conta Corrente, Dinheiro Físico e Poupança Protegida
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenTransfer()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transferir</span>
          </button>
          <button
            onClick={onOpenNewAccount}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Conta</span>
          </button>
          <button
            onClick={onGoToAccounts}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Gerir todas as contas"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid de Contas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {accounts.map((acc) => {
          return (
            <div
              key={acc.id}
              className={`p-3.5 rounded-xl border transition-all ${
                acc.isSavings
                  ? 'border-teal-200 bg-teal-50/40'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    {getAccountIcon(acc)}
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {acc.name}
                  </span>
                </div>
                {acc.isSavings && (
                  <span className="text-[10px] font-semibold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded shrink-0">
                    Poupança
                  </span>
                )}
              </div>

              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mb-1.5">
                {formatKz(acc.balance)}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                <span>{acc.isSavings ? 'Fora do saldo geral' : 'Disponível no geral'}</span>
                <button
                  onClick={() => onOpenTransfer(acc.id)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Mover fundos
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

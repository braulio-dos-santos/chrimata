import React from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { formatKz, formatRelativeDate } from '../../utils/currency';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

interface RecentTransactionsProps {
  onViewAll: () => void;
  onOpenNew: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ onViewAll, onOpenNew }) => {
  const { transactions, categories } = useFinance();

  const recent = transactions.slice(0, 6);

  const getCategory = (catId: string) => {
    return categories.find(c => c.id === catId);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Últimas Transacções</h3>
          <p className="text-xs text-slate-500">Histórico recente de movimentos financeiros</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Ver Todas ({transactions.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
          <p className="text-xs text-slate-500 mb-3">Ainda não registou nenhuma transacção.</p>
          <button
            onClick={onOpenNew}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            Registar Primeira Transacção
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {recent.map((tx) => {
            const cat = getCategory(tx.categoryId);
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70 px-2 -mx-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-rose-500" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>{cat?.name || 'Geral'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatRelativeDate(tx.date)}</span>
                      {tx.paymentMethod && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{tx.paymentMethod}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-bold font-mono tabular-nums ${
                      isIncome ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isIncome ? `+ ${formatKz(tx.amount)}` : `- ${formatKz(tx.amount)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { formatKz } from '../../utils/currency';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export const CashflowChart: React.FC = () => {
  const { summary, categorySpending } = useFinance();

  const total = summary.monthlyIncome + summary.monthlyExpense;
  const incomePct = total > 0 ? Math.round((summary.monthlyIncome / total) * 100) : 50;
  const expensePct = total > 0 ? Math.round((summary.monthlyExpense / total) * 100) : 50;

  const topCategories = categorySpending.slice(0, 5);
  const maxCategorySpent = Math.max(...topCategories.map(c => c.spent), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Balanço e Proporção Entrada vs Saída */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Fluxo Mensal
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Proporção entre receitas e despesas</p>

        {/* Barra Visual Split */}
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex mb-3">
          <div
            style={{ width: `${incomePct}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
            title={`Receitas: ${incomePct}%`}
          />
          <div
            style={{ width: `${expensePct}%` }}
            className="bg-rose-500 h-full transition-all duration-500"
            title={`Despesas: ${expensePct}%`}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-6">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Receitas ({incomePct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span>Despesas ({expensePct}%)</span>
          </div>
        </div>

        {/* Estatísticas resumidas em lista limpa */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Total de Entradas
            </span>
            <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
              {formatKz(summary.monthlyIncome)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              Total de Saídas
            </span>
            <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
              {formatKz(summary.monthlyExpense)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 font-semibold">
            <span className="text-slate-700 dark:text-slate-300">Saldo Operacional</span>
            <span className={`font-mono tabular-nums ${
              summary.monthlyIncome >= summary.monthlyExpense ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatKz(summary.monthlyIncome - summary.monthlyExpense, true)}
            </span>
          </div>
        </div>
      </div>

      {/* Maiores Destinos de Despesa */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Despesas por Categoria</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Mês corrente</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Onde o seu dinheiro foi investido ou consumido</p>

        {topCategories.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
            Nenhuma despesa registada neste período.
          </div>
        ) : (
          <div className="space-y-4">
            {topCategories.map(({ category, spent, budget, percentage }) => {
              const relativeBarWidth = Math.min(100, Math.round((spent / maxCategorySpent) * 100));
              const isOverBudget = budget && spent > budget.amountLimit;

              return (
                <div key={category.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{category.name}</span>
                      {budget && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          (Tecto: {formatKz(budget.amountLimit)})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                        {formatKz(spent)}
                      </span>
                      {budget && (
                        <span className={`text-[11px] font-medium font-mono ${
                          isOverBudget ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {percentage}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverBudget
                          ? 'bg-rose-500'
                          : percentage > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${relativeBarWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

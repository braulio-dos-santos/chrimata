import React from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { formatKz } from '../../utils/currency';
import { Wallet, ArrowDownRight, ArrowUpRight, PiggyBank, ShieldCheck } from 'lucide-react';

export const MetricCards: React.FC = () => {
  const { summary } = useFinance();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Geral Disponível (Sem Poupança) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Saldo Geral Disponível
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
            {formatKz(summary.totalAvailableBalance)}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Conta Corrente + Carteira (Livre para gastos)
          </p>
        </div>

        {/* Poupança & Reservas (Isolada do saldo geral) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-teal-200 dark:border-teal-900/50 p-5 shadow-xs transition-shadow hover:shadow-sm bg-teal-50/20 dark:bg-teal-950/20">
          <div className="flex items-center justify-between text-teal-800 dark:text-teal-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>Poupança Protegida</span>
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-900 dark:text-teal-200 tracking-tight">
            {formatKz(summary.totalSavingsBalance)}
          </div>
          <p className="mt-1 text-[11px] text-teal-800/80 dark:text-teal-400/80 font-medium">
            🔒 Não contabilizado no saldo geral
          </p>
        </div>

        {/* Receitas do Mês */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Receitas do Mês
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatKz(summary.monthlyIncome, true)}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Salário, bolsas e rendimentos no mês
          </p>
        </div>

        {/* Despesas do Mês */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Despesas do Mês
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 tracking-tight">
            {formatKz(summary.monthlyExpense)}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Gastos debitados de contas correntes e carteira
          </p>
        </div>
      </div>

      {/* Faixa Discreta de Património Total Consolidado */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-100/70 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Património Líquido Total:</span>
          <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
            {formatKz(summary.totalNetWorth)}
          </span>
          <span className="text-slate-400 dark:text-slate-500">
            (Disponível: {formatKz(summary.totalAvailableBalance)} + Poupança: {formatKz(summary.totalSavingsBalance)})
          </span>
        </div>
        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Taxa de poupança mensal: <strong className="text-emerald-700 dark:text-emerald-400">{summary.savingsRate}%</strong>
        </div>
      </div>
    </div>
  );
};

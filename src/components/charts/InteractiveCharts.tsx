import React, { useState } from 'react';
import { CategorySpending, FinancialGoal, Account } from '../../types/finance';
import { formatKz, getTermLabel } from '../../utils/currency';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  PiggyBank, 
  Target, 
  Wallet,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

// ==========================================
// 1. Gráfico de Fluxo de Caixa (Receitas vs Despesas vs Poupança)
// ==========================================
interface CashflowBarChartProps {
  income: number;
  expense: number;
  savings: number;
}

export const CashflowBarChart: React.FC<CashflowBarChartProps> = ({ income, expense, savings }) => {
  const maxVal = Math.max(income, expense, savings, 1);
  const incomeHeight = Math.max(8, Math.round((income / maxVal) * 160));
  const expenseHeight = Math.max(8, Math.round((expense / maxVal) * 160));
  const savingsHeight = Math.max(8, Math.round((savings / maxVal) * 160));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Fluxo Financeiro do Período
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comparativo directo entre entradas, saídas e acumulação em poupança
          </p>
        </div>
      </div>

      <div className="h-48 flex items-end justify-center gap-8 sm:gap-14 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        {/* Barra 1: Receitas */}
        <div className="flex flex-col items-center group w-20">
          <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {formatKz(income)}
          </span>
          <div 
            style={{ height: `${incomeHeight}px` }}
            className="w-12 sm:w-16 rounded-t-xl bg-linear-to-t from-emerald-600 to-emerald-400 dark:from-emerald-700 dark:to-emerald-500 shadow-sm transition-all duration-500 hover:brightness-110 flex items-start justify-center pt-2"
          >
            <ArrowUpRight className="w-4 h-4 text-white/90" />
          </div>
          <span className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Receitas</span>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{formatKz(income)}</span>
        </div>

        {/* Barra 2: Despesas */}
        <div className="flex flex-col items-center group w-20">
          <span className="text-[11px] font-mono font-semibold text-rose-600 dark:text-rose-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {formatKz(expense)}
          </span>
          <div 
            style={{ height: `${expenseHeight}px` }}
            className="w-12 sm:w-16 rounded-t-xl bg-linear-to-t from-rose-600 to-rose-400 dark:from-rose-700 dark:to-rose-500 shadow-sm transition-all duration-500 hover:brightness-110 flex items-start justify-center pt-2"
          >
            <ArrowDownRight className="w-4 h-4 text-white/90" />
          </div>
          <span className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Despesas</span>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{formatKz(expense)}</span>
        </div>

        {/* Barra 3: Poupança */}
        <div className="flex flex-col items-center group w-20">
          <span className="text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {formatKz(savings)}
          </span>
          <div 
            style={{ height: `${savingsHeight}px` }}
            className="w-12 sm:w-16 rounded-t-xl bg-linear-to-t from-indigo-600 to-indigo-400 dark:from-indigo-700 dark:to-indigo-500 shadow-sm transition-all duration-500 hover:brightness-110 flex items-start justify-center pt-2"
          >
            <PiggyBank className="w-4 h-4 text-white/90" />
          </div>
          <span className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Poupança</span>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{formatKz(savings)}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
          <p className="text-[11px] text-emerald-800 dark:text-emerald-300">Entradas</p>
          <p className="font-bold font-mono text-emerald-700 dark:text-emerald-400">{formatKz(income)}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50">
          <p className="text-[11px] text-rose-800 dark:text-rose-300">Saídas</p>
          <p className="font-bold font-mono text-rose-700 dark:text-rose-400">{formatKz(expense)}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
          <p className="text-[11px] text-indigo-800 dark:text-indigo-300">Reserva</p>
          <p className="font-bold font-mono text-indigo-700 dark:text-indigo-400">{formatKz(savings)}</p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. Gráfico de Rosca / Donut de Categorias
// ==========================================
interface CategoryDonutChartProps {
  categories: CategorySpending[];
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ categories }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalSpent = categories.reduce((acc, c) => acc + c.spent, 0);

  // Se não houver despesas
  if (totalSpent === 0 || categories.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Despesas por Categoria</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Nenhum registo de despesa no período.</p>
      </div>
    );
  }

  // Montar fatias SVG
  const radius = 68;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const slices = categories.map((cat, idx) => {
    const fraction = cat.spent / totalSpent;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += fraction * circumference;

    return {
      ...cat,
      fraction,
      percentage: Math.round(fraction * 100),
      strokeDasharray,
      strokeDashoffset,
      color: cat.category.color || '#10b981',
      index: idx,
    };
  });

  const activeCategory = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Distribuição por Categoria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Percentual alocado por destino de consumo
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          Total: {formatKz(totalSpent)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center">
          <svg width="190" height="190" viewBox="0 0 190 190" className="transform -rotate-90">
            <circle
              cx="95"
              cy="95"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-100 dark:text-slate-800"
            />
            {slices.map((slice) => (
              <circle
                key={slice.category.id}
                cx="95"
                cy="95"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={hoveredIndex === slice.index ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </svg>

          {/* Centro do Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            {activeCategory ? (
              <>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
                  {activeCategory.category.name}
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {activeCategory.percentage}%
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                  {formatKz(activeCategory.spent)}
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Despesas</span>
                <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                  {formatKz(totalSpent)}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {categories.length} Categorias
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legenda Interativa */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {slices.map((slice) => (
            <div
              key={slice.category.id}
              onMouseEnter={() => setHoveredIndex(slice.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                hoveredIndex === slice.index
                  ? 'bg-slate-100 dark:bg-slate-800 font-semibold'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span 
                  className="w-3 h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: slice.color }} 
                />
                <span className="text-slate-700 dark:text-slate-300 truncate">
                  {slice.category.name}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono shrink-0">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {formatKz(slice.spent)}
                </span>
                <span className="text-slate-400 text-[11px] w-8 text-right">
                  {slice.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. Gráfico de Metas por Horizonte (Curto, Médio e Longo Prazo)
// ==========================================
interface GoalsHorizonChartProps {
  goals: FinancialGoal[];
  totalSavingsBalance: number;
}

export const GoalsHorizonChart: React.FC<GoalsHorizonChartProps> = ({ goals, totalSavingsBalance }) => {
  const shortGoals = goals.filter((g) => g.term === 'short');
  const mediumGoals = goals.filter((g) => g.term === 'medium');
  const longGoals = goals.filter((g) => g.term === 'long');

  const calcGroup = (list: FinancialGoal[]) => {
    const target = list.reduce((acc, g) => acc + g.targetAmount, 0);
    const saved = list.reduce((acc, g) => acc + g.currentAmount, 0);
    const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
    return { count: list.length, target, saved, pct };
  };

  const shortStats = calcGroup(shortGoals);
  const medStats = calcGroup(mediumGoals);
  const longStats = calcGroup(longGoals);

  const totalGoalsTarget = shortStats.target + medStats.target + longStats.target;
  const totalGoalsSaved = shortStats.saved + medStats.saved + longStats.saved;
  const overallPct = totalGoalsTarget > 0 ? Math.round((totalGoalsSaved / totalGoalsTarget) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Objectivos de Consumo por Prazo & Poupança
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhamento comparativo de metas de curto, médio e longo prazo
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">
            {overallPct}% Coberto
          </span>
          <p className="text-[10px] text-slate-400">
            Poupança Protegida: {formatKz(totalSavingsBalance)}
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        {/* Curto Prazo */}
        <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                Curto Prazo (&lt; 6 meses)
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                {shortStats.count} {shortStats.count === 1 ? 'meta' : 'metas'}
              </span>
            </div>
            <div className="font-mono text-slate-800 dark:text-slate-200">
              <span className="font-bold text-amber-700 dark:text-amber-400">{formatKz(shortStats.saved)}</span>
              <span className="text-slate-400"> / {formatKz(shortStats.target)}</span>
              <span className="ml-2 font-bold">({shortStats.pct}%)</span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-amber-200/50 dark:bg-amber-900/30 rounded-full overflow-hidden">
            <div 
              style={{ width: `${shortStats.pct}%` }} 
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Médio Prazo */}
        <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                Médio Prazo (6 a 24 meses)
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                {medStats.count} {medStats.count === 1 ? 'meta' : 'metas'}
              </span>
            </div>
            <div className="font-mono text-slate-800 dark:text-slate-200">
              <span className="font-bold text-teal-700 dark:text-teal-400">{formatKz(medStats.saved)}</span>
              <span className="text-slate-400"> / {formatKz(medStats.target)}</span>
              <span className="ml-2 font-bold">({medStats.pct}%)</span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-teal-200/50 dark:bg-teal-900/30 rounded-full overflow-hidden">
            <div 
              style={{ width: `${medStats.pct}%` }} 
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Longo Prazo */}
        <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                Longo Prazo (&gt; 2 anos)
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                {longStats.count} {longStats.count === 1 ? 'meta' : 'metas'}
              </span>
            </div>
            <div className="font-mono text-slate-800 dark:text-slate-200">
              <span className="font-bold text-indigo-700 dark:text-indigo-400">{formatKz(longStats.saved)}</span>
              <span className="text-slate-400"> / {formatKz(longStats.target)}</span>
              <span className="ml-2 font-bold">({longStats.pct}%)</span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-indigo-200/50 dark:bg-indigo-900/30 rounded-full overflow-hidden">
            <div 
              style={{ width: `${longStats.pct}%` }} 
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. Gráfico de Alocação de Contas (Liquidez Geral vs Poupança Protegida)
// ==========================================
interface AccountsLiquidityChartProps {
  accounts: Account[];
}

export const AccountsLiquidityChart: React.FC<AccountsLiquidityChartProps> = ({ accounts }) => {
  const totalGeneralBalance = accounts
    .filter((a) => !a.isSavings)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalSavingsBalance = accounts
    .filter((a) => a.isSavings)
    .reduce((sum, a) => sum + a.balance, 0);

  const grandTotal = totalGeneralBalance + totalSavingsBalance;
  const generalPct = grandTotal > 0 ? Math.round((totalGeneralBalance / grandTotal) * 100) : 50;
  const savingsPct = grandTotal > 0 ? Math.round((totalSavingsBalance / grandTotal) * 100) : 50;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Alocação de Saldos & Isolamento da Poupança
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Regra Chrímata: Dinheiro de poupança protegido e isolado do saldo diário
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
          Património Global: {formatKz(grandTotal)}
        </span>
      </div>

      {/* Barra Proporcional */}
      <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex mb-3">
        <div
          style={{ width: `${generalPct}%` }}
          className="bg-emerald-500 h-full transition-all duration-500"
          title={`Saldo Geral Disponível: ${generalPct}%`}
        />
        <div
          style={{ width: `${savingsPct}%` }}
          className="bg-indigo-600 h-full transition-all duration-500"
          title={`Poupança Protegida: ${savingsPct}%`}
        />
      </div>

      <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-emerald-500 shrink-0" />
          <span>Disponível Diário / Operacional ({generalPct}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-indigo-600 shrink-0" />
          <span>Poupança Isolada ({savingsPct}%)</span>
        </div>
      </div>

      {/* Grid de Contas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Saldo Geral Disponível
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Uso Corrente
            </span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">
            {formatKz(totalGeneralBalance)}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Carteira física + Contas Correntes
          </p>
        </div>

        <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Poupança Protegida
            </span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
              Isolado do Geral
            </span>
          </div>
          <p className="text-lg font-bold font-mono text-indigo-700 dark:text-indigo-300">
            {formatKz(totalSavingsBalance)}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Destinado a objectivos e reservas
          </p>
        </div>
      </div>
    </div>
  );
};

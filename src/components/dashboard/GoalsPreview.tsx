import React from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { formatKz, getTermBadge } from '../../utils/currency';
import { Target, ArrowRight, Plus, PiggyBank, ShieldCheck } from 'lucide-react';
import { FinancialGoal } from '../../types/finance';

interface GoalsPreviewProps {
  onGoToGoals: () => void;
  onOpenNewGoal: () => void;
  onContributeGoal: (goal: FinancialGoal) => void;
}

export const GoalsPreview: React.FC<GoalsPreviewProps> = ({
  onGoToGoals,
  onOpenNewGoal,
  onContributeGoal,
}) => {
  const { goals, summary, accounts } = useFinance();

  // Filtrar até 3 metas ativas prioritárias
  const activeGoals = goals
    .filter((g) => g.status === 'active')
    .slice(0, 3);

  const totalGoals = goals.length;
  const coveragePercent = summary.goalsCoverageRate;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Objectivos de Consumo & Poupança
              </h2>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                {activeGoals.length} activos
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Metas de curto, médio e longo prazo vinculadas à sua reserva
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewGoal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Meta</span>
          </button>
          <button
            onClick={onGoToGoals}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <span>Ver Todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Relação Directa: Total Poupado vs Cobertura */}
      <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Almejado em Metas
          </span>
          <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
            {formatKz(summary.totalGoalsTarget)}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Já Poupado
          </span>
          <span className="font-mono text-base font-bold text-emerald-600 tabular-nums">
            {formatKz(summary.totalGoalsSaved)}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-teal-800 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Cobertura pela Poupança</span>
            </span>
            <span className="font-mono font-bold text-teal-900">{coveragePercent}%</span>
          </div>
          <div className="mt-1 w-full h-2 bg-teal-100/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, coveragePercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lista de Metas no Dashboard */}
      {activeGoals.length === 0 ? (
        <div className="text-center py-6 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <p className="text-xs font-semibold text-slate-700">Ainda não definiu nenhum objectivo</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Defina metas de curto, médio ou longo prazo (ex: computador, curso ou reserva).
          </p>
          <button
            onClick={onOpenNewGoal}
            className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Primeiro Objectivo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activeGoals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            const termBadge = getTermBadge(g.term);
            const linkedAcc = g.savingsAccountId
              ? accounts.find((a) => a.id === g.savingsAccountId)
              : null;

            return (
              <div
                key={g.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between bg-white"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${termBadge.badgeClass}`}
                    >
                      {termBadge.label}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 tabular-nums">
                      {pct}%
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 truncate mb-1" title={g.title}>
                    {g.title}
                  </h3>

                  <div className="text-[11px] text-slate-500 font-mono tabular-nums mb-2">
                    {formatKz(g.currentAmount)} / {formatKz(g.targetAmount)}
                  </div>

                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        g.term === 'short'
                          ? 'bg-sky-500'
                          : g.term === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-purple-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {linkedAcc && (
                    <div className="text-[10px] text-teal-800 flex items-center gap-1 truncate mb-3">
                      <PiggyBank className="w-3 h-3 text-teal-600 shrink-0" />
                      <span className="truncate">{linkedAcc.name}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onContributeGoal(g)}
                  className="w-full py-1.5 px-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Aportar Poupança</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

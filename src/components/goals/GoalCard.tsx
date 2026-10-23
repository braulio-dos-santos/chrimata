import React from 'react';
import { FinancialGoal } from '../../types/finance';
import { useFinance } from '../../contexts/FinanceContext';
import { 
  formatKz, 
  formatDatePt, 
  calculateRemainingMonths, 
  calculateMonthlySavingsNeeded,
  getTermBadge 
} from '../../utils/currency';
import { 
  Target, 
  PiggyBank, 
  Calendar, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Plus, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface GoalCardProps {
  goal: FinancialGoal;
  onEdit: (goal: FinancialGoal) => void;
  onContribute: (goal: FinancialGoal) => void;
  onDelete: (goal: FinancialGoal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onContribute,
  onDelete,
}) => {
  const { accounts } = useFinance();

  const percentage = Math.min(
    100,
    Math.round((goal.currentAmount / goal.targetAmount) * 100)
  );

  const isCompleted = goal.status === 'completed' || percentage >= 100;
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const remainingMonths = calculateRemainingMonths(goal.deadline);
  const monthlyNeeded = calculateMonthlySavingsNeeded(
    goal.targetAmount,
    goal.currentAmount,
    goal.deadline
  );

  const termInfo = getTermBadge(goal.term);
  const linkedAccount = goal.savingsAccountId
    ? accounts.find((a) => a.id === goal.savingsAccountId)
    : null;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-xs hover:shadow-md flex flex-col justify-between ${
        isCompleted
          ? 'border-emerald-300 bg-emerald-50/10 ring-1 ring-emerald-500/10'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div>
        {/* Cabeçalho do Card: Badge do Prazo & Ações */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${termInfo.badgeClass}`}
            >
              {termInfo.label}
            </span>

            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {goal.category}
            </span>

            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Alcançado!
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Editar Objectivo"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(goal)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Eliminar Objectivo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Título & Descrição */}
        <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug mb-1">
          {goal.title}
        </h3>
        {goal.notes && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {goal.notes}
          </p>
        )}

        {/* Relação com a Poupança */}
        <div className="mb-4 flex items-center gap-2 text-xs text-teal-800 bg-teal-50/70 border border-teal-200/80 px-2.5 py-1.5 rounded-lg">
          <PiggyBank className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          <span className="truncate">
            {linkedAccount ? (
              <>
                Vinculado a: <strong>{linkedAccount.name}</strong>
              </>
            ) : (
              'Alocado na Reserva Geral de Poupança'
            )}
          </span>
        </div>

        {/* Barra de Progresso e Montantes */}
        <div className="space-y-2 mb-4">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-lg font-extrabold text-slate-900 tabular-nums">
                {formatKz(goal.currentAmount)}
              </span>
              <span className="text-xs text-slate-400">/ {formatKz(goal.targetAmount)}</span>
            </div>
            <span
              className={`font-mono text-xs font-bold tabular-nums ${
                isCompleted ? 'text-emerald-600' : 'text-slate-700'
              }`}
            >
              {percentage}%
            </span>
          </div>

          {/* Track da Barra */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isCompleted
                  ? 'bg-emerald-600'
                  : goal.term === 'short'
                  ? 'bg-sky-500'
                  : goal.term === 'medium'
                  ? 'bg-amber-500'
                  : 'bg-purple-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rodapé: Prazos e Botão de Aporte */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Prazo: {formatDatePt(goal.deadline)}</span>
          </span>

          {!isCompleted && (
            <span className="text-[11px] font-medium text-slate-600">
              {remainingMonths > 0 ? `Faltam ~${remainingMonths} meses` : 'Prazo actual'}
            </span>
          )}
        </div>

        {!isCompleted && remainingMonths > 0 && monthlyNeeded > 0 && (
          <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg flex items-center justify-between">
            <span className="text-slate-500">Poupança mensal recomendada:</span>
            <span className="font-mono font-bold text-slate-800 tabular-nums">
              ~{formatKz(monthlyNeeded)}/mês
            </span>
          </div>
        )}

        <button
          onClick={() => onContribute(goal)}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isCompleted
              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
          }`}
        >
          {isCompleted ? (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Adicionar Aporte Extra</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Aportar Poupança</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

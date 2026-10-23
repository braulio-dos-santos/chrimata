import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { FinancialGoal } from '../../types/finance';
import { formatKz } from '../../utils/currency';
import { X, PiggyBank, ArrowRight, ShieldCheck, Wallet, Landmark } from 'lucide-react';

interface ContributeGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: FinancialGoal | null;
}

export const ContributeGoalModal: React.FC<ContributeGoalModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { accounts, contributeToGoal } = useFinance();

  const [amount, setAmount] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Contas operacionais para débito (Conta Corrente, Minha Carteira)
  const debitAccounts = accounts.filter((a) => !a.isSavings);
  // Conta de poupança vinculada
  const linkedSavingsAccount = goal?.savingsAccountId
    ? accounts.find((a) => a.id === goal.savingsAccountId)
    : accounts.find((a) => a.isSavings);

  React.useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError('');
      setNote('');
      // Seleciona a primeira conta corrente/carteira com saldo positivo por defeito
      const defaultAcc = debitAccounts.find((a) => a.balance > 0) || debitAccounts[0];
      setSourceAccountId(defaultAcc ? defaultAcc.id : '');
    }
  }, [isOpen, goal]);

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const selectedSourceAcc = accounts.find((a) => a.id === sourceAccountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const contributionNum = parseFloat(amount);
    if (isNaN(contributionNum) || contributionNum <= 0) {
      setError('Por favor, introduza um valor de aporte superior a 0 Kz.');
      return;
    }

    if (sourceAccountId && selectedSourceAcc) {
      if (selectedSourceAcc.balance < contributionNum) {
        setError(
          `Saldo insuficiente na conta "${selectedSourceAcc.name}". Saldo actual: ${formatKz(
            selectedSourceAcc.balance
          )}.`
        );
        return;
      }
    }

    try {
      contributeToGoal(
        goal.id,
        contributionNum,
        sourceAccountId || undefined,
        note.trim() || undefined
      );
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao realizar o aporte.');
    }
  };

  const handleQuickPercent = (pct: number) => {
    const calculated = Math.min(
      remaining,
      Math.round(remaining * (pct / 100))
    );
    if (calculated > 0) {
      setAmount(calculated.toString());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Aportar para Objectivo
              </h2>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">
                {goal.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Progresso Actual */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Poupado actual:</span>
            <span className="font-mono font-bold text-slate-900">
              {formatKz(goal.currentAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Meta total almejada:</span>
            <span className="font-mono font-bold text-emerald-700">
              {formatKz(goal.targetAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200">
            <span className="font-semibold text-slate-700">Falta poupar:</span>
            <span className="font-mono font-bold text-teal-800">
              {formatKz(remaining)}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Valor a Aportar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Montante a Guardar (Kz) *
              </label>
              {remaining > 0 && (
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(25)}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-medium cursor-pointer"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(50)}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-medium cursor-pointer"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount(remaining.toString())}
                    className="px-1.5 py-0.5 text-[10px] bg-emerald-50 hover:bg-emerald-100 rounded text-emerald-700 font-bold cursor-pointer"
                  >
                    Total
                  </button>
                </div>
              )}
            </div>
            <input
              type="number"
              required
              min="1"
              step="any"
              placeholder="Ex: 25000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900"
            />
          </div>

          {/* Conta de Origem (Débito) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Debitar de qual Conta / Carteira?
            </label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">Aporte directo (sem débito em conta)</option>
              {debitAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — Disponível: {formatKz(acc.balance)}
                </option>
              ))}
            </select>
          </div>

          {/* Relação Directa com a Poupança */}
          {linkedSavingsAccount && sourceAccountId && (
            <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-200 text-xs text-teal-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span>O valor sairá da conta de uso diário e entrará na </span>
                <strong className="text-teal-900 font-semibold">{linkedSavingsAccount.name}</strong>
                <span>, ficando protegido fora do saldo operacional geral.</span>
              </div>
            </div>
          )}

          {/* Nota */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nota ou Descrição (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Poupança do subsídio de transporte / freelance"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Confirmar Aporte</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

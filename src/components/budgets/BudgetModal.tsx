import React, { useState, useEffect } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Category, Budget } from '../../types/finance';
import { formatKz } from '../../utils/currency';
import { X, Check } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  existingBudget?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  category,
  existingBudget,
}) => {
  const { categories, saveBudget, selectedMonthYear } = useFinance();
  const [selectedCatId, setSelectedCatId] = useState('');
  const [amountLimit, setAmountLimit] = useState('');
  const [error, setError] = useState<string | null>(null);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  useEffect(() => {
    if (category) {
      setSelectedCatId(category.id);
    } else if (existingBudget) {
      setSelectedCatId(existingBudget.categoryId);
    } else if (expenseCategories.length > 0) {
      setSelectedCatId(expenseCategories[0].id);
    }

    if (existingBudget) {
      setAmountLimit(String(existingBudget.amountLimit));
    } else {
      setAmountLimit('');
    }
    setError(null);
  }, [category, existingBudget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericLimit = parseFloat(amountLimit.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numericLimit) || numericLimit <= 0) {
      setError('Por favor, defina um tecto orçamental válido em Kwanzas (maior que zero).');
      return;
    }

    if (!selectedCatId) {
      setError('Por favor, seleccione a categoria de despesa.');
      return;
    }

    saveBudget(selectedCatId, numericLimit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {existingBudget ? 'Actualizar Orçamento' : 'Definir Tecto Orçamental'}
            </h2>
            <p className="text-xs text-slate-500">
              Mês de referência: <strong className="text-slate-700">{selectedMonthYear}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Categoria de Despesa *
            </label>
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              disabled={!!category}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-75"
              required
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Limite Mensal em Kwanzas (Kz) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={amountLimit}
                onChange={(e) => setAmountLimit(e.target.value)}
                placeholder="Ex.: 45000"
                className="w-full pl-3.5 pr-14 py-2.5 text-base font-mono tabular-nums font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Kz
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              O sistema alertará quando atingir 80% e 100% deste limite.
            </p>
          </div>

          {/* Acções */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Orçamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

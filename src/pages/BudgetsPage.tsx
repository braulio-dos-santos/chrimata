import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Category, Budget } from '../types/finance';
import { formatKz } from '../utils/currency';
import { BudgetModal } from '../components/budgets/BudgetModal';
import { 
  PieChart, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const { 
    categories, 
    budgets, 
    transactions, 
    selectedMonthYear, 
    setSelectedMonthYear, 
    deleteBudget 
  } = useFinance();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Calcular gastos por categoria no mês seleccionado
  const monthTransactions = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(selectedMonthYear)
  );

  const budgetItems = expenseCategories.map((cat) => {
    const budget = budgets.find((b) => b.categoryId === cat.id);
    const spent = monthTransactions
      .filter((t) => t.categoryId === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);

    const limit = budget ? budget.amountLimit : 0;
    const remaining = limit - spent;
    const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

    return {
      category: cat,
      budget,
      spent,
      limit,
      remaining,
      percentage,
      isOverBudget: limit > 0 && spent > limit,
      isNearLimit: limit > 0 && spent >= limit * 0.8 && spent <= limit,
    };
  });

  // Totais orçamentais
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.amountLimit, 0);
  const totalBudgetSpent = budgetItems
    .filter((b) => b.budget)
    .reduce((sum, b) => sum + b.spent, 0);
  const remainingTotal = totalBudgetLimit - totalBudgetSpent;

  const handleEditBudget = (item: typeof budgetItems[0]) => {
    setSelectedCategory(item.category);
    setEditingBudget(item.budget || null);
    setModalOpen(true);
  };

  const handleCreateNewBudget = () => {
    setSelectedCategory(null);
    setEditingBudget(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Header & Seletor de Mês */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Gestão de Orçamentos Mensais
          </h1>
          <p className="text-xs text-slate-500">
            Defina limites de segurança por categoria e evite surpresas no final do mês
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleCreateNewBudget}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Definir Tecto</span>
          </button>
        </div>
      </div>

      {/* Cartões de Resumo do Orçamento Geral */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Total Planeado (Tecto)
          </span>
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatKz(totalBudgetLimit)}
          </span>
          <p className="mt-1 text-xs text-slate-400">
            {budgets.length} categorias orçamentadas
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Total Consumido
          </span>
          <span className="text-2xl font-bold font-mono tabular-nums text-rose-600">
            {formatKz(totalBudgetSpent)}
          </span>
          <p className="mt-1 text-xs text-slate-400">
            {totalBudgetLimit > 0 ? `${Math.round((totalBudgetSpent / totalBudgetLimit) * 100)}% consumido` : '0%'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Margem Disponível
          </span>
          <span className={`text-2xl font-bold font-mono tabular-nums ${
            remainingTotal >= 0 ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            {formatKz(remainingTotal, true)}
          </span>
          <p className="mt-1 text-xs text-slate-400">
            {remainingTotal >= 0 ? 'Dentro do plano mensal' : 'Orçamento geral ultrapassado'}
          </p>
        </div>
      </div>

      {/* Lista de Categorias e Seus Tectos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Desempenho por Categoria
            </h3>
            <p className="text-xs text-slate-500">
              Monitore o consumo em tempo real com base nas despesas registadas
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {budgetItems.map((item) => {
            const hasBudget = !!item.budget;

            return (
              <div
                key={item.category.id}
                className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.category.color }}
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        {item.category.name}
                      </span>
                      {item.isOverBudget && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3" />
                          Excedido em {formatKz(Math.abs(item.remaining))}
                        </span>
                      )}
                      {item.isNearLimit && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          Atenção: Atingiu {item.percentage}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-xs font-mono tabular-nums font-bold text-slate-900">
                        {formatKz(item.spent)}
                      </span>
                      {hasBudget ? (
                        <span className="text-xs text-slate-400 font-mono">
                          {' '}/ {formatKz(item.limit)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 block">Sem tecto definido</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditBudget(item)}
                        title={hasBudget ? 'Editar tecto' : 'Definir tecto'}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {hasBudget && item.budget && (
                        <button
                          onClick={() => {
                            if (item.budget && confirm(`Remover orçamento de ${item.category.name}?`)) {
                              deleteBudget(item.budget.id);
                            }
                          }}
                          title="Remover tecto"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Barra de Progresso */}
                {hasBudget ? (
                  <div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.isOverBudget
                            ? 'bg-rose-500'
                            : item.percentage >= 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono">
                      <span>{item.percentage}% gasto</span>
                      <span>
                        {item.remaining >= 0
                          ? `Resta ${formatKz(item.remaining)}`
                          : `Ultrapassou ${formatKz(Math.abs(item.remaining))}`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic">
                    Clique no botão de edição para fixar um limite mensal nesta categoria.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Configuração de Tecto */}
      <BudgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={selectedCategory}
        existingBudget={editingBudget}
      />
    </div>
  );
};

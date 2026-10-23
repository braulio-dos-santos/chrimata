import React, { useState, useEffect } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { FinancialGoal, GoalTerm } from '../../types/finance';
import { X, Target, PiggyBank, Calendar, DollarSign, Tag, Clock } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal?: FinancialGoal | null;
}

const GOAL_CATEGORIES = [
  'Tecnologia & Equipamentos',
  'Educação & Especialização',
  'Reserva & Segurança',
  'Transporte & Veículo',
  'Habitação & Casa',
  'Viagens & Lazer',
  'Saúde & Bem-Estar',
  'Negócio & Empreendedorismo',
  'Outro Consumo',
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  editingGoal,
}) => {
  const { accounts, saveGoal } = useFinance();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [term, setTerm] = useState<GoalTerm>('short');
  const [category, setCategory] = useState(GOAL_CATEGORIES[0]);
  const [savingsAccountId, setSavingsAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Apenas contas do tipo Poupança (isSavings = true)
  const savingsAccounts = accounts.filter((a) => a.isSavings);

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setTargetAmount(editingGoal.targetAmount.toString());
      setCurrentAmount(editingGoal.currentAmount.toString());
      setDeadline(editingGoal.deadline);
      setTerm(editingGoal.term);
      setCategory(editingGoal.category);
      setSavingsAccountId(editingGoal.savingsAccountId || '');
      setNotes(editingGoal.notes || '');
    } else {
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      // Data padrão: 6 meses a partir de hoje para curto prazo
      const future = new Date();
      future.setMonth(future.getMonth() + 6);
      setDeadline(future.toISOString().split('T')[0]);
      setTerm('short');
      setCategory(GOAL_CATEGORIES[0]);
      setSavingsAccountId(savingsAccounts.length > 0 ? savingsAccounts[0].id : '');
      setNotes('');
    }
    setError('');
  }, [editingGoal, isOpen]);

  // Ao alterar o termo, sugere uma data padrão condizente se o utilizador não tiver editado
  const handleTermChange = (newTerm: GoalTerm) => {
    setTerm(newTerm);
    const date = new Date();
    if (newTerm === 'short') {
      date.setMonth(date.getMonth() + 8);
    } else if (newTerm === 'medium') {
      date.setFullYear(date.getFullYear() + 2);
    } else {
      date.setFullYear(date.getFullYear() + 5);
    }
    setDeadline(date.toISOString().split('T')[0]);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetNum = parseFloat(targetAmount);
    const currentNum = parseFloat(currentAmount || '0');

    if (!title.trim()) {
      setError('Por favor, introduza o nome do objectivo.');
      return;
    }

    if (isNaN(targetNum) || targetNum <= 0) {
      setError('O montante objectivo deve ser um valor numérico superior a 0 Kz.');
      return;
    }

    if (isNaN(currentNum) || currentNum < 0) {
      setError('O valor poupado actual não pode ser negativo.');
      return;
    }

    if (!deadline) {
      setError('Por favor, defina a data limite para este objectivo.');
      return;
    }

    try {
      saveGoal({
        ...(editingGoal ? { id: editingGoal.id } : {}),
        title: title.trim(),
        targetAmount: targetNum,
        currentAmount: currentNum,
        deadline,
        term,
        category,
        savingsAccountId: savingsAccountId || undefined,
        status: currentNum >= targetNum ? 'completed' : 'active',
        notes: notes.trim() || undefined,
      });

      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao guardar o objectivo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingGoal ? 'Editar Objectivo de Consumo' : 'Novo Objectivo de Consumo'}
              </h2>
              <p className="text-xs text-slate-500">
                Planeamento financeiro vinculado à sua Poupança
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

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Título do Objectivo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome do Objectivo *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Ex: Computador Portátil, Entrada de Viatura, Curso TI"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>
          </div>

          {/* Horizonte Temporal: Curto, Médio ou Longo Prazo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Horizonte Temporal *</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTermChange('short')}
                className={`py-2 px-2.5 text-xs font-semibold rounded-lg border transition-all text-center cursor-pointer ${
                  term === 'short'
                    ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold">Curto Prazo</div>
                <div className="text-[10px] opacity-75">Até 1 ano</div>
              </button>

              <button
                type="button"
                onClick={() => handleTermChange('medium')}
                className={`py-2 px-2.5 text-xs font-semibold rounded-lg border transition-all text-center cursor-pointer ${
                  term === 'medium'
                    ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold">Médio Prazo</div>
                <div className="text-[10px] opacity-75">1 a 3 anos</div>
              </button>

              <button
                type="button"
                onClick={() => handleTermChange('long')}
                className={`py-2 px-2.5 text-xs font-semibold rounded-lg border transition-all text-center cursor-pointer ${
                  term === 'long'
                    ? 'border-purple-500 bg-purple-50 text-purple-800 ring-2 ring-purple-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold">Longo Prazo</div>
                <div className="text-[10px] opacity-75">&gt; 3 anos</div>
              </button>
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span>Categoria de Consumo</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium bg-white"
            >
              {GOAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Valores: Meta e Poupado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                <span>Meta Alvo (Kz) *</span>
              </label>
              <input
                type="number"
                required
                min="1"
                step="any"
                placeholder="Ex: 350000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Já Poupado Inicialmente (Kz)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-slate-700"
              />
            </div>
          </div>

          {/* Data Limite */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Data Limite Prevista *</span>
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          {/* Relação Directa com a Poupança */}
          <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2">
            <label className="block text-xs font-bold text-teal-900 flex items-center gap-1.5">
              <PiggyBank className="w-4 h-4 text-teal-700" />
              <span>Vincular à Conta de Poupança</span>
            </label>
            <p className="text-[11px] text-teal-800 leading-relaxed">
              Associe esta meta à sua conta de Poupança para que os aportes fiquem protegidos
              e separados do seu saldo corrente operacional do dia-a-dia.
            </p>
            <select
              value={savingsAccountId}
              onChange={(e) => setSavingsAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-teal-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-800"
            >
              <option value="">Sem conta específica (Usar Poupança Geral)</option>
              {savingsAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Saldo actual: {acc.balance.toLocaleString('pt-AO')} Kz)
                </option>
              ))}
            </select>
          </div>

          {/* Notas Adicionais */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas ou Motivação (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Essencial para terminar o semestre, ou para evitar juros de empréstimos."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
            />
          </div>

          {/* Botões de Submissão */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Target className="w-4 h-4" />
              <span>{editingGoal ? 'Guardar Alterações' : 'Criar Objectivo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Transaction, TransactionType, PaymentMethod } from '../../types/finance';
import { formatKz } from '../../utils/currency';
import { X, ArrowUpRight, ArrowDownRight, Check, Wallet, Landmark } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editingTransaction,
}) => {
  const { categories, accounts, addTransaction, updateTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('multicaixa');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const availableCategories = categories.filter((c) => c.type === (type === 'transfer' ? 'expense' : type));

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setTitle(editingTransaction.title);
      setAmount(String(editingTransaction.amount));
      setCategoryId(editingTransaction.categoryId);
      setAccountId(editingTransaction.accountId || (accounts.length > 0 ? accounts[0].id : ''));
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod || 'multicaixa');
      setDescription(editingTransaction.description || '');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      const defaultCat = categories.find((c) => c.type === 'expense');
      setCategoryId(defaultCat ? defaultCat.id : '');
      const defaultAcc = accounts.find((a) => !a.isSavings) || accounts[0];
      setAccountId(defaultAcc ? defaultAcc.id : '');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('multicaixa');
      setDescription('');
    }
    setError(null);
  }, [editingTransaction, isOpen, categories, accounts]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstCat = categories.find((c) => c.type === newType);
    if (firstCat) {
      setCategoryId(firstCat.id);
    }
  };

  const handleAccountChange = (accId: string) => {
    setAccountId(accId);
    const selectedAcc = accounts.find((a) => a.id === accId);
    if (selectedAcc) {
      if (selectedAcc.type === 'cash') {
        setPaymentMethod('dinheiro');
      } else if (selectedAcc.type === 'checking') {
        setPaymentMethod('multicaixa');
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Por favor, informe a descrição ou título da transacção.');
      return;
    }

    const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Por favor, insira um valor monetário válido em Kwanzas (maior que zero).');
      return;
    }

    if (!categoryId) {
      setError('Por favor, seleccione uma categoria.');
      return;
    }

    if (!date) {
      setError('Por favor, seleccione a data da transacção.');
      return;
    }

    if (editingTransaction) {
      updateTransaction({
        ...editingTransaction,
        title: title.trim(),
        amount: numericAmount,
        type,
        categoryId,
        accountId: accountId || undefined,
        date,
        paymentMethod,
        description: description.trim(),
      });
    } else {
      addTransaction({
        title: title.trim(),
        amount: numericAmount,
        type,
        categoryId,
        accountId: accountId || undefined,
        date,
        paymentMethod,
        description: description.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {editingTransaction ? 'Editar Transacção' : 'Registar Nova Transacção'}
            </h2>
            <p className="text-xs text-slate-500">
              Mantenha o registo actualizado para reflectir o seu saldo real
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Selector de Tipo (Receita vs Despesa) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipo de Movimento
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Despesa (Saída)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  type === 'income'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Receita (Entrada)</span>
              </button>
            </div>
          </div>

          {/* Título / O que foi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título / Descrição Curta *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Compras no Candando, Salário, Recarga de dados..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              required
            />
          </div>

          {/* Montante em Kz */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Valor em Kwanzas (Kz) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full pl-3.5 pr-14 py-2.5 text-base font-mono tabular-nums font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Kz
              </span>
            </div>
          </div>

          {/* Conta Associada */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Conta a Movimentar *
            </label>
            <select
              value={accountId}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              required
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatKz(a.balance)}) {a.isSavings ? '· [Poupança]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Categoria & Data (2 colunas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                required
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data do Movimento *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Método de Pagamento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Canal / Método de Pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="multicaixa">Multicaixa / Multicaixa Express</option>
              <option value="transferencia">Transferência Bancária (IBAN / Directo)</option>
              <option value="dinheiro">Dinheiro Físico (Carteira)</option>
              <option value="outro">Outro Meio</option>
            </select>
          </div>

          {/* Observações Opcionais */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas Adicionais (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Referente a despesas partilhadas com colega..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Footer Acções */}
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
              <span>{editingTransaction ? 'Guardar Alterações' : 'Confirmar Transacção'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

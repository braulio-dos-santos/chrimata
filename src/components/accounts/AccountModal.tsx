import React, { useState, useEffect } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Account, AccountType } from '../../types/finance';
import { X, Check, Wallet, Landmark, PiggyBank, PlusCircle } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAccount?: Account | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  editingAccount,
}) => {
  const { createAccount, updateAccount } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#0284C7');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setType(editingAccount.type);
      setBalance(String(editingAccount.balance));
      setColor(editingAccount.color || '#0284C7');
    } else {
      setName('');
      setType('checking');
      setBalance('0');
      setColor('#0284C7');
    }
    setError(null);
  }, [editingAccount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor, indique um nome para a conta.');
      return;
    }

    const numericBalance = parseFloat(balance.replace(/\./g, '').replace(',', '.')) || 0;

    if (editingAccount) {
      updateAccount({
        ...editingAccount,
        name: name.trim(),
        type,
        balance: numericBalance,
        color,
        isSavings: type === 'savings',
      });
    } else {
      createAccount({
        name: name.trim(),
        type,
        balance: numericBalance,
        color,
        isSavings: type === 'savings',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {editingAccount ? 'Editar Conta' : 'Adicionar Nova Conta'}
            </h2>
            <p className="text-xs text-slate-500">
              Controle carteira física, bancos e contas de poupança
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

          {/* Nome da Conta */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome da Conta *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: BFA Salário, BAI Directo, Dinheiro em Casa..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          {/* Tipo de Conta */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipo de Conta *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setType('checking'); setColor('#0284C7'); }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  type === 'checking'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Landmark className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold">Conta Corrente</span>
                </div>
                <p className="text-[10px] text-slate-500">Banco, cartões, salário</p>
              </button>

              <button
                type="button"
                onClick={() => { setType('cash'); setColor('#16A34A'); }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  type === 'cash'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold">Minha Carteira</span>
                </div>
                <p className="text-[10px] text-slate-500">Dinheiro físico em mão</p>
              </button>

              <button
                type="button"
                onClick={() => { setType('savings'); setColor('#0F766E'); }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  type === 'savings'
                    ? 'border-teal-700 bg-teal-50/70 text-teal-950 font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <PiggyBank className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-bold">Poupança</span>
                </div>
                <p className="text-[10px] text-slate-500">Protegida do saldo geral</p>
              </button>

              <button
                type="button"
                onClick={() => { setType('custom'); setColor('#8B5CF6'); }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  type === 'custom'
                    ? 'border-violet-600 bg-violet-50/70 text-violet-900'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <PlusCircle className="w-4 h-4 text-violet-600" />
                  <span className="text-xs font-bold">Outra Conta</span>
                </div>
                <p className="text-[10px] text-slate-500">Cofre, grupo, investimentos</p>
              </button>
            </div>

            {/* Aviso sobre a regra de poupança */}
            {type === 'savings' && (
              <div className="mt-2.5 p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-[11px] text-teal-900 leading-tight">
                🛡️ <strong>Regra Chrímata:</strong> O saldo de contas de Poupança é protegido e <strong>não é contabilizado no Saldo Geral Operacional</strong>, garantindo que não gasta as suas reservas por engano.
              </div>
            )}
          </div>

          {/* Saldo Inicial em Kz */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Saldo Inicial em Kwanzas (Kz)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0,00"
                className="w-full pl-3.5 pr-14 py-2 text-sm font-mono tabular-nums font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Kz
              </span>
            </div>
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
              <span>{editingAccount ? 'Guardar Conta' : 'Criar Conta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

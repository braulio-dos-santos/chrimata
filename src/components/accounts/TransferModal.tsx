import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { formatKz } from '../../utils/currency';
import { X, ArrowRight, ArrowLeftRight, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFromAccountId?: string;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  defaultFromAccountId,
}) => {
  const { accounts, transferBetweenAccounts } = useFinance();

  const [fromAccountId, setFromAccountId] = useState(
    defaultFromAccountId || (accounts.length > 0 ? accounts[0].id : '')
  );
  const [toAccountId, setToAccountId] = useState(
    accounts.length > 1 ? accounts[1].id : ''
  );
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const fromAccount = accounts.find((a) => a.id === fromAccountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);

  const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0;
  const isFromSavings = fromAccount?.isSavings;
  const isToSavings = toAccount?.isSavings;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fromAccountId || !toAccountId) {
      setError('Por favor, seleccione as duas contas intervenientes.');
      return;
    }

    if (fromAccountId === toAccountId) {
      setError('A conta de origem não pode ser idêntica à conta de destino.');
      return;
    }

    if (numericAmount <= 0) {
      setError('Por favor, insira um montante válido para transferir.');
      return;
    }

    if (fromAccount && fromAccount.balance < numericAmount) {
      setError(
        `Saldo insuficiente na conta de origem (${fromAccount.name}). Saldo actual: ${formatKz(
          fromAccount.balance
        )}.`
      );
      return;
    }

    try {
      transferBetweenAccounts(
        fromAccountId,
        toAccountId,
        numericAmount,
        date,
        description.trim()
      );
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao processar a transferência.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Transferência entre Contas
              </h2>
              <p className="text-xs text-slate-500">
                Mova fundos entre Conta Corrente, Carteira física e Poupança
              </p>
            </div>
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
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Selecção de Contas (Origem -> Destino) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            {/* Origem */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                De (Origem)
              </label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({formatKz(a.balance)})
                  </option>
                ))}
              </select>
              {fromAccount && (
                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                  Saldo: <strong>{formatKz(fromAccount.balance)}</strong>
                </div>
              )}
            </div>

            {/* Destino */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Para (Destino)
              </label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id} disabled={a.id === fromAccountId}>
                    {a.name} ({formatKz(a.balance)})
                  </option>
                ))}
              </select>
              {toAccount && (
                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                  Saldo: <strong>{formatKz(toAccount.balance)}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Valor da Transferência */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Montante a Transferir em Kwanzas (Kz) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full pl-3.5 pr-14 py-2 text-base font-mono tabular-nums font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Kz
              </span>
            </div>
          </div>

          {/* Data & Motivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data da Transferência *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motivo / Nota (Opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex.: Dinheiro para táxi, aporte poupança..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Feedback Didáctico de Impacto no Saldo Geral vs Poupança */}
          <div className="p-3 rounded-xl border text-xs space-y-1">
            {isToSavings && !isFromSavings && (
              <div className="text-teal-900 bg-teal-50/80 -m-3 p-3 rounded-xl border border-teal-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Aporte de Poupança:</strong> Este valor ({formatKz(numericAmount)}) será transferido para a Poupança e <strong>sairá do seu saldo geral disponível</strong>, ficando protegido contra gastos impulsivos.
                </div>
              </div>
            )}

            {!isToSavings && isFromSavings && (
              <div className="text-amber-900 bg-amber-50/80 -m-3 p-3 rounded-xl border border-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Resgate da Poupança:</strong> Está a retirar fundos da sua reserva. O valor entrará no seu saldo geral disponível para utilização.
                </div>
              </div>
            )}

            {!isToSavings && !isFromSavings && (
              <div className="text-slate-600 bg-slate-50 -m-3 p-3 rounded-xl border border-slate-200 flex items-start gap-2">
                <ArrowLeftRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Transferência Interna:</strong> O dinheiro apenas muda de canal (ex.: de conta bancária para dinheiro vivo em carteira). O seu saldo operacional geral permanece inalterado.
                </div>
              </div>
            )}
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
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Transferência</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

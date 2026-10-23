import React, { useState } from 'react';
import { formatKz } from '../../utils/currency';
import { ShieldCheck, Calendar, ArrowRight } from 'lucide-react';

export const EmergencyFundCalculator: React.FC = () => {
  const [essentialExpense, setEssentialExpense] = useState('80000');
  const [monthsCount, setMonthsCount] = useState<number>(6);
  const [monthlyContribution, setMonthlyContribution] = useState('20000');

  const numericExpense = parseFloat(essentialExpense.replace(/\./g, '').replace(',', '.')) || 0;
  const numericContribution = parseFloat(monthlyContribution.replace(/\./g, '').replace(',', '.')) || 1;

  const targetFund = numericExpense * monthsCount;
  const monthsToReach = Math.ceil(targetFund / Math.max(numericContribution, 1));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center gap-2 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-1">
        <ShieldCheck className="w-4 h-4" />
        <span>Reserva de Segurança</span>
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">
        Simulador de Fundo de Emergência
      </h3>
      <p className="text-xs text-slate-500 mb-6">
        Calcule quanto precisa para ter uma rede de protecção contra imprevistos de saúde, avarias ou quebras de rendimento
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Despesas Mensais Básicas */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Gasto Mensal Essencial (Kz)
          </label>
          <div className="relative">
            <input
              type="number"
              value={essentialExpense}
              onChange={(e) => setEssentialExpense(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-sm font-mono tabular-nums font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              Kz
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Apenas habitação, comida e saúde
          </span>
        </div>

        {/* Quantidade de Meses de Cobertura */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Meses de Cobertura Desejados
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[3, 6, 12].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonthsCount(m)}
                className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  monthsCount === m
                    ? 'bg-teal-700 border-teal-700 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {m} Meses
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {monthsCount === 3 ? 'Mínimo para estudantes' : monthsCount === 6 ? 'Padrão recomendado' : 'Máxima tranquilidade'}
          </span>
        </div>

        {/* Aporte Mensal Pretendido */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Poupança Mensal Possível (Kz)
          </label>
          <div className="relative">
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-sm font-mono tabular-nums font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              Kz
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            O valor que consegue guardar todo mês
          </span>
        </div>
      </div>

      {/* Resultado Consolidado */}
      <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider block mb-0.5">
            Meta Total da sua Reserva
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-950">
            {formatKz(targetFund)}
          </div>
          <p className="text-xs text-teal-800 mt-1">
            Cobre <strong>{monthsCount} meses</strong> de sobrevivência digna sem depender de empréstimos.
          </p>
        </div>

        <div className="sm:text-right shrink-0 bg-white px-4 py-2.5 rounded-lg border border-teal-200/80 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">
            Tempo para Conclusão
          </span>
          <span className="text-lg font-bold font-mono text-slate-900">
            {monthsToReach} {monthsToReach === 1 ? 'mês' : 'meses'}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            Guardando {formatKz(numericContribution)}/mês
          </span>
        </div>
      </div>
    </div>
  );
};

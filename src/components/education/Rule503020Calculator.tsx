import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { formatKz } from '../../utils/currency';
import { Calculator, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export const Rule503020Calculator: React.FC = () => {
  const { summary } = useFinance();
  const [incomeInput, setIncomeInput] = useState<string>(
    summary.monthlyIncome > 0 ? String(summary.monthlyIncome) : '150000'
  );

  const numericIncome = parseFloat(incomeInput.replace(/\./g, '').replace(',', '.')) || 0;

  // Divisão 50/30/20
  const needs50 = numericIncome * 0.50;
  const wants30 = numericIncome * 0.30;
  const savings20 = numericIncome * 0.20;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>Simulador Interactivo</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Calculadora da Regra 50 / 30 / 20
          </h3>
          <p className="text-xs text-slate-500">
            Descubra quanto deve destinar a cada área do seu orçamento com base no seu ganho mensal
          </p>
        </div>

        {/* Campo de rendimento com Kz */}
        <div className="sm:w-64">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Rendimento Mensal (Kz)
          </label>
          <div className="relative">
            <input
              type="number"
              value={incomeInput}
              onChange={(e) => setIncomeInput(e.target.value)}
              className="w-full pl-3 pr-10 py-1.5 text-sm font-mono tabular-nums font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              Kz
            </span>
          </div>
        </div>
      </div>

      {/* Os 3 Pilares da Regra */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        
        {/* 50% Necessidades */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                50% Necessidades
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                Essencial
              </span>
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mb-2">
              {formatKz(needs50)}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Custos básicos de sobrevivência: Habitação/Renda, alimentação do mês, transporte diário, contas de luz (ENDE), água e saúde.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-600">
            Tecto sugerido: <strong>{formatKz(needs50)}</strong>
          </div>
        </div>

        {/* 30% Desejos */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                30% Desejos
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                Estilo de Vida
              </span>
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mb-2">
              {formatKz(wants30)}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Conforto e qualidade de vida: Lazer em família, almoços fora, roupas novas, pacotes de internet extra, hobbies e convívio.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-600">
            Tecto sugerido: <strong>{formatKz(wants30)}</strong>
          </div>
        </div>

        {/* 20% Futuro / Poupança */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                20% Futuro
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Crescimento
              </span>
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mb-2">
              {formatKz(savings20)}
            </div>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              O seu escudo de tranquilidade: Aportes para o fundo de emergência, liquidação de dívidas e investimentos (depósitos a prazo, BTs/OTs).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-200 text-[11px] text-emerald-800 font-medium">
            Meta de poupança mensal: <strong>{formatKz(savings20)}</strong>
          </div>
        </div>
      </div>

      {/* Nota educativa de contexto local */}
      <div className="mt-4 p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-800 font-semibold">Dica para a nossa realidade em Angola:</strong> Se os preços actuais do cesto básico e dos transportes em Luanda ultrapassarem 50%, não desanime. Pode calibrar provisoriamente para <strong>60% Necessidades / 25% Desejos / 15% Poupança</strong>. O importante é o hábito inegociável de poupar todos os meses!
        </p>
      </div>
    </div>
  );
};

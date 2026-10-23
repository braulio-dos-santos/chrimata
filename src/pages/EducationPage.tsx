import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Rule503020Calculator } from '../components/education/Rule503020Calculator';
import { EmergencyFundCalculator } from '../components/education/EmergencyFundCalculator';
import { 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  TrendingUp, 
  ShieldAlert, 
  PiggyBank, 
  GraduationCap, 
  Briefcase,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const EducationPage: React.FC = () => {
  const { tips } = useFinance();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTipId, setExpandedTipId] = useState<string | null>('tip_503020');

  const filteredTips = selectedCategory === 'all'
    ? tips
    : tips.filter((t) => t.category === selectedCategory);

  // Glossário financeiro prático de Angola
  const glossaryItems = [
    {
      term: 'BODIVA (Bolsa de Dívida e Valores de Angola)',
      def: 'Mercado oficial onde se transaccionam obrigações do Estado, títulos de empresas e acções em moeda nacional.',
    },
    {
      term: 'BTs (Bilhetes do Tesouro)',
      def: 'Títulos de dívida de curto prazo (até 364 dias) emitidos pelo Ministério das Finanças. Excelente opção para iniciantes que pretendem rentabilizar poupanças sem risco de perda do capital nominal.',
    },
    {
      term: 'OTs (Obrigações do Tesouro)',
      def: 'Títulos de dívida pública de médio e longo prazo (2 a 10 anos) que pagam juros periódicos (cupões). Adequadas para quem planeia a mais de 3 anos.',
    },
    {
      term: 'Depósito a Prazo',
      def: 'Contrato com um banco comercial onde guarda o seu dinheiro por um período definido em troca de uma taxa de juro fixa. É a base ideal para o fundo de emergência.',
    },
    {
      term: 'Taxa de Juro e Spread',
      def: 'O custo de pedir dinheiro emprestado ou o rendimento de emprestar ao banco. O spread é a margem de lucro cobrada pela instituição financeira.',
    },
    {
      term: 'Dívida Tóxica',
      def: 'Empréstimos contraídos para financiar itens supérfluos ou com juros exorbitantes informais (como agiotas), que corroem o salário antes do mês terminar.',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2 border border-emerald-200/80">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>Educação Financeira Chrímata</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Aprenda a Dominar as Suas Finanças
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Conhecimento prático e ferramentas interactivas pensadas para a realidade de quem estuda e trabalha em Angola.
        </p>
      </div>

      {/* Ferramenta 1: Calculadora 50/30/20 */}
      <section>
        <Rule503020Calculator />
      </section>

      {/* Ferramenta 2: Simulador de Fundo de Emergência */}
      <section>
        <EmergencyFundCalculator />
      </section>

      {/* Secção 3: Artigos e Dicas Práticas */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Guia Prático de Literacia Financeira
            </h2>
            <p className="text-xs text-slate-500">
              Lições objectivas para aplicar no seu dia-a-dia
            </p>
          </div>

          {/* Filtro de Categoria dos Artigos */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'orcamento', label: 'Orçamento' },
              { id: 'poupanca', label: 'Poupança' },
              { id: 'dividas', label: 'Dívidas' },
              { id: 'investimento', label: 'Investimentos' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista com Accordion de Dicas */}
        <div className="space-y-3">
          {filteredTips.map((tip) => {
            const isExpanded = expandedTipId === tip.id;

            return (
              <div
                key={tip.id}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-slate-50/30"
              >
                <button
                  onClick={() => setExpandedTipId(isExpanded ? null : tip.id)}
                  className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      {tip.category === 'poupanca' ? (
                        <PiggyBank className="w-4 h-4" />
                      ) : tip.category === 'investimento' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : tip.category === 'dividas' ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {tip.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {tip.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-400 capitalize">
                      {tip.difficulty} · {tip.readTime}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 sm:p-6 bg-white border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
                    <div className="whitespace-pre-line text-slate-600 leading-relaxed font-normal">
                      {tip.content}
                    </div>

                    {tip.practicalAction && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                        ✨ <strong>Acção sugerida:</strong> {tip.practicalAction}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Secção 4: Glossário Financeiro Angolano */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Glossário de Termos Financeiros em Angola
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Conceitos essenciais explicados em linguagem simples e directa
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {glossaryItems.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition-all"
            >
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                {item.term}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.def}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

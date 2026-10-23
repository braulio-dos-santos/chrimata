import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  PieChart, 
  BookOpen, 
  TrendingUp,
  Sparkles,
  Wallet,
  Landmark,
  PiggyBank,
  ArrowLeftRight
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onGoToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onGoToLogin }) => {

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Texto Principal */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-6 border border-emerald-200/80">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gestão Multi-Contas & Literacia em Angola</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
                Controle a sua <span className="text-blue-600">Conta Corrente</span>, <span className="text-emerald-600">Carteira</span> e proteja a sua <span className="text-teal-700">Poupança</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
                No Chrímata, o dinheiro da sua <strong>Poupança não entra no saldo geral operacional</strong>, garantindo que as suas reservas ficam a salvo. Faça transferências ágeis entre contas, acompanhe o dinheiro vivo da carteira e aprenda a investir o seu Kwanza.
              </p>

              {/* Botões de Acção */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <button
                  onClick={onGetStarted}
                  className="px-6 py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Começar Agora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onGoToLogin}
                  className="px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  Já tenho conta
                </button>
              </div>
            </div>

            {/* Mockup Visual Rico do Sistema Multi-Contas do Chrímata */}
            <div className="relative">
              <div className="rounded-3xl border border-slate-200/90 shadow-2xl bg-white p-6 space-y-4">
                
                {/* Cabeçalho do mockup */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">chrimata.ao/dashboard</span>
                </div>

                {/* Exibição das 3 Contas Principais */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-1.5 text-blue-900 text-xs font-bold mb-1">
                      <Landmark className="w-3.5 h-3.5 text-blue-700" />
                      <span>Conta Corrente</span>
                    </div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      310.500,00 Kz
                    </div>
                    <span className="text-[10px] text-blue-700">Operacional</span>
                  </div>

                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-1.5 text-emerald-900 text-xs font-bold mb-1">
                      <Wallet className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Minha Carteira</span>
                    </div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      34.500,00 Kz
                    </div>
                    <span className="text-[10px] text-emerald-700">Dinheiro Físico</span>
                  </div>

                  <div className="p-3 bg-teal-50 rounded-xl border border-teal-300">
                    <div className="flex items-center gap-1.5 text-teal-950 text-xs font-bold mb-1">
                      <PiggyBank className="w-3.5 h-3.5 text-teal-800" />
                      <span>Poupança</span>
                    </div>
                    <div className="text-sm font-bold font-mono text-teal-950">
                      620.000,00 Kz
                    </div>
                    <span className="text-[10px] text-teal-800 font-semibold">🛡️ Isolada do Geral</span>
                  </div>
                </div>

                {/* Saldo Geral Disponível em destaque */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Saldo Geral Disponível (Sem Poupança)
                    </span>
                    <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                      345.000,00 Kz
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-700/50 font-semibold">
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      Transferências Activas
                    </span>
                  </div>
                </div>

                {/* Fluxo de transferência simulado */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Conta Corrente ➔ Poupança</p>
                      <p className="text-[10px] text-slate-500">Aporte mensal para a reserva</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    100.000,00 Kz
                  </span>
                </div>

              </div>

              {/* Tag flutuante */}
              <div className="absolute -bottom-5 -left-5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xl hidden sm:flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Poupança 100% Protegida</p>
                  <p className="text-[11px] text-slate-500">Nunca misture despesas com as suas reservas</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Os 3 Pilares do Chrímata */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
            Construído para resolver o problema real das suas finanças
          </h2>
          <p className="text-sm text-slate-600">
            Controle separado para cada conta e literacia financeira adaptada a Angola.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pilar 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Multi-Contas & Transferências
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Separe a Minha Conta Corrente da Minha Carteira física e crie novas contas bancárias ou cofres. Mova dinheiro com um clique.
            </p>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Histórico de transferências internas auditável</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Registo de levantamentos Multicaixa para carteira</span>
              </li>
            </ul>
          </div>

          {/* Pilar 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-5">
              <PiggyBank className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Poupança Isolada do Saldo Geral
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              O seu saldo geral exibe apenas o valor livre para gastar. O dinheiro da Poupança fica guardado e protegido no seu pote de reserva.
            </p>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Zero risco de gastar reservas por engano</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Acompanhamento da meta do fundo de emergência</span>
              </li>
            </ul>
          </div>

          {/* Pilar 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Literacia Financeira Prática
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Aprenda a aplicar a Regra 50/30/20, calcule o tamanho ideal da sua reserva e entenda instrumentos como Bilhetes e Obrigações do Tesouro em Angola.
            </p>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Calculadora 50/30/20 e fundo de emergência</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Glossário financeiro da BODIVA e banca</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Banner CTA Final */}
        <div className="mt-16 bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
            Pronto para transformar a sua relação com o dinheiro?
          </h2>
          <p className="text-sm text-emerald-100 max-w-xl mx-auto mb-8">
            Experimente o Chrímata agora mesmo. Não requer cartão de crédito e pode testar com dados fictícios com um único clique.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-3.5 text-sm font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Aceder ao Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};

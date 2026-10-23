import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFinance } from '../../contexts/FinanceContext';
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react';

interface QuickEducationCardProps {
  onGoToEducation: () => void;
}

export const QuickEducationCard: React.FC<QuickEducationCardProps> = ({ onGoToEducation }) => {
  const { user } = useAuth();
  const { tips } = useFinance();

  const relevantTip = tips.find(t => t.targetAudience === user?.profileType) || tips[0];

  if (!relevantTip) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-xl p-6 shadow-sm relative overflow-hidden">
      <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10 pointer-events-none">
        <BookOpen className="w-48 h-48 text-white" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Literacia Financeira Prática</span>
          <span aria-hidden="true">·</span>
          <span>{relevantTip.readTime}</span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 leading-tight">
          {relevantTip.title}
        </h3>

        <p className="text-xs text-slate-300 mb-4 max-w-xl leading-relaxed">
          {relevantTip.summary}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onGoToEducation}
            className="px-4 py-2 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Explorar Módulo Educativo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          {relevantTip.practicalAction && (
            <span className="text-[11px] text-emerald-200/90 italic">
              💡 {relevantTip.practicalAction}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

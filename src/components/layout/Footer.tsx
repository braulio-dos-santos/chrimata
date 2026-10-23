import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Chrímata</span>
            <span aria-hidden="true">·</span>
            <span>Gestão Financeira Pessoal & Educação</span>
            <span aria-hidden="true">·</span>
            <span>Angola (AOA)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
            <span>Para Estudantes e Trabalhadores</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Controle o seu Kwanza com sabedoria</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

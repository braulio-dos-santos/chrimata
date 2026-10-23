import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Plus, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  RotateCcw,
  BookOpen,
  PieChart,
  Receipt,
  LayoutDashboard,
  Wallet,
  Target,
  BarChart3,
  Sun,
  Moon,
  FileText
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenNewTransaction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange, onOpenNewTransaction }) => {
  const { user, isAuthenticated, logout, switchDemoUser, resetDemoData, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Contas', icon: Wallet },
    { id: 'goals', label: 'Objectivos', icon: Target },
    { id: 'transactions', label: 'Transacções', icon: Receipt },
    { id: 'budgets', label: 'Orçamentos', icon: PieChart },
    { id: 'reports', label: 'Relatórios & Gráficos', icon: BarChart3 },
    { id: 'education', label: 'Educação', icon: BookOpen },
    ...(isAdmin ? [{ id: 'admin', label: 'Administração', icon: ShieldCheck }] : []),
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'CH';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zona 1: Marca Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => onTabChange('dashboard')} 
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
                Ch
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  Chrímata
                </span>
                <span className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">
                  Gestão & Literacia Financeira
                </span>
              </div>
            </button>
          </div>

          {/* Zona 2: Links de Navegação */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer text-xs ${
                      active
                        ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Zona 3: Acção Principal, Dark Mode & Perfil */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Botão de Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              aria-label="Alternar tema"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-180 duration-300" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={onOpenNewTransaction}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:scale-95 transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nova Transacção</span>
                  <span className="sm:hidden">Nova</span>
                </button>

                {/* Dropdown de Utilizador & Alternância de Contas */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                  >
                    {getInitials(user?.name)}
                  </button>

                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-1"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                          {user?.profileType === 'student' ? (
                            <><GraduationCap className="w-3.5 h-3.5" /> Perfil Estudante</>
                          ) : (
                            <><Briefcase className="w-3.5 h-3.5" /> Perfil Trabalhador</>
                          )}
                          {user?.role === 'admin' && ' · Admin'}
                        </div>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                        <button
                          onClick={() => { onTabChange('reports'); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Relatórios em PDF & Gráficos</span>
                        </button>
                        <button
                          onClick={() => { onTabChange('accounts'); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                        >
                          <Wallet className="w-4 h-4 text-slate-400" />
                          <span>As Minhas Contas</span>
                        </button>
                        <button
                          onClick={() => { onTabChange('profile'); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>O Meu Perfil</span>
                        </button>
                        <button
                          onClick={() => { resetDemoData(); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4 text-amber-500" />
                          <span>Restaurar Dados Iniciais</span>
                        </button>
                        <button
                          onClick={() => { logout(); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Terminar Sessão</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botão Hambúrguer Mobile */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onTabChange('login')}
                  className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Entrar
                </button>
                <button
                  onClick={() => onTabChange('register')}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                >
                  Criar Conta
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Menu Mobile Expandido */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 dark:border-slate-800 animate-in fade-in">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left cursor-pointer ${
                      active
                        ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

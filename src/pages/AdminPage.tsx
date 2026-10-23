import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { firestoreService } from '../services/firestoreService';
import { storageService } from '../services/storage';
import { formatKz, formatDatePt } from '../utils/currency';
import { User, Transaction, Account, FinancialGoal, Category } from '../types/finance';
import { downloadFinancialPDF } from '../services/pdfReportService';
import { 
  ShieldCheck, 
  Users, 
  Receipt, 
  TrendingUp, 
  Plus, 
  Check, 
  Lock, 
  Wallet, 
  Target, 
  Trash2, 
  UserCheck, 
  UserX, 
  Search, 
  FileText, 
  RefreshCw,
  PieChart,
  Settings,
  AlertTriangle
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, updateProfile } = useAuth();
  const { categories, addCategory, refreshData } = useFinance();

  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'accounts' | 'transactions' | 'categories' | 'settings'>('metrics');
  
  // Dados Globais
  const [usersList, setUsersList] = useState<User[]>([]);
  const [accountsList, setAccountsList] = useState<Account[]>([]);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [goalsList, setGoalsList] = useState<FinancialGoal[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Filtros
  const [userSearch, setUserSearch] = useState('');
  const [txSearch, setTxSearch] = useState('');

  // Formulário de Categoria
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [newCatColor, setNewCatColor] = useState('#16A34A');
  const [catSuccess, setCatSuccess] = useState(false);

  // Modal / Confirmações
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const loadGlobalAdminData = async () => {
    setLoadingData(true);
    try {
      const [uList, aList, tList, gList] = await Promise.all([
        firestoreService.getAllUsers(),
        firestoreService.getAllAccountsGlobal(),
        firestoreService.getAllTransactionsGlobal(),
        firestoreService.getAllGoalsGlobal(),
      ]);

      setUsersList(uList);
      setAccountsList(aList);
      setTransactionsList(tList);
      setGoalsList(gList);
    } catch {
      setUsersList(storageService.getUsers());
      setAccountsList(storageService.getAccounts());
      setTransactionsList(storageService.getTransactions());
      setGoalsList(storageService.getGoals());
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadGlobalAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-xs animate-in fade-in">
        <Lock className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Acesso Restrito ao Administrador</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Esta área é reservada exclusivamente para a supervisão e controlo de administração do sistema Chrímata.
        </p>
      </div>
    );
  }

  // Cálculos de métricas globais
  const totalVolume = transactionsList.reduce((sum, t) => sum + t.amount, 0);
  const totalSavingsLocked = accountsList.filter(a => a.isSavings).reduce((sum, a) => sum + a.balance, 0);
  const totalAvailableBalance = accountsList.filter(a => !a.isSavings).reduce((sum, a) => sum + a.balance, 0);
  const studentUsers = usersList.filter(u => u.profileType === 'student').length;
  const workerUsers = usersList.filter(u => u.profileType === 'worker').length;

  // Filtragem de utilizadores
  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.institutionOrCompany && u.institutionOrCompany.toLowerCase().includes(userSearch.toLowerCase()))
  );

  // Filtragem de transacções
  const filteredTxs = transactionsList.filter(t => 
    t.title.toLowerCase().includes(txSearch.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(txSearch.toLowerCase()))
  );

  const handleToggleUserRole = async (targetUser: User) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const updated = { ...targetUser, role: newRole as 'admin' | 'user' };
    
    await firestoreService.saveUserProfile(updated);
    storageService.saveUser(updated);
    
    setNoticeMessage(`Papel do utilizador "${targetUser.name}" alterado para ${newRole.toUpperCase()}.`);
    setTimeout(() => setNoticeMessage(null), 4000);
    loadGlobalAdminData();
  };

  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;
    await firestoreService.deleteUser(userToDelete.id);
    setNoticeMessage(`Utilizador "${userToDelete.name}" eliminado com sucesso.`);
    setUserToDelete(null);
    setTimeout(() => setNoticeMessage(null), 4000);
    loadGlobalAdminData();
  };

  const handleDeleteTxConfirm = async () => {
    if (!txToDelete) return;
    await firestoreService.deleteTransaction(txToDelete);
    setNoticeMessage(`Transacção "${txToDelete.title}" removida pelo Administrador.`);
    setTxToDelete(null);
    setTimeout(() => setNoticeMessage(null), 4000);
    loadGlobalAdminData();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    await addCategory({
      name: newCatName.trim(),
      type: newCatType,
      color: newCatColor,
      icon: 'Tag',
    });

    setNewCatName('');
    setCatSuccess(true);
    setTimeout(() => setCatSuccess(false), 3000);
    loadGlobalAdminData();
  };

  const handleExportGlobalAudit = () => {
    downloadFinancialPDF({
      userName: user?.name || 'Administrador Chrímata',
      userEmail: user?.email || 'admin@chrimata.ao',
      userProfile: user?.profileType || 'worker',
      periodLabel: 'Relatório Global de Auditoria de Administração',
      summary: {
        totalAvailableBalance,
        totalSavingsBalance: totalSavingsLocked,
        totalNetWorth: totalAvailableBalance + totalSavingsLocked,
        totalBalance: totalAvailableBalance,
        monthlyIncome: totalVolume,
        monthlyExpense: 0,
        savingsRate: 100,
        totalBudgetLimit: 0,
        totalBudgetSpent: 0,
        totalGoalsTarget: 0,
        totalGoalsSaved: 0,
        goalsCoverageRate: 100,
        activeGoalsCount: goalsList.length,
        completedGoalsCount: 0,
      },
      accounts: accountsList,
      transactions: transactionsList,
      categorySpending: [],
      goals: goalsList,
    }, 'chrimata-relatorio-auditoria-admin');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      
      {/* Top Banner do Painel Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200/80 dark:border-indigo-800/80 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Sessão de Administrador Activa ({user?.email})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Centro de Controlo & Gestão Global
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Supervisão de contas, utilizadores, volume transaccionado e taxonomia monetária
          </p>
        </div>

        {/* Acções Rápidas de Admin */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadGlobalAdminData}
            disabled={loadingData}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Actualizar Dados</span>
          </button>

          <button
            onClick={handleExportGlobalAudit}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Exportar Relatório Geral (PDF)</span>
          </button>
        </div>
      </div>

      {/* Aviso de Confirmação / Feedback */}
      {noticeMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{noticeMessage}</span>
          </div>
        </div>
      )}

      {/* Navegação de Abas Internas do Admin */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'metrics'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Métricas Globais</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Gestão de Utilizadores ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'accounts'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Contas Globais ({accountsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'transactions'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Auditoria de Transacções ({transactionsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Taxonomia & Categorias</span>
        </button>
      </div>

      {/* ABA 1: MÉTRICAS GLOBAIS */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Utilizadores Activos</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                {usersList.length}
              </span>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                <span className="text-emerald-600 font-semibold">{studentUsers} Estudantes</span> · 
                <span className="text-teal-600 font-semibold">{workerUsers} Trabalhadores</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Volume Transaccionado</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-2xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatKz(totalVolume)}
              </span>
              <p className="mt-2 text-[11px] text-slate-500">
                {transactionsList.length} transacções registadas no sistema
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Poupança Protegida</span>
                <Wallet className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-2xl font-extrabold font-mono tabular-nums text-teal-700 dark:text-teal-300">
                {formatKz(totalSavingsLocked)}
              </span>
              <p className="mt-2 text-[11px] text-slate-500">
                Total acumulado em contas de poupança
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Objectivos Financeiros</span>
                <Target className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                {goalsList.length}
              </span>
              <p className="mt-2 text-[11px] text-slate-500">
                Metas ativas de curto, médio e longo prazo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Distribuição de Saldos por Tipo de Conta
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Visão do capital alocado entre Conta Corrente, Carteira e Poupança
              </p>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Saldo Operacional Disponível</span>
                    <span className="font-mono text-slate-900 dark:text-white">{formatKz(totalAvailableBalance)}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full" 
                      style={{ width: `${totalAvailableBalance + totalSavingsLocked > 0 ? (totalAvailableBalance / (totalAvailableBalance + totalSavingsLocked)) * 100 : 50}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Reserva de Poupança Isolada</span>
                    <span className="font-mono text-teal-700 dark:text-teal-400">{formatKz(totalSavingsLocked)}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-600 h-full rounded-full" 
                      style={{ width: `${totalAvailableBalance + totalSavingsLocked > 0 ? (totalSavingsLocked / (totalAvailableBalance + totalSavingsLocked)) * 100 : 50}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Estatísticas de Perfis
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Distribuição de contas entre Perfis Estudante e Trabalhador
              </p>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <span className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300">{studentUsers}</span>
                  <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 mt-1">Estudantes</p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Foco em propinas e mesadas</p>
                </div>

                <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl">
                  <span className="text-2xl font-bold font-mono text-teal-800 dark:text-teal-300">{workerUsers}</span>
                  <p className="text-xs font-semibold text-teal-900 dark:text-teal-200 mt-1">Trabalhadores</p>
                  <p className="text-[10px] text-teal-700 dark:text-teal-400">Foco em salários e investimentos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: GESTÃO DE UTILIZADORES */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Controlo de Utilizadores do Sistema</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gerencie permissões, papéis e privilégios de acesso</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Pesquisar por nome ou e-mail..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3">Utilizador</th>
                  <th className="px-6 py-3">E-mail</th>
                  <th className="px-6 py-3">Perfil</th>
                  <th className="px-6 py-3">Papel</th>
                  <th className="px-6 py-3">Instituição / Empresa</th>
                  <th className="px-6 py-3 text-right">Acções de Administração</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {u.name}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400">{u.email}</td>
                    <td className="px-6 py-3.5 capitalize">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        u.profileType === 'student'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-teal-50 text-teal-800 border border-teal-200'
                      }`}>
                        {u.profileType === 'student' ? 'Estudante' : 'Trabalhador'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {u.role === 'admin' && <ShieldCheck className="w-3 h-3 text-indigo-600" />}
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400">{u.institutionOrCompany || '—'}</td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleUserRole(u)}
                          title={u.role === 'admin' ? 'Despromover para Utilizador Normal' : 'Promover para Administrador'}
                          className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer border border-indigo-200"
                        >
                          {u.role === 'admin' ? 'Tornar Utilizador' : 'Tornar Admin'}
                        </button>

                        <button
                          onClick={() => setUserToDelete(u)}
                          title="Eliminar Utilizador"
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: CONTAS GLOBAIS */}
      {activeTab === 'accounts' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Auditoria de Contas Registadas</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Contas bancárias, carteiras físicas e depósitos de poupança no sistema</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3">Nome da Conta</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Saldo Actual</th>
                  <th className="px-6 py-3">Estado de Poupança</th>
                  <th className="px-6 py-3">ID do Titular</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {accountsList.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">
                      {a.name}
                    </td>
                    <td className="px-6 py-3.5 uppercase text-[11px] font-mono">
                      {a.type === 'checking' ? 'Conta Corrente' : a.type === 'cash' ? 'Carteira (Físico)' : 'Poupança'}
                    </td>
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {formatKz(a.balance)}
                    </td>
                    <td className="px-6 py-3.5">
                      {a.isSavings ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full border border-teal-200">
                          🛡️ Poupança Isolada
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Saldo Operacional</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-400">{a.userId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 4: AUDITORIA DE TRANSACÇÕES */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Auditoria Global de Transacções</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Histórico completo de entradas, saídas e transferências no Chrímata</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                placeholder="Pesquisar transacção..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3">Descrição / Título</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Valor</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3 text-right">Moderador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredTxs.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">
                      {t.title}
                      {t.description && <p className="text-[11px] font-normal text-slate-400">{t.description}</p>}
                    </td>
                    <td className="px-6 py-3.5 capitalize">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        t.type === 'income' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : t.type === 'expense'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      }`}>
                        {t.type === 'income' ? 'Receita' : t.type === 'expense' ? 'Despesa' : 'Transferência'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {formatKz(t.amount)}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-slate-400">{formatDatePt(t.date)}</td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setTxToDelete(t)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar Transacção Inválida"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 5: TAXONOMIA E CATEGORIAS */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Adicionar Categoria de Sistema Global
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Categorias adicionadas aqui ficam visíveis e prontas para uso por todos os utilizadores do Chrímata
            </p>

            {catSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Categoria adicionada com sucesso à taxonomia do sistema!</span>
              </div>
            )}

            <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex.: Bolsas BODIVA, Propinas Universitárias, Seguros de Saúde..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Fluxo *
                </label>
                <select
                  value={newCatType}
                  onChange={(e) => setNewCatType(e.target.value as 'income' | 'expense')}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="expense">Despesa (Saída)</option>
                  <option value="income">Receita (Entrada)</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Categoria</span>
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Categorias Activas no Sistema</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</p>
                    <span className={`text-[10px] font-semibold uppercase ${c.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {c.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                  </div>
                  {c.isSystem && (
                    <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                      Sistema
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Eliminar Utilizador */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirmar Eliminação de Utilizador</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Tem a certeza de que pretende eliminar permanentemente o utilizador <strong className="text-slate-900 dark:text-white">{userToDelete.name}</strong> ({userToDelete.email})?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUserConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Eliminar Transacção */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirmar Moderação de Transacção</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Tem a certeza de que pretende eliminar a transacção <strong className="text-slate-900 dark:text-white">{txToDelete.title}</strong> de {formatKz(txToDelete.amount)}?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setTxToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteTxConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Eliminar Transacção
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

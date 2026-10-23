import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { firestoreService } from '../services/firestoreService';
import { storageService } from '../services/storage';
import { formatKz, formatDatePt } from '../utils/currency';
import { User, Transaction, Account, FinancialGoal } from '../types/finance';
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
  Search, 
  FileText, 
  RefreshCw,
  PieChart,
  AlertTriangle,
  Eye,
  X,
  CreditCard,
  Building2,
  Calendar
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { categories, addCategory } = useFinance();

  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'accounts' | 'transactions' | 'categories'>('metrics');
  
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

  // Modais de Inspeção e Confirmação
  const [userToInspect, setUserToInspect] = useState<User | null>(null);
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

  // Filtragem
  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.institutionOrCompany && u.institutionOrCompany.toLowerCase().includes(userSearch.toLowerCase()))
  );

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

    if (userToInspect?.id === targetUser.id) {
      setUserToInspect(updated);
    }
  };

  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;
    await firestoreService.deleteUser(userToDelete.id);
    setNoticeMessage(`Utilizador "${userToDelete.name}" e dados associados foram eliminados.`);
    setUserToDelete(null);
    setUserToInspect(null);
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
      userEmail: user?.email || 'dossantosbraulio20@gmail.com',
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

  // Dados calculados para inspeção do utilizador seleccionado
  const inspectedAccounts = userToInspect ? accountsList.filter(a => a.userId === userToInspect.id) : [];
  const inspectedTransactions = userToInspect ? transactionsList.filter(t => t.userId === userToInspect.id) : [];
  const inspectedGoals = userToInspect ? goalsList.filter(g => g.userId === userToInspect.id) : [];

  const inspectedAvailableBalance = inspectedAccounts.filter(a => !a.isSavings).reduce((sum, a) => sum + a.balance, 0);
  const inspectedSavingsBalance = inspectedAccounts.filter(a => a.isSavings).reduce((sum, a) => sum + a.balance, 0);

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
            Centro de Controlo & Análise de Dados Reais
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Supervisão e auditoria de utilizadores, contas bancárias, transacções reais e poupanças
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

      {/* Feedback do Admin */}
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
          <span>Métricas Globais Reais</span>
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
                <span className="text-[11px] font-bold uppercase tracking-wider">Utilizadores Registados</span>
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
                {transactionsList.length} transacções processadas por utilizadores
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Poupança Total Acumulada</span>
                <Wallet className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-2xl font-extrabold font-mono tabular-nums text-teal-700 dark:text-teal-300">
                {formatKz(totalSavingsLocked)}
              </span>
              <p className="mt-2 text-[11px] text-slate-500">
                Guardado em contas de poupança isoladas
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Metas de Poupança</span>
                <Target className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                {goalsList.length}
              </span>
              <p className="mt-2 text-[11px] text-slate-500">
                Objectivos criados pelos utilizadores
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: GESTÃO DE UTILIZADORES */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Gestão e Inspeção de Utilizadores</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Clique num utilizador para ver a sua ficha financeira completa, contas e transacções</p>
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
                  <th className="px-6 py-3 text-right">Inspecção / Controlo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 cursor-pointer">
                    <td 
                      onClick={() => setUserToInspect(u)}
                      className="px-6 py-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap flex items-center gap-2 hover:text-emerald-600 transition-colors"
                    >
                      <span>{u.name}</span>
                    </td>
                    <td onClick={() => setUserToInspect(u)} className="px-6 py-3.5 text-slate-500 dark:text-slate-400">{u.email}</td>
                    <td onClick={() => setUserToInspect(u)} className="px-6 py-3.5 capitalize">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        u.profileType === 'student'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-teal-50 text-teal-800 border border-teal-200'
                      }`}>
                        {u.profileType === 'student' ? 'Estudante' : 'Trabalhador'}
                      </span>
                    </td>
                    <td onClick={() => setUserToInspect(u)} className="px-6 py-3.5 font-bold">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {u.role === 'admin' && <ShieldCheck className="w-3 h-3 text-indigo-600" />}
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td onClick={() => setUserToInspect(u)} className="px-6 py-3.5 text-slate-500 dark:text-slate-400">{u.institutionOrCompany || '—'}</td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setUserToInspect(u)}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer border border-emerald-200/80 flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ver Ficha Completa</span>
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
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Auditoria de Contas de Utilizadores</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Contas bancárias, carteiras físicas e depósitos de poupança criados por utilizadores</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3">Nome da Conta</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Saldo Actual</th>
                  <th className="px-6 py-3">Estado de Poupança</th>
                  <th className="px-6 py-3">Titular (ID)</th>
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
              <p className="text-xs text-slate-500 dark:text-slate-400">Histórico completo de entradas, saídas e transferências de utilizadores</p>
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
                        title="Eliminar Transacção"
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
        </div>
      )}

      {/* MODAL DE INSPEÇÃO COMPLETA DO UTILIZADOR ("Saber exatamente tudo") */}
      {userToInspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-4xl w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Cabeçalho do Modal de Inspeção */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-lg flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  {userToInspect.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      Ficha de Auditoria: {userToInspect.name}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      userToInspect.role === 'admin' 
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' 
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {userToInspect.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {userToInspect.email} · {userToInspect.institutionOrCompany || 'Sem entidade'} · Perfil {userToInspect.profileType === 'student' ? 'Estudante' : 'Trabalhador'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setUserToInspect(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumo Patrimonial do Utilizador */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Saldo Operacional
                </span>
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {formatKz(inspectedAvailableBalance)}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Conta Corrente & Carteira</p>
              </div>

              <div className="bg-teal-50/60 dark:bg-teal-950/40 p-4 rounded-xl border border-teal-200 dark:border-teal-800">
                <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider block mb-1">
                  Poupança Isolada
                </span>
                <span className="text-xl font-bold font-mono text-teal-900 dark:text-teal-300">
                  {formatKz(inspectedSavingsBalance)}
                </span>
                <p className="text-[10px] text-teal-700 dark:text-teal-400 mt-1">Reserva intocável protegida</p>
              </div>

              <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider block mb-1">
                  Património Líquido Total
                </span>
                <span className="text-xl font-bold font-mono text-indigo-900 dark:text-indigo-300">
                  {formatKz(inspectedAvailableBalance + inspectedSavingsBalance)}
                </span>
                <p className="text-[10px] text-indigo-700 dark:text-indigo-400 mt-1">Total acumulado pelo utilizador</p>
              </div>
            </div>

            {/* Contas do Utilizador */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Contas Registadas ({inspectedAccounts.length})</span>
              </h3>

              {inspectedAccounts.length === 0 ? (
                <p className="text-xs text-slate-400 italic">O utilizador não possui contas ativas registadas.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inspectedAccounts.map((a) => (
                    <div key={a.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{a.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{a.type === 'checking' ? 'Conta Corrente' : a.type === 'cash' ? 'Carteira' : 'Poupança'}</p>
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                        {formatKz(a.balance)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transacções do Utilizador */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Histórico de Transacções ({inspectedTransactions.length})</span>
              </h3>

              {inspectedTransactions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhuma transacção processada por este utilizador.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-800/40">
                  {inspectedTransactions.map((t) => (
                    <div key={t.id} className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{t.title}</p>
                        <p className="text-[10px] text-slate-400">{formatDatePt(t.date)} · {t.type.toUpperCase()}</p>
                      </div>
                      <span className={`font-mono font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                        {formatKz(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Objectivos do Utilizador */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Metas de Poupança ({inspectedGoals.length})</span>
              </h3>

              {inspectedGoals.length === 0 ? (
                <p className="text-xs text-slate-400 italic">O utilizador não criou metas de poupança.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inspectedGoals.map((g) => (
                    <div key={g.id} className="p-3 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white mb-1">
                        <span>{g.title}</span>
                        <span className="text-indigo-600">{Math.round((g.currentAmount / g.targetAmount) * 100)}%</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Poupado: {formatKz(g.currentAmount)} de {formatKz(g.targetAmount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rodapé de Acções de Admin */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleUserRole(userToInspect)}
                  className="px-3 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer border border-indigo-200"
                >
                  {userToInspect.role === 'admin' ? 'Tornar Utilizador Normal' : 'Promover a Administrador'}
                </button>

                <button
                  onClick={() => {
                    setUserToDelete(userToInspect);
                  }}
                  className="px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer border border-rose-200"
                >
                  Eliminar Utilizador
                </button>
              </div>

              <button
                onClick={() => setUserToInspect(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Fechar Ficha
              </button>
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

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { storageService } from '../services/storage';
import { formatKz, formatDatePt } from '../utils/currency';
import { 
  ShieldCheck, 
  Users, 
  Receipt, 
  TrendingUp, 
  Plus, 
  Tag, 
  Check, 
  Lock 
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { categories, addCategory } = useFinance();

  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [newCatColor, setNewCatColor] = useState('#16A34A');
  const [catSuccess, setCatSuccess] = useState(false);

  const allUsers = storageService.getUsers();
  const allTransactions = storageService.getTransactions();

  const totalVolume = allTransactions.reduce((sum, t) => sum + t.amount, 0);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
        <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-base font-bold text-slate-900 mb-1">Acesso Restrito</h2>
        <p className="text-xs text-slate-500 mb-4">
          Esta área é reservada a utilizadores com privilégios de Administrador do sistema Chrímata.
        </p>
      </div>
    );
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      type: newCatType,
      color: newCatColor,
      icon: 'Tag',
    });

    setNewCatName('');
    setCatSuccess(true);
    setTimeout(() => setCatSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Painel de Administração</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Supervisão do Sistema Chrímata
        </h1>
        <p className="text-xs text-slate-500">
          Métricas agregadas, gestão de contas e configuração de taxonomia monetária
        </p>
      </div>

      {/* Métricas Globais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total de Utilizadores</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {allUsers.length}
          </span>
          <p className="mt-1 text-xs text-slate-400">
            Estudantes, trabalhadores e administradores
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Transacções Processadas</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {allTransactions.length}
          </span>
          <p className="mt-1 text-xs text-slate-400">
            Movimentos registados no sistema
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Volume Transaccionado</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-2xl font-bold font-mono tabular-nums text-teal-900">
            {formatKz(totalVolume)}
          </span>
          <p className="mt-1 text-xs text-slate-400">
            Total bruto gerido na moeda nacional
          </p>
        </div>
      </div>

      {/* Seção 2: Gestão de Categorias Globais */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Adicionar Nova Categoria de Sistema
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Categorias criadas aqui ficam imediatamente disponíveis para todos os utilizadores
        </p>

        {catSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Categoria adicionada com sucesso ao sistema!</span>
          </div>
        )}

        <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome da Categoria *
            </label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Ex.: Bolsas de Pós-Graduação, Propinas, Seguros..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo *
            </label>
            <select
              value={newCatType}
              onChange={(e) => setNewCatType(e.target.value as 'income' | 'expense')}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="expense">Despesa (Saída)</option>
              <option value="income">Receita (Entrada)</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Utilizadores Registados */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Contas do Sistema</h3>
          <p className="text-xs text-slate-500">Utilizadores activos na base de dados</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">E-mail</th>
                <th className="px-6 py-3">Perfil</th>
                <th className="px-6 py-3">Papel</th>
                <th className="px-6 py-3">Instituição / Entidade</th>
                <th className="px-6 py-3">Data de Registo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-3 font-semibold text-slate-900 whitespace-nowrap">
                    {u.name}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{u.email}</td>
                  <td className="px-6 py-3 capitalize">{u.profileType === 'student' ? 'Estudante' : 'Trabalhador'}</td>
                  <td className="px-6 py-3 font-semibold capitalize text-slate-700">{u.role}</td>
                  <td className="px-6 py-3 text-slate-500">{u.institutionOrCompany || '—'}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-slate-400">{formatDatePt(u.createdAt.split('T')[0])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

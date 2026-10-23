import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { ProfileType } from '../types/finance';
import { 
  User as UserIcon, 
  GraduationCap, 
  Briefcase, 
  Save, 
  RotateCcw, 
  Download, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, resetDemoData, switchDemoUser } = useAuth();
  const { transactions, budgets } = useFinance();

  const [name, setName] = useState(user?.name || '');
  const [profileType, setProfileType] = useState<ProfileType>(user?.profileType || 'student');
  const [institutionOrCompany, setInstitutionOrCompany] = useState(user?.institutionOrCompany || '');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      profileType,
      institutionOrCompany: institutionOrCompany.trim(),
    });
    setSuccessMessage('Perfil actualizado com sucesso!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleExportBackup = () => {
    const backupData = {
      user,
      transactions,
      budgets,
      exportedAt: new Date().toISOString(),
      app: 'Chrímata',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chrimata_backup_${user?.id}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          O Meu Perfil
        </h1>
        <p className="text-xs text-slate-500">
          Gerencie as suas preferências de conta, perfil profissional ou académico e cópias de segurança
        </p>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Formulário de Dados */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-500/20 flex items-center justify-center font-bold text-xl shrink-0">
            {user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'CH'}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              {user?.profileType === 'student' ? (
                <><GraduationCap className="w-3.5 h-3.5" /> Estudante</>
              ) : (
                <><Briefcase className="w-3.5 h-3.5" /> Trabalhador</>
              )}
              {user?.role === 'admin' && ' · Administrador do Sistema'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Endereço de E-mail
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Perfil *
              </label>
              <select
                value={profileType}
                onChange={(e) => setProfileType(e.target.value as ProfileType)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="student">Estudante Universitário / Ensino Médio</option>
                <option value="worker">Trabalhador / Profissional / Empresa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {profileType === 'student' ? 'Universidade / Faculdade' : 'Empresa / Sector'}
              </label>
              <input
                type="text"
                value={institutionOrCompany}
                onChange={(e) => setInstitutionOrCompany(e.target.value)}
                placeholder={profileType === 'student' ? 'Ex.: UAN, ISUTIC, UCAN...' : 'Ex.: Sonangol, Sector Bancário...'}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Alterações</span>
            </button>
          </div>
        </form>
      </div>

      {/* Gestão de Dados e Cópia de Segurança */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Dados & Cópias de Segurança
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Exporte os seus registos financeiros ou reponha os dados para testes
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Descarregar Backup JSON</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Tem a certeza que deseja restaurar os dados de demonstração originais?')) {
                resetDemoData();
                setSuccessMessage('Dados de teste restaurados com sucesso!');
                setTimeout(() => setSuccessMessage(null), 3000);
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Restaurar Dados Originais de Teste</span>
          </button>
        </div>
      </div>
    </div>
  );
};

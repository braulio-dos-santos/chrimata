import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProfileType } from '../types/finance';
import { UserPlus, GraduationCap, Briefcase, Check } from 'lucide-react';

interface RegisterPageProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onGoToLogin }) => {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileType, setProfileType] = useState<ProfileType>('student');
  const [institutionOrCompany, setInstitutionOrCompany] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A palavra-passe deve conter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const res = await register(name, email, password, profileType, institutionOrCompany);
    setLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.message || 'Erro ao criar conta.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow-md">
            Ch
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Criar Conta no Chrímata
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Comece hoje a gerir o seu dinheiro com qualidade
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Manuel António"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Endereço de E-mail *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manuel@exemplo.ao"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          {/* Selector de Perfil */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              O Seu Perfil Principal *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProfileType('student')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  profileType === 'student'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-5 h-5 text-emerald-600 mb-1" />
                <p className="text-xs font-bold">Estudante</p>
                <p className="text-[10px] text-slate-500">Mesada, bolsas e estudos</p>
              </button>

              <button
                type="button"
                onClick={() => setProfileType('worker')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  profileType === 'worker'
                    ? 'border-teal-600 bg-teal-50 text-teal-900'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-5 h-5 text-teal-600 mb-1" />
                <p className="text-xs font-bold">Trabalhador</p>
                <p className="text-[10px] text-slate-500">Salário, renda e contas</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {profileType === 'student' ? 'Universidade / Instituto' : 'Empresa / Profissão'}
            </label>
            <input
              type="text"
              value={institutionOrCompany}
              onChange={(e) => setInstitutionOrCompany(e.target.value)}
              placeholder={profileType === 'student' ? 'Ex.: UAN, ISUTIC, UCAN...' : 'Ex.: Sonangol, Consultor...'}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Criar Palavra-passe *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'A registar conta...' : 'Concluir Registo Gratuito'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Já possui uma conta? </span>
          <button
            onClick={onGoToLogin}
            className="font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
          >
            Entrar aqui
          </button>
        </div>
      </div>
    </div>
  );
};

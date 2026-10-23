import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ProfileType } from '../types/finance';
import { storageService, DEMO_USERS } from '../services/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, profileType: ProfileType, institutionOrCompany?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchDemoUser: (id: string) => void;
  updateProfile: (data: Partial<User>) => void;
  resetDemoData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = storageService.getCurrentUser();
    setUser(current);
    setLoading(false);
  }, []);

  const login = async (email: string): Promise<{ success: boolean; message?: string }> => {
    const users = storageService.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (found) {
      storageService.setCurrentUser(found);
      setUser(found);
      return { success: true };
    }

    return {
      success: false,
      message: 'Utilizador não encontrado. Verifique as suas credenciais ou crie um novo registo.'
    };
  };

  const register = async (
    name: string,
    email: string,
    _password: string,
    profileType: ProfileType,
    institutionOrCompany?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const users = storageService.getUsers();
    const cleanEmail = email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Já existe uma conta com este endereço de e-mail.' };
    }

    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      role: 'user',
      profileType,
      currency: 'AOA',
      institutionOrCompany: institutionOrCompany?.trim() || (profileType === 'student' ? 'Universidade / Instituto' : 'Empresa / Sector de Actividade'),
      avatar: profileType === 'student' ? '/src/assets/images/avatar_student_1792544187412.jpg' : '/src/assets/images/avatar_worker_1792544188229.jpg',
      createdAt: new Date().toISOString(),
    };

    storageService.saveUser(newUser);
    storageService.setCurrentUser(newUser);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chrimata_current_user_v1');
  };

  const switchDemoUser = (userId: string) => {
    const users = storageService.getUsers();
    const found = users.find(u => u.id === userId) || DEMO_USERS.find(u => u.id === userId);
    if (found) {
      storageService.setCurrentUser(found);
      setUser(found);
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    storageService.saveUser(updated);
    setUser(updated);
  };

  const resetDemoData = () => {
    storageService.resetToDemoData();
    const current = storageService.getCurrentUser();
    setUser(current);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">A carregar Chrímata...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        switchDemoUser,
        updateProfile,
        resetDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  }
  return ctx;
};

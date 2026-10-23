import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ProfileType } from '../types/finance';
import { storageService, DEMO_USERS } from '../services/storage';
import { auth } from '../services/firebase';
import { firestoreService } from '../services/firestoreService';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';

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
    // Listener de estado de autenticação Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        let profile = await firestoreService.getUserProfile(fbUser.uid);
        if (!profile) {
          profile = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Utilizador Chrímata',
            email: fbUser.email || '',
            role: (fbUser.email === 'dossantosbraulio20@gmail.com' || fbUser.email === 'admin@chrimata.ao') ? 'admin' : 'user',
            profileType: 'worker',
            currency: 'AOA',
            institutionOrCompany: 'Empresa / Sector de Actividade',
            createdAt: new Date().toISOString(),
          };
          await firestoreService.saveUserProfile(profile);
        }
        setUser(profile);
        storageService.setCurrentUser(profile);
      } else {
        const localCurrent = storageService.getCurrentUser();
        setUser(localCurrent);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // Tenta primeiro via Firebase Auth se fornecida palavra-passe
    if (password && password.length >= 6) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        let profile = await firestoreService.getUserProfile(cred.user.uid);
        if (!profile) {
          profile = {
            id: cred.user.uid,
            name: cred.user.displayName || cleanEmail.split('@')[0],
            email: cleanEmail,
            role: (cleanEmail === 'dossantosbraulio20@gmail.com' || cleanEmail === 'admin@chrimata.ao') ? 'admin' : 'user',
            profileType: 'worker',
            currency: 'AOA',
            institutionOrCompany: 'Empresa / Sector de Actividade',
            createdAt: new Date().toISOString(),
          };
          await firestoreService.saveUserProfile(profile);
        }
        setUser(profile);
        storageService.setCurrentUser(profile);
        return { success: true };
      } catch (fbErr: any) {
        console.warn('Firebase Auth Login fallback:', fbErr.message);
      }
    }

    // Fallback de login local para administradores/utilizadores locais
    const users = storageService.getUsers();
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
    password: string,
    profileType: ProfileType,
    institutionOrCompany?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      // Regista conta no Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const newUser: User = {
        id: cred.user.uid,
        name: name.trim(),
        email: cleanEmail,
        role: (cleanEmail === 'dossantosbraulio20@gmail.com' || cleanEmail === 'admin@chrimata.ao') ? 'admin' : 'user',
        profileType,
        currency: 'AOA',
        institutionOrCompany: institutionOrCompany?.trim() || (profileType === 'student' ? 'Universidade / Instituto' : 'Empresa / Sector de Actividade'),
        avatar: profileType === 'student' ? '/src/assets/images/avatar_student_1792544187412.jpg' : '/src/assets/images/avatar_worker_1792544188229.jpg',
        createdAt: new Date().toISOString(),
      };

      await firestoreService.saveUserProfile(newUser);
      storageService.saveUser(newUser);
      storageService.setCurrentUser(newUser);
      setUser(newUser);
      return { success: true };
    } catch (err: any) {
      console.warn('Erro ao registar no Firebase Auth, a utilizar fallback local:', err.message);

      const users = storageService.getUsers();
      if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
        return { success: false, message: 'Já existe uma conta com este endereço de e-mail.' };
      }

      const newUser: User = {
        id: 'usr_' + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        role: (cleanEmail === 'dossantosbraulio20@gmail.com' || cleanEmail === 'admin@chrimata.ao') ? 'admin' : 'user',
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
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // Ignora erro se não houver sessão activa
    }
    setUser(null);
    storageService.setCurrentUser(null);
    localStorage.removeItem('chrimata_current_user_v1');
    localStorage.removeItem('chrimata_current_user_v2');
    localStorage.removeItem('chrimata_current_user');
  };

  const switchDemoUser = (userId: string) => {
    const users = storageService.getUsers();
    const found = users.find(u => u.id === userId) || DEMO_USERS.find(u => u.id === userId);
    if (found) {
      storageService.setCurrentUser(found);
      setUser(found);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    storageService.saveUser(updated);
    setUser(updated);
    await firestoreService.saveUserProfile(updated);
  };

  const resetDemoData = () => {
    storageService.resetToDemoData();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">A carregar Chrímata...</p>
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

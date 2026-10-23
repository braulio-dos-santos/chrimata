import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AccountsPage } from './pages/AccountsPage';
import { GoalsPage } from './pages/GoalsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { ReportsPage } from './pages/ReportsPage';
import { EducationPage } from './pages/EducationPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TransactionModal } from './components/transactions/TransactionModal';
import { Transaction } from './types/finance';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const handleOpenNewTransaction = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleCloseTxModal = () => {
    setIsTxModalOpen(false);
    setEditingTx(null);
  };

  // Se não estiver autenticado e tentar aceder a abas privadas, encaminha para a landing page
  const activeView = !isAuthenticated && !['landing', 'login', 'register'].includes(currentTab)
    ? 'landing'
    : currentTab;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Barra de Navegação Top Bar */}
      <Navbar
        currentTab={activeView}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenNewTransaction={handleOpenNewTransaction}
      />

      {/* Conteúdo Dinâmico por Aba */}
      <main className="flex-1">
        {activeView === 'landing' && (
          <LandingPage
            onGetStarted={() => setCurrentTab(isAuthenticated ? 'dashboard' : 'register')}
            onGoToLogin={() => setCurrentTab('login')}
          />
        )}

        {activeView === 'login' && (
          <LoginPage
            onSuccess={() => setCurrentTab('dashboard')}
            onGoToRegister={() => setCurrentTab('register')}
          />
        )}

        {activeView === 'register' && (
          <RegisterPage
            onSuccess={() => setCurrentTab('dashboard')}
            onGoToLogin={() => setCurrentTab('login')}
          />
        )}

        {activeView === 'dashboard' && (
          <DashboardPage
            onOpenNewTransaction={handleOpenNewTransaction}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {activeView === 'accounts' && <AccountsPage />}

        {activeView === 'goals' && <GoalsPage />}

        {activeView === 'transactions' && (
          <TransactionsPage
            onOpenNewTransaction={handleOpenNewTransaction}
            onEditTransaction={handleEditTransaction}
          />
        )}

        {activeView === 'budgets' && <BudgetsPage />}

        {activeView === 'reports' && <ReportsPage />}

        {activeView === 'education' && <EducationPage />}

        {activeView === 'profile' && <ProfilePage />}

        {activeView === 'admin' && <AdminPage />}
      </main>

      {/* Modal Global de Transacção */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={handleCloseTxModal}
        editingTransaction={editingTx}
      />

      {/* Rodapé Institucional */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <MainApp />
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

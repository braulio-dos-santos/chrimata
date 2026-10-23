import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, Category, Budget, EducationalTip, FinancialSummary, Account, FinancialGoal } from '../types/finance';
import { storageService, DEFAULT_CATEGORIES } from '../services/storage';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from './AuthContext';
import { getCurrentMonthYear } from '../utils/currency';

interface FinanceContextType {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  tips: EducationalTip[];
  goals: FinancialGoal[];
  selectedMonthYear: string;
  setSelectedMonthYear: (my: string) => void;
  summary: FinancialSummary;
  categorySpending: { category: Category; spent: number; budget?: Budget; percentage: number }[];
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => Promise<Transaction>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  saveBudget: (categoryId: string, amountLimit: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addCategory: (cat: Omit<Category, 'id' | 'isSystem'>) => Promise<void>;
  createAccount: (data: Omit<Account, 'id' | 'createdAt' | 'userId'>) => Promise<Account>;
  updateAccount: (acc: Account) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  transferBetweenAccounts: (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    date: string,
    description?: string
  ) => Promise<Transaction>;
  saveGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'userId'> & { id?: string }) => Promise<FinancialGoal>;
  deleteGoal: (id: string) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number, sourceAccountId?: string, note?: string) => Promise<void>;
  refreshData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(getCurrentMonthYear());
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [tips, setTips] = useState<EducationalTip[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);

  const loadData = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      return;
    }

    try {
      // Tenta carregar do Firestore (Nuvem)
      const [allAccs, allTx, allCats, allBudgets, allGoals] = await Promise.all([
        firestoreService.getAccounts(user.id),
        firestoreService.getTransactions(user.id),
        firestoreService.getCategories(),
        firestoreService.getBudgets(user.id, selectedMonthYear),
        firestoreService.getGoals(user.id),
      ]);

      setAccounts(allAccs);
      setTransactions(allTx);
      setCategories(allCats);
      setBudgets(allBudgets);
      setTips(firestoreService.getTips());
      setGoals(allGoals);
    } catch {
      // Fallback para LocalStorage se a nuvem estiver indisponível
      const allAccs = storageService.getAccounts(user.id);
      const allTx = storageService.getTransactions(user.id);
      const allCats = storageService.getCategories();
      const allBudgets = storageService.getBudgets(user.id, selectedMonthYear);
      const allTips = storageService.getTips();
      const allGoals = storageService.getGoals(user.id);

      setAccounts(allAccs);
      setTransactions(allTx);
      setCategories(allCats);
      setBudgets(allBudgets);
      setTips(allTips);
      setGoals(allGoals);
    }
  }, [user, selectedMonthYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cálculos de Resumo Financeiro com Contas & Poupança Separada
  const summary: FinancialSummary = useMemo(() => {
    const totalAvailableBalance = accounts
      .filter((a) => !a.isSavings)
      .reduce((sum, a) => sum + a.balance, 0);

    const totalSavingsBalance = accounts
      .filter((a) => a.isSavings)
      .reduce((sum, a) => sum + a.balance, 0);

    const totalNetWorth = totalAvailableBalance + totalSavingsBalance;

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    transactions.forEach((tx) => {
      const isCurrentMonth = tx.date.startsWith(selectedMonthYear);

      if (isCurrentMonth) {
        if (tx.type === 'income') {
          monthlyIncome += tx.amount;
        } else if (tx.type === 'expense') {
          monthlyExpense += tx.amount;
        }
      }
    });

    const savings = monthlyIncome - monthlyExpense;
    const savingsRate = monthlyIncome > 0 ? Math.max(0, Math.round((savings / monthlyIncome) * 100)) : 0;

    const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.amountLimit, 0);

    let totalBudgetSpent = 0;
    budgets.forEach((b) => {
      const spent = transactions
        .filter(
          (t) =>
            t.type === 'expense' &&
            t.categoryId === b.categoryId &&
            t.date.startsWith(selectedMonthYear)
        )
        .reduce((sum, t) => sum + t.amount, 0);
      totalBudgetSpent += spent;
    });

    const activeGoals = goals.filter((g) => g.status === 'active');
    const completedGoals = goals.filter((g) => g.status === 'completed');
    const totalGoalsTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalGoalsSaved = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    const goalsCoverageRate = totalGoalsTarget > 0
      ? Math.min(100, Math.round((totalSavingsBalance / totalGoalsTarget) * 100))
      : 100;

    return {
      totalAvailableBalance,
      totalSavingsBalance,
      totalNetWorth,
      totalBalance: totalAvailableBalance,
      monthlyIncome,
      monthlyExpense,
      savingsRate,
      totalBudgetLimit,
      totalBudgetSpent,
      totalGoalsTarget,
      totalGoalsSaved,
      goalsCoverageRate,
      activeGoalsCount: activeGoals.length,
      completedGoalsCount: completedGoals.length,
    };
  }, [accounts, transactions, budgets, goals, selectedMonthYear]);

  // Consumo por Categoria
  const categorySpending = useMemo(() => {
    const expenseCategories = categories.filter((c) => c.type === 'expense' && c.id !== 'cat_transfer');
    const monthExpenses = transactions.filter(
      (t) => t.type === 'expense' && t.date.startsWith(selectedMonthYear)
    );

    return expenseCategories
      .map((cat) => {
        const spent = monthExpenses
          .filter((t) => t.categoryId === cat.id)
          .reduce((sum, t) => sum + t.amount, 0);

        const budget = budgets.find((b) => b.categoryId === cat.id);
        const percentage =
          budget && budget.amountLimit > 0 ? Math.round((spent / budget.amountLimit) * 100) : 0;

        return {
          category: cat,
          spent,
          budget,
          percentage,
        };
      })
      .sort((a, b) => b.spent - a.spent);
  }, [categories, transactions, budgets, selectedMonthYear]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) throw new Error('Utilizador não autenticado');
    const created = await firestoreService.addTransaction({
      ...data,
      userId: user.id,
    });
    storageService.addTransaction({ ...data, userId: user.id });
    await loadData();
    return created;
  };

  const updateTransaction = async (tx: Transaction) => {
    await firestoreService.updateTransaction(tx);
    storageService.updateTransaction(tx);
    await loadData();
  };

  const deleteTransaction = async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      await firestoreService.deleteTransaction(tx);
    }
    storageService.deleteTransaction(id);
    await loadData();
  };

  const saveBudget = async (categoryId: string, amountLimit: number) => {
    if (!user) return;
    await firestoreService.saveBudget({
      userId: user.id,
      categoryId,
      amountLimit,
      monthYear: selectedMonthYear,
    });
    storageService.saveBudget({
      userId: user.id,
      categoryId,
      amountLimit,
      monthYear: selectedMonthYear,
    });
    await loadData();
  };

  const deleteBudget = async (id: string) => {
    await firestoreService.deleteBudget(id);
    storageService.deleteBudget(id);
    await loadData();
  };

  const addCategory = async (cat: Omit<Category, 'id' | 'isSystem'>) => {
    const newCat: Category = {
      ...cat,
      id: 'cat_custom_' + Date.now(),
      isSystem: false,
    };
    await firestoreService.addCategory(newCat);
    storageService.addCategory(newCat);
    await loadData();
  };

  const createAccount = async (data: Omit<Account, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) throw new Error('Utilizador não autenticado');
    const acc = await firestoreService.createAccount({
      ...data,
      userId: user.id,
    });
    storageService.createAccount({ ...data, userId: user.id });
    await loadData();
    return acc;
  };

  const updateAccount = async (acc: Account) => {
    await firestoreService.updateAccount(acc);
    storageService.updateAccount(acc);
    await loadData();
  };

  const deleteAccount = async (id: string) => {
    await firestoreService.deleteAccount(id);
    storageService.deleteAccount(id);
    await loadData();
  };

  const transferBetweenAccounts = async (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    date: string,
    description?: string
  ) => {
    if (!user) throw new Error('Utilizador não autenticado');
    const tx = await firestoreService.transferBetweenAccounts(
      user.id,
      fromAccountId,
      toAccountId,
      amount,
      date,
      description
    );
    storageService.transferBetweenAccounts(user.id, fromAccountId, toAccountId, amount, date, description);
    await loadData();
    return tx;
  };

  const saveGoal = async (goalData: Omit<FinancialGoal, 'id' | 'createdAt' | 'userId'> & { id?: string }) => {
    if (!user) throw new Error('Utilizador não autenticado');
    const saved = await firestoreService.saveGoal({
      ...goalData,
      userId: user.id,
    });
    storageService.saveGoal({ ...goalData, userId: user.id });
    await loadData();
    return saved;
  };

  const deleteGoal = async (id: string) => {
    await firestoreService.deleteGoal(id);
    storageService.deleteGoal(id);
    await loadData();
  };

  const contributeToGoal = async (goalId: string, amount: number, sourceAccountId?: string, note?: string) => {
    if (!user) throw new Error('Utilizador não autenticado');
    await firestoreService.contributeToGoal(user.id, goalId, amount, sourceAccountId, note);
    storageService.contributeToGoal(user.id, goalId, amount, sourceAccountId, note);
    await loadData();
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        transactions,
        categories,
        budgets,
        tips,
        goals,
        selectedMonthYear,
        setSelectedMonthYear,
        summary,
        categorySpending,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        saveBudget,
        deleteBudget,
        addCategory,
        createAccount,
        updateAccount,
        deleteAccount,
        transferBetweenAccounts,
        saveGoal,
        deleteGoal,
        contributeToGoal,
        refreshData: loadData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) {
    throw new Error('useFinance deve ser utilizado dentro de FinanceProvider');
  }
  return ctx;
};

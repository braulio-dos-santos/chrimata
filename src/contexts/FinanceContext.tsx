import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, Category, Budget, EducationalTip, FinancialSummary, Account, FinancialGoal } from '../types/finance';
import { storageService, DEFAULT_CATEGORIES } from '../services/storage';
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
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => Transaction;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  saveBudget: (categoryId: string, amountLimit: number) => void;
  deleteBudget: (id: string) => void;
  addCategory: (cat: Omit<Category, 'id' | 'isSystem'>) => void;
  createAccount: (data: Omit<Account, 'id' | 'createdAt' | 'userId'>) => Account;
  updateAccount: (acc: Account) => void;
  deleteAccount: (id: string) => void;
  transferBetweenAccounts: (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    date: string,
    description?: string
  ) => Transaction;
  saveGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'userId'> & { id?: string }) => FinancialGoal;
  deleteGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number, sourceAccountId?: string, note?: string) => void;
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

  const loadData = useCallback(() => {
    if (!user) {
      setAccounts([]);
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      return;
    }
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
  }, [user, selectedMonthYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cálculos de Resumo Financeiro com Contas & Poupança Separada
  const summary: FinancialSummary = useMemo(() => {
    // 1. Saldo Disponível Operacional = Soma das contas NÃO-poupança (Conta Corrente, Minha Carteira, etc.)
    const totalAvailableBalance = accounts
      .filter((a) => !a.isSavings)
      .reduce((sum, a) => sum + a.balance, 0);

    // 2. Saldo de Poupança = Soma de todas as contas do tipo poupança (protegido do saldo geral)
    const totalSavingsBalance = accounts
      .filter((a) => a.isSavings)
      .reduce((sum, a) => sum + a.balance, 0);

    // 3. Património Total = Disponível + Poupança
    const totalNetWorth = totalAvailableBalance + totalSavingsBalance;

    // 4. Receitas e Despesas do Mês (Transferências internas entre contas não contam como despesa/receita externa)
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

    // 5. Métricas de Objectivos de Consumo & Poupança
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
      totalBalance: totalAvailableBalance, // Regra do utilizador: Poupança NÃO é contabilizada no geral
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

  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) throw new Error('Utilizador não autenticado');
    const created = storageService.addTransaction({
      ...data,
      userId: user.id,
    });
    loadData();
    return created;
  };

  const updateTransaction = (tx: Transaction) => {
    storageService.updateTransaction(tx);
    loadData();
  };

  const deleteTransaction = (id: string) => {
    storageService.deleteTransaction(id);
    loadData();
  };

  const saveBudget = (categoryId: string, amountLimit: number) => {
    if (!user) return;
    storageService.saveBudget({
      userId: user.id,
      categoryId,
      amountLimit,
      monthYear: selectedMonthYear,
    });
    loadData();
  };

  const deleteBudget = (id: string) => {
    storageService.deleteBudget(id);
    loadData();
  };

  const addCategory = (cat: Omit<Category, 'id' | 'isSystem'>) => {
    const newCat: Category = {
      ...cat,
      id: 'cat_custom_' + Date.now(),
      isSystem: false,
    };
    storageService.addCategory(newCat);
    loadData();
  };

  const createAccount = (data: Omit<Account, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) throw new Error('Utilizador não autenticado');
    const acc = storageService.createAccount({
      ...data,
      userId: user.id,
    });
    loadData();
    return acc;
  };

  const updateAccount = (acc: Account) => {
    storageService.updateAccount(acc);
    loadData();
  };

  const deleteAccount = (id: string) => {
    storageService.deleteAccount(id);
    loadData();
  };

  const transferBetweenAccounts = (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    date: string,
    description?: string
  ) => {
    if (!user) throw new Error('Utilizador não autenticado');
    const tx = storageService.transferBetweenAccounts(
      user.id,
      fromAccountId,
      toAccountId,
      amount,
      date,
      description
    );
    loadData();
    return tx;
  };

  const saveGoal = (goalData: Omit<FinancialGoal, 'id' | 'createdAt' | 'userId'> & { id?: string }) => {
    if (!user) throw new Error('Utilizador não autenticado');
    const saved = storageService.saveGoal({
      ...goalData,
      userId: user.id,
    });
    loadData();
    return saved;
  };

  const deleteGoal = (id: string) => {
    storageService.deleteGoal(id);
    loadData();
  };

  const contributeToGoal = (goalId: string, amount: number, sourceAccountId?: string, note?: string) => {
    if (!user) throw new Error('Utilizador não autenticado');
    storageService.contributeToGoal(user.id, goalId, amount, sourceAccountId, note);
    loadData();
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

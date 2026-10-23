export type UserRole = 'user' | 'admin';
export type ProfileType = 'student' | 'worker';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileType: ProfileType;
  avatar?: string;
  currency: string;
  institutionOrCompany?: string;
  createdAt: string;
}

export type AccountType = 'checking' | 'cash' | 'savings' | 'custom';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number; // Em Kwanzas (Kz)
  color?: string;
  icon?: string;
  institution?: string;
  isSavings: boolean; // Se true, NÃO é contabilizado no saldo geral operacional
  createdAt: string;
}

export interface CategorySpending {
  category: Category;
  spent: number;
  budget?: Budget;
  percentage: number;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export type PaymentMethod = 'multicaixa' | 'transferencia' | 'dinheiro' | 'outro';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isSystem: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  accountId?: string; // Conta debitada ou creditada
  toAccountId?: string; // Conta de destino em caso de transferência
  title: string;
  amount: number; // Em Kwanzas (Kz)
  type: TransactionType;
  date: string; // YYYY-MM-DD
  description?: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amountLimit: number; // Em Kwanzas (Kz)
  monthYear: string; // YYYY-MM
}

export interface EducationalTip {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'orcamento' | 'poupanca' | 'investimento' | 'dividas';
  targetAudience: 'student' | 'worker' | 'all';
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  readTime: string;
  practicalAction?: string;
}

export type GoalTerm = 'short' | 'medium' | 'long';

export interface FinancialGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number; // Em Kwanzas (Kz)
  currentAmount: number; // Em Kwanzas (Kz)
  deadline: string; // YYYY-MM-DD
  term: GoalTerm; // Curto, Médio ou Longo prazo
  category: string; // Tecnologia, Educação, Habitação, Veículo, etc.
  savingsAccountId?: string; // Conta de poupança associada
  status: 'active' | 'completed';
  notes?: string;
  createdAt: string;
}

export interface FinancialSummary {
  totalAvailableBalance: number; // Apenas contas operacionais (exclui Poupança)
  totalSavingsBalance: number; // Total guardado na(s) conta(s) de Poupança
  totalNetWorth: number; // Património total (Disponível + Poupança)
  totalBalance: number; // Saldo geral operacional (= totalAvailableBalance)
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number; // percentagem (0 - 100)
  totalBudgetLimit: number;
  totalBudgetSpent: number;
  totalGoalsTarget: number; // Total almejado em objectivos
  totalGoalsSaved: number; // Total já poupado para os objectivos
  goalsCoverageRate: number; // Rácio de cobertura da poupança sobre os objectivos
  activeGoalsCount: number; // Número de objectivos em progresso
  completedGoalsCount: number; // Número de objectivos alcançados
}


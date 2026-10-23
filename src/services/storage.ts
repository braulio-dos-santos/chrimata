import { User, Category, Transaction, Budget, EducationalTip, FinancialGoal, Account, AccountType } from '../types/finance';
import { getCurrentMonthYear } from '../utils/currency';

const STORAGE_KEYS = {
  USERS: 'chrimata_users_v2',
  CURRENT_USER: 'chrimata_current_user_v2',
  CATEGORIES: 'chrimata_categories_v2',
  TRANSACTIONS: 'chrimata_transactions_v2',
  BUDGETS: 'chrimata_budgets_v2',
  TIPS: 'chrimata_educational_tips_v2',
  GOALS: 'chrimata_goals_v2',
  ACCOUNTS: 'chrimata_accounts_v2',
};

export const DEFAULT_CATEGORIES: Category[] = [
  // Receitas
  { id: 'cat_salario', name: 'Salário & Vencimento', type: 'income', icon: 'Briefcase', color: '#16A34A', isSystem: true },
  { id: 'cat_bolsa', name: 'Bolsa & Mesada', type: 'income', icon: 'GraduationCap', color: '#10B981', isSystem: true },
  { id: 'cat_freelance', name: 'Freelance & Biscate', type: 'income', icon: 'Laptop', color: '#0F766E', isSystem: true },
  { id: 'cat_invest', name: 'Rendimentos & Investimentos', type: 'income', icon: 'TrendingUp', color: '#0284C7', isSystem: true },
  { id: 'cat_outras_rec', name: 'Outras Receitas', type: 'income', icon: 'PlusCircle', color: '#64748B', isSystem: true },

  // Despesas
  { id: 'cat_alimentacao', name: 'Alimentação & Supermercado', type: 'expense', icon: 'ShoppingCart', color: '#F97316', isSystem: true },
  { id: 'cat_habitacao', name: 'Habitação & Renda', type: 'expense', icon: 'Home', color: '#6366F1', isSystem: true },
  { id: 'cat_transporte', name: 'Transporte & Táxi/Combustível', type: 'expense', icon: 'Car', color: '#0284C7', isSystem: true },
  { id: 'cat_educacao', name: 'Educação & Materiais', type: 'expense', icon: 'BookOpen', color: '#8B5CF6', isSystem: true },
  { id: 'cat_saude', name: 'Saúde & Farmácia', type: 'expense', icon: 'HeartPulse', color: '#EF4444', isSystem: true },
  { id: 'cat_servicos', name: 'Serviços (Luz, Água, Internet)', type: 'expense', icon: 'Zap', color: '#F59E0B', isSystem: true },
  { id: 'cat_lazer', name: 'Lazer & Convívio', type: 'expense', icon: 'Coffee', color: '#EC4899', isSystem: true },
  { id: 'cat_poupanca', name: 'Poupança & Aportes', type: 'expense', icon: 'PiggyBank', color: '#10B981', isSystem: true },
  { id: 'cat_outras_desp', name: 'Outras Despesas', type: 'expense', icon: 'MoreHorizontal', color: '#64748B', isSystem: true },
  { id: 'cat_transfer', name: 'Transferência entre Contas', type: 'expense', icon: 'ArrowLeftRight', color: '#6366F1', isSystem: true },
];

export const DEMO_USERS: User[] = [
  {
    id: 'user_admin',
    name: 'Administrador Chrímata',
    email: 'admin@chrimata.ao',
    role: 'admin',
    profileType: 'worker',
    currency: 'AOA',
    institutionOrCompany: 'Gabinete de Gestão Chrímata',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export function createDemoAccounts(): Account[] {
  return [
    // Contas do Administrador
    {
      id: 'acc_admin_checking',
      userId: 'user_admin',
      name: 'Minha Conta Corrente',
      type: 'checking',
      balance: 550000,
      color: '#0284C7',
      isSavings: false,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'acc_admin_cash',
      userId: 'user_admin',
      name: 'Minha Carteira (Dinheiro Físico)',
      type: 'cash',
      balance: 40000,
      color: '#16A34A',
      isSavings: false,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'acc_admin_savings',
      userId: 'user_admin',
      name: 'Poupança Corporativa',
      type: 'savings',
      balance: 1200000,
      color: '#0F766E',
      isSavings: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];
}

function createDemoTransactions(): Transaction[] {
  const currentMonth = getCurrentMonthYear();
  const [year, month] = currentMonth.split('-');

  return [
    {
      id: 'tx_a1',
      userId: 'user_admin',
      accountId: 'acc_admin_checking',
      categoryId: 'cat_salario',
      title: 'Vencimento de Gestão',
      amount: 850000,
      type: 'income',
      date: `${year}-${month}-01`,
      description: 'Crédito na Conta Corrente',
      paymentMethod: 'transferencia',
      createdAt: `${year}-${month}-01T09:00:00Z`,
    },
    {
      id: 'tx_a_tr1',
      userId: 'user_admin',
      accountId: 'acc_admin_checking',
      toAccountId: 'acc_admin_cash',
      categoryId: 'cat_transfer',
      title: 'Levantamento para Carteira',
      amount: 50000,
      type: 'transfer',
      date: `${year}-${month}-02`,
      description: 'Dinheiro vivo para carteira física',
      paymentMethod: 'multicaixa',
      createdAt: `${year}-${month}-02T12:00:00Z`,
    },
    {
      id: 'tx_a_tr2',
      userId: 'user_admin',
      accountId: 'acc_admin_checking',
      toAccountId: 'acc_admin_savings',
      categoryId: 'cat_transfer',
      title: 'Aporte para Poupança Corporativa',
      amount: 200000,
      type: 'transfer',
      date: `${year}-${month}-03`,
      description: 'Transferência para Poupança (fora do saldo operacional)',
      paymentMethod: 'transferencia',
      createdAt: `${year}-${month}-03T10:00:00Z`,
    },
  ];
}

function createDemoBudgets(): Budget[] {
  const currentMonth = getCurrentMonthYear();
  return [
    { id: 'b_a1', userId: 'user_admin', categoryId: 'cat_alimentacao', amountLimit: 150000, monthYear: currentMonth },
    { id: 'b_a2', userId: 'user_admin', categoryId: 'cat_servicos', amountLimit: 50000, monthYear: currentMonth },
    { id: 'b_a3', userId: 'user_admin', categoryId: 'cat_transporte', amountLimit: 60000, monthYear: currentMonth },
  ];
}

export const DEFAULT_TIPS: EducationalTip[] = [
  {
    id: 'tip_contas_organizacao',
    title: 'Separar Contas: A Chave para Nunca Gastar a Poupança',
    summary: 'Porque deve manter o dinheiro da carteira, da conta corrente e da poupança em lugares diferentes.',
    content: `Quando misturamos todo o dinheiro numa única conta ou na carteira, o cérebro tem a falsa sensação de abundância.
    
No Chrímata aplicamos o princípio dos 3 potes:
1. Minha Conta Corrente: Onde entram o salário ou as bolsas e de onde saem os débitos fixos (renda, internet, transferências).
2. Minha Carteira: Dinheiro físico levantado para o táxi, pequenos lanches e imprevistos na rua.
3. Poupança: Uma conta à parte que NÃO é contabilizada no saldo geral disponível. Assim, quando olhar para o seu saldo, vê apenas o que pode gastar sem tocar no seu futuro!`,
    category: 'poupanca',
    targetAudience: 'all',
    difficulty: 'iniciante',
    readTime: '3 min',
    practicalAction: 'Configure transferências automáticas da conta corrente para a sua poupança.',
  },
  {
    id: 'tip_503020',
    title: 'A Regra 50/30/20 Adaptada à Realidade Angolana',
    summary: 'Aprenda a dividir o seu salário ou rendimento mensal de forma equilibrada e sem sufoco.',
    content: `A regra 50/30/20 é uma das metodologias mais comprovadas para organizar finanças pessoais:
- 50% para Necessidades Essenciais: Renda/habitação, alimentação básica, água, luz, transporte diário e saúde.
- 30% para Desejos e Qualidade de Vida: Refeições fora, lazer em família, roupas, hobbies e telecomunicações extras.
- 20% para o Futuro (Poupança e Dívidas): Reserva de emergência, quitação de empréstimos e investimentos.

Dica para a nossa realidade: Se os custos fixos em Luanda ou províncias exigirem mais de 50%, comece com a regra adaptada de 60/25/15 e vá optimizando aos poucos!`,
    category: 'orcamento',
    targetAudience: 'all',
    difficulty: 'iniciante',
    readTime: '3 min',
    practicalAction: 'Simule a sua divisão de rendimentos na calculadora.',
  },
  {
    id: 'tip_emergencia',
    title: 'Fundo de Emergência: O Seu Escudo Contra Imprevistos',
    summary: 'Porque deve ter guardado de 3 a 6 meses do seu custo de vida básico antes de pensar em gastar.',
    content: `Um fundo de emergência serve para cobrir eventualidades como avarias de viatura, problemas médicos familiares, atrasos salariais ou imprevistos habitacionais.
    
Passos para construir:
1. Calcule o seu custo de vida mínimo mensal.
2. Não tente juntar tudo de uma vez: separe 10% a 20% de cada ganho para a conta Poupança.
3. Guarde este valor num local seguro com liquidez (depósito a prazo).
4. Lembre-se: no Chrímata a sua Poupança fica protegida e não entra no saldo operacional do dia-a-dia!`,
    category: 'poupanca',
    targetAudience: 'all',
    difficulty: 'iniciante',
    readTime: '4 min',
  },
];

export function createDemoGoals(): FinancialGoal[] {
  return [
    // Metas do Administrador
    {
      id: 'goal_admin_reserve',
      userId: 'user_admin',
      title: 'Fundo Estratégico de Reserva',
      targetAmount: 2500000,
      currentAmount: 1200000,
      deadline: '2026-12-31',
      term: 'short',
      category: 'Reserva & Segurança',
      savingsAccountId: 'acc_admin_savings',
      status: 'active',
      notes: 'Manutenção de liquidez operacional e de contingência.',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'goal_admin_exp',
      userId: 'user_admin',
      title: 'Expansão de Projecto Financeiro',
      targetAmount: 8000000,
      currentAmount: 2400000,
      deadline: '2028-06-30',
      term: 'medium',
      category: 'Educação & Especialização',
      savingsAccountId: 'acc_admin_savings',
      status: 'active',
      notes: 'Fundo reservado para investimento de médio prazo.',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];
}

export function initStorage(): void {
  if (typeof window === 'undefined') return;

  const existingUsersRaw = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!existingUsersRaw) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
  } else {
    try {
      const parsed: User[] = JSON.parse(existingUsersRaw);
      // Remove legacy test users
      const cleaned = parsed.filter(u => u.id !== 'user_student' && u.id !== 'user_worker');
      if (cleaned.length === 0) cleaned.push(DEMO_USERS[0]);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(cleaned));
    } catch {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
    }
  }

  // Clear legacy storage keys
  localStorage.removeItem('chrimata_current_user_v1');
  localStorage.removeItem('chrimata_current_user');
  localStorage.removeItem('chrimata_user');

  const currentUserRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (currentUserRaw) {
    try {
      const cur: User = JSON.parse(currentUserRaw);
      if (!cur || !cur.id || cur.id === 'user_student' || cur.id === 'user_worker') {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(createDemoAccounts()));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(createDemoTransactions()));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BUDGETS)) {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(createDemoBudgets()));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TIPS)) {
    localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify(DEFAULT_TIPS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(createDemoGoals()));
  }
}

export const storageService = {
  // Utilizadores
  getUsers(): User[] {
    initStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : DEMO_USERS;
    } catch {
      return DEMO_USERS;
    }
  },

  getCurrentUser(): User | null {
    initStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    const current = this.getCurrentUser();
    if (current?.id === user.id) {
      this.setCurrentUser(user);
    }
  },

  // Contas
  getAccounts(userId?: string): Account[] {
    initStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      const list: Account[] = data ? JSON.parse(data) : createDemoAccounts();
      if (userId) {
        return list.filter(a => a.userId === userId);
      }
      return list;
    } catch {
      return [];
    }
  },

  createAccount(data: Omit<Account, 'id' | 'createdAt'>): Account {
    const accounts = this.getAccounts();
    const newAcc: Account = {
      ...data,
      id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      isSavings: data.type === 'savings' || data.isSavings,
      createdAt: new Date().toISOString(),
    };
    accounts.push(newAcc);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    return newAcc;
  },

  updateAccount(account: Account): void {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex(a => a.id === account.id);
    if (idx >= 0) {
      accounts[idx] = {
        ...account,
        isSavings: account.type === 'savings' || account.isSavings,
      };
    } else {
      accounts.push({
        ...account,
        isSavings: account.type === 'savings' || account.isSavings,
      });
    }
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  deleteAccount(id: string): void {
    const accounts = this.getAccounts();
    const filtered = accounts.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(filtered));
  },

  // Transferências entre Contas
  transferBetweenAccounts(
    userId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    date: string,
    description?: string
  ): Transaction {
    const accounts = this.getAccounts();
    const fromAcc = accounts.find(a => a.id === fromAccountId);
    const toAcc = accounts.find(a => a.id === toAccountId);

    if (!fromAcc || !toAcc) {
      throw new Error('Contas de origem ou destino não encontradas.');
    }

    if (fromAcc.id === toAcc.id) {
      throw new Error('A conta de origem não pode ser igual à conta de destino.');
    }

    if (amount <= 0) {
      throw new Error('O montante a transferir deve ser superior a zero.');
    }

    // Debita a conta de origem e credita a de destino
    fromAcc.balance -= amount;
    toAcc.balance += amount;
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));

    // Regista a transacção do tipo transfer
    const newTx: Transaction = {
      id: 'tx_tr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      categoryId: 'cat_transfer',
      accountId: fromAccountId,
      toAccountId,
      title: `Transferência: ${fromAcc.name} ➔ ${toAcc.name}`,
      amount,
      type: 'transfer',
      date,
      description: description || `Transferência de fundos entre contas internas.`,
      paymentMethod: fromAcc.type === 'cash' ? 'dinheiro' : 'transferencia',
      createdAt: new Date().toISOString(),
    };

    const transactions = this.getTransactions();
    transactions.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    return newTx;
  },

  // Categorias
  getCategories(): Category[] {
    initStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  addCategory(category: Category): void {
    const categories = this.getCategories();
    categories.push(category);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  // Transacções
  getTransactions(userId?: string): Transaction[] {
    initStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const list: Transaction[] = data ? JSON.parse(data) : [];
      if (userId) {
        return list.filter(t => t.userId === userId);
      }
      return list;
    } catch {
      return [];
    }
  },

  addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const transactions = this.getTransactions();
    const newTx: Transaction = {
      ...tx,
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };

    // Actualiza o saldo da conta associada se fornecida
    if (tx.accountId) {
      const accounts = this.getAccounts();
      const acc = accounts.find(a => a.id === tx.accountId);
      if (acc) {
        if (tx.type === 'income') {
          acc.balance += tx.amount;
        } else if (tx.type === 'expense') {
          acc.balance -= tx.amount;
        }
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      }
    }

    transactions.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return newTx;
  },

  updateTransaction(tx: Transaction): void {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === tx.id);
    if (index >= 0) {
      transactions[index] = tx;
    } else {
      transactions.unshift(tx);
    }
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  deleteTransaction(id: string): void {
    const transactions = this.getTransactions();
    const toDelete = transactions.find(t => t.id === id);

    if (toDelete && toDelete.accountId) {
      const accounts = this.getAccounts();
      const acc = accounts.find(a => a.id === toDelete.accountId);
      if (acc) {
        if (toDelete.type === 'income') {
          acc.balance -= toDelete.amount;
        } else if (toDelete.type === 'expense') {
          acc.balance += toDelete.amount;
        } else if (toDelete.type === 'transfer' && toDelete.toAccountId) {
          const toAcc = accounts.find(a => a.id === toDelete.toAccountId);
          acc.balance += toDelete.amount;
          if (toAcc) toAcc.balance -= toDelete.amount;
        }
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      }
    }

    const filtered = transactions.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
  },

  // Orçamentos
  getBudgets(userId?: string, monthYear?: string): Budget[] {
    initStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      const list: Budget[] = data ? JSON.parse(data) : [];
      return list.filter(b => {
        if (userId && b.userId !== userId) return false;
        if (monthYear && b.monthYear !== monthYear) return false;
        return true;
      });
    } catch {
      return [];
    }
  },

  saveBudget(budget: Omit<Budget, 'id'> & { id?: string }): Budget {
    const budgets = this.getBudgets();
    let updated: Budget;
    if (budget.id) {
      const index = budgets.findIndex(b => b.id === budget.id);
      if (index >= 0) {
        budgets[index] = budget as Budget;
        updated = budgets[index];
      } else {
        updated = { ...budget, id: 'b_' + Date.now() };
        budgets.push(updated);
      }
    } else {
      const existing = budgets.findIndex(b => b.userId === budget.userId && b.categoryId === budget.categoryId && b.monthYear === budget.monthYear);
      if (existing >= 0) {
        budgets[existing].amountLimit = budget.amountLimit;
        updated = budgets[existing];
      } else {
        updated = { ...budget, id: 'b_' + Date.now() };
        budgets.push(updated);
      }
    }
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    return updated;
  },

  deleteBudget(id: string): void {
    const budgets = this.getBudgets();
    const filtered = budgets.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(filtered));
  },

  // Dicas Educativas
  getTips(): EducationalTip[] {
    initStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIPS);
      return data ? JSON.parse(data) : DEFAULT_TIPS;
    } catch {
      return DEFAULT_TIPS;
    }
  },

  // Objectivos de Consumo e Poupança (Curto, Médio e Longo Prazo)
  getGoals(userId?: string): FinancialGoal[] {
    initStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      const list: FinancialGoal[] = data ? JSON.parse(data) : createDemoGoals();
      if (userId) {
        return list.filter(g => g.userId === userId);
      }
      return list;
    } catch {
      return [];
    }
  },

  saveGoal(goal: Omit<FinancialGoal, 'id' | 'createdAt'> & { id?: string }): FinancialGoal {
    const goals = this.getGoals();
    let updated: FinancialGoal;
    if (goal.id) {
      const index = goals.findIndex(g => g.id === goal.id);
      if (index >= 0) {
        goals[index] = {
          ...goals[index],
          ...goal,
          status: goal.currentAmount >= goal.targetAmount ? 'completed' : (goal.status || 'active'),
        };
        updated = goals[index];
      } else {
        updated = {
          ...goal,
          id: 'goal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          status: goal.currentAmount >= goal.targetAmount ? 'completed' : 'active',
          createdAt: new Date().toISOString(),
        };
        goals.push(updated);
      }
    } else {
      updated = {
        ...goal,
        id: 'goal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        status: goal.currentAmount >= goal.targetAmount ? 'completed' : 'active',
        createdAt: new Date().toISOString(),
      };
      goals.push(updated);
    }
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return updated;
  },

  deleteGoal(id: string): void {
    const goals = this.getGoals();
    const filtered = goals.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(filtered));
  },

  contributeToGoal(
    userId: string,
    goalId: string,
    amount: number,
    sourceAccountId?: string,
    note?: string
  ): { goal: FinancialGoal; tx?: Transaction } {
    if (amount <= 0) {
      throw new Error('O montante do aporte deve ser superior a zero.');
    }
    const goals = this.getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
      throw new Error('Objectivo não encontrado.');
    }

    let createdTx: Transaction | undefined;

    // Se fornecida conta de débito (ex: Corrente ou Carteira), transfere o valor para a Conta de Poupança vinculada
    if (sourceAccountId) {
      const accounts = this.getAccounts();
      const sourceAcc = accounts.find(a => a.id === sourceAccountId);
      if (!sourceAcc) {
        throw new Error('Conta de débito não encontrada.');
      }
      if (sourceAcc.balance < amount) {
        throw new Error(`Saldo insuficiente na conta ${sourceAcc.name} (Saldo actual: ${sourceAcc.balance} Kz).`);
      }

      sourceAcc.balance -= amount;

      // Se o objectivo possui uma conta de poupança vinculada, credita o saldo da poupança
      if (goal.savingsAccountId) {
        const savingsAcc = accounts.find(a => a.id === goal.savingsAccountId);
        if (savingsAcc) {
          savingsAcc.balance += amount;
        }
      }
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));

      // Regista transacção interna de aporte
      createdTx = {
        id: 'tx_aporte_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        userId,
        categoryId: 'cat_poupanca',
        accountId: sourceAccountId,
        toAccountId: goal.savingsAccountId,
        title: `Aporte Objectivo: ${goal.title}`,
        amount,
        type: 'transfer',
        date: new Date().toISOString().split('T')[0],
        description: note || `Aporte dedicado ao objectivo "${goal.title}" (${goal.term === 'short' ? 'Curto' : goal.term === 'medium' ? 'Médio' : 'Longo'} Prazo).`,
        paymentMethod: sourceAcc.type === 'cash' ? 'dinheiro' : 'transferencia',
        createdAt: new Date().toISOString(),
      };

      const transactions = this.getTransactions();
      transactions.unshift(createdTx);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }

    // Actualiza o progresso do objectivo
    goal.currentAmount += amount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));

    return { goal, tx: createdTx };
  },

  // Redefinir para dados de fábrica
  resetToDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(createDemoAccounts()));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(createDemoTransactions()));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(createDemoBudgets()));
    localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify(DEFAULT_TIPS));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(createDemoGoals()));
  },
};

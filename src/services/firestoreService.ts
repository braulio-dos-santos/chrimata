import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { User, Account, Transaction, Category, Budget, EducationalTip, FinancialGoal } from '../types/finance';
import { storageService, DEFAULT_CATEGORIES, DEFAULT_TIPS, createDemoAccounts } from './storage';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
}

export const firestoreService = {
  // Utilizadores
  async getUserProfile(userId: string): Promise<User | null> {
    if (!auth.currentUser) return storageService.getCurrentUser();
    const path = `users/${userId}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        return snap.data() as User;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return storageService.getCurrentUser();
    }
  },

  async saveUserProfile(user: User): Promise<void> {
    if (!auth.currentUser) {
      storageService.saveUser(user);
      return;
    }
    const path = `users/${user.id}`;
    try {
      await setDoc(doc(db, 'users', user.id), user, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      storageService.saveUser(user);
    }
  },

  // Operações de Admin Global
  async getAllUsers(): Promise<User[]> {
    if (!auth.currentUser) return storageService.getUsers();
    const path = 'users';
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (snap.empty) return storageService.getUsers();
      return snap.docs.map(d => d.data() as User);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return storageService.getUsers();
    }
  },

  async deleteUser(userId: string): Promise<void> {
    if (!auth.currentUser) return;
    const path = `users/${userId}`;
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  async getAllAccountsGlobal(): Promise<Account[]> {
    if (!auth.currentUser) return storageService.getAccounts();
    const path = 'accounts';
    try {
      const snap = await getDocs(collection(db, 'accounts'));
      return snap.docs.map(d => d.data() as Account);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return storageService.getAccounts();
    }
  },

  async getAllTransactionsGlobal(): Promise<Transaction[]> {
    if (!auth.currentUser) return storageService.getTransactions();
    const path = 'transactions';
    try {
      const snap = await getDocs(collection(db, 'transactions'));
      const list = snap.docs.map(d => d.data() as Transaction);
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return storageService.getTransactions();
    }
  },

  async getAllGoalsGlobal(): Promise<FinancialGoal[]> {
    if (!auth.currentUser) return storageService.getGoals();
    const path = 'goals';
    try {
      const snap = await getDocs(collection(db, 'goals'));
      return snap.docs.map(d => d.data() as FinancialGoal);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return storageService.getGoals();
    }
  },

  // Contas do Utilizador
  async getAccounts(userId: string): Promise<Account[]> {
    if (!auth.currentUser) {
      return storageService.getAccounts(userId);
    }
    const path = 'accounts';
    try {
      const q = query(collection(db, 'accounts'), where('userId', '==', auth.currentUser.uid));
      const snap = await getDocs(q);
      const accounts: Account[] = snap.docs.map(d => d.data() as Account);

      if (accounts.length === 0) {
        const demo = createDemoAccounts().map(acc => ({
          ...acc,
          id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          userId: auth.currentUser!.uid,
        }));
        for (const acc of demo) {
          try {
            await setDoc(doc(db, 'accounts', acc.id), acc);
          } catch (e) {
            handleFirestoreError(e, OperationType.CREATE, `accounts/${acc.id}`);
          }
        }
        return demo;
      }

      return accounts;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return storageService.getAccounts(userId);
    }
  },

  async createAccount(data: Omit<Account, 'id' | 'createdAt'>): Promise<Account> {
    const newAcc: Account = {
      ...data,
      id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      isSavings: data.type === 'savings' || data.isSavings,
      createdAt: new Date().toISOString(),
    };

    if (!auth.currentUser) {
      return storageService.createAccount(data);
    }

    const path = `accounts/${newAcc.id}`;
    try {
      await setDoc(doc(db, 'accounts', newAcc.id), newAcc);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
    return newAcc;
  },

  async updateAccount(account: Account): Promise<void> {
    if (!auth.currentUser) {
      storageService.updateAccount(account);
      return;
    }
    const path = `accounts/${account.id}`;
    try {
      await setDoc(doc(db, 'accounts', account.id), account, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
      storageService.updateAccount(account);
    }
  },

  async deleteAccount(id: string): Promise<void> {
    if (!auth.currentUser) {
      storageService.deleteAccount(id);
      return;
    }
    const path = `accounts/${id}`;
    try {
      await deleteDoc(doc(db, 'accounts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
      storageService.deleteAccount(id);
    }
  },

  // Transacções
  async getTransactions(userId: string): Promise<Transaction[]> {
    if (!auth.currentUser) {
      return storageService.getTransactions(userId);
    }
    const path = 'transactions';
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', auth.currentUser.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => d.data() as Transaction);
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return storageService.getTransactions(userId);
    }
  },

  async addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const newTx: Transaction = {
      ...tx,
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };

    if (!auth.currentUser) {
      return storageService.addTransaction(tx);
    }

    const path = `transactions/${newTx.id}`;
    try {
      await runTransaction(db, async (tr) => {
        tr.set(doc(db, 'transactions', newTx.id), newTx);

        if (tx.accountId) {
          const accRef = doc(db, 'accounts', tx.accountId);
          const accSnap = await tr.get(accRef);
          if (accSnap.exists()) {
            const acc = accSnap.data() as Account;
            let newBalance = acc.balance;
            if (tx.type === 'income') newBalance += tx.amount;
            else if (tx.type === 'expense') newBalance -= tx.amount;
            tr.update(accRef, { balance: newBalance });
          }
        }
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      return storageService.addTransaction(tx);
    }

    return newTx;
  },

  async updateTransaction(tx: Transaction): Promise<void> {
    if (!auth.currentUser) {
      storageService.updateTransaction(tx);
      return;
    }
    const path = `transactions/${tx.id}`;
    try {
      await setDoc(doc(db, 'transactions', tx.id), tx, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
      storageService.updateTransaction(tx);
    }
  },

  async deleteTransaction(tx: Transaction): Promise<void> {
    if (!auth.currentUser) {
      storageService.deleteTransaction(tx.id);
      return;
    }
    const path = `transactions/${tx.id}`;
    try {
      await runTransaction(db, async (tr) => {
        tr.delete(doc(db, 'transactions', tx.id));

        if (tx.accountId) {
          const accRef = doc(db, 'accounts', tx.accountId);
          const accSnap = await tr.get(accRef);
          if (accSnap.exists()) {
            const acc = accSnap.data() as Account;
            let newBalance = acc.balance;
            if (tx.type === 'income') newBalance -= tx.amount;
            else if (tx.type === 'expense') newBalance += tx.amount;
            else if (tx.type === 'transfer' && tx.toAccountId) {
              const toAccRef = doc(db, 'accounts', tx.toAccountId);
              const toAccSnap = await tr.get(toAccRef);
              newBalance += tx.amount;
              if (toAccSnap.exists()) {
                const toAcc = toAccSnap.data() as Account;
                tr.update(toAccRef, { balance: toAcc.balance - tx.amount });
              }
            }
            tr.update(accRef, { balance: newBalance });
          }
        }
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
      storageService.deleteTransaction(tx.id);
    }
  },

  // Transferências entre contas
  async transferBetweenAccounts(
    userId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    date: string,
    description?: string
  ): Promise<Transaction> {
    if (!auth.currentUser) {
      return storageService.transferBetweenAccounts(userId, fromAccountId, toAccountId, amount, date, description);
    }

    const path = 'transactions';
    try {
      let createdTx: Transaction | null = null;

      await runTransaction(db, async (tr) => {
        const fromRef = doc(db, 'accounts', fromAccountId);
        const toRef = doc(db, 'accounts', toAccountId);

        const fromSnap = await tr.get(fromRef);
        const toSnap = await tr.get(toRef);

        if (!fromSnap.exists() || !toSnap.exists()) {
          throw new Error('Conta de origem ou destino não encontrada.');
        }

        const fromAcc = fromSnap.data() as Account;
        const toAcc = toSnap.data() as Account;

        if (amount <= 0) {
          throw new Error('O montante deve ser superior a zero.');
        }

        tr.update(fromRef, { balance: fromAcc.balance - amount });
        tr.update(toRef, { balance: toAcc.balance + amount });

        const newTx: Transaction = {
          id: 'tx_tr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          userId: auth.currentUser!.uid,
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

        tr.set(doc(db, 'transactions', newTx.id), newTx);
        createdTx = newTx;
      });

      if (!createdTx) throw new Error('Falha ao concluir a transferência.');
      return createdTx;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      return storageService.transferBetweenAccounts(userId, fromAccountId, toAccountId, amount, date, description);
    }
  },

  // Categorias
  async getCategories(): Promise<Category[]> {
    if (!auth.currentUser) {
      return storageService.getCategories();
    }
    const path = 'categories';
    try {
      const snap = await getDocs(collection(db, 'categories'));
      if (snap.empty) {
        for (const cat of DEFAULT_CATEGORIES) {
          try {
            await setDoc(doc(db, 'categories', cat.id), cat);
          } catch (e) {
            handleFirestoreError(e, OperationType.CREATE, `categories/${cat.id}`);
          }
        }
        return DEFAULT_CATEGORIES;
      }
      return snap.docs.map(d => d.data() as Category);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return storageService.getCategories();
    }
  },

  async addCategory(cat: Category): Promise<void> {
    if (!auth.currentUser) {
      storageService.addCategory(cat);
      return;
    }
    const path = `categories/${cat.id}`;
    try {
      await setDoc(doc(db, 'categories', cat.id), cat);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      storageService.addCategory(cat);
    }
  },

  // Orçamentos
  async getBudgets(userId: string, monthYear: string): Promise<Budget[]> {
    if (!auth.currentUser) {
      return storageService.getBudgets(userId, monthYear);
    }
    const path = 'budgets';
    try {
      const q = query(
        collection(db, 'budgets'), 
        where('userId', '==', auth.currentUser.uid), 
        where('monthYear', '==', monthYear)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as Budget);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return storageService.getBudgets(userId, monthYear);
    }
  },

  async saveBudget(budget: Omit<Budget, 'id'> & { id?: string }): Promise<Budget> {
    const id = budget.id || ('b_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
    const fullBudget: Budget = {
      ...budget,
      id,
    };

    if (!auth.currentUser) {
      return storageService.saveBudget(budget);
    }

    const path = `budgets/${id}`;
    try {
      await setDoc(doc(db, 'budgets', id), fullBudget, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      return storageService.saveBudget(budget);
    }
    return fullBudget;
  },

  async deleteBudget(id: string): Promise<void> {
    if (!auth.currentUser) {
      storageService.deleteBudget(id);
      return;
    }
    const path = `budgets/${id}`;
    try {
      await deleteDoc(doc(db, 'budgets', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
      storageService.deleteBudget(id);
    }
  },

  // Objectivos
  async getGoals(userId: string): Promise<FinancialGoal[]> {
    if (!auth.currentUser) {
      return storageService.getGoals(userId);
    }
    const path = 'goals';
    try {
      const q = query(collection(db, 'goals'), where('userId', '==', auth.currentUser.uid));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as FinancialGoal);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return storageService.getGoals(userId);
    }
  },

  async saveGoal(goal: Omit<FinancialGoal, 'id' | 'createdAt'> & { id?: string }): Promise<FinancialGoal> {
    const id = goal.id || ('goal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
    const fullGoal: FinancialGoal = {
      ...goal,
      id,
      status: goal.currentAmount >= goal.targetAmount ? 'completed' : (goal.status || 'active'),
      createdAt: new Date().toISOString(),
    };

    if (!auth.currentUser) {
      return storageService.saveGoal(goal);
    }

    const path = `goals/${id}`;
    try {
      await setDoc(doc(db, 'goals', id), fullGoal, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      return storageService.saveGoal(goal);
    }
    return fullGoal;
  },

  async deleteGoal(id: string): Promise<void> {
    if (!auth.currentUser) {
      storageService.deleteGoal(id);
      return;
    }
    const path = `goals/${id}`;
    try {
      await deleteDoc(doc(db, 'goals', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
      storageService.deleteGoal(id);
    }
  },

  async contributeToGoal(
    userId: string,
    goalId: string,
    amount: number,
    sourceAccountId?: string,
    note?: string
  ): Promise<void> {
    if (!auth.currentUser) {
      storageService.contributeToGoal(userId, goalId, amount, sourceAccountId, note);
      return;
    }

    const path = `goals/${goalId}`;
    try {
      await runTransaction(db, async (tr) => {
        const goalRef = doc(db, 'goals', goalId);
        const goalSnap = await tr.get(goalRef);
        if (!goalSnap.exists()) throw new Error('Objectivo não encontrado.');

        const goal = goalSnap.data() as FinancialGoal;

        if (sourceAccountId) {
          const sourceRef = doc(db, 'accounts', sourceAccountId);
          const sourceSnap = await tr.get(sourceRef);
          if (!sourceSnap.exists()) throw new Error('Conta de débito não encontrada.');

          const sourceAcc = sourceSnap.data() as Account;
          if (sourceAcc.balance < amount) {
            throw new Error(`Saldo insuficiente na conta ${sourceAcc.name}.`);
          }

          tr.update(sourceRef, { balance: sourceAcc.balance - amount });

          if (goal.savingsAccountId) {
            const savingsRef = doc(db, 'accounts', goal.savingsAccountId);
            const savingsSnap = await tr.get(savingsRef);
            if (savingsSnap.exists()) {
              const savingsAcc = savingsSnap.data() as Account;
              tr.update(savingsRef, { balance: savingsAcc.balance + amount });
            }
          }

          const txId = 'tx_aporte_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
          const newTx: Transaction = {
            id: txId,
            userId: auth.currentUser!.uid,
            categoryId: 'cat_poupanca',
            accountId: sourceAccountId,
            toAccountId: goal.savingsAccountId,
            title: `Aporte Objectivo: ${goal.title}`,
            amount,
            type: 'transfer',
            date: new Date().toISOString().split('T')[0],
            description: note || `Aporte dedicado ao objectivo "${goal.title}".`,
            paymentMethod: sourceAcc.type === 'cash' ? 'dinheiro' : 'transferencia',
            createdAt: new Date().toISOString(),
          };

          tr.set(doc(db, 'transactions', txId), newTx);
        }

        const newCurrent = goal.currentAmount + amount;
        tr.update(goalRef, {
          currentAmount: newCurrent,
          status: newCurrent >= goal.targetAmount ? 'completed' : goal.status,
        });
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      storageService.contributeToGoal(userId, goalId, amount, sourceAccountId, note);
    }
  },

  getTips(): EducationalTip[] {
    return DEFAULT_TIPS;
  }
};

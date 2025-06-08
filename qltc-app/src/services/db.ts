import Dexie, { type Table } from 'dexie';

// Define interfaces for your data models (sẽ chi tiết hơn ở Task 2.1, 2.2)
export interface Category {
  id: string; // UUID
  name: string;
  parentId?: string | null;
  icon?: string;
  color?: string;
  isPinned: boolean;
  order: number;
  isHidden: boolean;
  defaultSplitRatio?: string;
  budgetLimit?: number | null;
}

export interface Transaction {
  id: string; // UUID
  categoryId: string;
  amount: number;
  date: string; // ISO 8601 format
  note?: string | null; // Allow null for note
  type: 'income' | 'expense';
  payer?: string | null;
  isShared: boolean;
  splitRatio?: string | null;
}

export const db = new Dexie('QLCTDatabase');

db.version(1).stores({
  categories: '++_id, id, name, parentId, isPinned, order, isHidden', // Dexie's auto-incrementing primary key _id, our own id is indexed
  transactions: '++_id, id, categoryId, date, type, isShared, &[categoryId+date]', // Dexie's auto-incrementing primary key _id, our own id is indexed
});

// Define typed tables
export const categoriesTable: Table<Category, number> = db.table('categories');
export const transactionsTable: Table<Transaction, number> = db.table('transactions');

// Helper functions for categories
export const getAllCategoriesDB = (): Promise<Category[]> => categoriesTable.orderBy('order').toArray();
export const addCategoryDB = (category: Category): Promise<number> => categoriesTable.add(category); // Returns the new _id
export const updateCategoryDB = (id: string, changes: Partial<Category>): Promise<number> => {
  return categoriesTable.where('id').equals(id).modify(changes);
};
export const deleteCategoryDB = (id: string): Promise<number> => {
  return categoriesTable.where('id').equals(id).delete();
};
export const getCategoryByIdDB = (id: string): Promise<Category | undefined> => categoriesTable.where('id').equals(id).first();

// Helper functions for transactions
export const getAllTransactionsDB = (): Promise<Transaction[]> => transactionsTable.orderBy('date').reverse().toArray();
export const addTransactionDB = (transaction: Transaction): Promise<number> => transactionsTable.add(transaction);
export const updateTransactionDB = (id: string, changes: Partial<Transaction>): Promise<number> => {
  return transactionsTable.where('id').equals(id).modify(changes);
};
export const deleteTransactionDB = (id: string): Promise<number> => {
  return transactionsTable.where('id').equals(id).delete();
};
export const getTransactionsByDateRangeDB = (startDate: string, endDate: string): Promise<Transaction[]> => {
  return transactionsTable
    .where('date')
    .between(startDate, endDate, true, true) // true, true for inclusive
    .toArray();
};
export const getTransactionsByCategoryIdDB = (categoryId: string): Promise<Transaction[]> => {
  return transactionsTable
    .where('categoryId')
    .equals(categoryId)
    .toArray();
};

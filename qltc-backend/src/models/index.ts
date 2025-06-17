export interface User {
  id: string; // e.g., UUID or database-generated ID
  email: string; // Unique
  passwordHash: string; // Store hashed passwords, not plain text
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string; // UUID
  userId: string; // Foreign key to User table
  name: string;
  parentId: string | null;
  icon?: string;
  color?: string;
  isPinned: boolean;
  order: number;
  isHidden: boolean;
  defaultSplitRatio?: string; // e.g., "50/50", "user1Id:100"
  budgetLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SplitRatioItem {
  memberId: string;
  percentage: number;
}

export interface Transaction {
  id: string; // UUID
  userId: string; // Foreign key to User table
  categoryId: string; // Foreign key to Category table
  amount: number;
  date: string; // ISO 8601 format string (e.g., "2023-10-27T10:00:00.000Z") or Date object
  note?: string | null;
  type: 'income' | 'expense';
  // Payer information might be more complex in a multi-user system.
  // For simplicity, if 'payer' refers to one of the household members linked to the 'userId' account,
  // this will store the HouseholdMember ID.
  payer?: string | null; 
  isShared: boolean;
  // splitRatio could reference other user IDs within a shared group in a more advanced system.
  splitRatio?: SplitRatioItem[] | null; // Updated to be an array of objects
  predefinedSplitRatioId?: string | null; // For linking to a PredefinedSplitRatio
  createdAt: Date;
  updatedAt: Date;
}

// We'll use a simple in-memory store for now to simulate a database
export const inMemoryDb = {
  users: [] as User[],
  categories: [] as Category[],
  transactions: [] as Transaction[],
};
import type { Person } from './person';
import type { HouseholdMember } from './householdMember';

export interface Transaction {
  id: string; // UUID, unique
  categoryId: string; // Foreign key to Category
  amount: number;
  date: string; // ISO 8601 format, e.g., "2025-05-31"
  note?: string | null;
  type: 'income' | 'expense';
  payer?: string | null; // userId of the user who made the payment/received income. Null if not applicable or system-level.
  isShared: boolean; // Default: false
  splitRatio?: SplitRatioItem[] | null; // Updated to match backend and NewTransactionData
  userId: string; // Foreign key to User, set by backend (assuming it's always present on fetched Transaction)
  createdAt: string | Date; // ISO 8601 string or Date object
  updatedAt: string | Date; // ISO 8601 string or Date object
}

// In src/stores/transactionStore.ts
export interface NewTransactionData {
  familyId: string | null; // Add familyId here
  categoryId: string | null;
  date: string; // Or Date, depending on what your store expects before conversion
  amount: number | null;
  note?: string | null;
  payer: string | null; // userId
  isShared: boolean;
  splitRatio: SplitRatioItem[] | null;
  type: 'income' | 'expense';
}

// Payload for real-time transaction updates
export interface TransactionUpdatePayload {
  message: string;
  operation: 'create' | 'update' | 'delete';
  item?: Transaction; // Present for create/update
  itemId?: string;    // Present for delete
}

// And for split ratio options if you want to strongly type them
// export type SplitRatioOption = "50/50" | "Chồng:100" | "Vợ:100" | string; // string for custom
// src/models/index.ts (example)
export interface SplitRatioItem {
  memberId: string; // Corresponds to HouseholdMember ID
  percentage: number;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  icon: string | null;
  color: string | null;
  isPinned: boolean;
  isHidden: boolean;
  order: number | null;
  defaultSplitRatio: SplitRatioItem[] | null;
  familyId: string;
  budgetLimit: number | null; // Added this line
  createdAt: string;
  updatedAt: string;
}

export * from './auth';
export * from './family';
export type { Person };
export type { HouseholdMember };

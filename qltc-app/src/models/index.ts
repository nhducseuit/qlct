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
  userId?: string; // Added: Foreign key to User, set by backend
  createdAt?: string; // Added: ISO 8601 string, set by backend
  updatedAt?: string; // Added: ISO 8601 string, set by backend
}

// In src/stores/transactionStore.ts
export interface NewTransactionData {
  categoryId: string;
  date: string; // Or Date, depending on what your store expects before conversion
  amount: number;
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
  parentId?: string | null;
  icon?: string | null;
  color?: string | null;
  isPinned: boolean;
  order: number;
  isHidden: boolean;
  budgetLimit?: number | null;
  defaultSplitRatio?: SplitRatioItem[] | null; // Ensure this matches
  userId: string; // Assuming backend sends this
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
  // children?: Category[]; // Dynamically added for UI if needed
}

export interface HouseholdMember {
  id: string;
  name: string;
  isActive: boolean;
  order?: number | null; // Make order optional and nullable to match backend
  userId: string;
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
}

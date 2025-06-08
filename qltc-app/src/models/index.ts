export interface Category {
  id: string; // UUID, unique
  name: string;
  parentId?: string | null; // For sub-categories
  icon?: string; // Icon name from Tabler Icons
  color?: string; // Hex color code, optional for parent category
  isPinned: boolean; // Default: false, for "Chọn nhanh"
  order: number; // For sorting
  isHidden: boolean; // Default: false, to hide category
  defaultSplitRatio?: string; // e.g., "50/50", "Chồng:100", "Vợ:100"
  budgetLimit?: number | null; // Optional budget limit
}

export interface Transaction {
  id: string; // UUID, unique
  categoryId: string; // Foreign key to Category
  amount: number;
  date: string; // ISO 8601 format, e.g., "2025-05-31"
  note?: string | null;
  type: 'income' | 'expense';
  payer?: string | null; // userId of the user who made the payment/received income. Null if not applicable or system-level.
  isShared: boolean; // Default: false
  splitRatio?: string | null; // e.g., "50/50", overrides category's defaultSplitRatio if present
  userId?: string; // Added: Foreign key to User, set by backend
  createdAt?: string; // Added: ISO 8601 string, set by backend
  updatedAt?: string; // Added: ISO 8601 string, set by backend
}

// In src/stores/transactionStore.ts
export interface NewTransactionData {
  categoryId: string;
  date: string; // Or Date, depending on what your store expects before conversion
  amount: number;
  note: string;
  payer: string | null; // userId
  isShared: boolean;
  splitRatio: string | null;
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

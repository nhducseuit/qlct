/**
 * Transaction API Service
 *
 * This service makes HTTP requests to the NestJS backend for transaction-related operations.
 */
import apiClient from './api'; // Import the new configured Axios instance
import qs from 'qs'; // Import qs for query string serialization
import type { Transaction, SplitRatioItem } from 'src/models';

// The base URL for transactions will be something like '/transactions'
const API_URL = '/transactions'; // Matches your TransactionController route

// Define DTO types for request payloads, aligning with backend DTOs
export interface CreateTransactionPayload {
  categoryId: string;
  amount: number;
  date: string; // ISO 8601 format
  note?: string | null;
  type: 'income' | 'expense';
  payer?: string | null; // HouseholdMember ID (UUID)
  isShared: boolean;
  splitRatio?: SplitRatioItem[] | null;
}

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;

// Define the DTO for querying transactions
export interface GetTransactionsQueryPayload {
  categoryId?: string;
  periodType?: 'monthly' | 'quarterly' | 'yearly';
  year?: number;
  month?: number;
  quarter?: number;
  startDate?: string; // ISO Date string
  endDate?: string;   // ISO Date string
  memberIds?: string[];
  transactionType?: 'expense' | 'income' | 'all';
  isStrictMode?: 'true' | 'false';
}


export const fetchTransactionsAPI = async (query: GetTransactionsQueryPayload): Promise<Transaction[]> => {
  console.log('[TransactionApiService] fetchTransactionsAPI called with query:', query);
  try {
    const response = await apiClient.get<Transaction[]>(API_URL, {
      params: query,
      paramsSerializer: params => {
        // Use qs to serialize array parameters as "repeat" (e.g., memberIds=id1&memberIds=id2)
        return qs.stringify(params, { arrayFormat: 'repeat' });
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const addTransactionAPI = async (transactionData: CreateTransactionPayload): Promise<Transaction> => {
  console.log('[TransactionApiService] addTransactionAPI called', transactionData);
  try {
    // Backend DTO (CreateTransactionDto) expects these fields.
    // The backend will handle userId, createdAt, updatedAt.
    const response = await apiClient.post<Transaction>(API_URL, transactionData);
    return response.data;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const updateTransactionAPI = async (
  transactionId: string,
  updates: UpdateTransactionPayload
): Promise<Transaction> => {
  console.log(`[TransactionApiService] updateTransactionAPI called for transactionId: ${transactionId}`, updates);
  try {
    const response = await apiClient.patch<Transaction>(`${API_URL}/${transactionId}`, updates);
    return response.data; // Backend returns the updated transaction
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransactionAPI = async (transactionId: string): Promise<{ message: string }> => {
  console.log(`[TransactionApiService] deleteTransactionAPI called for transactionId: ${transactionId}`);
  try {
    // Backend no longer needs familyId as a query param for deletion
    const response = await apiClient.delete<{ message: string }>(`${API_URL}/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Placeholder for fetching by date range - to be implemented if needed
export const fetchTransactionsByDateRangeAPI = async (
  startDate: string,
  endDate: string,
): Promise<Transaction[]> => {
  // The main fetchTransactionsAPI can handle date ranges.
  return fetchTransactionsAPI({ startDate, endDate });
};

// Placeholder for fetching by category - to be implemented if needed
export const fetchTransactionsByCategoryAPI = async (
  categoryId: string,
): Promise<Transaction[]> => {
  // The main fetchTransactionsAPI can handle filtering by category.
  return fetchTransactionsAPI({ categoryId });
};

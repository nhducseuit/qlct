/**
 * Transaction API Service
 *
 * This service makes HTTP requests to the NestJS backend for transaction-related operations.
 */
import apiClient from './api'; // Import the new configured Axios instance
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


export const fetchTransactionsAPI = async (): Promise<Transaction[]> => {
  console.log('[TransactionApiService] fetchTransactionsAPI called');
  try {
    const response = await apiClient.get<Transaction[]>(API_URL);
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
    // Backend returns a message object upon successful deletion
    const response = await apiClient.delete<{ message: string }>(`${API_URL}/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Placeholder: Backend filtering for these would be more efficient.
export const fetchTransactionsByDateRangeAPI = async (startDate: string, endDate: string): Promise<Transaction[]> => {
  console.log(`[TransactionApiService] fetchTransactionsByDateRangeAPI called for range: ${startDate} - ${endDate}`);
  // TODO: Implement backend filtering or accept client-side filtering for now.
  // Example if backend supports query params:
  // const response = await apiClient.get<Transaction[]>(API_URL, { params: { startDate, endDate } });
  // return response.data;
  console.warn('fetchTransactionsByDateRangeAPI is using client-side filtering as a placeholder.');
  const allTransactions = await fetchTransactionsAPI();
  // Perform client-side filtering (less efficient for large datasets)
  return allTransactions.filter(t => {
    const transactionDate = t.date; // Assuming date is already in a comparable format or convert
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

export const fetchTransactionsByCategoryAPI = async (categoryId: string): Promise<Transaction[]> => {
  console.log(`[TransactionApiService] fetchTransactionsByCategoryAPI called for categoryId: ${categoryId}`);
  // TODO: Implement backend filtering or accept client-side filtering for now.
  // Example if backend supports query params:
  // const response = await apiClient.get<Transaction[]>(API_URL, { params: { categoryId } });
  // return response.data;
  console.warn('fetchTransactionsByCategoryAPI is using client-side filtering as a placeholder.');
  const allTransactions = await fetchTransactionsAPI();
  return allTransactions.filter(t => t.categoryId === categoryId);
};

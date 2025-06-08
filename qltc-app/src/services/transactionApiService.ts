/**
 * Transaction API Service
 *
 * This service makes HTTP requests to the NestJS backend for transaction-related operations.
 */
import { api } from 'boot/axios'; // Import the configured axios instance
import type { Transaction } from 'src/models';

// The base URL for transactions will be something like '/transactions'
// The actual backend host is configured in the axios boot file.
const API_URL = '/transactions'; // Matches your TransactionController route

export const fetchTransactionsAPI = async (userId: string): Promise<Transaction[]> => {
  console.log(`[TransactionApiService] fetchTransactionsAPI called for userId: ${userId}`);
  // userId is implicitly handled by the backend via JWT token
  try {
    const response = await api.get<Transaction[]>(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const addTransactionAPI = async (userId: string, transactionData: Transaction): Promise<Transaction> => {
  console.log(`[TransactionApiService] addTransactionAPI called for userId: ${userId}`, transactionData);
  // userId is implicitly handled by the backend
  try {
    // The backend's CreateTransactionDto might not expect 'id', 'userId', 'createdAt', 'updatedAt'
    // Let's assume the backend DTO matches the core fields of NewTransactionData
    // Create a mutable copy to send to the backend
    const createDto: Partial<Transaction> = { ...transactionData };

    // Remove properties that the backend will set or doesn't expect on creation
    delete createDto.id;
    delete createDto.userId;
    delete createDto.createdAt;
    delete createDto.updatedAt;
    const response = await api.post<Transaction>(API_URL, createDto);
    return response.data;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const updateTransactionAPI = async (
  userId: string,
  transactionId: string,
  updates: Partial<Omit<Transaction, 'id'>>
): Promise<Transaction> => { // Changed return type to match backend response
  console.log(`[TransactionApiService] updateTransactionAPI called for userId: ${userId}, transactionId: ${transactionId}`, updates);
  try {
    const response = await api.patch<Transaction>(`${API_URL}/${transactionId}`, updates);
    return response.data; // Assuming backend returns the updated transaction
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransactionAPI = async (userId: string, transactionId: string): Promise<{ message: string }> => { // Changed return type
  console.log(`[TransactionApiService] deleteTransactionAPI called for userId: ${userId}, transactionId: ${transactionId}`);
  try {
    const response = await api.delete<{ message: string }>(`${API_URL}/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

export const fetchTransactionsByDateRangeAPI = async (userId: string, startDate: string, endDate: string): Promise<Transaction[]> => {
  console.log(`[TransactionApiService] fetchTransactionsByDateRangeAPI called for userId: ${userId}, range: ${startDate} - ${endDate}`);
  // This specific endpoint isn't defined in your TransactionController.
  // For now, we'll fetch all and filter client-side, or you'd add this to backend.
  // As a placeholder, let's just fetch all.
  // Or, if your backend supports query params for filtering:
  // const response = await api.get<Transaction[]>(API_URL, { params: { startDate, endDate } });
  // return response.data;
  console.warn('fetchTransactionsByDateRangeAPI is not fully implemented for backend calls yet. Fetching all.');
  return fetchTransactionsAPI(userId); // Placeholder
};

export const fetchTransactionsByCategoryAPI = async (userId: string, categoryId: string): Promise<Transaction[]> => {
  console.log(`[TransactionApiService] fetchTransactionsByCategoryAPI called for userId: ${userId}, categoryId: ${categoryId}`);
  // This specific endpoint isn't defined in your TransactionController.
  // For now, we'll fetch all and filter client-side, or you'd add this to backend.
  // As a placeholder, let's just fetch all.
  // Or, if your backend supports query params for filtering:
  // const response = await api.get<Transaction[]>(API_URL, { params: { categoryId } });
  // return response.data;
  console.warn('fetchTransactionsByCategoryAPI is not fully implemented for backend calls yet. Fetching all.');
  return fetchTransactionsAPI(userId); // Placeholder
};

// If there were initial/sample transactions to create, a function like
// createInitialTransactionsAPI could be added here, similar to categories.
// For now, we assume transactions are user-generated.

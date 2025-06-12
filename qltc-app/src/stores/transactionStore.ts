import { defineStore } from 'pinia';
import { ref, onMounted } from 'vue';
import {
  fetchTransactionsAPI,
  addTransactionAPI,
  updateTransactionAPI,
  deleteTransactionAPI,
  fetchTransactionsByDateRangeAPI,
  fetchTransactionsByCategoryAPI,
  type CreateTransactionPayload,
  type UpdateTransactionPayload,
} from 'src/services/transactionApiService';
import type { NewTransactionData, Transaction } from 'src/models'; // Ensure SplitRatioItem is part of models
import { useQuasar } from 'quasar';
import { dayjs } from 'src/boot/dayjs';
import { useAuthStore } from './authStore';
import { connect } from 'src/services/socketService'; // Renamed connectSocket to connect
import { AxiosError } from 'axios';
import type { Socket } from 'socket.io-client';

export const useTransactionStore = defineStore('transactions', () => {
  const $q = useQuasar();
  const transactions = ref<Transaction[]>([]);
  const authStore = useAuthStore();
  let storeSocket: Socket | null = null; // Renamed to avoid confusion with global socket

  const addTransaction = async (transactionData: NewTransactionData) => {
    if (!authStore.isAuthenticated) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể thêm giao dịch.' });
      throw new Error('User not authenticated');
    }

    // Ensure date is in ISO 8601 string format for the backend
    const isoDate = dayjs(transactionData.date).toISOString();

    const payload: CreateTransactionPayload = {
      categoryId: transactionData.categoryId,
      amount: transactionData.amount,
      date: isoDate,
      note: transactionData.note ?? null, // Convert undefined to null
      type: transactionData.type,
      payer: transactionData.payer,
      isShared: transactionData.isShared,
      splitRatio: transactionData.splitRatio,
    };

    try {
      await addTransactionAPI(payload);
      // UI update will be handled by WebSocket event
      $q.notify({ type: 'positive', message: 'Đã thêm giao dịch mới.' });
    } catch (error) {
      console.error('Failed to add transaction:', error);
      $q.notify({
        color: 'negative',
        message: 'Thêm giao dịch thất bại.',
        icon: 'report_problem',
      });
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: UpdateTransactionPayload) => {
    if (!authStore.isAuthenticated) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể cập nhật giao dịch.' });
      throw new Error('User not authenticated');
    }

    // Ensure date is in ISO 8601 string format if it's being updated
    const payloadForApi: UpdateTransactionPayload = { ...updates };
    if (payloadForApi.date) {
      payloadForApi.date = dayjs(payloadForApi.date).toISOString();
    }

    // Sanitize payload: remove backend-managed fields that shouldn't be in an update DTO
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const { id: _id, userId: _userId, createdAt: _createdAt, updatedAt: _updatedAt, ...finalPayload } = payloadForApi as any;


    try {
      console.log(`[TransactionStore] Updating transaction ${id} with payload:`, JSON.parse(JSON.stringify(finalPayload)));
      const updatedTransaction = await updateTransactionAPI(id, finalPayload);
      if (updatedTransaction) {
        // UI update will be handled by WebSocket event
        $q.notify({ type: 'positive', message: 'Đã cập nhật giao dịch.' });
      } else {
        $q.notify({ type: 'warning', message: 'Không tìm thấy giao dịch để cập nhật hoặc không có gì thay đổi.' });
      }
    } catch (error) {
      console.error('Failed to update transaction:', error);
      $q.notify({
        color: 'negative',
        message: 'Cập nhật giao dịch thất bại.',
        icon: 'report_problem',
      });
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!authStore.isAuthenticated) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể xóa giao dịch.' });
      throw new Error('User not authenticated');
    }
    try {
      const result = await deleteTransactionAPI(id);
      if (result && result.message) {
        // UI update will be handled by WebSocket event
        $q.notify({ type: 'positive', message: 'Đã xóa giao dịch.' });
      } else {
        $q.notify({ type: 'warning', message: 'Không tìm thấy giao dịch để xóa.' });
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      let errorMessage = 'Xóa giao dịch thất bại.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = String(error.response.data.message);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      $q.notify({
        color: 'negative',
        message: errorMessage,
        icon: 'report_problem',
      });
      throw error; // Re-throw to allow components to handle if needed
    }
  };

  const loadTransactions = async () => {
    if (!authStore.isAuthenticated) {
      console.log('[TransactionStore] User not authenticated, skipping transaction load.');
      transactions.value = [];
      return;
    }
    try {
      const fetchedTransactions = await fetchTransactionsAPI();
      transactions.value = fetchedTransactions.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
      console.log('[TransactionStore] Transactions loaded:', transactions.value.length);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      $q.notify({
        color: 'negative',
        message: 'Không thể tải danh sách giao dịch.',
        icon: 'report_problem',
      });
    }
  };

  const getTransactionsByDateRange = async (startDate: string, endDate: string): Promise<Transaction[]> => {
    if (!authStore.isAuthenticated) {
      console.warn('[TransactionStore] getTransactionsByDateRange called: User not authenticated.');
      return [];
    }
    return fetchTransactionsByDateRangeAPI(startDate, endDate);
  };

  const getTransactionsByCategory = async (categoryId: string): Promise<Transaction[]> => {
    if (!authStore.isAuthenticated) {
      console.warn('[TransactionStore] getTransactionsByCategory called: User not authenticated.');
      return [];
    }
    return fetchTransactionsByCategoryAPI(categoryId);
  };

  // --- WebSocket Event Handling ---
  const handleTransactionUpdate = (data: { operation: string; item?: Transaction; itemId?: string; message?: string }) => {
    console.log('[TransactionStore] RAW handleTransactionUpdate invoked with data:', JSON.parse(JSON.stringify(data)));
    console.log('[TransactionStore] Received transactions_updated event:', data);
    let changed = false;
    switch (data.operation) {
      case 'create':
        if (data.item) {
          const exists = transactions.value.some(t => t.id === data.item!.id);
          if (!exists) {
            transactions.value.push(data.item);
            changed = true;
          }
        }
        break;
      case 'update':
        if (data.item) {
          const index = transactions.value.findIndex(t => t.id === data.item!.id);
          if (index !== -1) {
            transactions.value.splice(index, 1, data.item);
            changed = true;
          } else {
            transactions.value.push(data.item); // If not found, might be new for this client
            changed = true;
          }
        }
        break;
      case 'delete':
        if (data.itemId) {
          const initialLength = transactions.value.length;
          transactions.value = transactions.value.filter(t => t.id !== data.itemId);
          if (transactions.value.length !== initialLength) changed = true;
        }
        break;
      default:
        console.warn('[TransactionStore] Unknown operation from WebSocket:', data.operation);
    }
    if (changed) {
      transactions.value.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
      $q.notify({
        type: 'info',
        message: data?.message || 'Dữ liệu giao dịch đã được cập nhật.',
        icon: 'sym_o_sync',
        position: 'top-right',
        timeout: 2500,
      });
    }
  };

  const setupSocketListeners = async () => {
    if (authStore.isAuthenticated) {
      try {
        console.log(`[TransactionStore] Attempting to connect socket and set up listeners.`);
        const connectedSocketInstance = await connect(); // Use the new async connect

        if (connectedSocketInstance?.connected) {
          storeSocket = connectedSocketInstance;
          console.log(`[TransactionStore] Socket connected (${storeSocket.id}). Setting up WebSocket listeners for transactions_updated`);
          storeSocket.off('transactions_updated', handleTransactionUpdate); // Remove old listener first
          storeSocket.on('transactions_updated', handleTransactionUpdate);
        } else {
          console.warn('[TransactionStore] Failed to connect socket or socket not connected after attempt. Listeners not set up.');
          if (storeSocket) { // If there was an old storeSocket, clean its listeners
              storeSocket.off('transactions_updated', handleTransactionUpdate);
              storeSocket = null;
          }
        }
      } catch (error) {
        console.error('[TransactionStore] Error during socket connection or listener setup:', error);
        if (storeSocket) {
          storeSocket.off('transactions_updated', handleTransactionUpdate);
          storeSocket = null;
        }
      }
    } else {
      clearSocketListeners(); // Ensure listeners are cleared if not authenticated
    }
  };

  const clearSocketListeners = () => {
    if (storeSocket) {
      console.log(`[TransactionStore] Clearing WebSocket listeners for transactions_updated from socket ${storeSocket.id}`);
      storeSocket.off('transactions_updated', handleTransactionUpdate);
    }
    storeSocket = null; // Clear the store's local reference
  };

  authStore.$subscribe((_mutation, state) => {
    if (state.isAuthenticated) {
      void loadTransactions(); // void to call async function without awaiting here
      void setupSocketListeners();
    } else {
      transactions.value = [];
      clearSocketListeners();
      // Consider disconnecting socket if no other store is using it.
      // disconnectSocket(); // Managed by socketService or globally
    }
  });

  onMounted(() => {
    if (authStore.isAuthenticated) {
      void loadTransactions(); // void to call async function without awaiting here
      void setupSocketListeners();
    }
  });

  return {
    transactions,
    loadTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByDateRange,
    getTransactionsByCategory,
  };
});

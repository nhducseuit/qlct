import { defineStore } from 'pinia';
import { ref } from 'vue';
// import {
//   getAllTransactionsDB,
//   addTransactionDB,
//   updateTransactionDB,
//   deleteTransactionDB,
//   getTransactionsByDateRangeDB,
//   getTransactionsByCategoryIdDB,
// } from 'src/services/db'; // Will be replaced by apiService calls
import {
  fetchTransactionsAPI,
  addTransactionAPI,
  updateTransactionAPI,
  deleteTransactionAPI,
  fetchTransactionsByDateRangeAPI,
  fetchTransactionsByCategoryAPI,
} from 'src/services/transactionApiService'; // Import the new mock API service
import type { NewTransactionData, Transaction, TransactionUpdatePayload } from 'src/models'; // Import TransactionUpdatePayload
import { v4 as uuidv4 } from 'uuid';
import { useQuasar } from 'quasar';
import { dayjs } from 'src/boot/dayjs'; // Import dayjs đã được cấu hình
import { useAuthStore } from './authStore';
import { connectSocket, disconnectSocket } from 'src/services/socketService'; // NEW

export const useTransactionStore = defineStore('transactions', () => {
  const $q = useQuasar();
  const transactions = ref<Transaction[]>([]);
  const authStore = useAuthStore(); // Initialize authStore instance
  const socketInitialized = ref(false); // NEW: Flag to track socket listener setup

  const addTransaction = async (transactionData: Omit<NewTransactionData, 'id' | 'date'> & { date: string | Date }) => {
    // Ensure date is in ISO 8601 string format
    const isoDate = dayjs(transactionData.date).toISOString();

    const newTransaction: Transaction = {
      id: uuidv4(),
      ...transactionData,
      date: isoDate,
      // With exactOptionalPropertyTypes, if note is present, it must be string or null.
      // If transactionData.note is undefined, omit it. If it's null, keep as null.
      ...(transactionData.note !== undefined && { note: transactionData.note }),
    };
    try {
      const userId = authStore.user?.id;
      if (!userId) {
        $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể thêm giao dịch.' });
        return;
      }

      await addTransactionAPI(userId, newTransaction);
      await loadTransactions(); // Refresh list
      $q.notify({ type: 'positive', message: 'Đã thêm giao dịch mới.' });
    } catch (error) {
      console.error('Failed to add transaction:', error);
      $q.notify({
        color: 'negative',
        message: 'Thêm giao dịch thất bại.',
        icon: 'report_problem',
      });
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    // Ensure date is in ISO 8601 string format if it's being updated
    if (updates.date) {
      updates.date = dayjs(updates.date).toISOString();
    }

    try {
      const userId = authStore.user?.id;
      if (!userId) {
        $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể cập nhật giao dịch.' });
        return;
      }

      const updatedTransaction = await updateTransactionAPI(userId, id, updates);
      if (updatedTransaction) { // Check if an updated transaction was returned
        await loadTransactions(); // Refresh list
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
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const userId = authStore.user?.id;
      if (!userId) {
        $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể xóa giao dịch.' });
        return;
      }

      const result = await deleteTransactionAPI(userId, id);
      if (result && result.message) { // Check if the delete was successful based on backend response
        await loadTransactions(); // Refresh list
        $q.notify({ type: 'positive', message: 'Đã xóa giao dịch.' });
      } else {
        $q.notify({ type: 'warning', message: 'Không tìm thấy giao dịch để xóa.' });
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      $q.notify({
        color: 'negative',
        message: 'Xóa giao dịch thất bại.',
        icon: 'report_problem',
      });
    }
  };

  const loadTransactions = async () => {
    if (!authStore.isAuthenticated || !authStore.user?.id) {
      console.log('[TransactionStore] User not authenticated, skipping transaction load.');
      transactions.value = []; // Clear transactions if user is not authenticated
      return;
    }
    const userId = authStore.user.id;

    try {
      transactions.value = await fetchTransactionsAPI(userId);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      $q.notify({
        color: 'negative',
        message: 'Không thể tải danh sách giao dịch.',
        icon: 'report_problem',
      });
    }
  };

  // Getters
  const getTransactionsByDateRange = async (startDate: string, endDate: string): Promise<Transaction[]> => {
    const userId = authStore.user?.id;
    if (!userId) {
      console.warn('[TransactionStore] getTransactionsByDateRange called without user ID.');
      return [];
    }
    return fetchTransactionsByDateRangeAPI(userId, startDate, endDate);
  };

  const getTransactionsByCategory = async (categoryId: string): Promise<Transaction[]> => {
    const userId = authStore.user?.id;
    if (!userId) {
      console.warn('[TransactionStore] getTransactionsByCategory called without user ID.');
      return [];
    }
    return fetchTransactionsByCategoryAPI(userId, categoryId);
  };

  // Initial load - using an async IIFE to not make the whole store setup async
  const initializeRealtimeListeners = () => {
    if (socketInitialized.value || !authStore.isAuthenticated) return;

    const socket = connectSocket(); // connectSocket handles not re-connecting if already connected

    if (socket) {
      socket.off('transactions_updated'); // Xóa listener cũ để tránh trùng lặp
      socket.on('transactions_updated', (data: TransactionUpdatePayload) => {
        console.log('Real-time: transactions_updated event received from server', data);
        // Backend đã scope sự kiện cho user này thông qua room
        $q.notify({
          type: 'info',
          message: data?.message || 'Dữ liệu giao dịch đã được cập nhật.',
          icon: 'sym_o_sync',
          position: 'top-right',
          timeout: 2500,
        });
        void (async () => {
          await loadTransactions(); // ÍT TỐN CÔNG SỨC NHẤT: Tải lại toàn bộ giao dịch
        })();
      });
      socketInitialized.value = true;
      console.log('Transaction store: Realtime listeners initialized.');
    } else {
      console.warn('Transaction store: Failed to initialize socket for realtime listeners.');
    }
  };

  // Lắng nghe thay đổi trạng thái xác thực để quản lý kết nối socket và tải dữ liệu
  authStore.$subscribe((mutation, state) => {
    if (state.isAuthenticated && state.user?.id) {
      initializeRealtimeListeners();
      // Nếu chưa có transactions, hoặc cần tải lại sau khi login
      if (transactions.value.length === 0) { // Hoặc một điều kiện khác để tải lại
        void (
          async () => {
            await loadTransactions();
          }
        )();
      }
    } else if (!state.isAuthenticated) {
      transactions.value = []; // Xóa dữ liệu khi logout
      disconnectSocket();
      socketInitialized.value = false; // Reset flag
    }
  });

  // Kiểm tra trạng thái xác thực ban đầu khi store được khởi tạo
  if (authStore.isAuthenticated && authStore.user?.id) {
    initializeRealtimeListeners();
    if (transactions.value.length === 0) { // Tải dữ liệu nếu cần
      void (
        async () => {
          await loadTransactions();
        }
      )();
    }
  }

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

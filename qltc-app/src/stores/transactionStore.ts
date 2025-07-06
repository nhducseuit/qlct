import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  fetchTransactionsAPI,
  addTransactionAPI,
  updateTransactionAPI,
  deleteTransactionAPI,
  fetchTransactionsByDateRangeAPI,
  fetchTransactionsByCategoryAPI,
  type CreateTransactionPayload,
  type UpdateTransactionPayload,
  type GetTransactionsQueryPayload, // Import the new query payload type
} from 'src/services/transactionApiService';
import type { NewTransactionData, Transaction } from 'src/models'; // Ensure SplitRatioItem is part of models
import { useQuasar } from 'quasar';
import { dayjs } from 'src/boot/dayjs';
import { useAuthStore } from './authStore';
import { useFamilyStore } from './familyStore';
import { connect } from 'src/services/socketService'; // Renamed connectSocket to connect
import { AxiosError } from 'axios';
import type { Socket } from 'socket.io-client';

export const useTransactionStore = defineStore('transactions', () => {
  const $q = useQuasar();
  const transactions = ref<Transaction[]>([]);
  // New state for transactions specific to a category and period for the report detail
  const categoryPeriodTransactions = ref<Transaction[] | null>(null);
  const categoryPeriodTransactionsLoading = ref(false);
  const authStore = useAuthStore();
  let storeSocket: Socket | null = null; // Renamed to avoid confusion with global socket
  const familyStore = useFamilyStore();

  const addTransaction = async (transactionData: NewTransactionData) => {
    if (!authStore.isAuthenticated) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể thêm giao dịch.' });
      throw new Error('User not authenticated');
    }
    const familyId = familyStore.selectedFamilyId;
    if (!familyId) {
      $q.notify({ type: 'negative', message: 'Vui lòng chọn gia đình trước khi thêm giao dịch.' });
      throw new Error('No family selected');
    }

    // Validate required fields before creating the payload
    if (!transactionData.categoryId || !transactionData.amount) {
      const errorMessage = 'Category and amount are required fields.';
      console.error(`[TransactionStore] ${errorMessage}`);
      $q.notify({ type: 'negative', message: 'Vui lòng điền đầy đủ thông tin danh mục và số tiền.' });
      throw new Error(errorMessage);
    }

    // Ensure date is parsed as UTC from YYYY/MM/DD format to preserve the day
    // then convert to ISO 8601 string format for the backend.
    const isoDate = dayjs.utc(transactionData.date, 'YYYY/MM/DD').toISOString();
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
    const familyId = familyStore.selectedFamilyId;
    if (!familyId) {
      $q.notify({ type: 'negative', message: 'Vui lòng chọn gia đình trước khi cập nhật giao dịch.' });
      throw new Error('No family selected');
    }
    const payloadForApi: UpdateTransactionPayload = { ...updates };
    // If date is being updated and is in YYYY/MM/DD string format, parse as UTC
    if (payloadForApi.date && typeof payloadForApi.date === 'string') {
      // Assuming the date string from updates is also in 'YYYY/MM/DD' format
      payloadForApi.date = dayjs.utc(payloadForApi.date, 'YYYY/MM/DD').toISOString();
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
    const familyId = familyStore.selectedFamilyId;
    if (!familyId) {
      $q.notify({ type: 'negative', message: 'Vui lòng chọn gia đình trước khi xóa giao dịch.' });
      throw new Error('No family selected');
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

  const loadTransactions = async (query?: Omit<GetTransactionsQueryPayload, 'familyId'>) => {
    if (!authStore.isAuthenticated) {
      console.log('[TransactionStore] User not authenticated, skipping transaction load.');
      transactions.value = [];
      if (!query) categoryPeriodTransactions.value = null; // Clear specific transactions if general load
      return;
    }
    const familyId = familyStore.selectedFamilyId;
    if (!familyId) {
      transactions.value = [];
      if (!query) categoryPeriodTransactions.value = null;
      $q.notify({ type: 'negative', message: 'Vui lòng chọn gia đình để xem giao dịch.' });
      return;
    }
    try {
      const fetchedTransactions = await fetchTransactionsAPI({ ...query });
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

  const loadTransactionsForCategoryPeriod = async (
    categoryId: string,
    periodType: 'monthly' | 'quarterly' | 'yearly',
    year: number,
    month?: number, // 1-12
    quarter?: number, // 1-4
    memberIds?: string[],
    transactionType?: 'expense' | 'income' | 'all',
    isStrictMode?: boolean,
  ) => {
    if (!authStore.isAuthenticated) {
      categoryPeriodTransactions.value = null;
      return;
    }
    const familyId = familyStore.selectedFamilyId;
    if (!familyId) {
      categoryPeriodTransactions.value = null;
      $q.notify({ type: 'negative', message: 'Vui lòng chọn gia đình để xem chi tiết giao dịch.' });
      return;
    }
    categoryPeriodTransactionsLoading.value = true;
    try {
      const query: GetTransactionsQueryPayload = { categoryId, periodType, year };
      // Conditionally add optional properties
      if (month !== undefined) {
        query.month = month;
      }
      if (quarter !== undefined) {
        query.quarter = quarter;
      }
      if (memberIds && memberIds.length > 0) {
        query.memberIds = memberIds;
      }
      if (transactionType) {
        query.transactionType = transactionType;
      }
      if (isStrictMode !== undefined) {
        query.isStrictMode = isStrictMode ? 'true' : 'false';
      }

      const fetchedTransactions = await fetchTransactionsAPI(query);

      // This logic seems to be for a specific view, so we'll put the result
      // in the dedicated state property.
      categoryPeriodTransactions.value = fetchedTransactions.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
    } catch (error) {
      console.error('Failed to load transactions for category/period:', error);
      $q.notify({
        color: 'negative',
        message: 'Không thể tải chi tiết giao dịch cho danh mục.',
        icon: 'report_problem',
      });
      categoryPeriodTransactions.value = null;
    } finally {
      categoryPeriodTransactionsLoading.value = false;
    }
  };

  const getTransactionsByDateRange = async (startDate: string, endDate: string): Promise<Transaction[]> => {
    if (!authStore.isAuthenticated) {
      console.warn('[TransactionStore] getTransactionsByDateRange called: User not authenticated.');
      return [];
    }
    const familyId = familyStore.selectedFamilyId;
    if (!familyId) {
      $q.notify({ type: 'negative', message: 'Vui lòng chọn gia đình để xem giao dịch.' });
      return [];
    }
    return fetchTransactionsByDateRangeAPI(startDate, endDate);
  };

  const getTransactionsByCategory = async (categoryId: string): Promise<Transaction[]> => {
    if (!authStore.isAuthenticated) {
      console.warn('[TransactionStore] getTransactionsByCategory called: User not authenticated.');
      return [];
    }
    const familyId = familyStore.selectedFamilyId;
    if (!familyId) {
      $q.notify({ type: 'negative', message: 'Vui lòng chọn gia đình để xem giao dịch.' });
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

  const initializeStore = () => {
    if (authStore.isAuthenticated) {
      void loadTransactions();
      void setupSocketListeners();
    } else {
      transactions.value = [];
      categoryPeriodTransactions.value = null;
      clearSocketListeners();
    }
  };


  // Reload transactions when auth or family changes
  authStore.$subscribe(() => {
    initializeStore();
  });
  familyStore.$subscribe(() => {
    initializeStore();
  });

  initializeStore();

  return {
    transactions,
    loadTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByDateRange,
    getTransactionsByCategory,
    categoryPeriodTransactions,
    categoryPeriodTransactionsLoading,
    loadTransactionsForCategoryPeriod,
  };
});

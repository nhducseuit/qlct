// d:\sources\qlct\qltc-app\src\stores\settlementStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from './authStore';
import {
  fetchBalancesAPI,
  createSettlementAPI,
  fetchSettlementsAPI,
} from 'src/services/settlementApiService'; // We'll create this service next
import type {
  BalancesResponseDto,
  CreateSettlementDto,
  SettlementDto,
  PaginatedSettlementsResponseDto,
  GetSettlementsQueryDto,
} from 'src/models/settlement'; // We'll create this model definitions file next
import { AxiosError } from 'axios';

export const useSettlementStore = defineStore('settlements', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();

  // State for balances
  const balances = ref<BalancesResponseDto | null>(null);
  const balancesLoading = ref(false);
  const balancesError = ref<string | null>(null);

  // State for settlement history
  const settlementHistory = ref<PaginatedSettlementsResponseDto | null>(null);
  const settlementHistoryLoading = ref(false);
  const settlementHistoryError = ref<string | null>(null);

  // State for creating a settlement
  const createSettlementLoading = ref(false);
  const createSettlementError = ref<string | null>(null);

  // Action to fetch balances
  const loadBalances = async () => {
    if (!authStore.isAuthenticated) {
      balancesError.value = 'Người dùng chưa được xác thực.';
      balances.value = null;
      return;
    }
    balancesLoading.value = true;
    balancesError.value = null;
    try {
      console.log('[SettlementStore] Fetching balances...');
      const data = await fetchBalancesAPI(); // No query DTO for now
      balances.value = data;
      console.log('[SettlementStore] Balances loaded:', data);
    } catch (error: unknown) {
      console.error('Failed to load balances:', error);
      const errorMessage =
        error instanceof AxiosError && error.response?.data?.message
          ? String(error.response.data.message)
          : error instanceof Error
          ? error.message
          : 'Không thể tải thông tin cân đối.';
      balancesError.value = errorMessage;
      balances.value = null;
      $q.notify({
        color: 'negative',
        message: errorMessage,
        icon: 'report_problem',
      });
    } finally {
      balancesLoading.value = false;
    }
  };

  // Action to record a new settlement
  const recordSettlement = async (settlementData: CreateSettlementDto): Promise<SettlementDto | null> => {
    if (!authStore.isAuthenticated) {
      createSettlementError.value = 'Người dùng chưa được xác thực.';
      return null;
    }
    createSettlementLoading.value = true;
    createSettlementError.value = null;
    try {
      console.log('[SettlementStore] Recording settlement:', settlementData);
      const newSettlement = await createSettlementAPI(settlementData);
      console.log('[SettlementStore] Settlement recorded:', newSettlement);
      // Optionally, refresh balances or settlement history after recording
      void loadBalances(); // Refresh balances
      // void loadSettlementHistory(); // If history is already loaded and needs refresh
      $q.notify({
        color: 'positive',
        message: 'Đã ghi nhận thanh toán thành công!',
        icon: 'check_circle',
      });
      return newSettlement;
    } catch (error: unknown) {
      console.error('Failed to record settlement:', error);
      const errorMessage =
        error instanceof AxiosError && error.response?.data?.message
          ? String(error.response.data.message)
          : error instanceof Error
          ? error.message
          : 'Không thể ghi nhận thanh toán.';
      createSettlementError.value = errorMessage;
      $q.notify({
        color: 'negative',
        message: errorMessage,
        icon: 'report_problem',
      });
      return null;
    } finally {
      createSettlementLoading.value = false;
    }
  };

  // Action to fetch settlement history
  const loadSettlementHistory = async (query?: GetSettlementsQueryDto) => {
    if (!authStore.isAuthenticated) {
      settlementHistoryError.value = 'Người dùng chưa được xác thực.';
      settlementHistory.value = null;
      return;
    }
    settlementHistoryLoading.value = true;
    settlementHistoryError.value = null;
    try {
      console.log('[SettlementStore] Fetching settlement history with query:', query);
      const data = await fetchSettlementsAPI(query || {}); // Pass empty object if query is undefined
      settlementHistory.value = data;
      console.log('[SettlementStore] Settlement history loaded:', data);
    } catch (error: unknown) {
      console.error('Failed to load settlement history:', error);
      const errorMessage =
        error instanceof AxiosError && error.response?.data?.message
          ? String(error.response.data.message)
          : error instanceof Error
          ? error.message
          : 'Không thể tải lịch sử thanh toán.';
      settlementHistoryError.value = errorMessage;
      settlementHistory.value = null;
      $q.notify({
        color: 'negative',
        message: errorMessage,
        icon: 'report_problem',
      });
    } finally {
      settlementHistoryLoading.value = false;
    }
  };

  return {
    balances,
    balancesLoading,
    balancesError,
    loadBalances,

    settlementHistory,
    settlementHistoryLoading,
    settlementHistoryError,
    loadSettlementHistory,

    createSettlementLoading,
    createSettlementError,
    recordSettlement,
  };
});

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from './authStore';
import {
  fetchTotalsSummaryAPI,
  fetchCategoryBreakdownAPI,
  fetchBudgetTrendAPI,
} from 'src/services/summaryApiService';
import type {
  TotalsSummaryResponseDto,
  GetTotalsSummaryQueryDto,
  PeriodType,
  CategoryBreakdownResponseDto,
  GetCategoryBreakdownQueryDto,
  BudgetTrendResponseDto,
  GetBudgetTrendQueryDto,
} from 'src/models/summary';
import { dayjs } from 'src/boot/dayjs';
import { AxiosError } from 'axios';

export const useSummaryStore = defineStore('summaries', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();

  const totalsSummary = ref<TotalsSummaryResponseDto | null>(null);
  const totalsSummaryLoading = ref(false);
  const totalsSummaryError = ref<string | null>(null);

  const categoryBreakdown = ref<CategoryBreakdownResponseDto | null>(null);
  const categoryBreakdownLoading = ref(false);
  const categoryBreakdownError = ref<string | null>(null);

  const budgetTrend = ref<BudgetTrendResponseDto | null>(null);
  const budgetTrendLoading = ref(false);
  const budgetTrendError = ref<string | null>(null);

  const loadTotalsSummary = async (periodType: PeriodType, year?: number) => {
    if (!authStore.isAuthenticated) {
      totalsSummaryError.value = 'Người dùng chưa được xác thực.';
      totalsSummary.value = null;
      return;
    }

    totalsSummaryLoading.value = true;
    totalsSummaryError.value = null;
    try {
      const query: GetTotalsSummaryQueryDto = {
        periodType,
        year: year || dayjs().year(), // Default to current year if not provided
      };
      console.log('[SummaryStore] Fetching totals summary with query:', query);
      const data = await fetchTotalsSummaryAPI(query);
      totalsSummary.value = data;
      console.log('[SummaryStore] Totals summary loaded:', data);
    } catch (error: unknown) {
      console.error('Failed to load totals summary:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        totalsSummaryError.value = String(error.response.data.message);
      } else if (error instanceof Error) {
        totalsSummaryError.value = error.message;
      } else {
        totalsSummaryError.value = 'Không thể tải tổng hợp thu chi.';
      }
      totalsSummary.value = null;
      $q.notify({
        color: 'negative',
        message: totalsSummaryError.value || 'Đã có lỗi xảy ra.', // Provide a fallback if null
        icon: 'report_problem',
      });
    } finally {
      totalsSummaryLoading.value = false;
    }
  };

  const loadCategoryBreakdown = async (
    periodType: PeriodType,
    year?: number,
    month?: number,
    quarter?: number,
    parentCategoryId?: string,
    categoryIds?: string[], // Added for global category filter
  ) => {
    if (!authStore.isAuthenticated) {
      categoryBreakdownError.value = 'Người dùng chưa được xác thực.';
      categoryBreakdown.value = null;
      return;
    }

    categoryBreakdownLoading.value = true;
    categoryBreakdownError.value = null;
    try {
      // Initialize with required properties and default year
      const query: GetCategoryBreakdownQueryDto = {
        periodType,
        year: year || dayjs().year(),
      };

      // Conditionally add optional properties if they are defined
      if (month !== undefined) {
        query.month = month;
      }
      if (quarter !== undefined) {
        query.quarter = quarter;
      }
      if (parentCategoryId !== undefined) {
        query.parentCategoryId = parentCategoryId;
      }
      if (categoryIds && categoryIds.length > 0) {
        query.categoryIds = categoryIds;
      }

      console.log('[SummaryStore] Fetching category breakdown with query:', query);
      const data = await fetchCategoryBreakdownAPI(query);
      categoryBreakdown.value = data;
      console.log('[SummaryStore] Category breakdown loaded:', data);
    } catch (error: unknown) {
      console.error('Failed to load category breakdown:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        categoryBreakdownError.value = String(error.response.data.message);
      } else if (error instanceof Error) {
        categoryBreakdownError.value = error.message;
      } else {
        categoryBreakdownError.value = 'Không thể tải phân tích theo danh mục.';
      }
      categoryBreakdown.value = null;
      $q.notify({
        color: 'negative',
        message: categoryBreakdownError.value || 'Đã có lỗi xảy ra khi tải phân tích danh mục.',
        icon: 'report_problem',
      });
    } finally {
      categoryBreakdownLoading.value = false;
    }
  };

  const loadBudgetTrend = async (
    periodType: PeriodType, // Typically 'monthly' for year trend, or 'yearly' for multi-year
    year: number,
    categoryIds?: string[],
  ) => {
    if (!authStore.isAuthenticated) {
      budgetTrendError.value = 'Người dùng chưa được xác thực.';
      budgetTrend.value = null;
      return;
    }

    budgetTrendLoading.value = true;
    budgetTrendError.value = null;
    try {
      const query: GetBudgetTrendQueryDto = {
        periodType,
        year,
      };
      if (categoryIds && categoryIds.length > 0) {
        query.categoryIds = categoryIds;
      }

      console.log('[SummaryStore] Fetching budget trend with query:', query);
      const data = await fetchBudgetTrendAPI(query);
      budgetTrend.value = data;
      console.log('[SummaryStore] Budget trend loaded:', data);
    } catch (error: unknown) {
      console.error('Failed to load budget trend:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        budgetTrendError.value = String(error.response.data.message);
      } else if (error instanceof Error) {
        budgetTrendError.value = error.message;
      } else {
        budgetTrendError.value = 'Không thể tải xu hướng ngân sách.';
      }
      budgetTrend.value = null;
      $q.notify({
        color: 'negative',
        message: budgetTrendError.value || 'Đã có lỗi xảy ra khi tải xu hướng ngân sách.',
        icon: 'report_problem',
      });
    } finally {
      budgetTrendLoading.value = false;
    }
  };

  return {
    totalsSummary,
    totalsSummaryLoading,
    totalsSummaryError,
    loadTotalsSummary,

    categoryBreakdown,
    categoryBreakdownLoading,
    categoryBreakdownError,
    loadCategoryBreakdown,

    budgetTrend,
    budgetTrendLoading,
    budgetTrendError,
    loadBudgetTrend,
  };
});

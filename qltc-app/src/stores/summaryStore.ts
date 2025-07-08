import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from './authStore';
import {
  fetchTotalsSummaryAPI,
  fetchCategoryBreakdownAPI,
  fetchBudgetTrendAPI,
  fetchMemberBreakdownAPI,
  fetchPersonBreakdownAPI,
  fetchPersonCategoryBudgetCompareAPI,
} from 'src/services/summaryApiService';
import type {
  TotalsSummaryResponseDto,
  GetTotalsSummaryQueryDto,
  PeriodType,
  CategoryBreakdownResponseDto,
  GetCategoryBreakdownQueryDto,
  BudgetTrendResponseDto,
  GetBudgetTrendQueryDto,
  MemberBreakdownResponseDto,
  GetMemberBreakdownQueryDto,
  PersonBreakdownResponseDto,
  GetPersonBreakdownQueryDto,
  PersonCategoryBudgetCompareResponseDto,
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

  const memberBreakdown = ref<MemberBreakdownResponseDto | null>(null);
  const memberBreakdownLoading = ref(false);
  const memberBreakdownError = ref<string | null>(null);

  // Person Breakdown State
  const personBreakdown = ref<PersonBreakdownResponseDto | null>(null);
  const personBreakdownLoading = ref(false);
  const personBreakdownError = ref<string | null>(null);

  // Person Category Budget Compare State
  const personCategoryBudgetCompare = ref<PersonCategoryBudgetCompareResponseDto | null>(null);
  const personCategoryBudgetCompareLoading = ref(false);
  const personCategoryBudgetCompareError = ref<string | null>(null);

  const loadTotalsSummary = async (
    periodType: PeriodType,
    year?: number,
    transactionType?: 'expense' | 'all' // Added transactionType
  ) => {
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
      if (transactionType) {
        query.transactionType = transactionType;
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
    _familyId: string, // Unused, for compatibility only
    periodType: PeriodType,
    year?: number,
    month?: number,
    quarter?: number,
    parentCategoryId?: string,
    categoryIds?: string[], // Added for global category filter
    memberIds?: string[],   // Added for global member filter
    transactionType?: 'expense' | 'all', // Added transactionType
    isStrictMode?: boolean // Added for strict member filtering
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
        // Ensure categoryIds is always treated as an array for the query
        query.categoryIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
      } else {
        // Ensure categoryIds is not present or is undefined if empty, to avoid sending empty array if not desired
        delete query.categoryIds;
      }
      if (memberIds && memberIds.length > 0) { // Add memberIds to query
        query.memberIds = memberIds;
      }
      if (transactionType) {
        query.transactionType = transactionType;
      }
      if (isStrictMode !== undefined) { // Pass strict mode flag
        query.isStrictMode = isStrictMode;
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
    memberIds?: string[], // Added for global member filter
    transactionType?: 'expense' | 'all', // Added transactionType
    isStrictMode?: boolean // Added for strict member filtering
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
      if (memberIds && memberIds.length > 0) { // Add memberIds to query
        query.memberIds = memberIds;
      }
      if (transactionType) {
        query.transactionType = transactionType;
      }
      if (isStrictMode !== undefined) { // Pass strict mode flag
        query.isStrictMode = isStrictMode;
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

  const loadMemberBreakdown = async (
    periodType: PeriodType,
    year?: number,
    month?: number,
    quarter?: number,
    memberIds?: string[], // Added for global member filter
    transactionType?: 'expense' | 'all', // Added transactionType
    categoryIds?: string[], // Added for category filter
  ) => {
    if (!authStore.isAuthenticated) {
      memberBreakdownError.value = 'Người dùng chưa được xác thực.';
      memberBreakdown.value = null;
      return;
    }

    memberBreakdownLoading.value = true;
    memberBreakdownError.value = null;
    try {
      const query: GetMemberBreakdownQueryDto & { categoryIds?: string[] } = {
        periodType,
        year: year || dayjs().year(),
        ...(month !== undefined ? { month } : {}),
        ...(quarter !== undefined ? { quarter } : {}),
        ...(memberIds && memberIds.length > 0 ? { memberIds } : {}),
        ...(transactionType ? { transactionType } : {}),
        ...(categoryIds && categoryIds.length > 0 ? { categoryIds } : {}),
        // isStrictMode is deprecated/removed, do not include
      };

      console.log('[SummaryStore] Fetching member breakdown with query:', query);
      const data = await fetchMemberBreakdownAPI(query);
      memberBreakdown.value = data;
      console.log('[SummaryStore] Member breakdown loaded:', data);
    } catch (error: unknown) {
      console.error('Failed to load member breakdown:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        memberBreakdownError.value = String(error.response.data.message);
      } else if (error instanceof Error) {
        memberBreakdownError.value = error.message;
      } else {
        memberBreakdownError.value = 'Không thể tải phân tích theo thành viên.';
      }
      memberBreakdown.value = null;
      $q.notify({
        color: 'negative',
        message: memberBreakdownError.value || 'Đã có lỗi xảy ra khi tải phân tích thành viên.',
        icon: 'report_problem',
      });
    } finally {
      memberBreakdownLoading.value = false;
    }
  };

  const loadPersonBreakdown = async (
    periodType: PeriodType,
    year?: number,
    month?: number,
    quarter?: number,
    transactionType?: 'expense' | 'all',
  ) => {
    if (!authStore.isAuthenticated) {
      personBreakdownError.value = 'Người dùng chưa được xác thực.';
      personBreakdown.value = null;
      return;
    }
    personBreakdownLoading.value = true;
    personBreakdownError.value = null;
    try {
      const query: GetPersonBreakdownQueryDto = {
        periodType,
        year: year || dayjs().year(),
        ...(month !== undefined ? { month } : {}),
        ...(quarter !== undefined ? { quarter } : {}),
        ...(transactionType ? { transactionType } : {}),
      };
      const data = await fetchPersonBreakdownAPI(query);
      personBreakdown.value = data;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        personBreakdownError.value = String(error.response.data.message);
      } else if (error instanceof Error) {
        personBreakdownError.value = error.message;
      } else {
        personBreakdownError.value = 'Không thể tải phân tích theo người.';
      }
      personBreakdown.value = null;
      // $q.notify({
      //   color: 'negative',
      //   message: personBreakdownError.value || 'Đã có lỗi xảy ra khi tải phân tích theo người.',
      //   icon: 'report_problem',
      // });
    } finally {
      personBreakdownLoading.value = false;
    }
  };

  const loadPersonCategoryBudgetCompare = async (
    periodType: PeriodType,
    year?: number,
    month?: number,
    quarter?: number,
    transactionType?: 'expense' | 'all',
  ) => {
    if (!authStore.isAuthenticated) {
      personCategoryBudgetCompareError.value = 'Người dùng chưa được xác thực.';
      personCategoryBudgetCompare.value = null;
      return;
    }
    personCategoryBudgetCompareLoading.value = true;
    personCategoryBudgetCompareError.value = null;
    try {
      const query: GetPersonBreakdownQueryDto = {
        periodType,
        year: year || dayjs().year(),
        ...(month !== undefined ? { month } : {}),
        ...(quarter !== undefined ? { quarter } : {}),
        ...(transactionType ? { transactionType } : {}),
      };
      const data = await fetchPersonCategoryBudgetCompareAPI(query);
      personCategoryBudgetCompare.value = data;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        personCategoryBudgetCompareError.value = String(error.response.data.message);
      } else if (error instanceof Error) {
        personCategoryBudgetCompareError.value = error.message;
      } else {
        personCategoryBudgetCompareError.value = 'Không thể tải biểu đồ ngân sách theo danh mục.';
      }
      personCategoryBudgetCompare.value = null;
    } finally {
      personCategoryBudgetCompareLoading.value = false;
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

    memberBreakdown,
    memberBreakdownLoading,
    memberBreakdownError,
    loadMemberBreakdown,

    personBreakdown,
    personBreakdownLoading,
    personBreakdownError,
    loadPersonBreakdown,

    personCategoryBudgetCompare,
    personCategoryBudgetCompareLoading,
    personCategoryBudgetCompareError,
    loadPersonCategoryBudgetCompare,
  };
});

import apiClient from './api';
import type {
  TotalsSummaryResponseDto,
  GetTotalsSummaryQueryDto,
  CategoryBreakdownResponseDto,
  MemberBreakdownResponseDto,
  AverageExpensesResponseDto,
  GetAverageExpensesQueryDto,
  BudgetComparisonResponseDto,
  GetBudgetComparisonQueryDto,
  BudgetTrendResponseDto,
  PeriodType, // Assuming PeriodType is exported from models/summary or similar
} from 'src/models/summary'; // We'll create this models file next
import qs from 'qs';

const API_URL = '/summaries';


export const fetchTotalsSummaryAPI = async (
  query: GetTotalsSummaryQueryDto,
): Promise<TotalsSummaryResponseDto> => {
  const response = await apiClient.get<TotalsSummaryResponseDto>(`${API_URL}/totals`, { params: query });
  return response.data;
};
// Frontend version of DTOs for type safety in API calls
// These should mirror the backend DTOs structure
export interface GetCategoryBreakdownPayload {
  periodType: PeriodType;
  year?: number;
  month?: number;
  quarter?: number;
  parentCategoryId?: string;
  categoryIds?: string[];
  memberIds?: string[];
  transactionType?: 'expense' | 'all';
}

export const fetchCategoryBreakdownAPI = async (
  query: GetCategoryBreakdownPayload, // Use the frontend payload type
): Promise<CategoryBreakdownResponseDto> => {
  const response = await apiClient.get<CategoryBreakdownResponseDto>(`${API_URL}/category-breakdown`, {
    params: query,
    paramsSerializer: params => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    }
  });
  return response.data;
};

export interface GetMemberBreakdownPayload {
  periodType: PeriodType;
  year?: number;
  month?: number;
  quarter?: number;
  memberIds?: string[];
  transactionType?: 'expense' | 'all';
}

export const fetchMemberBreakdownAPI = async (
  query: GetMemberBreakdownPayload, // Use the frontend payload type
): Promise<MemberBreakdownResponseDto> => {
  const response = await apiClient.get<MemberBreakdownResponseDto>(`${API_URL}/member-breakdown`, {
    params: query,
    paramsSerializer: params => {
      // Use qs for consistency, even if memberIds is the only array param here
      return qs.stringify(params, { arrayFormat: 'repeat' });
    }
  });
  return response.data;
};

// Assuming GetAverageExpensesQueryDto is correctly defined in models/summary
// and doesn't need transactionType for now.
// export interface GetAverageExpensesPayload extends GetAverageExpensesQueryDto {}

// Assuming GetBudgetComparisonQueryDto is correctly defined in models/summary
// and doesn't need transactionType for now.
export const fetchAverageExpensesAPI = async (
  query: GetAverageExpensesQueryDto,
): Promise<AverageExpensesResponseDto> => {
  const response = await apiClient.get<AverageExpensesResponseDto>(`${API_URL}/average-expenses`, { params: query });
  return response.data;
};

export const fetchBudgetComparisonAPI = async (
  query: GetBudgetComparisonQueryDto,
): Promise<BudgetComparisonResponseDto> => {
  const response = await apiClient.get<BudgetComparisonResponseDto>(`${API_URL}/budget-comparison`, { params: query });
  return response.data;
};

export interface GetBudgetTrendPayload {
  periodType: PeriodType;
  year: number;
  categoryIds?: string[];
  memberIds?: string[];
  transactionType?: 'expense' | 'all';
}

export const fetchBudgetTrendAPI = async (
  query: GetBudgetTrendPayload, // Use the frontend payload type
): Promise<BudgetTrendResponseDto> => {
  const response = await apiClient.get<BudgetTrendResponseDto>(`${API_URL}/budget-trend`, {
    params: query,
    paramsSerializer: params => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    }
  });
  return response.data;
};

import apiClient from './api';
import type {
  TotalsSummaryResponseDto,
  GetTotalsSummaryQueryDto,
  CategoryBreakdownResponseDto,
  GetCategoryBreakdownQueryDto,
  MemberBreakdownResponseDto,
  GetMemberBreakdownQueryDto,
  AverageExpensesResponseDto,
  GetAverageExpensesQueryDto,
  BudgetComparisonResponseDto,
  GetBudgetComparisonQueryDto,
  BudgetTrendResponseDto,
  GetBudgetTrendQueryDto,
} from 'src/models/summary'; // We'll create this models file next
import qs from 'qs';

const API_URL = '/summaries';

export const fetchTotalsSummaryAPI = async (
  query: GetTotalsSummaryQueryDto,
): Promise<TotalsSummaryResponseDto> => {
  const response = await apiClient.get<TotalsSummaryResponseDto>(`${API_URL}/totals`, { params: query });
  return response.data;
};

export const fetchCategoryBreakdownAPI = async (
  query: GetCategoryBreakdownQueryDto,
): Promise<CategoryBreakdownResponseDto> => {
  const response = await apiClient.get<CategoryBreakdownResponseDto>(`${API_URL}/category-breakdown`, {
    params: query,
    paramsSerializer: params => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    }
  });
  return response.data;
};

export const fetchMemberBreakdownAPI = async (
  query: GetMemberBreakdownQueryDto,
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

export const fetchBudgetTrendAPI = async (
  query: GetBudgetTrendQueryDto,
): Promise<BudgetTrendResponseDto> => {
  const response = await apiClient.get<BudgetTrendResponseDto>(`${API_URL}/budget-trend`, {
    params: query,
    paramsSerializer: params => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    }
  });
  return response.data;
};

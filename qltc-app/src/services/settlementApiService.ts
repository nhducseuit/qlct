// d:\sources\qlct\qltc-app\src\services\settlementApiService.ts
import apiClient from './api'; // Assuming your configured Axios instance is exported from here
import type {
  BalancesResponseDto,
  CreateSettlementDto,
  SettlementDto,
  PaginatedSettlementsResponseDto,
  GetSettlementsQueryDto,
  // GetBalancesQueryDto is not used yet, but can be added if needed
} from 'src/models/settlement';
import qs from 'qs';

const API_URL = '/settlements';

/**
 * Fetches the current balances between household members.
 */
export const fetchBalancesAPI = async (): Promise<BalancesResponseDto> => {
  // Currently, GetBalancesQueryDto is empty on the backend, so no params are sent.
  // If query params are added later, they would be passed here.
  // const query: GetBalancesQueryDto = {};
  const response = await apiClient.get<BalancesResponseDto>(`${API_URL}/balances`);
  return response.data;
};

/**
 * Records a new settlement.
 * @param settlementData - The data for the new settlement.
 */
export const createSettlementAPI = async (
  settlementData: CreateSettlementDto,
): Promise<SettlementDto> => {
  const response = await apiClient.post<SettlementDto>(API_URL, settlementData);
  return response.data;
};

/**
 * Fetches a paginated list of settlement history.
 * @param query - Optional query parameters for pagination and filtering.
 */
export const fetchSettlementsAPI = async (
  query: GetSettlementsQueryDto,
): Promise<PaginatedSettlementsResponseDto> => {
  const response = await apiClient.get<PaginatedSettlementsResponseDto>(API_URL, {
    params: query,
    paramsSerializer: params => {
      // Ensure array parameters are formatted correctly if any are added in the future
      // For now, GetSettlementsQueryDto has page, limit, payerId, payeeId, startDate, endDate
      // which qs handles well by default. arrayFormat: 'repeat' is good for multiple values of the same key.
      return qs.stringify(params, { arrayFormat: 'repeat', skipNulls: true });
    },
  });
  return response.data;
};

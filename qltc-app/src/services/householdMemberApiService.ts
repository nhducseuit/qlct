import apiClient from './api'; // Import the configured Axios instance
import type { HouseholdMember, Family } from 'src/models'; // Assuming HouseholdMember type is in src/models


// Define DTO types for request payloads, aligning with backend DTOs
export interface CreateHouseholdMemberPayload {
  name?: string; // Optional: only required when creating a new person inline (legacy)
  isActive?: boolean;
  order?: number;
  personId?: string;
}

export type UpdateHouseholdMemberPayload = Partial<CreateHouseholdMemberPayload>;

const API_URL = '/household-members'; // Matches your HouseholdMemberController route

// Define the structure for the hierarchical response
export interface FamilyMemberGroup extends Family {
  members: HouseholdMember[];
}

export const fetchHouseholdMembersAPI = async (): Promise<HouseholdMember[]> => {
  console.log('[HouseholdMemberApiService] fetchHouseholdMembersAPI called');
  const response = await apiClient.get<HouseholdMember[]>(API_URL);
  return response.data;
};

// New function to fetch all members for the user, grouped by family
export const fetchAllMyMembersGroupedByFamilyAPI = async (): Promise<FamilyMemberGroup[]> => {
  console.log('[HouseholdMemberApiService] fetchAllMyMembersGroupedByFamilyAPI called');
  const response = await apiClient.get<FamilyMemberGroup[]>(`${API_URL}/my-members-by-family`);
  return response.data;
};

export const addHouseholdMemberAPI = async (memberData: CreateHouseholdMemberPayload): Promise<HouseholdMember> => {
  console.log('[HouseholdMemberApiService] addHouseholdMemberAPI called', memberData);
  const response = await apiClient.post<HouseholdMember>(API_URL, memberData);
  return response.data;
};

export const updateHouseholdMemberAPI = async (
  memberId: string,
  updates: UpdateHouseholdMemberPayload,
): Promise<HouseholdMember> => {
  console.log(`[HouseholdMemberApiService] updateHouseholdMemberAPI called for memberId: ${memberId}`, updates);
  const response = await apiClient.patch<HouseholdMember>(`${API_URL}/${memberId}`, updates);
  return response.data;
};

export const deleteHouseholdMemberAPI = async (memberId: string): Promise<HouseholdMember> => {
  console.log(`[HouseholdMemberApiService] deleteHouseholdMemberAPI called for memberId: ${memberId}`);
  // Backend returns the deleted member object
  const response = await apiClient.delete<HouseholdMember>(`${API_URL}/${memberId}`);
  return response.data;
};

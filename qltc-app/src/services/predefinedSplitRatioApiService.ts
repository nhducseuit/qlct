/**
 * Predefined Split Ratio API Service
 *
 * This service makes HTTP requests to the backend API for predefined split ratios.
 */
import apiClient from './api'; // Import the configured Axios instance
import type { PredefinedSplitRatio } from 'src/stores/predefinedSplitRatioStore'; // Assuming the interface is defined here
import type { SplitRatioItem } from 'src/models';

const API_URL = '/predefined-split-ratios'; // Matches your PredefinedSplitRatioController route

export interface CreatePredefinedSplitRatioPayload {
  name: string;
  splitRatio: SplitRatioItem[];
  // familyId is derived from the user's token on the backend
}

export type UpdatePredefinedSplitRatioPayload = Partial<CreatePredefinedSplitRatioPayload>;

export const fetchPredefinedSplitRatiosAPI = async (): Promise<PredefinedSplitRatio[]> => {
  // No familyId param, backend returns all accessible ratios (user's family and parent)
  try {
    const response = await apiClient.get<PredefinedSplitRatio[]>(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching predefined split ratios:', error);
    throw error;
  }
};

export const addPredefinedSplitRatioAPI = async (
  payload: CreatePredefinedSplitRatioPayload
): Promise<PredefinedSplitRatio> => {
  console.log('[PredefinedSplitRatioApiService] addPredefinedSplitRatioAPI called', payload);
  try {
    const response = await apiClient.post<PredefinedSplitRatio>(API_URL, payload);
    return response.data;
  } catch (error) {
    console.error('Error adding predefined split ratio:', error);
    throw error;
  }
};

export const updatePredefinedSplitRatioAPI = async (
  id: string,
  updates: UpdatePredefinedSplitRatioPayload,
): Promise<PredefinedSplitRatio> => {
  console.log(`[PredefinedSplitRatioApiService] updatePredefinedSplitRatioAPI called for ID: ${id}`, updates);
  try {
    const response = await apiClient.patch<PredefinedSplitRatio>(`${API_URL}/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating predefined split ratio:', error);
    throw error;
  }
};

export const deletePredefinedSplitRatioAPI = async (id: string): Promise<PredefinedSplitRatio> => {
  // Backend returns the deleted object
  console.log(`[PredefinedSplitRatioApiService] deletePredefinedSplitRatioAPI called for ID: ${id}`);
  try {
    const response = await apiClient.delete<PredefinedSplitRatio>(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting predefined split ratio:', error);
    throw error;
  }
};

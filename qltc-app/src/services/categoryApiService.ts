/**
 * Category API Service
 *
 * This service makes HTTP requests to the backend API for categories.
 */
import apiClient from './api'; // Import the configured Axios instance
import type { Category, SplitRatioItem } from 'src/models';

// Define DTO types for request payloads, aligning with backend DTOs
// Ensure these types are consistent with your backend's CreateCategoryDto and UpdateCategoryDto
export interface CreateCategoryPayload {
  name: string;
  parentId?: string | null;
  icon?: string | null;
  color?: string | null;
  isPinned?: boolean;
  order?: number;
  isHidden?: boolean;
  budgetLimit?: number | null;
  defaultSplitRatio?: SplitRatioItem[] | null;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export const fetchCategoriesAPI = async (): Promise<Category[]> => {
  console.log('[CategoryApiService] fetchCategoriesAPI called');
  const response = await apiClient.get<Category[]>('/categories');
  return response.data;
};

export const addCategoryAPI = async (categoryData: CreateCategoryPayload): Promise<Category> => {
  console.log('[CategoryApiService] addCategoryAPI called', categoryData);
  const response = await apiClient.post<Category>('/categories', categoryData);
  return response.data;
};

export const updateCategoryAPI = async (
  categoryId: string,
  updates: UpdateCategoryPayload,
): Promise<Category> => {
  console.log(`[CategoryApiService] updateCategoryAPI called for categoryId: ${categoryId}`, updates);
  const response = await apiClient.patch<Category>(`/categories/${categoryId}`, updates);
  return response.data;
};

export const deleteCategoryAPI = async (categoryId: string): Promise<Category> => {
  console.log(`[CategoryApiService] deleteCategoryAPI called for categoryId: ${categoryId}`);
  // Backend returns the deleted category object upon successful deletion
  const response = await apiClient.delete<Category>(`/categories/${categoryId}`);
  return response.data;
};

export const reorderCategoriesAPI = async (
  operations: { categoryId: string; order: number }[]
): Promise<void> => {
  // Note: Backend currently supports updating order via PATCH /categories/:id one by one.
  // A batch update endpoint could be more efficient for reordering multiple items.
  console.log('[CategoryApiService] reorderCategoriesAPI called', operations);
  const promises = operations.map(op =>
    apiClient.patch<Category>(`/categories/${op.categoryId}`, { order: op.order })
  );
  await Promise.all(promises);
  // This function could return Promise<Category[]> if the updated categories are needed by the caller.
};

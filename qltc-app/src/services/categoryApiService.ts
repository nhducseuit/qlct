/**
 * Category API Service
 *
 * This service makes HTTP requests to the backend API for categories.
 */
import apiClient from './api';
import type { Category as CategoryModel, SplitRatioItem } from 'src/models';

// Define DTO types for request payloads, aligning with backend DTOs
// Ensure these types are consistent with your backend's CreateCategoryDto and UpdateCategoryDto
export interface CreateCategoryPayload {
  name: string;
  parentId?: string | null;
  color?: string | null;
  isPinned?: boolean;
  isHidden?: boolean;
  familyId?: string;
  defaultSplitRatio?: SplitRatioItem[] | null;
}

export interface Category extends CreateCategoryPayload {
  id: string;
  order: number;
  budgetLimit?: number | null;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;


export const fetchCategoriesAPI = async (familyId: string): Promise<CategoryModel[]> => {
  console.log('[CategoryApiService] fetchCategoriesAPI called for familyId:', familyId);
  const response = await apiClient.get<CategoryModel[]>('/categories', { params: { familyId } });
  return response.data;
};


/**
 * Add a new category.
 * @param categoryData The data for the new category.
 * @returns The newly created category.
 */
export const addCategoryAPI = async (categoryData: CreateCategoryPayload): Promise<CategoryModel> => {
  try {
    const response = await apiClient.post<CategoryModel>('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('[CategoryApiService] Error in addCategoryAPI:', error);
    throw error;
  }
};


export const updateCategoryAPI = async (
  categoryId: string,
  updates: UpdateCategoryPayload,
  familyId: string
): Promise<Category> => {
  console.log(`[CategoryApiService] updateCategoryAPI called for categoryId: ${categoryId}`, updates, 'familyId:', familyId);
  // Remove familyId from the PATCH body, only send as query param if needed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars
  const { familyId: _omit, ...safeUpdates } = updates as any;
  const response = await apiClient.patch<Category>(
    `/categories/${categoryId}`,
    safeUpdates,
    { params: { familyId } }
  );
  return response.data;
};


export const deleteCategoryAPI = async (categoryId: string, familyId: string): Promise<Category> => {
  console.log(`[CategoryApiService] deleteCategoryAPI called for categoryId: ${categoryId}, familyId: ${familyId}`);
  // Backend returns the deleted category object upon successful deletion
  const response = await apiClient.delete<Category>(`/categories/${categoryId}`, { params: { familyId } });
  return response.data;
};

export const reorderCategoriesAPI = async (
  operations: { categoryId: string; order: number }[],
  familyId: string // Add familyId parameter
): Promise<void> => {
  // Note: Backend currently supports updating order via PATCH /categories/:id one by one.
  // A batch update endpoint could be more efficient for reordering multiple items.
  console.log('[CategoryApiService] reorderCategoriesAPI called', operations);
  const promises = operations.map(op =>
    apiClient.patch<Category>(`/categories/${op.categoryId}`, { order: op.order }, { params: { familyId } })
  );
  await Promise.all(promises);
  // This function could return Promise<Category[]> if the updated categories are needed by the caller.
};

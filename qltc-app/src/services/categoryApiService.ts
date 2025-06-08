/**
 * Mock Category API Service
 *
 * This service simulates an API backend for categories.
 * For now, it interacts directly with Dexie (db.ts) as if it were the backend database.
 * In a real scenario, these functions would make HTTP requests to a remote server.
 *
 * It also introduces the concept of `userId` for data scoping, though Dexie
 * currently doesn't store `userId` with categories, so actual filtering by userId
 * is not implemented here. This is a placeholder for future backend integration.
 */
import {
  getAllCategoriesDB,
  addCategoryDB,
  updateCategoryDB,
  deleteCategoryDB,
  // getCategoryByIdDB, // Not strictly needed if store handles it
} from 'src/services/db';
import type { Category } from 'src/models';

export const fetchCategoriesAPI = async (userId: string): Promise<Category[]> => {
  console.log(`[CategoryApiService] fetchCategoriesAPI called for userId: ${userId}`);
  // In a real API, userId would be used to fetch user-specific categories.
  // Here, we return all categories as Dexie isn't user-scoped yet.
  return getAllCategoriesDB();
};

export const addCategoryAPI = async (userId: string, categoryData: Category): Promise<Category> => {
  console.log(`[CategoryApiService] addCategoryAPI called for userId: ${userId}`, categoryData);
  // In a real API, categoryData might be augmented with userId before saving.
  // Dexie's addCategoryDB doesn't take userId.
  await addCategoryDB(categoryData);
  return categoryData; // Return the added category, as an API might
};

export const updateCategoryAPI = async (
  userId: string,
  categoryId: string,
  updates: Partial<Omit<Category, 'id'>>
): Promise<number> => {
  console.log(`[CategoryApiService] updateCategoryAPI called for userId: ${userId}, categoryId: ${categoryId}`, updates);
  // Real API would ensure user has permission to update this categoryId.
  return updateCategoryDB(categoryId, updates);
};

export const deleteCategoryAPI = async (userId: string, categoryId: string): Promise<number> => {
  console.log(`[CategoryApiService] deleteCategoryAPI called for userId: ${userId}, categoryId: ${categoryId}`);
  // Real API would ensure user has permission to delete this categoryId.
  return deleteCategoryDB(categoryId);
};

export const reorderCategoriesAPI = async (
  userId: string,
  operations: { categoryId: string; order: number }[]
): Promise<void> => {
  console.log(`[CategoryApiService] reorderCategoriesAPI called for userId: ${userId}`, operations);
  // In a real API, this might be a batch update or specific reorder endpoint.
  // For now, we'll update them one by one.
  // This is a simplified mock; a real backend might handle this more atomically.
  const promises = operations.map(op =>
    updateCategoryDB(op.categoryId, { order: op.order })
  );
  await Promise.all(promises);
  // A real API might return a success status or the updated items.
  // For this mock, void is fine as the store will reload.
};

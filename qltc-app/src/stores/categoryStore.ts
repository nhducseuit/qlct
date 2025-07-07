import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { AxiosError } from 'axios';
import type { Socket } from 'socket.io-client';
import { connect } from 'src/services/socketService';
import {
  fetchCategoriesAPI,
  addCategoryAPI,
  updateCategoryAPI,
  deleteCategoryAPI,
  reorderCategoriesAPI,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from 'src/services/categoryApiService';
import type { Category } from 'src/models';
import { useAuthStore } from './authStore';
import { useFamilyStore } from './familyStore';

// Define a specific type for the WebSocket event payload
type CategoryEventPayload =
  | { action: 'create'; data: Category }
  | { action: 'update'; data: Category }
  | { action: 'delete'; data: { id: string } };

// Define a local type for the hierarchical structure to be used within the store
export type HierarchicalCategory = Category & { children: HierarchicalCategory[] };

export const useCategoryStore = defineStore('categories', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();
  const categories = ref<Category[]>([]);
  const isLoading = ref(false);
  const familyStore = useFamilyStore();
  let storeSocket: Socket | null = null;

  // Watch for family change and reload categories
  watch(
    () => familyStore.selectedFamilyId,
    () => {
      if (authStore.isAuthenticated) {
        void loadCategories();
      }
    }
  );

  const loadCategories = async () => {
    if (!authStore.isAuthenticated) {
      console.log('[CategoryStore] User not authenticated, skipping category load.');
      categories.value = [];
      return;
    }
    const currentFamilyId = familyStore.selectedFamilyId;
    if (!currentFamilyId) {
      console.warn('[CategoryStore] No family selected, skipping category load.');
      categories.value = [];
      return;
    }
    isLoading.value = true;
    try {
      // Only one API call, backend returns all accessible categories (user's family and parent)
      const allCategories = await fetchCategoriesAPI();
      categories.value = allCategories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } catch (error) {
      console.error('Failed to load categories:', error);
      $q.notify({
        color: 'negative',
        message: 'Không thể tải danh mục.',
        icon: 'report_problem',
      });
      // Clear categories on error to avoid showing stale/incomplete data
      categories.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const addCategory = async (categoryData: CreateCategoryPayload & { familyId?: string }) => {
    if (!authStore.isAuthenticated) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể thêm danh mục.' });
      throw new Error('User not authenticated');
    }
    try {
      // Use the familyId chosen in the dialog (categoryData.familyId), fallback to selectedFamilyId if not present
      const targetFamilyId = categoryData.familyId || familyStore.selectedFamilyId;
      if (!targetFamilyId) {
        throw new Error('Family ID is missing. Cannot add category.');
      }

      const payload: CreateCategoryPayload = {
        ...categoryData,
        familyId: targetFamilyId, // Ensure familyId is in the payload
        color: categoryData.color === '' ? null : (categoryData.color ?? null), // Transform '' to null
        isPinned: categoryData.isPinned ?? false,
        isHidden: categoryData.isHidden ?? false,
      };

      const addedCategory = await addCategoryAPI(payload);

      // Instead of reloading, just add the new category to the local state.
      categories.value.push(addedCategory);

      $q.notify({ type: 'positive', message: 'Đã thêm danh mục mới.' });
      return addedCategory;
    } catch (error) {
      console.error('Failed to add category:', error);
      $q.notify({
        color: 'negative',
        message: 'Thêm danh mục thất bại.',
        icon: 'report_problem',
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: UpdateCategoryPayload) => {
    if (!authStore.isAuthenticated)
    {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể cập nhật danh mục.' });
      throw new Error('User not authenticated');
    }

    // Optimistic update for faster UI feedback
    const categoryIndex = categories.value.findIndex(c => c.id === id);
    if (categoryIndex === -1) {
      console.error('Category not found for optimistic update');
      // Fallback to API call without optimistic update if not found locally
    } else {
      // Store the original category state in case we need to revert
      const originalCategory = JSON.parse(JSON.stringify(categories.value[categoryIndex]));

      // Apply updates to the local state
      // Note: This merges the `updates` into the existing category object
      Object.assign(categories.value[categoryIndex] as object, updates);

      try {
        // Now, send the update to the backend
        await updateCategoryAPI(id, updates, familyStore.selectedFamilyId!);
        // The backend will broadcast a websocket event, which the store will handle granularly.
        $q.notify({ type: 'positive', message: 'Đã cập nhật danh mục.' });
      } catch (error) {
        // If the API call fails, revert the change in the UI
        categories.value[categoryIndex] = originalCategory;
        console.error('Failed to update category:', error);
        $q.notify({
          color: 'negative',
          message: 'Cập nhật danh mục thất bại.',
          icon: 'report_problem',
        });
        throw error;
      }
      return;
    }

    // Fallback for when optimistic update is not possible
    try {
      console.log(`[CategoryStore] Attempting to update category (fallback). ID: ${id}, Updates:`, JSON.parse(JSON.stringify(updates)));
      const updatedCategory = await updateCategoryAPI(id, updates, familyStore.selectedFamilyId!);
      $q.notify({ type: 'positive', message: 'Đã cập nhật danh mục.' });
      return updatedCategory;
    } catch (error) {
      console.error('Failed to update category:', error);
      $q.notify({
        color: 'negative',
        message: 'Cập nhật danh mục thất bại.',
        icon: 'report_problem',
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!authStore.isAuthenticated) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể xóa danh mục.' });
      throw new Error('User not authenticated');
    }

    const categoryIndex = categories.value.findIndex(c => c.id === id);
    if (categoryIndex === -1) {
      throw new Error('Category not found for deletion');
    }

    // Optimistic removal
    const [removedCategory] = categories.value.splice(categoryIndex, 1);

    try {
      await deleteCategoryAPI(id, familyStore.selectedFamilyId!);
      $q.notify({ type: 'positive', message: 'Đã xóa danh mục.' });
    } catch (error) {
      // Revert on failure
      if (removedCategory) {
        categories.value.splice(categoryIndex, 0, removedCategory);
      }

      console.error('Failed to delete category:', error);
      let errorMessage = 'Xóa danh mục thất bại.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = String(error.response.data.message);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      $q.notify({
        color: 'negative',
        message: errorMessage,
        icon: 'report_problem',
      });
      throw error;
    }
  };

  const handleCategoryUpdate = (event: CategoryEventPayload) => {
    console.log(`[CategoryStore] Received categories_updated event: ${event.action}`, event.data);

    switch (event.action) {
      case 'create': {
        const newCategory = event.data;
        const existingIndex = categories.value.findIndex(c => c.id === newCategory.id);
        if (existingIndex === -1) {
          // Add the new category and then sort the entire array to maintain order.
          categories.value.push(newCategory);
          categories.value.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }
        break;
      }
      case 'update': {
        const updatedCategory = event.data;
        const index = categories.value.findIndex(c => c.id === updatedCategory.id);
        if (index !== -1) {
          // Use splice to replace the item in-place, ensuring reactivity.
          // This is the pattern used in householdMemberStore for robust updates.
          categories.value.splice(index, 1, updatedCategory);
        } else {
          // If an update event comes for a category not in the list, it's likely a new
          // category from the parent family. Add it and sort.
          categories.value.push(updatedCategory);
          categories.value.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }
        break;
      }
      case 'delete': {
        const { id } = event.data;
        const index = categories.value.findIndex(c => c.id === id);
        if (index !== -1) {
          categories.value.splice(index, 1);
        }
        break;
      }
      default:
        console.warn(`[CategoryStore] Unknown category update event`, event);
        break;
    }
  };

  const setupSocketListeners = () => {
    if (storeSocket) {
      storeSocket.off('categories_updated'); // Remove all listeners for this event to avoid duplicates
      storeSocket.on('categories_updated', (event: CategoryEventPayload) => {
        handleCategoryUpdate(event);
      });
    }
  };

  const connectSocket = async () => {
    if (storeSocket?.connected) {
      return;
    }
    try {
      storeSocket = await connect();
      if (storeSocket) {
        setupSocketListeners();
      }
    } catch (error) {
      console.error('[CategoryStore] Socket connection failed:', error);
    }
  };

  const disconnectSocket = () => {
    if (storeSocket) {
      storeSocket.off('categories_updated', handleCategoryUpdate);
      storeSocket.disconnect();
      storeSocket = null;
    }
  };

  // A computed property that flattens the hierarchical structure for use in select dropdowns.
  const flatSortedCategoriesForSelect = computed(() => {
    const result: { id: string; name: string; parentId: string | null; depth: number }[] = [];

    // Helper type for recursive building
    type HierarchicalCategory = Category & { children: HierarchicalCategory[]; depth: number };

    // Recursive function to build the hierarchy
    const buildHierarchy = (
      categoriesToBuild: Category[],
      allCategories: Category[],
      depth = 0
    ): HierarchicalCategory[] => {
      return categoriesToBuild
        .map((category) => {
          const children = allCategories.filter((c) => c.parentId === category.id);
          return {
            ...category,
            depth,
            children: buildHierarchy(children, allCategories, depth + 1),
          };
        })
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)); // Sort children by order
    };

    // Recursive function to flatten the hierarchy into the desired list format
    const buildFlatListFromHierarchy = (items: HierarchicalCategory[]) => {
      for (const item of items) {
        result.push({
          id: item.id,
          name: '—'.repeat(item.depth) + ` ${item.name}`,
          parentId: item.parentId ?? null,
          depth: item.depth,
        });
        if (item.children.length > 0) {
          buildFlatListFromHierarchy(item.children);
        }
      }
    };

    const allCatsForFamily = categories.value;

    // Initial call to build the hierarchy from root categories
    const hierarchical = buildHierarchy(
      allCatsForFamily.filter((c) => !c.parentId),
      allCatsForFamily
    );

    // Flatten the built hierarchy
    buildFlatListFromHierarchy(hierarchical);

    return result;
  });

  const hierarchicalCategories = computed((): HierarchicalCategory[] => {
    const buildHierarchy = (
      parentId: string | null = null,
      allCategories: Category[] = categories.value
    ): HierarchicalCategory[] => {
      return allCategories
        .filter((c) => c.parentId === parentId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((c) => ({
          ...c,
          children: buildHierarchy(c.id, allCategories),
        }));
    };
    return buildHierarchy(null);
  });

  const categoriesByFamily = computed(() => {
    const result: {
      familyName: string;
      categories: HierarchicalCategory[];
    }[] = [];

    const currentFamily = familyStore.selectedFamily;
    const parentFamily = familyStore.parentOfSelectedFamily;

    const buildHierarchyForFamily = (familyId: string) => {
      const familyCategories = categories.value.filter((c) => c.familyId === familyId);
      const buildHierarchy = (
        parentId: string | null = null
      ): HierarchicalCategory[] => {
        return familyCategories
          .filter((c) => c.parentId === parentId)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((c) => ({
            ...c,
            children: buildHierarchy(c.id),
          }));
      };
      return buildHierarchy(null);
    };

    if (currentFamily) {
      result.push({
        familyName: `${currentFamily.name} (Gia đình hiện tại)`,
        categories: buildHierarchyForFamily(currentFamily.id),
      });
    }
    if (parentFamily) {
      result.push({
        familyName: `${parentFamily.name} (Gia đình cha)`,
        categories: buildHierarchyForFamily(parentFamily.id),
      });
    }

    return result;
  });

  const visibleCategories = computed(() => {
    const filterHidden = (cats: HierarchicalCategory[]): HierarchicalCategory[] => {
      return cats
        .map((c) => ({ ...c, children: filterHidden(c.children) }))
        .filter((c) => !c.isHidden);
    };
    return filterHidden(hierarchicalCategories.value);
  });

  const pinnedCategories = computed(() => {
    return categories.value.filter((c) => c.isPinned).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  const togglePinCategory = async (category: Category) => {
    try {
      await updateCategory(category.id, { isPinned: !category.isPinned });
    } catch (error) {
      console.error('Failed to toggle pin for category:', error);
    }
  };

  const reorderCategories = async (orderedIds: string[]) => {
    const originalCategories = JSON.parse(JSON.stringify(categories.value));
    categories.value.forEach((cat) => {
      const newIndex = orderedIds.indexOf(cat.id);
      if (newIndex !== -1) {
        cat.order = newIndex;
      }
    });
    categories.value.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    try {
      const operations = orderedIds.map((id, index) => ({
        categoryId: id,
        order: index,
      }));
      await reorderCategoriesAPI(operations, familyStore.selectedFamilyId!);
      $q.notify({ type: 'positive', message: 'Đã cập nhật thứ tự danh mục.' });
    } catch (error) {
      console.error('Failed to reorder categories:', error);
      $q.notify({
        color: 'negative',
        message: 'Cập nhật thứ tự thất bại.',
        icon: 'report_problem',
      });
      categories.value = originalCategories;
    }
  };

  const getCategoryById = (id: string) => {
    return categories.value.find((c) => c.id === id);
  };

  return {
    categories,
    isLoading,
    hierarchicalCategories,
    flatSortedCategoriesForSelect,
    categoriesByFamily,
    visibleCategories,
    pinnedCategories,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    reorderCategories,
    togglePinCategory,
    connectSocket,
    disconnectSocket,
  };
});

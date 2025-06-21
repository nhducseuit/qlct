import { defineStore } from 'pinia';
import { ref, computed, onMounted } from 'vue';
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
import { useQuasar } from 'quasar';
import { useAuthStore } from './authStore';
import { connect } from 'src/services/socketService'; // Renamed connectSocket to connect
import type { Socket } from 'socket.io-client';
import { AxiosError } from 'axios';
// import { v4 as uuidv4 } from 'uuid'; // Not used currently

export const useCategoryStore = defineStore('categories', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();
  const categories = ref<Category[]>([]);
  let storeSocket: Socket | null = null; // Renamed to avoid confusion


  const loadCategories = async () => {
    if (!authStore.isAuthenticated) {
      console.log('[CategoryStore] User not authenticated, skipping category load.');
      categories.value = [];
      return;
    }

    try {
      console.log('[CategoryStore] Loading categories from API...');
      const fetchedCategories = await fetchCategoriesAPI();
      categories.value = fetchedCategories.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Failed to load categories:', error);
      $q.notify({
        color: 'negative',
        message: 'Không thể tải danh mục.',
        icon: 'report_problem',
      });
    }
  };

  const addCategory = async (categoryData: CreateCategoryPayload) => {
    if (!authStore.isAuthenticated) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể thêm danh mục.' });
      throw new Error('User not authenticated');
    }
    try {
      // Backend will generate ID and set defaults for isPinned, isHidden, order if not provided.
      // Ensure defaultSplitRatio is in the correct format if provided.
      const payload: CreateCategoryPayload = {
        ...categoryData,
        color: categoryData.color === '' ? null : (categoryData.color ?? null), // Transform '' to null
        isPinned: categoryData.isPinned ?? false,
        isHidden: categoryData.isHidden ?? false,
        // order: categoryData.order, // Let backend handle default order or manage explicitly
      };
      const addedCategory = await addCategoryAPI(payload);
      // Optimistic update can be done here, or rely purely on WebSocket
      // categories.value.push(addedCategory);
      // categories.value.sort((a, b) => a.order - b.order);
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
    if (!authStore.isAuthenticated) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể cập nhật danh mục.' });
      throw new Error('User not authenticated');
    }
    console.log(`[CategoryStore] Attempting to update category. ID: ${id}, Raw updates received:`, JSON.parse(JSON.stringify(updates)));
    try {
      // Ensure the payload sent to the API service does not contain 'id'.
      // The 'updates' parameter might be a Partial<Category> if called from a component,
      // which could include 'id'. We explicitly remove it here.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      const { id: _id, userId: _userId, createdAt: _createdAt, updatedAt: _updatedAt, color, ...restOfUpdates } = updates as any;

      const payloadForApi: UpdateCategoryPayload = {
        ...restOfUpdates,
      };
      // Transform '' to null for color, or assign if it's a valid string or already null
      payloadForApi.color = (color === '' || color === undefined) ? null : color;

      console.log(`[CategoryStore] Cleaned payload for API:`, JSON.parse(JSON.stringify(payloadForApi)));

      const updatedCategory = await updateCategoryAPI(id, payloadForApi);
      // Optimistic update or rely on WebSocket
      // const index = categories.value.findIndex(c => c.id === id);
      // if (index !== -1) categories.value.splice(index, 1, updatedCategory);
      // categories.value.sort((a, b) => a.order - b.order);
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
    try {
      await deleteCategoryAPI(id);
      // Optimistic update or rely on WebSocket
      // categories.value = categories.value.filter(c => c.id !== id);
      $q.notify({ type: 'positive', message: 'Đã xóa danh mục.' });
    } catch (error)
    {
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

  const getCategoryById = (id: string): Category | undefined => {
    return categories.value.find((c) => c.id === id);
  };

  const togglePinCategory = async (id: string) => {
    const category = getCategoryById(id);
    if (category) {
      await updateCategory(id, { isPinned: !category.isPinned });
    }
  };

  const pinnedCategories = computed<Category[]>(() =>
    categories.value.filter((c) => c.isPinned && !c.isHidden).sort((a, b) => a.order - b.order)
  );

  const visibleCategories = computed<Category[]>(() =>
    categories.value.filter((c) => !c.isHidden).sort((a, b) => a.order - b.order)
  );

  const hierarchicalCategories = computed(() => {
    const cats = JSON.parse(JSON.stringify(visibleCategories.value)) as (Category & { children: Category[] })[];
    const map: { [key: string]: (Category & { children: Category[] }) } = {};
    const roots: (Category & { children: Category[] })[] = [];

    cats.forEach(cat => {
      cat.children = [];
      map[cat.id] = cat;
    });

    cats.forEach(cat => {
      if (cat && cat.parentId && map[cat.parentId]) {
        map[cat.parentId]?.children.push(cat);
        map[cat.parentId]?.children.sort((a,b) => a.order - b.order); // Sort children
      } else {
        roots.push(cat);
      }
    });
    return roots.sort((a,b) => a.order - b.order); // Sort roots
  });

  const flatSortedCategoriesForSelect = computed(() => {
    const result: { id: string; name: string; parentId: string | null; depth: number }[] = [];
    // Helper function to traverse the already sorted hierarchical categories
    function traverse(nodes: (Category & { children?: Category[] })[], depth: number) {
      for (const node of nodes) {
        result.push({
          id: node.id,
          name: node.name, // Store original name
          parentId: node.parentId || null,
          depth: depth,
        });
        if (node.children && node.children.length > 0) {
          traverse(node.children, depth + 1); // Children are already sorted
        }
      }
    }
    traverse(hierarchicalCategories.value, 0); // Start traversal with sorted root categories
    return result;
  });

  const reorderCategory = async (categoryId: string, direction: 'up' | 'down') => {
    if (!authStore.isAuthenticated) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể sắp xếp danh mục.' });
      return;
    }

    const category = getCategoryById(categoryId);
    if (!category) {
      console.error('Reorder: Category not found');
      return;
    }

    const siblings = categories.value
      .filter(c => c.parentId === category.parentId)
      .sort((a, b) => a.order - b.order);

    const currentIndexInSiblings = siblings.findIndex(s => s.id === categoryId);
    let operations: { categoryId: string; order: number }[] = [];

    if (direction === 'up' && currentIndexInSiblings > 0) {
      const prevSibling = siblings[currentIndexInSiblings - 1];
      if (prevSibling) {
        operations = [
          { categoryId: category.id, order: prevSibling.order },
          { categoryId: prevSibling.id, order: category.order },
        ];
      }
    } else if (direction === 'down' && currentIndexInSiblings < siblings.length - 1) {
      const nextSibling = siblings[currentIndexInSiblings + 1];
      if (nextSibling) {
        operations = [
          { categoryId: category.id, order: nextSibling.order },
          { categoryId: nextSibling.id, order: category.order },
        ];
      }
    } else {
      $q.notify({ type: 'info', message: 'Không thể di chuyển thêm.' });
      return;
    }

    if (operations.length > 0) {
      try {
        await reorderCategoriesAPI(operations);
        // For now, rely on WebSocket or a full reload to update the order.
        // Optimistic local reordering can be complex to get right with server responses.
        // await loadCategories(); // Or let WebSocket handle it
        $q.notify({ type: 'positive', message: 'Đã cập nhật thứ tự danh mục.' });
      } catch (error) {
        console.error('Failed to reorder categories:', error);
        $q.notify({ type: 'negative', message: 'Lỗi khi sắp xếp danh mục.' });
        await loadCategories(); // Re-fetch to ensure consistency after error
      }
    }
  };

  // --- WebSocket Event Handling ---
  const handleCategoryUpdate = (data: { operation: string; item?: Category; itemId?: string }) => {
    console.log('[CategoryStore] Received categories_updated event:', data);
    let changed = false;
    switch (data.operation) {
      case 'create':
        if (data.item) {
          const exists = categories.value.some(c => c.id === data.item!.id);
          if (!exists) {
            categories.value.push(data.item);
            changed = true;
          }
        }
        break;
      case 'update':
        if (data.item) {
          const index = categories.value.findIndex(c => c.id === data.item!.id);
          if (index !== -1) {
            categories.value.splice(index, 1, data.item);
            changed = true;
          } else {
            categories.value.push(data.item); // If not found, might be new for this client
            changed = true;
          }
        }
        break;
      case 'delete':
        if (data.itemId) {
          console.log(`[CategoryStore] Delete operation for itemId: ${data.itemId}. Current categories count: ${categories.value.length}`);
          const categoryToRemove = categories.value.find(c => c.id === data.itemId);
          if (categoryToRemove) {
            console.log(`[CategoryStore] Found category to remove:`, JSON.parse(JSON.stringify(categoryToRemove)));
          } else {
            console.warn(`[CategoryStore] Delete event: Category with ID ${data.itemId} not found in local store before filter.`);
          }
          const initialLength = categories.value.length;
          categories.value = categories.value.filter(c => c.id !== data.itemId);
          if (categories.value.length !== initialLength) {
            changed = true;
            console.log(`[CategoryStore] Category ${data.itemId} removed. New categories count: ${categories.value.length}`);
          } else {
            console.warn(`[CategoryStore] Delete event: Filter did not change categories array length for ID ${data.itemId}. This might mean it was already removed or there's an ID mismatch.`);
          }
        }
        break;
      default:
        console.warn('[CategoryStore] Unknown operation from WebSocket:', data.operation);
    }
    if (changed) {
      categories.value.sort((a, b) => a.order - b.order); // Ensure categories are sorted
    }
  };

  const setupSocketListeners = async () => {
    if (authStore.isAuthenticated) {
      try {
        console.log(`[CategoryStore] setupSocketListeners: Attempting to connect socket.`);
        const connectedSocketInstance = await connect(); // Use the new async connect
        console.log(`[CategoryStore] setupSocketListeners: socketService.connect() resolved. Instance:`, connectedSocketInstance ? connectedSocketInstance.id : 'null', 'Connected:', connectedSocketInstance?.connected);

        if (connectedSocketInstance?.connected) {
          storeSocket = connectedSocketInstance;
          console.log(`[CategoryStore] setupSocketListeners: Socket connected (${storeSocket.id}). Setting up listeners for categories_updated.`);
          storeSocket.off('categories_updated', handleCategoryUpdate); // Remove old listener first
          storeSocket.on('categories_updated', handleCategoryUpdate);
        } else {
          console.warn('[CategoryStore] setupSocketListeners: Failed to get a connected socket. Listeners not set up. Clearing any old storeSocket.');
          if (storeSocket) { // If there was an old storeSocket, clean its listeners
              storeSocket.off('categories_updated', handleCategoryUpdate);
              console.log(`[CategoryStore] setupSocketListeners: Cleared listeners from previous storeSocket ${storeSocket.id} due to failed new connection.`);
              storeSocket = null;
          }
        }
      } catch (error) {
        console.error('[CategoryStore] Error during socket connection or listener setup:', error);
        if (storeSocket) {
          storeSocket.off('categories_updated', handleCategoryUpdate);
          storeSocket = null;
        }
      }
    } else {
      console.log('[CategoryStore] setupSocketListeners: User not authenticated. Clearing listeners.');
      clearSocketListeners(); // Ensure listeners are cleared if not authenticated
    }
  };

  const clearSocketListeners = () => {
    if (storeSocket) {
      console.log(`[CategoryStore] Clearing WebSocket listeners for categories_updated from socket ${storeSocket.id}`);
      storeSocket.off('categories_updated', handleCategoryUpdate);
      // Don't nullify the global socket here, only the store's reference if needed.
      // The global socket is managed by socketService.
    }
    storeSocket = null; // Clear the store's local reference
  };

  // Initial load and WebSocket setup
  onMounted(() => {
    if (authStore.isAuthenticated) {
      void loadCategories();
      void setupSocketListeners();
    }
    // Watch for authentication changes to setup/teardown listeners
    authStore.$subscribe(() => { // Removed unused mutation and state params
      if (authStore.isAuthenticated) { // Access isAuthenticated from the store instance
        void loadCategories();
        void setupSocketListeners();
      } else {
        categories.value = []; // Clear data on logout
        clearSocketListeners();
      }
    });
  });

  return {
    categories,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    togglePinCategory,
    pinnedCategories,
    visibleCategories,
    hierarchicalCategories,
    flatSortedCategoriesForSelect, // Expose the new computed property
    reorderCategory,
  };
});

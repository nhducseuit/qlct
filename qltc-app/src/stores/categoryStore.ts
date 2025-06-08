import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
// import {
//   getAllCategoriesDB,
//   addCategoryDB,
//   updateCategoryDB,
//   deleteCategoryDB,
// } from 'src/services/db'; // Will be replaced by apiService calls
import {
  fetchCategoriesAPI,
  addCategoryAPI,
  updateCategoryAPI,
  deleteCategoryAPI,
  reorderCategoriesAPI,
} from 'src/services/categoryApiService'; // Import the new mock API service
import type { Category } from 'src/models';
import { v4 as uuidv4 } from 'uuid';
import { useQuasar } from 'quasar';
import { useAuthStore } from './authStore'; // Import authStore

export const useCategoryStore = defineStore('categories', () => {
  const $q = useQuasar();
  const categories = ref<Category[]>([]);

  const createInitialCategories = async () => {
    const initialCategories: Omit<Category, 'id'>[] = [
      { name: 'Ăn uống', isPinned: true, order: 0, icon: 'IconToolsKitchen2', defaultSplitRatio: '50/50', budgetLimit: 5000000, isHidden: false },
      { name: 'Nhà ở', isPinned: true, order: 1, icon: 'IconHome', defaultSplitRatio: '60/40', budgetLimit: 7000000, isHidden: false },
      { name: 'Di chuyển', isPinned: false, order: 2, icon: 'IconCar', defaultSplitRatio: '50/50', budgetLimit: 1500000, isHidden: false },
      { name: 'Mua sắm', isPinned: true, order: 3, icon: 'IconShoppingCart', defaultSplitRatio: 'Chồng:100', budgetLimit: 2000000, isHidden: false },
      { name: 'Giải trí', isPinned: false, order: 4, icon: 'IconDeviceGamepad2', defaultSplitRatio: '50/50', budgetLimit: 1000000, isHidden: false },
      // Sub-categories for Ăn uống (parentId will be set after parent is created)
      { name: 'Ăn ngoài', parentId: 'TO_BE_REPLACED_AN_UONG', isPinned: true, order: 0, icon: 'IconToolsKitchen2', isHidden: false },
      { name: 'Cafe', parentId: 'TO_BE_REPLACED_AN_UONG', isPinned: true, order: 1, icon: 'IconCoffee', isHidden: false }, // Corrected icon name case
      { name: 'Đi chợ', parentId: 'TO_BE_REPLACED_AN_UONG', isPinned: false, order: 2, icon: 'IconBasket', isHidden: false },
      // Sub-categories for Nhà ở
      { name: 'Tiền thuê nhà', parentId: 'TO_BE_REPLACED_NHA_O', isPinned: false, order: 0, icon: 'IconBuildingArch', isHidden: false },
      { name: 'Điện', parentId: 'TO_BE_REPLACED_NHA_O', isPinned: true, order: 1, icon: 'IconPlug', isHidden: false },
      { name: 'Nước', parentId: 'TO_BE_REPLACED_NHA_O', isPinned: false, order: 2, icon: 'IconDroplet', isHidden: false },
    ];

    const auth = useAuthStore();
    const userId = auth.user?.id;
    if (!userId) {
      console.error('Cannot create initial categories without a user ID.');
      // $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể tạo danh mục mẫu.' });
      return; // In DEV mode, user is auto-created, so this should be fine.
    }

    try {
      const parentCategoriesMap: Record<string, string> = {};

      for (const catData of initialCategories) {
        if (!catData.parentId) { // Parent category
          const newCatId = uuidv4();
          await addCategoryAPI(userId, { ...catData, id: newCatId } as Category);
          if (catData.name === 'Ăn uống') parentCategoriesMap['TO_BE_REPLACED_AN_UONG'] = newCatId;
          if (catData.name === 'Nhà ở') parentCategoriesMap['TO_BE_REPLACED_NHA_O'] = newCatId;
        }
      }
      for (const catData of initialCategories) {
        if (catData.parentId && parentCategoriesMap[catData.parentId]) { // Sub category
          await addCategoryAPI(userId, {
            ...catData,
            id: uuidv4(),
            parentId: parentCategoriesMap[catData.parentId] ?? null } as Category); // Ensure parentId is string | null
        }
      }
      $q.notify({ type: 'info', message: 'Đã tạo dữ liệu danh mục mẫu.' });
    } catch (error) {
      console.error('Failed to create initial categories:', error);
    }
  };

  const loadCategories = async () => {
    const auth = useAuthStore();
    if (!auth.isAuthenticated || !auth.user?.id) {
      console.log('[CategoryStore] User not authenticated, skipping category load.');
      categories.value = []; // Clear categories if user is not authenticated
      return;
    }
    const userId = auth.user.id;

    try {
      categories.value = await fetchCategoriesAPI(userId);
      if (categories.value.length === 0) {
        await createInitialCategories();
        categories.value = await fetchCategoriesAPI(userId); // Reload after creation
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      $q.notify({
        color: 'negative',
        message: 'Không thể tải danh mục từ cơ sở dữ liệu.',
        icon: 'report_problem',
      });
    }
  };

  const addCategory = async (
    categoryData: Omit<Category, 'id' | 'isPinned' | 'isHidden' | 'order'> &
    Partial<Pick<Category, 'isPinned' | 'isHidden' | 'order'>>
  ) => {
    const auth = useAuthStore();
    const userId = auth.user?.id;
    if (!userId) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể thêm danh mục.' });
      return;
    }

    const newCategory: Category = {
      id: uuidv4(),
      isPinned: categoryData.isPinned ?? false,
      isHidden: categoryData.isHidden ?? false,
      order: categoryData.order ?? categories.value.length, // Simple ordering, can be improved
      name: categoryData.name,
      parentId: categoryData.parentId ?? null, // Ensure parentId is string | null
      // Conditionally add optional properties only if they have a value (not undefined)
      // This is to satisfy exactOptionalPropertyTypes
      ...(categoryData.icon !== undefined && { icon: categoryData.icon }),
      ...(categoryData.color !== undefined && { color: categoryData.color }),
      ...(categoryData.defaultSplitRatio !== undefined && { defaultSplitRatio: categoryData.defaultSplitRatio }),
      ...(categoryData.budgetLimit !== undefined && { budgetLimit: categoryData.budgetLimit }),
    };
    try {
      await addCategoryAPI(userId, newCategory);
      await loadCategories(); // Refresh list
      $q.notify({ type: 'positive', message: 'Đã thêm danh mục mới.' });
    } catch (error) {
      console.error('Failed to add category:', error);
      $q.notify({
        color: 'negative',
        message: 'Thêm danh mục thất bại.',
        icon: 'report_problem',
      });
    }
  };

  const updateCategory = async (id: string, updates: Partial<Omit<Category, 'id'>>) => {
    const auth = useAuthStore();
    const userId = auth.user?.id;
    if (!userId) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể cập nhật danh mục.' });
      return;
    }

    console.log(`[CategoryStore] Attempting to update category. ID: ${id}, Updates:`, JSON.parse(JSON.stringify(updates)));
    try {
      const updatedCount = await updateCategoryAPI(userId, id, updates);
      console.log(`[CategoryStore] updateCategoryAPI returned: ${updatedCount}`);
      if (updatedCount > 0) {
        await loadCategories(); // Refresh list
        $q.notify({ type: 'positive', message: 'Đã cập nhật danh mục.' });
      } else {
        // This might happen if the category was deleted by another process/tab
        const existingCategory = getCategoryById(id);
        $q.notify({ type: 'warning', message: 'Không tìm thấy danh mục để cập nhật hoặc không có gì thay đổi.' });
        console.warn(`[CategoryStore] Category update for ID ${id} resulted in 0 changes. Current data in store:`, existingCategory ? JSON.parse(JSON.stringify(existingCategory)) : 'Not found in store');
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      $q.notify({
        color: 'negative',
        message: 'Cập nhật danh mục thất bại.',
        icon: 'report_problem',
      });
    }
  };

  const deleteCategory = async (id: string) => {
    const auth = useAuthStore();
    const userId = auth.user?.id;
    if (!userId) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể xóa danh mục.' });
      return;
    }

    // TODO: Consider checking for transactions associated with this category first
    try {
      const deletedCount = await deleteCategoryAPI(userId, id);
      if (deletedCount > 0) {
        await loadCategories(); // Refresh list
        $q.notify({ type: 'positive', message: 'Đã xóa danh mục.' });
      } else {
        $q.notify({ type: 'warning', message: 'Không tìm thấy danh mục để xóa.' });
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      $q.notify({
        color: 'negative',
        message: 'Xóa danh mục thất bại.',
        icon: 'report_problem',
      });
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
      cat.children = []; // Initialize children array
      map[cat.id] = cat;
    });

    cats.forEach(cat => {
      if (cat.parentId && map[cat.parentId]) {
        // Ensure map[cat.parentId] exists before pushing
        const parentInCategoryMap = map[cat.parentId];
        if (parentInCategoryMap) {
          parentInCategoryMap.children.push(cat);
        }
        // Sort children by order if needed, e.g., map[cat.parentId].children.sort((a,b) => a.order - b.order);
      } else {
        roots.push(cat);
      }
    });
    // Sort root categories by order
    return roots.sort((a,b) => a.order - b.order);
  });

  const reorderCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const auth = useAuthStore();
    const userId = auth.user?.id;
    if (!userId) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể sắp xếp danh mục.' });
      return;
    }

    const categoryIndex = categories.value.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) return;

    const category = categories.value[categoryIndex];
    if (!category) {
      console.error('Reorder: Category not found');
      return;
    }

    const siblings = categories.value.filter(c => c.parentId === category.parentId).sort((a, b) => a.order - b.order);

    const currentIndexInSiblings = siblings.findIndex(s => s.id === categoryId);

    if (direction === 'up' && currentIndexInSiblings > 0) {
      const prevSibling = siblings[currentIndexInSiblings - 1];
      if (!prevSibling) return;

      // Swap order values
      const tempOrder = category.order;
      const newCategoryOrder = prevSibling.order;
      const newPrevSiblingOrder = tempOrder;

      await reorderCategoriesAPI(userId, [
        { categoryId: category.id, order: newCategoryOrder },
        { categoryId: prevSibling.id, order: newPrevSiblingOrder },
      ]);
    } else if (direction === 'down' && currentIndexInSiblings < siblings.length - 1) {
      const nextSibling = siblings[currentIndexInSiblings + 1];
      if (!nextSibling) return;

      const tempOrder = category.order;
      const newCategoryOrder = nextSibling.order;
      const newNextSiblingOrder = tempOrder;

      await reorderCategoriesAPI(userId, [
        { categoryId: category.id, order: newCategoryOrder },
        { categoryId: nextSibling.id, order: newNextSiblingOrder },
      ]);
    } else {
      $q.notify({ type: 'info', message: 'Không thể di chuyển thêm.' });
      return;
    }

    // Sau khi cập nhật DB, tải lại danh sách để đảm bảo thứ tự đúng và UI cập nhật
    // Hoặc có thể sắp xếp lại `categories.value` trực tiếp nếu muốn tối ưu hơn
    // categories.value.sort((a, b) => a.order - b.order);
    // Tuy nhiên, load lại từ DB đảm bảo tính nhất quán cao hơn.
    await loadCategories();
    $q.notify({ type: 'positive', message: 'Đã cập nhật thứ tự danh mục.' });
  };


  // Initial load when store is initialized.
  // Needs to be aware of auth state.
  void (async () => {
    const auth = useAuthStore();
    // If in DEV mode, auth is true by default.
    // If not in DEV, wait for auth state to be potentially resolved (e.g., from localStorage token)
    // For now, this simple check is okay as DEV mode is immediate.
    // A more robust solution might involve watching auth.isAuthenticated.
    if (auth.isAuthenticated) await loadCategories();
  })();

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
    reorderCategory,
  };
});

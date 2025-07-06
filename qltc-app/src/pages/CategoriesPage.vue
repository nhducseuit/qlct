<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5">Quản lý Danh mục</div>
      <q-btn
        color="primary"
        icon="add"
        label="Thêm Danh mục Cha"
        @click="openAddCategoryDialog()"
      />
    </div>

    <div v-if="categoryStore.isLoading" class="text-center q-pa-lg">
      <q-spinner-dots color="primary" size="40px" />
      <p class="q-mt-md">Đang tải danh mục...</p>
    </div>

    <div v-else-if="!categoriesByFamily || categoriesByFamily.length === 0" class="text-center text-grey-7 q-mt-xl">
      <q-icon name="sym_o_folder_off" size="3em" />
      <p>Chưa có danh mục nào.</p>
      <p>Hãy bắt đầu bằng cách thêm một danh mục cha.</p>
    </div>

    <div v-else>
      <div v-for="familyGroup in categoriesByFamily" :key="familyGroup.familyName" class="q-mb-xl">
        <div class="text-h6 q-mb-sm text-primary">{{ familyGroup.familyName }}</div>
        <q-list bordered separator v-if="familyGroup.categories.length > 0">
          <template v-for="parentCategory in familyGroup.categories" :key="parentCategory.id">
            <q-expansion-item
              v-if="parentCategory.children && parentCategory.children.length > 0"
              :default-opened="isCategoryExpanded(parentCategory.id)"
              @show="() => onCategoryExpand(parentCategory.id)"
              @hide="() => onCategoryCollapse(parentCategory.id)"
            >
              <template v-slot:header>
                <CategoryListItem
                  :category="parentCategory"
                  @edit="openEditCategoryDialog"
                  @delete="confirmDeleteCategory"
                  @toggle-pin="togglePin"
                  @toggle-hide="toggleHide"
                  @add-sub="openAddSubCategoryDialog"
                  @move-up="moveCategoryUp"
                  @move-down="moveCategoryDown"
                  class="full-width"
                />
              </template>
              <q-list bordered separator class="q-ml-md bg-grey-1">
                <CategoryListItem
                  v-for="childCategory in parentCategory.children"
                  :key="childCategory.id"
                  :category="childCategory"
                  is-sub-item
                  @edit="openEditCategoryDialog"
                  @delete="confirmDeleteCategory"
                  @toggle-pin="togglePin"
                  @toggle-hide="toggleHide"
                  @move-up="moveCategoryUp"
                  @move-down="moveCategoryDown"
                />
              </q-list>
            </q-expansion-item>
            <CategoryListItem
              v-else
              :category="parentCategory"
              @edit="openEditCategoryDialog"
              @delete="confirmDeleteCategory"
              @toggle-pin="togglePin"
              @toggle-hide="toggleHide"
              @add-sub="openAddSubCategoryDialog"
              @move-up="moveCategoryUp"
              @move-down="moveCategoryDown"
            />
          </template>
        </q-list>
        <div v-else class="text-center text-grey-6 q-pa-md">
          <q-icon name="sym_o_inbox" size="2em" />
          <p>Không có danh mục nào trong gia đình này.</p>
        </div>
      </div>
    </div>

    <!-- Dialogs will be handled by other functions -->
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useCategoryStore } from 'src/stores/categoryStore';
import { useFamilyStore } from 'src/stores/familyStore';
import CategoryListItem from 'src/components/Category/CategoryListItem.vue';
import CategoryFormDialog from 'src/components/Category/CategoryFormDialog.vue';
import type { Category } from 'src/models';
import type { UpdateCategoryPayload } from 'src/services/categoryApiService';
import { useQuasar } from 'quasar';

const categoryStore = useCategoryStore();
const familyStore = useFamilyStore();
const $q = useQuasar();

// Define a local type for the hierarchical structure to be used in the component
type HierarchicalCategory = Category & { children: HierarchicalCategory[] };

const categoriesByFamily = computed(() => categoryStore.categoriesByFamily);
const expandedCategories = ref<string[]>([]);

// Watch for changes in the selected family and trigger a reload.
watch(
  () => familyStore.selectedFamilyId,
  (newFamilyId) => {
    if (newFamilyId) {
      // The store's watcher will handle the loading.
      // We don't need to manually call it here as the store is reactive.
    }
  },
  { immediate: true }
);

const openAddCategoryDialog = (parentIdProp: string | null = null) => {
  let parentName: string | null = null;
  if (parentIdProp) {
    const parentCategory = categoryStore.getCategoryById(parentIdProp);
    parentName = parentCategory ? parentCategory.name : null;
  }

  $q.dialog({
    component: CategoryFormDialog,
    componentProps: {
      parentId: parentIdProp,
      parentCategoryName: parentName,
    },
  }).onOk((formData: Omit<Category, 'id' | 'order'>) => {
    void categoryStore.addCategory(formData);
  });
};

const openAddSubCategoryDialog = (parentId: string) => {
  openAddCategoryDialog(parentId);
};

const openEditCategoryDialog = (categoryToEdit: Category) => {
  let parentName: string | null = null;
  if (categoryToEdit.parentId) {
    const parentCat = categoryStore.getCategoryById(categoryToEdit.parentId);
    parentName = parentCat ? parentCat.name : null;
  }
  $q.dialog({
    component: CategoryFormDialog,
    componentProps: {
      editingCategory: categoryToEdit,
      parentCategoryName: parentName,
    },
  }).onOk((formData: UpdateCategoryPayload) => {
    void categoryStore.updateCategory(categoryToEdit.id, formData);
  });
};

const confirmDeleteCategory = (categoryId: string) => {
  const categoryToDelete = categoryStore.getCategoryById(categoryId);
  if (!categoryToDelete) return;

  const hasChildren = categoryStore.categories.some(c => c.parentId === categoryToDelete.id);
  const message = hasChildren
    ? 'Danh mục này chứa các danh mục con. Xóa nó cũng sẽ xóa tất cả các danh mục con. Bạn có chắc chắn?'
    : 'Bạn có chắc chắn muốn xóa danh mục này không?';

  $q.dialog({
    title: 'Xác nhận Xóa',
    message,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void categoryStore.deleteCategory(categoryToDelete.id);
  });
};

const togglePin = async (categoryId: string) => {
  const category = categoryStore.getCategoryById(categoryId);
  if (!category) return;
  // The store action handles the API call and optimistic update
  await categoryStore.togglePinCategory(category);
};

const toggleHide = async (categoryId: string) => {
  const category = categoryStore.getCategoryById(categoryId);
  if (!category) return;
  await categoryStore.updateCategory(category.id, { isHidden: !category.isHidden });
};

const moveCategory = async (categoryId: string, direction: 'up' | 'down') => {
  const category = categoryStore.getCategoryById(categoryId);
  if (!category) return;

  const familyGroup = categoriesByFamily.value.find(fg => fg.categories.some(c => findCategoryRecursive(c, categoryId)));
  if (!familyGroup) return;

  const siblings = category.parentId
    ? findParent(familyGroup.categories, category.parentId)?.children
    : familyGroup.categories;

  if (!siblings) return;

  const currentIndex = siblings.findIndex(c => c.id === category.id);
  if (currentIndex === -1) return;

  const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (newIndex < 0 || newIndex >= siblings.length) {
    return; // Cannot move further
  }

  const reorderedSiblings = [...siblings];
  const [movedItem] = reorderedSiblings.splice(currentIndex, 1);
  if (movedItem) {
    reorderedSiblings.splice(newIndex, 0, movedItem);
  }

  const orderedIds = reorderedSiblings.map(c => c.id);

  await categoryStore.reorderCategories(orderedIds);
};

// Helper to find a category recursively
const findCategoryRecursive = (cat: HierarchicalCategory, id: string): HierarchicalCategory | null => {
  if (cat.id === id) return cat;
  if (cat.children) {
    for (const child of cat.children) {
      const found = findCategoryRecursive(child, id);
      if (found) return found;
    }
  }
  return null;
};

// Helper to find a parent category in a hierarchy
const findParent = (categories: HierarchicalCategory[], parentId: string): HierarchicalCategory | null => {
  for (const cat of categories) {
    if (cat.id === parentId) return cat;
    if (cat.children) {
        const found = findParent(cat.children, parentId);
        if (found) return found;
    }
  }
  return null;
};

const moveCategoryUp = (categoryId: string) => moveCategory(categoryId, 'up');
const moveCategoryDown = (categoryId: string) => moveCategory(categoryId, 'down');


// --- Expanded state management ---
const onCategoryExpand = (categoryId: string) => {
  if (!expandedCategories.value.includes(categoryId)) {
    expandedCategories.value.push(categoryId);
  }
};

const onCategoryCollapse = (categoryId: string) => {
  const index = expandedCategories.value.indexOf(categoryId);
  if (index > -1) {
    expandedCategories.value.splice(index, 1);
  }
};

const isCategoryExpanded = (categoryId: string) => {
  return expandedCategories.value.includes(categoryId);
};

onMounted(() => {
  void categoryStore.connectSocket();
  // The store watcher handles loading categories automatically.
  // If categories are empty on mount, the watcher should trigger a load.
  if (familyStore.selectedFamilyId && categoryStore.categories.length === 0) {
    void categoryStore.loadCategories();
  }
});

onUnmounted(() => {
  categoryStore.disconnectSocket();
});
</script>

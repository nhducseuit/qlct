<template>
  <q-page padding>
    <!-- Header và nút Thêm Danh mục Cha -->
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5">Quản lý Danh mục</div>
      <q-btn
        color="primary"
        icon="add"
        label="Thêm Danh mục Cha"
        @click="openAddCategoryDialog()"
      />
    </div>
    <!-- Loading và Trạng thái rỗng -->
    <div v-if="loading" class="text-center">
      <q-spinner-dots color="primary" size="40px" />
      <p>Đang tải danh mục...</p>
    </div>
    <div v-else-if="hierarchicalCategories.length === 0" class="text-center text-grey-7 q-mt-xl">
      <q-icon name="sym_o_folder_off" size="3em" />
      <p>Chưa có danh mục nào.</p>
      <p>Hãy bắt đầu bằng cách thêm một danh mục cha.</p>
    </div>

    <!-- Task 4.3: Hiển thị danh mục dạng cây -->
    <div v-else>
      <q-list bordered separator>
        <template v-for="parentCategory in hierarchicalCategories" :key="parentCategory.id">
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
    </div>

    <!-- TODO: Dialog thêm/sửa danh mục -->
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCategoryStore } from 'src/stores/categoryStore';
import CategoryListItem from 'src/components/Category/CategoryListItem.vue';
import CategoryFormDialog from 'src/components/Category/CategoryFormDialog.vue'; // Import dialog
import type { Category } from 'src/models';
import { useQuasar } from 'quasar';

const categoryStore = useCategoryStore();
const $q = useQuasar();

// Sử dụng getter hierarchicalCategories từ store
const hierarchicalCategories = computed(() => categoryStore.hierarchicalCategories);
const loading = ref(false); // Sẽ dùng nếu có logic tải phức tạp hơn
const expandedCategories = ref<string[]>([]); // Lưu trữ ID các danh mục đang mở

const openAddCategoryDialog = (parentIdProp: string | null = null) => {
  let parentName: string | null = null;
  if (parentIdProp) {
    const parentCat = categoryStore.getCategoryById(parentIdProp);
    parentName = parentCat ? parentCat.name : null;
  }

  $q.dialog({
    component: CategoryFormDialog,
    componentProps: {
      parentId: parentIdProp,
      parentCategoryName: parentName,
    },
  }).onOk((formData: Partial<Category>) => {
    // Xác định order cho danh mục mới
    // Nếu là danh mục con, order là số lượng con hiện tại của cha
    // Nếu là danh mục cha, order là số lượng danh mục cha hiện tại
    const order = parentIdProp
      ? (hierarchicalCategories.value.find(c => c.id === parentIdProp)?.children?.length || 0)
      : hierarchicalCategories.value.length;

    void categoryStore.addCategory({ ...formData, order } as Category);
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
  }).onOk((formData: Partial<Category>) => {
    // id không thay đổi, chỉ cập nhật các trường khác
    void categoryStore.updateCategory(categoryToEdit.id, formData);
  });
};

const confirmDeleteCategory = (id: string) => {
  $q.dialog({
    title: 'Xác nhận Xóa',
    message: 'Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác và có thể ảnh hưởng đến các giao dịch liên quan.',
    cancel: true,
    persistent: true,
    ok: {
      label: 'Xóa',
      color: 'negative',
    },
  }).onOk(() => {
  void categoryStore.deleteCategory(id);
  });
};

const togglePin = async (id: string) => {
  await categoryStore.togglePinCategory(id);
};

const toggleHide = async (id: string) => {
  const category = categoryStore.getCategoryById(id);
  if (category) {
    await categoryStore.updateCategory(id, { isHidden: !category.isHidden });
  }
};

const isCategoryExpanded = (categoryId: string) => expandedCategories.value.includes(categoryId);
const onCategoryExpand = (categoryId: string) => {
  if (!expandedCategories.value.includes(categoryId)) {
    expandedCategories.value.push(categoryId);
  }
};
const onCategoryCollapse = (categoryId: string) => {
  expandedCategories.value = expandedCategories.value.filter(id => id !== categoryId);
};

const moveCategoryUp = async (id: string) => {
  await categoryStore.reorderCategory(id, 'up');
};

const moveCategoryDown = async (id: string) => {
  await categoryStore.reorderCategory(id, 'down');
};

// Load categories on mount if not already loaded by the store's initial call
onMounted(async () => {
  if (categoryStore.categories.length === 0) {
    loading.value = true;
    await categoryStore.loadCategories();
    loading.value = false;
  }
});
</script>

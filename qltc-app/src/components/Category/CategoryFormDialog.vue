<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card class="q-dialog-plugin" style="width: 500px; max-width: 90vw;">
      <q-form @submit.prevent="onSubmit">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editingCategory ? 'Sửa Danh mục' : 'Thêm Danh mục Mới' }}</div>
          <div v-if="parentCategoryName" class="text-subtitle2">
            Là con của: {{ parentCategoryName }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            filled
            v-model="formData.name"
            label="Tên danh mục *"
            lazy-rules
            :rules="[val => !!val || 'Tên danh mục không được để trống']"
            autofocus
          />

          <!-- TODO: Task 4.6: Chọn icon, màu sắc -->
          <div>
            <div class="text-subtitle2 q-mb-xs">Chọn Icon:</div>
            <q-btn flat dense :label="formData.icon ? formData.icon.replace('Icon', '') : 'Chọn icon'">
              <TablerIcon v-if="formData.icon" :name="formData.icon" class="q-ml-sm" />
              <q-icon v-else name="sym_o_add_photo_alternate" class="q-ml-sm" />
              <q-popup-proxy>
                <IconPicker @icon-selected="handleIconSelected" />
              </q-popup-proxy>
            </q-btn>
            <q-btn
              v-if="formData.icon"
              flat
              dense
              icon="close"
              size="sm"
              @click="formData.icon = ''"
              class="q-ml-sm"
              title="Xóa icon"
            />
          </div>

          <q-input
            v-if="!formData.parentId"
            filled
            v-model="formData.color"
            label="Mã màu (ví dụ: #FF0000)"
            hint="Chỉ áp dụng cho danh mục cha"
          >
            <template v-slot:append>
              <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-color v-model="formData.color" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input
            filled
            v-model.number="formData.budgetLimit"
            label="Hạn mức (VND, không bắt buộc)"
            type="number"
            step="1000"
            clearable
            input-class="text-right"
          />

          <q-input
            filled
            v-model="formData.defaultSplitRatio"
            label="Tỷ lệ chia mặc định (ví dụ: 50/50, Chồng:100)"
            hint="Không bắt buộc"
            clearable
          />

        </q-card-section>

        <q-card-actions align="right" class="text-primary q-pb-md q-pr-md">
          <q-btn flat label="Hủy" @click="onDialogCancel" />
          <q-btn color="primary" :label="editingCategory ? 'Lưu thay đổi' : 'Thêm mới'" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useDialogPluginComponent, QForm } from 'quasar';
import type { Category } from 'src/models';
import TablerIcon from 'src/components/Common/TablerIcon.vue';
import IconPicker from 'src/components/Category/IconPicker.vue'; // Import IconPicker

interface Props {
  editingCategory?: Category | null;
  parentId?: string | null;
  parentCategoryName?: string | null; // Để hiển thị tên danh mục cha
}

const props = defineProps<Props>();

defineEmits([
  ...useDialogPluginComponent.emits,
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

// const formRef = ref<QForm | null>(null);
const formData = ref<Partial<Category>>({
  name: '',
  icon: '',
  color: '', // Default color or let user pick
  budgetLimit: null,
  defaultSplitRatio: '',
  parentId: props.parentId ?? null, // Gán parentId nếu có, default to null if undefined
  isPinned: false, // Default values for new category
  isHidden: false,
  order: 0, // Sẽ cần logic để xác định order sau
});

onMounted(() => {
  if (props.editingCategory) {
    // Destructure to remove 'children' or any other non-Category properties
    // that might have been added for UI purposes (e.g., by hierarchicalCategories)
    const categoryDataForForm = { ...props.editingCategory } as Category & { children?: Category[] };
    delete categoryDataForForm.children; // Explicitly remove the children property
    formData.value = categoryDataForForm; // Assign the modified object
  } else {
    // Set default color for new parent categories if desired
    if (!props.parentId) {
      formData.value.color = '#424242'; // Example default color (grey-9)
    }
  }
});

// Nếu parentId thay đổi (ví dụ: dialog được tái sử dụng), cập nhật formData.parentId
watch(() => props.parentId, (newParentId) => {
  formData.value.parentId = newParentId ?? null;
});

const handleIconSelected = (iconName: string) => {
  formData.value.icon = iconName;
};

const onSubmit = () => {
  // const isValid = await formRef.value?.validate(); // Nếu có formRef
  // if (!isValid) return;

  // Nếu không có editingCategory, đây là thêm mới, gán các giá trị mặc định còn thiếu
  if (!props.editingCategory) {
    formData.value.isPinned = formData.value.isPinned ?? false;
    formData.value.isHidden = formData.value.isHidden ?? false;
    // `order` sẽ cần được xử lý ở store hoặc khi gọi action
  }

  onDialogOK(formData.value);
};

</script>

<style scoped>
.q-dialog-plugin {
  /* Add any specific styling for the dialog card here */
}
</style>

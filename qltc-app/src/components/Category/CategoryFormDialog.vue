<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card class="q-dialog-plugin" style="width: 500px; max-width: 90vw">
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
          <!-- Default SplitRatio Input Section -->
          <div class="q-mt-md q-pa-md bordered rounded-borders bg-grey-1">
            <div class="text-subtitle2 q-mb-sm">Tỷ lệ chia mặc định (tổng phải là 100%):</div>
            <div v-if="activeMembers.length === 0" class="text-caption text-negative">
              Không có thành viên nào đang hoạt động để phân chia.
            </div>
            <div v-for="member in activeMembers" :key="member.id" class="row items-center q-mb-xs">
              <div class="col-5 ellipsis">{{ member.name }}</div>
              <div class="col-5">
                <q-input
                  dense
                  filled
                  type="number"
                  v-model.number="defaultMemberSplitPercentages[member.id]"
                  @update:model-value="val => updateDefaultSplitRatio(member.id, val)"
                  suffix="%"
                  :rules="[
                    val => val === null || val === '' || (val >= 0 && val <= 100) || '0-100',
                  ]"
                  input-class="text-right"
                />
              </div>
            </div>
            <div class="row justify-end items-center q-mt-sm">
              <q-btn flat dense size="sm" label="Chia đều" @click="distributeDefaultEqually" class="q-mr-sm" v-if="activeMembers.length > 0"/>
              <div class="text-subtitle2" :class="{'text-negative': totalDefaultPercentage !== 100 && activeMembers.length > 0}">
                Tổng: {{ totalDefaultPercentage }}%
              </div>
            </div>
            <div v-if="totalDefaultPercentage !== 100 && (formData.defaultSplitRatio && formData.defaultSplitRatio.length > 0) && activeMembers.length > 0" class="text-caption text-negative q-mt-xs">
              Tổng tỷ lệ phân chia mặc định phải là 100%.
            </div>
          </div>

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
import { ref, onMounted, watch, computed  } from 'vue';
import { useDialogPluginComponent, QForm } from 'quasar';
import type { Category, SplitRatioItem } from 'src/models';
import TablerIcon from 'src/components/Common/TablerIcon.vue';
import IconPicker from 'src/components/Category/IconPicker.vue'; // Import IconPicker
import { useHouseholdMemberStore } from 'src/stores/householdMemberStore'; // Import household member store

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
const householdMemberStore = useHouseholdMemberStore();

// const formRef = ref<QForm | null>(null);
const formData = ref<Partial<Category>>({
  name: '',
  icon: '',
  color: '', // Default color or let user pick
  budgetLimit: null,
  defaultSplitRatio: null as SplitRatioItem[] | null, // Initialize as null
  parentId: props.parentId ?? null, // Gán parentId nếu có, default to null if undefined
  isPinned: false, // Default values for new category
  isHidden: false,
  order: 0, // Sẽ cần logic để xác định order sau
});

const activeMembers = computed(() =>
  householdMemberStore.members.filter(member => member.isActive)
);

const defaultMemberSplitPercentages = ref<Record<string, number | null>>({});

const updateDefaultMemberSplitPercentagesFromForm = () => {
  const newPercentages: Record<string, number | null> = {};
  activeMembers.value.forEach(member => {
    const existingSplit = formData.value.defaultSplitRatio?.find(sr => sr.memberId === member.id);
    newPercentages[member.id] = existingSplit ? existingSplit.percentage : null;
  });
  defaultMemberSplitPercentages.value = newPercentages;
};

const updateDefaultSplitRatio = (memberId: string, percentage: number | string | null) => {
  const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  if (formData.value.defaultSplitRatio === null || formData.value.defaultSplitRatio === undefined) {
    formData.value.defaultSplitRatio = [];
  }

  const index = formData.value.defaultSplitRatio.findIndex(sr => sr.memberId === memberId);
  if (numPercentage !== null && !isNaN(numPercentage) && numPercentage >= 0) {
    if (index > -1) {
      formData.value.defaultSplitRatio[index]!.percentage = numPercentage;
    } else {
      formData.value.defaultSplitRatio.push({ memberId, percentage: numPercentage });
    }
  } else {
    if (index > -1) {
      formData.value.defaultSplitRatio[index]!.percentage = 0;
    }
    defaultMemberSplitPercentages.value[memberId] = null;
  }
};

const totalDefaultPercentage = computed(() => {
  if (!formData.value.defaultSplitRatio) return 0;
  return formData.value.defaultSplitRatio.reduce((sum, item) => sum + (item.percentage || 0), 0);
});

const distributeDefaultEqually = () => {
  if (activeMembers.value.length === 0) return;
  const count = activeMembers.value.length;
  const percentage = parseFloat((100 / count).toFixed(2));
  const remainder = 100 - (percentage * count);

  formData.value.defaultSplitRatio = activeMembers.value.map((member, index) => {
    let finalPercentage = percentage;
    if (index === 0 && remainder !== 0) {
      finalPercentage = parseFloat((percentage + remainder).toFixed(2));
    }
    return { memberId: member.id, percentage: finalPercentage };
  });
  updateDefaultMemberSplitPercentagesFromForm();
};

onMounted(() => {
  if (props.editingCategory) {
    // Destructure to remove 'children' or any other non-Category properties
    // that might have been added for UI purposes (e.g., by hierarchicalCategories)
    const categoryDataForForm = { ...props.editingCategory } as Category & { children?: Category[] };
    delete categoryDataForForm.children; // Explicitly remove the children property
    formData.value = categoryDataForForm; // Assign the modified object
    // Ensure defaultSplitRatio is correctly typed if coming from editingCategory
    if (props.editingCategory.defaultSplitRatio) {
      formData.value.defaultSplitRatio = JSON.parse(JSON.stringify(props.editingCategory.defaultSplitRatio));
    } else {
      formData.value.defaultSplitRatio = null;
    }
  } else {
    // Set default color for new parent categories if desired
    if (!props.parentId) {
      formData.value.color = '#424242'; // Example default color (grey-9)
    }
  }
  updateDefaultMemberSplitPercentagesFromForm(); // Initialize UI inputs
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
  const dataToSend = { ...formData.value };

  if (!props.editingCategory) {
    dataToSend.isPinned = dataToSend.isPinned ?? false;
    dataToSend.isHidden = dataToSend.isHidden ?? false;
    // `order` sẽ cần được xử lý ở store hoặc khi gọi action
  }

  // Ensure empty string for color becomes null
  if (dataToSend.color === '') {
    dataToSend.color = null;
  }

  // Validate and process defaultSplitRatio
  if (dataToSend.defaultSplitRatio && dataToSend.defaultSplitRatio.length > 0) {
    if (totalDefaultPercentage.value !== 100 && activeMembers.value.length > 0) {
      // $q.notify is not available here directly, consider emitting an error or handling in parent
      console.error('Tổng tỷ lệ phân chia mặc định phải là 100%.');
      // alert('Tổng tỷ lệ phân chia mặc định phải là 100%.'); // Simple alert for now
      return; // Prevent dialog closing
    }
    dataToSend.defaultSplitRatio = dataToSend.defaultSplitRatio.filter(sr => sr.percentage && sr.percentage > 0);
    if (dataToSend.defaultSplitRatio.length === 0) dataToSend.defaultSplitRatio = null;
  } else {
    dataToSend.defaultSplitRatio = null; // Ensure it's null if empty or not set
  }
  onDialogOK(dataToSend);
};

</script>

<style scoped>
.q-dialog-plugin {
  /* Add any specific styling for the dialog card here */
}
</style>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
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



          <!-- Family selection for new parent categories (right below name) -->
          <div v-if="!editingCategory && !formData.parentId" class="q-mb-md">
            <q-select
              filled
              v-model="formData.familyId"
              :options="familySelectOptions"
              option-value="id"
              option-label="name"
              label="Chọn gia đình cho danh mục này *"
              :rules="[val => !!val || 'Vui lòng chọn gia đình']"
              emit-value
              map-options
              @update:model-value="updateDefaultMemberSplitPercentagesFromForm"
            />
          </div>


          <q-input
            filled
            v-model.number="formData.budgetLimit"
            label="Hạn mức (VND, không bắt buộc)"
            type="number"
            step="1000"
            clearable
            input-class="text-right"
          />
          <!-- Default SplitRatio Input Section (disabled if no family selected) -->
          <div class="q-mt-md q-pa-md bordered rounded-borders bg-grey-1">
            <div class="text-subtitle2 q-mb-sm">Tỷ lệ chia mặc định (tổng phải là 100%):</div>
            <div v-if="!familyIdForSplitRatio" class="text-caption text-negative">
              Vui lòng chọn gia đình trước khi phân chia.
            </div>
            <template v-else>
              <div v-if="activeMembers.length === 0" class="text-caption text-negative">
                Không có thành viên nào đang hoạt động để phân chia.
              </div>
              <div v-for="member in activeMembers" :key="member.id" class="row items-center q-mb-xs">
                <div class="col-5 ellipsis">{{ member.person?.name }}</div>
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
            </template>
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
import { useHouseholdMemberStore } from 'src/stores/householdMemberStore'; // Import household member store
import { useCategoryStore } from 'src/stores/categoryStore';
import { useFamilyStore } from 'src/stores/familyStore';

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
const categoryStore = useCategoryStore();
const familyStore = useFamilyStore();

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

const familyIdForSplitRatio = computed<string | null>(() => {
  // For editing, the category's own familyId is authoritative.
  if (props.editingCategory?.familyId) {
    return props.editingCategory.familyId;
  }
  // For a new root category, the familyId is selected in the form.
  if (formData.value.familyId) {
    return formData.value.familyId;
  }
  // For a new sub-category, find the parent's familyId.
  if (props.parentId) {
    const parentCategory = categoryStore.categories.find(c => c.id === props.parentId);
    return parentCategory?.familyId ?? null;
  }
  return null;
});

const activeMembers = computed(() => {
  const targetFamilyId = familyIdForSplitRatio.value;
  if (!targetFamilyId) return [];

  // Now, find the family group. The familyGroups are keyed by familyId.
  const group = householdMemberStore.familyGroups.find(fg => fg.id === targetFamilyId);
  return group ? group.members.filter(member => member.isActive) : [];
});

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

// Helper: get all ancestor family IDs (including self)
import type { Family } from 'src/models/family';
function getFamilyAndAncestors(families: Family[], selectedFamilyId: string): string[] {
  const ids: string[] = [];
  let currentId: string | undefined = selectedFamilyId;
  const famMap: Record<string, Family> = Object.fromEntries(families.map((f: Family) => [f.id, f]));
  while (currentId) {
    ids.push(currentId);
    const fam: Family | undefined = famMap[currentId];
    if (fam && fam.parentId) {
      currentId = fam.parentId;
    } else {
      break;
    }
  }
  return ids;
}

// Improved: Always include all user's families (from familyGroups) and their ancestors, deduped, user's own at top
const familySelectOptions = computed(() => {
  // Collect all user's family IDs from familyGroups
  const userFamilyIds = householdMemberStore.familyGroups.map(fg => fg.id).filter(Boolean);
  // Collect all ancestors for each user's family
  // eslint-disable-next-line prefer-const
  let allowedFamilyIds: string[] = [];
  userFamilyIds.forEach(fid => {
    allowedFamilyIds.push(fid);
    allowedFamilyIds.push(...getFamilyAndAncestors(familyStore.families, fid).filter(id => id !== fid));
  });
  // Remove duplicates, keep first occurrence, and put user's own families at the top
  const seen = new Set<string>();
  const uniqueIds = allowedFamilyIds.filter(id => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  // Map to family objects
  const options = uniqueIds
    .map(fid => {
      const fam = familyStore.families.find(f => f.id === fid);
      return fam ? { id: fam.id, name: fam.name || 'Gia đình không tên' } : null;
    })
    .filter(Boolean);
  // If still empty, fallback: show all families (should not happen, but for robustness)
  if (options.length === 0 && familyStore.families.length > 0) {
    return familyStore.families.map(fam => ({ id: fam.id, name: fam.name || 'Gia đình không tên' }));
  }
  return options;
});

const onSubmit = () => {
  // If creating a new sub-category, its familyId MUST be inherited from the parent.
  if (!props.editingCategory && props.parentId) {
    const parentCategory = categoryStore.getCategoryById(props.parentId);
    if (parentCategory) {
      formData.value.familyId = parentCategory.familyId;
    } else {
      console.error('Parent category not found, cannot assign familyId.');
      return; // Abort
    }
  }

  // Validate total percentage only if a split ratio is defined
  if (
    formData.value.defaultSplitRatio &&
    formData.value.defaultSplitRatio.length > 0 &&
    totalDefaultPercentage.value !== 100
  ) {
    console.error('Total split ratio must be 100%');
    // Optionally notify user
    return; // Abort submission
  }

  // Clean up the split ratio: remove members with 0, null, or undefined percentage
  if (formData.value.defaultSplitRatio) {
    const cleanedRatio = formData.value.defaultSplitRatio.filter(
      sr => sr.percentage && sr.percentage > 0
    );
    formData.value.defaultSplitRatio = cleanedRatio.length > 0 ? cleanedRatio : null;
  }

  onDialogOK(formData.value);
};

onMounted(() => {
  if (props.editingCategory) {
    // Deep copy to avoid mutating the original prop object
    formData.value = JSON.parse(JSON.stringify(props.editingCategory));
    if (!formData.value.defaultSplitRatio) {
      formData.value.defaultSplitRatio = [];
    }
    updateDefaultMemberSplitPercentagesFromForm();
  } else {
    formData.value.parentId = props.parentId ?? null;
    // For a new ROOT category, set default familyId to the currently selected one.
    if (!props.parentId && familyStore.selectedFamilyId) {
      formData.value.familyId = familyStore.selectedFamilyId;
    }
    // For a new CHILD category, the familyId is determined onSubmit from its parent.
    updateDefaultMemberSplitPercentagesFromForm();
  }
});

// Watch for changes in active members and repopulate the percentages
// This is crucial if the family/member data loads after the dialog is mounted
watch(activeMembers, () => {
  updateDefaultMemberSplitPercentagesFromForm();
}, { deep: true });

// Nếu parentId thay đổi (ví dụ: dialog được tái sử dụng), cập nhật formData.parentId
watch(() => props.parentId, (newParentId) => {
  formData.value.parentId = newParentId ?? null;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleIconSelected = (iconName: string) => {
  formData.value.icon = iconName;
};

</script>

<style scoped>

</style>

<template>
  <q-page padding class="q-pa-md" style="padding-bottom: 80px;">
    <div v-if="loading" class="q-pa-md flex flex-center">
      <q-spinner size="40px" color="primary" />
      <span class="q-ml-md">Đang tải dữ liệu...</span>
    </div>
    <q-form v-else @submit.prevent="onSubmit" ref="entryForm" class="q-gutter-md">
      <div class="text-h6 q-mb-md">Thêm khoản chi</div>

      <!-- Task 3.4: Chọn ngày -->
      <q-input
        filled
        v-model="form.date"
        label="Ngày giao dịch"
        mask="date"
        :rules="['date']"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="form.date" minimal />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <!-- Family Selection -->
      <q-select
        filled
        v-model="form.familyId"
        :options="familyOptions"
        label="Chọn gia đình"
        emit-value
        map-options
        option-value="value"
        option-label="label"
        :rules="[(val: any) => !!val || 'Vui lòng chọn gia đình']"
      />

      <!-- Task 3.7: Lựa chọn "Ai chi" (Moved Up) -->
      <div class="q-mt-md">
        <q-select
          filled
          v-model="form.payer"
          :options="payerOptions"
          label="Ai chi/nhận:"
          emit-value
          map-options
          @update:model-value="onPayerChange"
          clearable
          :disable="!form.familyId"
        />
      </div>

      <!-- Task 3.6: Input ghi chú (Moved Up) -->
      <q-input
        filled
        v-model="form.note"
        label="Ghi chú (không bắt buộc)"
        type="textarea"
        autogrow
      />

      <!-- Task 3.5: Nhập số tiền -->
      <q-input
        filled
        v-model="formattedAmount"
        label="Số tiền"
        type="text"
        step="1000"
        :rules="[
          (val: any) => {
            const parsedVal = parseNumberFromThousandsSeparator(val);
            return (parsedVal !== null && parsedVal > 0) || 'Số tiền phải lớn hơn 0';
          }
        ]"
        input-class="text-right"
      >
        <template v-slot:append>
          <span class="text-caption">VND</span>
        </template>
      </q-input>

      <!-- Task 3.2: Danh mục "Chọn nhanh" -->
      <div>
        <div class="text-subtitle1">Chọn nhanh danh mục:</div>
        <q-scroll-area horizontal style="height: 60px; max-width: 100%;">
          <div class="row no-wrap q-gutter-x-sm q-pa-xs">
            <q-btn
              v-for="cat in pinnedCategories"
              :key="cat.id"
              :icon="cat.icon ? undefined : 'sym_o_label'"
              :color="form.categoryId === cat.id ? 'primary' : 'grey-7'"
              :label="cat.name"
              size="sm"
              unelevated
              no-caps
              @click="selectCategory(cat.id)"
            >
              <TablerIcon v-if="cat.icon" :name="cat.icon" class="q-mr-sm" />
            </q-btn>
            <div v-if="!pinnedCategories.length" class="text-grey-7">
              Chưa có danh mục nào được ghim.
            </div>
          </div>
        </q-scroll-area>
      </div>

      <q-select
        filled
        v-model="form.categoryId"
        :options="categoryOptions"
        label="Hoặc chọn danh mục từ danh sách"
        emit-value
        map-options
        option-value="id"
        option-label="name"
        :rules="[(val: any) => !!val || 'Vui lòng chọn danh mục']"
        clearable
        @update:model-value="onCategorySelected"
        :disable="!form.familyId"
      />

      <!-- Task 3.8: Checkbox "Chi chung" và tỷ lệ chia -->
      <q-checkbox
        v-model="form.isShared"
        label="Chi chung"
        class="q-mt-sm"
        @update:model-value="onSharedChange"
      />
      <!-- SplitRatio Input Section -->
      <div v-if="form.isShared" class="q-mt-md q-pa-md bordered rounded-borders bg-grey-1">
        <!-- Task 3.13: Select Predefined Split Ratio -->
        <q-select
          filled
          dense
          v-model="selectedPredefinedRatioId"
          :options="predefinedSplitRatioOptions"
          label="Hoặc chọn tỷ lệ chia có sẵn"
          emit-value
          map-options
          clearable
          class="q-mb-md"
          :disable="!form.familyId"
        />

        <div class="text-subtitle2 q-mb-sm">Phân chia chi phí (tổng phải là 100%):</div>
        <div v-if="activeMembers.length === 0" class="text-caption text-negative">
          Vui lòng chọn một gia đình có thành viên đang hoạt động để chia sẻ chi phí.
        </div>
        <div v-for="member in activeMembers" :key="member.id" class="row items-center q-mb-xs">
          <div class="col-5 ellipsis">{{ member.person?.name }}</div>
          <div class="col-5">
            <q-input
              dense
              filled
              type="number"
              v-model.number="memberSplitPercentages[member.id]"
              @update:model-value="(val: any) => updateSplitRatio(member.id, val)"
              suffix="%"
              :rules="[
                val => val === null || val === '' || (val >= 0 && val <= 100) || '0-100',
              ]"
              input-class="text-right"
            />
          </div>
        </div>
        <div class="row justify-end items-center q-mt-sm">
          <q-btn flat dense size="sm" label="Chia đều" @click="distributeEqually" class="q-mr-sm" v-if="activeMembers.length > 0"/>
          <div class="text-subtitle2" :class="{'text-negative': totalPercentage !== 100 && activeMembers.length > 0}">
            Tổng: {{ totalPercentage }}%
          </div>
        </div>
        <div v-if="totalPercentage !== 100 && form.isShared && activeMembers.length > 0" class="text-caption text-negative q-mt-xs">
          Tổng tỷ lệ phân chia phải là 100%.
        </div>
      </div>
      <q-btn label="Lưu khoản này" type="submit" color="primary" class="full-width q-mt-lg" />
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar, QForm } from 'quasar';
import { computed, ref, onMounted, nextTick, watch } from 'vue';
import { useTransactionStore } from 'src/stores/transactionStore';
import { useCategoryStore } from 'src/stores/categoryStore';
import { useHouseholdMemberStore } from 'src/stores/householdMemberStore';
import { usePredefinedSplitRatioStore } from 'src/stores/predefinedSplitRatioStore';
import {
  formatNumberWithThousandsSeparator,
  parseNumberFromThousandsSeparator,
} from 'src/utils/formatters';
import dayjs from 'dayjs';
import { useFamilyStore } from 'src/stores/familyStore';
import { useAuthStore } from 'src/stores/authStore';
import type { NewTransactionData, Category, HouseholdMember } from 'src/models';
import TablerIcon from 'src/components/Common/TablerIcon.vue';

const transactionStore = useTransactionStore();
const memberStore = useHouseholdMemberStore();
const categoryStore = useCategoryStore();
const familyStore = useFamilyStore();
const authStore = useAuthStore();
const predefinedSplitRatioStore = usePredefinedSplitRatioStore();
const $q = useQuasar();

const entryForm = ref<QForm | null>(null);

const form = ref<NewTransactionData>({
  date: dayjs().format('YYYY/MM/DD'),
  familyId: familyStore.selectedFamilyId ?? '',
  payer: authStore.userWithMembershipsAndPerson?.person?.id ?? null,
  note: '',
  amount: null as number | null,
  categoryId: null as string | null,
  isShared: true,
  splitRatio: [],
  type: 'expense' as 'expense' | 'income',
});

const memberSplitPercentages = ref<Record<string, number | null>>({});
const selectedPredefinedRatioId = ref<string | null>(null);

const familyOptions = computed(() => {
  if (familyStore.families.length === 0) return [];
  // Show all families the user can select (no deduping, no filtering to just selected/parent)
  return familyStore.families.map(f => ({ label: f.name, value: f.id }));
});

// Helper to get selected family and its parent IDs
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getSelectedFamilyAndParentIds() {
  const selected = familyStore.families.find(f => f.id === form.value.familyId);
  if (!selected) return [];
  return selected.parentId ? [selected.id, selected.parentId] : [selected.id];
}

const activeMembers = computed(() => {
  if (!form.value.familyId) return [];
  return memberStore.allMembersWithFamily.filter(
    (member: HouseholdMember) => member.isActive && member.familyId === form.value.familyId
  );
});

const categoryOptions = computed(() => {
  if (!form.value.familyId) return [];
  // Only show categories for the selected family (not parent)
  const familyCategories = categoryStore.categories.filter((c: Category) => c.familyId === form.value.familyId);
  // Use cornered arrow character for child annotation
  const childPrefix = '└─ ';
  function buildHierarchy(categories: Category[], parentId: string | null = null, prefix = ''): { id: string; name: string }[] {
    return categories
      .filter((c: Category) => c.parentId === parentId)
      .sort((a: Category, b: Category) => (a.order ?? 0) - (b.order ?? 0))
      .flatMap((cat: Category) => [
        { id: cat.id, name: prefix + cat.name },
        ...buildHierarchy(categories, cat.id, prefix + childPrefix)
      ]);
  }
  return buildHierarchy(familyCategories);
});

const predefinedSplitRatioOptions = computed(() => {
  if (!form.value.familyId) return [];
  // Only show ratios for the selected family (not parent)
  return predefinedSplitRatioStore.predefinedRatios
    .filter(r => r.familyId === form.value.familyId)
    .map((ratio) => ({
      label: ratio.name,
      value: ratio.id,
    }));
});

// Watcher: When a predefined split ratio is selected, update split fields
watch(selectedPredefinedRatioId, (newId) => {
  if (!newId) return;
  const ratio = predefinedSplitRatioStore.predefinedRatios.find(r => r.id === newId);
  if (!ratio) return;
  // Map the split ratio to memberSplitPercentages
  // Only update for members currently active in the selected family
  const memberPercentages: Record<string, number | null> = {};
  ratio.splitRatio.forEach(item => {
    // Only set for members that are currently active in the form
    if (activeMembers.value.some(m => m.id === item.memberId)) {
      memberPercentages[item.memberId] = item.percentage;
    }
  });
  // Set 0 for any active member not in the ratio
  activeMembers.value.forEach(m => {
    if (!(m.id in memberPercentages)) {
      memberPercentages[m.id] = 0;
    }
  });
  memberSplitPercentages.value = memberPercentages;
  // Also update form.value.splitRatio for submission
  form.value.splitRatio = ratio.splitRatio.filter(item => activeMembers.value.some(m => m.id === item.memberId));
});

const loading = computed(() => familyStore.families.length === 0);

const payerOptions = computed(() => {
  return activeMembers.value
    .filter((member: HouseholdMember) => member.person)
    .map((member: HouseholdMember) => ({
      label: member.person!.name,
      value: member.id, // Use membership ID
    }));
});

const pinnedCategories = computed(() => {
  if (!form.value.familyId) return [];
  // Only show pinned categories for the currently selected family (not parent, not mixed)
  return categoryStore.categories
    .filter((c: Category) => c.isPinned && c.familyId === form.value.familyId)
    .sort((a: Category, b: Category) => (a.order ?? 0) - (b.order ?? 0));
});

// Retain last selected family, payer, and date

// Patch: Only update lastSelected* if value is not null/empty and different from previous
watch(() => form.value.familyId, (val, oldVal) => {
  if (val && val !== oldVal) transactionStore.lastSelectedFamilyId = val;
});
watch(() => form.value.payer, (val, oldVal) => {
  if (val && val !== oldVal) transactionStore.lastSelectedPayer = val;
});
watch(() => form.value.date, (val, oldVal) => {
  if (val && val !== oldVal) transactionStore.lastSelectedDate = val;
});

onMounted(async () => {
  if (familyStore.families.length === 0) {
    await familyStore.loadFamilies();
  }
  // Restore last selections if available
  if (transactionStore.lastSelectedFamilyId) {
    form.value.familyId = transactionStore.lastSelectedFamilyId;
  } else if (!form.value.familyId && familyStore.selectedFamilyId) {
    form.value.familyId = familyStore.selectedFamilyId;
  }
  if (transactionStore.lastSelectedPayer) {
    form.value.payer = transactionStore.lastSelectedPayer;
  }
  if (transactionStore.lastSelectedDate) {
    form.value.date = transactionStore.lastSelectedDate;
  }
  // Only load categories and ratios once
  await categoryStore.loadCategories();
  await predefinedSplitRatioStore.loadPredefinedRatios();
  // Set payer to the current user's membershipId by default if not set
  if (!form.value.payer) {
    const myMembership = activeMembers.value.find(m => m.person && m.person.id === authStore.userWithMembershipsAndPerson?.person?.id);
    if (myMembership) {
      form.value.payer = myMembership.id;
    }
  }
});


// When family changes, just reset selection (do not reload data)
watch(() => form.value.familyId, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    form.value.categoryId = null;
    selectedPredefinedRatioId.value = null;
    memberSplitPercentages.value = {};
    // Reset payer to a valid membershipId for the new family
    const newActiveMembers = activeMembers.value;
    // Prefer current user if they are a member of the new family
    const myMembership = newActiveMembers.find(m => m.person && m.person.id === authStore.userWithMembershipsAndPerson?.person?.id);
    form.value.payer = myMembership ? myMembership.id : (newActiveMembers[0]?.id ?? null);
  }
});


// Watch for families to load, then load categories/ratios if needed (only if not already loaded)
watch(
  () => familyStore.families.length,
  (len) => {
    if (len > 0 && categoryStore.categories.length === 0) {
      void categoryStore.loadCategories();
    }
    if (len > 0 && predefinedSplitRatioStore.predefinedRatios.length === 0) {
      void predefinedSplitRatioStore.loadPredefinedRatios();
    }
  }
);

const formattedAmount = computed({
  get: () => formatNumberWithThousandsSeparator(form.value.amount),
  set: (newValue) => {
    const parsed = parseNumberFromThousandsSeparator(newValue);
    form.value.amount = parsed;
  },
});

const totalPercentage = computed(() => {
  return Object.values(memberSplitPercentages.value).reduce(
    (sum: number, val) => sum + (Number(val) || 0),
    0
  );
});

const selectCategory = (categoryId: string) => {
  form.value.categoryId = categoryId;
};

const onCategorySelected = (value: string | null) => {
  form.value.categoryId = value;
};

const onPayerChange = (value: string | null) => {
    // The 'value' is now membershipId
    if (!form.value.isShared) {
        if (value) {
            // Find the corresponding memberId to store in splitRatio
            const member = activeMembers.value.find(m => m.id === value);
            if (member) {
                form.value.splitRatio = [{ memberId: member.id, percentage: 100 }];
            }
        } else {
            form.value.splitRatio = [];
        }
    }
};

const onSharedChange = (value: boolean) => {
    if (value) {
        // When switching to shared, distribute equally
        distributeEqually();
    } else {
        // When switching to not-shared, set split to be 100% payer
        if (form.value.payer) {
            const member = activeMembers.value.find(m => m.id === form.value.payer);
            if (member) {
                form.value.splitRatio = [{ memberId: member.id, percentage: 100 }];
            }
        } else {
            form.value.splitRatio = [];
        }
    }
};

const updateSplitRatio = (memberId: string, percentage: string | number | null) => {
  const numericPercentage =
    percentage === null || percentage === '' ? null : Number(percentage);
  memberSplitPercentages.value[memberId] = numericPercentage;
  // If user manually changes a value, deselect the predefined ratio
  selectedPredefinedRatioId.value = null;
};

const distributeEqually = () => {
  const activeCount = activeMembers.value.length;
  if (activeCount === 0) return;

  const percentage = 100 / activeCount;

  // Round to 2 decimal places to handle cases like 100/3
  const roundedPercentage = Math.round(percentage * 100) / 100;

  let distributedTotal = 0;
  activeMembers.value.forEach((member, index) => {
    if (index < activeCount - 1) {
      memberSplitPercentages.value[member.id] = roundedPercentage;
      distributedTotal += roundedPercentage;
    } else {
      // Assign the remainder to the last person to ensure total is exactly 100
      memberSplitPercentages.value[member.id] = 100 - distributedTotal;
    }
  });
  selectedPredefinedRatioId.value = null;
};

const resetForm = async () => {
  // Retain last selected family, payer, and date
  form.value = {
    date: transactionStore.lastSelectedDate || dayjs().format('YYYY/MM/DD'),
    familyId: transactionStore.lastSelectedFamilyId || familyStore.selectedFamilyId || '',
    payer: transactionStore.lastSelectedPayer || authStore.userWithMembershipsAndPerson?.person?.id || null,
    note: '',
    amount: null as number | null,
    categoryId: null as string | null,
    isShared: true,
    splitRatio: [],
    type: 'expense' as 'expense' | 'income',
  };
  memberSplitPercentages.value = {};
  selectedPredefinedRatioId.value = null;
  // Wait for next tick to ensure form is updated before focusing
  await nextTick();
  if (entryForm.value) {
    entryForm.value.reset();
  }
};

// Task 3.14: Submit handler
const onSubmit = async () => {
  if (!entryForm.value) return;
  const isValid = await entryForm.value.validate();
  if (isValid) {
    if (form.value.isShared && totalPercentage.value !== 100 && activeMembers.value.length > 0) {
      $q.notify({ type: 'negative', message: 'Tổng tỷ lệ phân chia cho chi phí chung phải là 100%.' });
      return;
    }
    // Find the member for the payer from the membershipId
    const payerMember = activeMembers.value.find((m: HouseholdMember) => m.id === form.value.payer);
    // Finalize split ratio based on current state, mapping memberId to membershipId
    const finalSplitRatio = form.value.isShared
      ? Object.entries(memberSplitPercentages.value)
          .map(([memberId, percentage]) => {
            // memberId here is the membership ID
            const member = activeMembers.value.find(m => m.id === memberId);
            return member ? {
              memberId: member.id, // Use membership ID
              percentage: Number(percentage) || 0,
            } : null;
          })
          .filter((item): item is { memberId: string; percentage: number } => !!item && item.percentage > 0)
      : (payerMember ? [{ memberId: payerMember.id, percentage: 100 }] : null);
    const transactionPayload: NewTransactionData = {
      ...form.value,
      payer: payerMember ? payerMember.id : null, // Submit membershipId as payer
      amount: form.value.amount as number,
      categoryId: form.value.categoryId as string,
      familyId: form.value.familyId as string,
      splitRatio: finalSplitRatio,
    };
    if (transactionPayload.splitRatio && transactionPayload.splitRatio.length === 0) {
      transactionPayload.splitRatio = null;
    }
    try {
      await transactionStore.addTransaction(transactionPayload);
      $q.notify({ type: 'positive', message: 'Khoản chi đã được lưu thành công!' });
      await resetForm();
    } catch (error) {
      console.error('Error saving transaction:', error);
      $q.notify({ type: 'negative', message: 'Đã xảy ra lỗi khi lưu khoản chi.' });
    }
  }
};

defineExpose({ pinnedCategories, payerOptions, loading });
</script>

<style scoped>
.bordered {
  border: 1px solid #e0e0e0;
}
.rounded-borders {
  border-radius: 8px;
}
</style>

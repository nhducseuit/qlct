<template>
  <q-page padding class="q-pa-md" style="padding-bottom: 80px;"> <!-- Increased bottom padding -->
    <q-form @submit.prevent="onSubmit" ref="entryForm" class="q-gutter-md">
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
        :rules="[val => !!val || 'Vui lòng chọn gia đình']"
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
          val => {
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
        :rules="[val => !!val || 'Vui lòng chọn danh mục']"
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
              @update:model-value="val => updateSplitRatio(member.id, val)"
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
import { computed, ref, watch, onMounted, nextTick } from 'vue';
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
import type { SplitRatioItem, NewTransactionData } from 'src/models';
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
  payer: authStore.user?.id ?? null,
  note: '',
  amount: null as number | null,
  categoryId: null as string | null,
  isShared: true,
  splitRatio: [],
  type: 'expense' as 'expense' | 'income',
});

const memberSplitPercentages = ref<Record<string, number | null>>({});
const selectedPredefinedRatioId = ref<string | null>(null);

const familyOptions = computed(() =>
  familyStore.families.map(f => ({ label: f.name, value: f.id }))
);

const pinnedCategories = computed(() => categoryStore.pinnedCategories);

const activeMembers = computed(() => {
  if (!form.value.familyId) return [];
  return memberStore.allMembersWithFamily.filter(
    (member) => member.isActive && member.familyId === form.value.familyId
  );
});

const payerOptions = computed(() => {
  return activeMembers.value.map((member) => ({
    label: member.person.name,
    value: member.id,
  }));
});

const categoryOptions = computed(() => {
  return categoryStore.flatSortedCategoriesForSelect.map(cat => ({
    id: cat.id,
    name: cat.name,
    // ... any other properties needed for the select component
  }));
});

const predefinedSplitRatioOptions = computed(() => {
  return predefinedSplitRatioStore.predefinedRatios.map((ratio) => ({
    label: ratio.name,
    value: ratio.id,
  }));
});

onMounted(() => {
  const initialFamilyId = familyStore.selectedFamilyId || authStore.user?.familyId;
  if (initialFamilyId) {
    form.value.familyId = initialFamilyId;
    familyStore.selectedFamilyId = initialFamilyId;
    // Data loading is now handled by watchers in the respective stores
  } else {
    // Handle case where no family is selected and user has no default
    console.warn('No family selected and no default family for user.');
  }

  if (activeMembers.value.some(m => m.id === authStore.user?.id)) {
    form.value.payer = authStore.user?.id ?? null;
  }
});

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
    if (!form.value.isShared) {
        if (value) {
            form.value.splitRatio = [{ memberId: value, percentage: 100 }];
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
            form.value.splitRatio = [{ memberId: form.value.payer, percentage: 100 }];
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
  const currentFamilyId = form.value.familyId;
  form.value = {
    date: dayjs().format('YYYY/MM/DD'),
    familyId: currentFamilyId, // Keep the current family
    payer: authStore.user?.id ?? null,
    note: '',
    amount: null,
    categoryId: null,
    isShared: true,
    splitRatio: [],
    type: 'expense',
  };
  memberSplitPercentages.value = {};
  selectedPredefinedRatioId.value = null;

  await nextTick();
  entryForm.value?.resetValidation();

  // Set default payer if applicable
  if (activeMembers.value.some(m => m.id === authStore.user?.id)) {
    form.value.payer = authStore.user?.id ?? null;
  }
};

const onSubmit = async () => {
  if (!entryForm.value) return;

  const isValid = await entryForm.value.validate();

  if (isValid) {
    if (form.value.isShared && totalPercentage.value !== 100 && activeMembers.value.length > 0) {
      $q.notify({ type: 'negative', message: 'Tổng tỷ lệ phân chia cho chi phí chung phải là 100%.' });
      return;
    }

    // Finalize split ratio based on current state
    const finalSplitRatio = form.value.isShared
      ? Object.entries(memberSplitPercentages.value)
          .map(([memberId, percentage]) => ({
            memberId,
            percentage: Number(percentage) || 0,
          }))
          .filter(item => item.percentage > 0)
      : (form.value.payer ? [{ memberId: form.value.payer, percentage: 100 }] : null);


    const transactionPayload: NewTransactionData = {
      ...form.value,
      amount: form.value.amount as number,
      categoryId: form.value.categoryId as string,
      familyId: form.value.familyId as string,
      splitRatio: finalSplitRatio,
    };

    if (transactionPayload.splitRatio && transactionPayload.splitRatio.length === 0) {
      transactionPayload.splitRatio = null;
    }

    await transactionStore.addTransaction(transactionPayload);
    $q.notify({ type: 'positive', message: 'Đã lưu giao dịch!' });
    await resetForm();
  } else {
    $q.notify({
      color: 'negative',
      message: 'Vui lòng kiểm tra lại các trường thông tin.',
      icon: 'report_problem',
    });
  }
};

watch(
  () => form.value.familyId,
  (newFamilyId, oldFamilyId) => {
    if (!newFamilyId || newFamilyId === oldFamilyId) return;

    // Update global state, which will trigger watchers in stores to load data
    familyStore.selectedFamilyId = newFamilyId;

    // Reset form fields that depend on the family
    form.value.categoryId = null;
    form.value.payer = null;
    form.value.isShared = true;
    form.value.splitRatio = [];
    memberSplitPercentages.value = {};
    selectedPredefinedRatioId.value = null;

    // Use nextTick to allow the activeMembers computed property to update
    void nextTick(() => {
        if (activeMembers.value.some(m => m.id === authStore.user?.id)) {
            form.value.payer = authStore.user?.id ?? null;
        }
        entryForm.value?.resetValidation();
    });
  }
);

watch(selectedPredefinedRatioId, (newId) => {
  if (newId) {
    const ratio = predefinedSplitRatioStore.getRatioById(newId);
    if (ratio) {
      // Clear existing splits
      memberSplitPercentages.value = {};
      const activeMemberIds = new Set(activeMembers.value.map(m => m.id));

      // Apply predefined splits only for active members
      ratio.splitRatio.forEach((item: SplitRatioItem) => {
        if (activeMemberIds.has(item.memberId)) {
           memberSplitPercentages.value[item.memberId] = item.percentage;
        }
      });
    }
  } else {
      // If the predefined ratio is cleared, we don't clear manual entries.
      // The user might want to adjust from a preset.
  }
});
</script>

<style lang="scss" scoped>
.bordered {
  border: 1px solid #e0e0e0;
}

.rounded-borders {
  border-radius: 4px; /* Or your theme's default */
}

/* Add some breathing room to the scroll area */
.q-scroll-area--horizontal {
  padding-bottom: 8px;
}
</style>

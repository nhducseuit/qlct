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

      <!-- Task 3.7: Lựa chọn "Ai chi" (Moved Up) -->
      <div class="q-mt-md">
        <!-- <div class="text-subtitle2 q-mb-xs">Ai chi:</div> -->
        <q-select
          filled
          v-model="form.payer"
          :options="payerOptions"
          label="Ai chi/nhận:"
          emit-value
          map-options
          @update:model-value="onPayerChange"
          clearable
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
      <!-- Removed q-mb-md to reduce gap -->
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
        />

        <div class="text-subtitle2 q-mb-sm">Phân chia chi phí (tổng phải là 100%):</div>
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
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useQuasar, QForm } from 'quasar';
import { useCategoryStore } from 'src/stores/categoryStore';
import { useTransactionStore } from 'src/stores/transactionStore';
import { useHouseholdMemberStore } from 'src/stores/householdMemberStore'; // Import householdMemberStore
import { usePredefinedSplitRatioStore } from 'src/stores/predefinedSplitRatioStore'; // Import predefinedSplitRatioStore
import { type NewTransactionData, type SplitRatioItem } from 'src/models/index';
import { dayjs } from 'src/boot/dayjs';
import TablerIcon from 'src/components/Common/TablerIcon.vue'; // Import component icon
import { formatNumberWithThousandsSeparator, parseNumberFromThousandsSeparator } from '../../utils/formatters';

const $q = useQuasar();
const categoryStore = useCategoryStore();
const transactionStore = useTransactionStore();
const householdMemberStore = useHouseholdMemberStore();
const predefinedSplitRatioStore = usePredefinedSplitRatioStore(); // Use the new store

const entryForm = ref<QForm | null>(null);
const form = ref({
  categoryId: null as string | null,
  date: dayjs().format('YYYY/MM/DD'), // Quasar default date format
  amount: null as number | null,
  note: '',
  // Set default payer after members are loaded
  payer: null as string | null,
  isShared: false,
  splitRatio: null as SplitRatioItem[] | null, // Default or from category
  selectedPredefinedRatioId: null,
  type: 'expense' as 'income' | 'expense', // Default to expense
});

const formattedAmount = computed<string>({
  get() {
    return formatNumberWithThousandsSeparator(form.value.amount);
  },
  set(newValue: string) {
    const parsed = parseNumberFromThousandsSeparator(newValue);
    if (parsed !== null) {
      form.value.amount = parsed;
    } else if (newValue === '') {
      form.value.amount = null;
    }
  }
});

const activeMembers = computed(() =>
  householdMemberStore.members.filter(member => member.isActive)
);
const memberSplitPercentages = ref<Record<string, number | null>>({});

const pinnedCategories = computed(() => categoryStore.pinnedCategories);
const payerOptions = computed(() =>
  householdMemberStore.members.filter(member => member.isActive).map(member => ({
    label: member.name,
    value: member.id,
  }))
);
// Options for predefined split ratios
const predefinedSplitRatioOptions = computed(() =>
  predefinedSplitRatioStore.predefinedRatios.map(ratio => ({
    label: ratio.name,
    value: ratio.id,
  }))
);


// Task 3.3: Chuẩn bị options cho q-select (sẽ cải thiện với danh mục cha-con sau)
const categoryOptions = computed(() =>
  categoryStore.flatSortedCategoriesForSelect.map(cat => ({
    id: cat.id,
    name: `${'\xA0\xA0\xA0\xA0'.repeat(cat.depth)}${cat.depth > 0 ? '↳ ' : ''}${cat.name}`, // Indent with non-breaking spaces
  })),
);

// Task 3.13: Select predefined split ratio
const selectedPredefinedRatioId = ref<string | null>(null);

watch(selectedPredefinedRatioId, (newRatioId) => {
  if (newRatioId) {
    const predefinedRatio = predefinedSplitRatioStore.getPredefinedRatioById(newRatioId);
    if (predefinedRatio) {
      form.value.isShared = true; // Automatically tick "Chi chung"
      form.value.splitRatio = JSON.parse(JSON.stringify(predefinedRatio.splitRatio)); // Apply the ratio
      updateMemberSplitPercentagesFromForm(); // Update UI inputs
    }
  }
});


const onCategorySelected = (categoryId: string | null) => {
  if (form.value.isShared) { // Only attempt to apply default split if shared
    if (categoryId) {
      const category = categoryStore.getCategoryById(categoryId);
      if (category?.defaultSplitRatio) {
        form.value.splitRatio = JSON.parse(JSON.stringify(category.defaultSplitRatio)); // Deep copy
      } else {
        // If category has no default, initialize for manual input or clear
        form.value.splitRatio = activeMembers.value.length > 0 ? activeMembers.value.map(m => ({ memberId: m.id, percentage: 0 })) : [];
      }
    }
    updateMemberSplitPercentagesFromForm(); // Always update UI based on new form.value.splitRatio
  }
};

const onPayerChange = (payerId: string | null) => {
  if (payerId && !form.value.isShared) {
    // Nếu không phải chi chung, và đã chọn người chi, thì tỷ lệ là 100% cho người đó
    // Nếu không phải chi chung, và đã chọn người chi, thì tỷ lệ là 100% cho người đó
    form.value.splitRatio = [{ memberId: payerId, percentage: 100 }];
  } else if (!payerId && !form.value.isShared) {
    // Nếu bỏ chọn người chi và không phải chi chung (trường hợp này ít xảy ra với radio)
    form.value.splitRatio = null;
  }
};

const onSharedChange = (isShared: boolean) => {
  if (isShared) {
    // This handler is for when the user MANUALLY ticks the checkbox.
    // If a predefined ratio is already selected, this handler should not override it.
    // The check for `selectedPredefinedRatioId` handles the case where `isShared` is
    // set programmatically by the predefined ratio watcher.
    if (!selectedPredefinedRatioId.value) {
      // When manually ticking "Chi chung", apply category default or reset.
      const category = form.value.categoryId ? categoryStore.getCategoryById(form.value.categoryId) : null;
      if (category?.defaultSplitRatio) {
        form.value.splitRatio = JSON.parse(JSON.stringify(category.defaultSplitRatio));
      } else if (activeMembers.value.length > 0) {
        form.value.splitRatio = activeMembers.value.map(m => ({ memberId: m.id, percentage: 0 }));
      } else {
        form.value.splitRatio = [];
      }
    }
  } else {
    // When un-ticking, always clear the predefined selection and revert to single-payer.
    selectedPredefinedRatioId.value = null;
    onPayerChange(form.value.payer);
  }
  updateMemberSplitPercentagesFromForm();
};

// Set default payer once household members are loaded
watch(() => householdMemberStore.members, (newMembers) => {
  if (!form.value.payer && newMembers.length > 0) {
    form.value.payer = newMembers.find(m => m.isActive)?.id || (newMembers[0] ? newMembers[0].id : null);
    onPayerChange(form.value.payer); // Initialize splitRatio if not shared
  }
}, { immediate: true });

const selectCategory = (categoryId: string) => {
  form.value.categoryId = categoryId;
  onCategorySelected(categoryId);
};

// Function to update form.value.splitRatio based on memberSplitPercentages
// This is needed when user manually edits percentages
const updateSplitRatioFromPercentages = () => {
  form.value.splitRatio = activeMembers.value
    .map(member => ({
      memberId: member.id,
      percentage: memberSplitPercentages.value[member.id] ?? 0, // Use 0 if null/undefined
    }))
    .filter(sr => sr.percentage > 0); // Only include members with > 0%
};

const updateMemberSplitPercentagesFromForm = () => {
  const newPercentages: Record<string, number | null> = {};
  activeMembers.value.forEach(member => {
    const existingSplit = form.value.splitRatio?.find(sr => sr.memberId === member.id);
    newPercentages[member.id] = existingSplit ? existingSplit.percentage : null;
  });
  memberSplitPercentages.value = newPercentages;
};

const updateSplitRatio = (memberId: string, percentage: number | string | null) => {
  const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  if (form.value.splitRatio === null) form.value.splitRatio = [];
  selectedPredefinedRatioId.value = null; // Clear predefined selection if manual edit occurs

  const index = form.value.splitRatio.findIndex(sr => sr.memberId === memberId);
  if (numPercentage !== null && !isNaN(numPercentage) && numPercentage >= 0) {
    if (index > -1) {
      form.value.splitRatio[index]!.percentage = numPercentage;
    } else {
      form.value.splitRatio.push({ memberId, percentage: numPercentage });
    }
  } else {
    if (index > -1) {
      form.value.splitRatio[index]!.percentage = 0;
    }
    memberSplitPercentages.value[memberId] = null;
  }
  updateSplitRatioFromPercentages(); // Keep form.value.splitRatio in sync
};

const totalPercentage = computed(() => {
  if (!form.value.isShared || !form.value.splitRatio) return 0;
  return form.value.splitRatio.reduce((sum, item) => sum + (item.percentage || 0), 0);
});

const distributeEqually = () => {
  if (!form.value.isShared || activeMembers.value.length === 0) return;
  const count = activeMembers.value.length;
  const percentage = parseFloat((100 / count).toFixed(2));
  const remainder = 100 - (percentage * count);

  form.value.splitRatio = activeMembers.value.map((member, index) => {
    let finalPercentage = percentage;
    if (index === 0 && remainder !== 0) {
      finalPercentage = parseFloat((percentage + remainder).toFixed(2));
    }
    return { memberId: member.id, percentage: finalPercentage };
  });
  selectedPredefinedRatioId.value = null; // Clear predefined selection
  updateMemberSplitPercentagesFromForm();
};

const resetForm = async () => { // Make async to use await with nextTick
  const currentDate = form.value.date; // Save the current date
  const currentPayer = form.value.payer; // Save the current payer
  const currentType = form.value.type; // Save the current type

  form.value = {
    categoryId: null as string | null,
    date: currentDate, // Keep current date
    amount: null as number | null,
    note: '',
    payer: currentPayer, // Keep current payer
    isShared: false,
    splitRatio: null as SplitRatioItem[] | null,
    selectedPredefinedRatioId: null, // Reset predefined selection
    type: currentType, // Keep current type
  };
  updateMemberSplitPercentagesFromForm(); // Reset UI for split percentages

  // Ensure resetValidation is called after the form model has been updated
  // and the DOM has had a chance to react if necessary (though usually not needed for resetValidation)
  if (entryForm.value) {    await nextTick(); // Wait for Vue to update the DOM based on model changes
    entryForm.value.resetValidation(); // Now reset validation state
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
    // Task 3.10: Logic lưu transaction
    const transactionData: NewTransactionData = {
      categoryId: form.value.categoryId as string, // Ensured by validation
      date: form.value.date, // string in YYYY/MM/DD format
      amount: form.value.amount as number, // Ensured by validation
      note: form.value.note,
      payer: form.value.payer, // string (userId) or null
      isShared: form.value.isShared,
      splitRatio: form.value.isShared
        ? (form.value.splitRatio ? form.value.splitRatio.filter(sr => sr.percentage && sr.percentage > 0) : null)
        : (form.value.payer ? [{ memberId: form.value.payer, percentage: 100 }] : null),
      type: form.value.type,
    };
    if (transactionData.splitRatio && transactionData.splitRatio.length === 0) {
      transactionData.splitRatio = null;
    }

    await transactionStore.addTransaction(transactionData);
    $q.notify({ type: 'positive', message: 'Đã lưu giao dịch!' });
    await resetForm(); // Reset form after successful submission
  } else {
    $q.notify({
      color: 'negative',
      message: 'Vui lòng kiểm tra lại các trường thông tin.',
      icon: 'report_problem',
    });
  }
};

// Watchers để tự động cập nhật splitRatio khi categoryId hoặc isShared thay đổi
watch(() => form.value.categoryId, (newCategoryId) => {
  onCategorySelected(newCategoryId);
});

watch(() => form.value.isShared, (newIsShared) => {
  onSharedChange(newIsShared);
});

// Watcher cho payer để cập nhật splitRatio khi không phải chi chung
watch(() => form.value.payer, (newPayer) => {
  onPayerChange(newPayer);
});

onMounted(async () => {
  const initialLoadPromises = [];

  // Load categories if not already loaded
  if (categoryStore.categories.length === 0) {
    initialLoadPromises.push(categoryStore.loadCategories());
  }
  // Load household members if not already loaded
  if (householdMemberStore.members.length === 0) {
    initialLoadPromises.push(householdMemberStore.loadMembers());
  }
  // Load predefined split ratios if not already loaded
  if (predefinedSplitRatioStore.predefinedRatios.length === 0) {
    initialLoadPromises.push(predefinedSplitRatioStore.loadPredefinedRatios());
  }

  try {
    await Promise.all(initialLoadPromises);
  } catch (error) {
    console.error('Error during initial data loading for QuickEntryForm:', error);
    // Notifications are typically handled by individual store actions
  }
});

</script>

<style scoped>
.q-scroll-area--horizontal .q-scrollarea__content {
  display: flex;
  flex-wrap: nowrap;
}
</style>

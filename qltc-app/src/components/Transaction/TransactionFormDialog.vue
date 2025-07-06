<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card class="q-dialog-plugin" style="width: 600px; max-width: 95vw;">
      <q-form @submit.prevent="onSubmit" ref="entryForm" class="q-gutter-md">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editingTransaction ? 'Sửa Giao dịch' : 'Thêm Giao dịch Mới' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <!-- Category Selection -->
          <q-select
            filled
            v-model="form.categoryId"
            :options="categoryOptions"
            label="Danh mục *"
            emit-value
            map-options
            option-value="id"
            option-label="name"
            :rules="[val => !!val || 'Vui lòng chọn danh mục']"
            clearable
            @update:model-value="onCategorySelected"
          />

          <!-- Date Selection -->
          <q-input
            filled
            v-model="form.date"
            label="Ngày giao dịch *"
            mask="date"
            :rules="['date']"
            class="q-mt-md"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.date" minimal />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

      <!-- Payer -->
      <q-select
        filled
        v-model="form.payer"
        :options="payerOptions"
        label="Ai chi/nhận:"
        emit-value
        map-options
        clearable
        class="q-mt-md"
        @update:model-value="onPayerChange"
      />

          <!-- Amount -->
          <q-input
            filled
            v-model="formattedAmount"
            label="Số tiền *"
            type="text"
            step="1000"
        :rules="[
          val => {
            const parsedVal = parseNumberFromThousandsSeparator(val);
            return (parsedVal !== null && parsedVal > 0) || 'Số tiền phải lớn hơn 0';
          }
        ]"
            input-class="text-right"
            class="q-mt-md"
          >
            <template v-slot:append>
              <span class="text-caption">VND</span>
            </template>
          </q-input>

          <!-- Note -->
          <q-input
            filled
            v-model="form.note"
            label="Ghi chú (không bắt buộc)"
            type="textarea"
            autogrow
            class="q-mt-md"
          />

          <!-- Shared Expense -->
          <q-checkbox
            v-model="form.isShared"
            label="Chi chung"
            class="q-mt-sm"
            @update:model-value="onSharedChange"
          />

          <!-- SplitRatio Input Section -->
          <div v-if="form.isShared" class="q-mt-md q-pa-md_ bordered rounded-borders_ bg-grey-1">
            <div class="text-subtitle2 q-mb-sm">Phân chia chi phí (tổng phải là 100%):</div>
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

        </q-card-section>

        <q-card-actions align="right" class="text-primary q-pb-md q-pr-md">
          <q-btn flat label="Hủy" @click="onDialogCancel" />
          <q-btn color="primary" :label="editingTransaction ? 'Lưu thay đổi' : 'Thêm mới'" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useDialogPluginComponent, QForm, useQuasar } from 'quasar';
import { useCategoryStore } from 'src/stores/categoryStore';
import { useHouseholdMemberStore } from 'src/stores/householdMemberStore';
import { type Transaction, type SplitRatioItem } from 'src/models/index';
import { dayjs } from 'src/boot/dayjs';
import { formatNumberWithThousandsSeparator, parseNumberFromThousandsSeparator } from '../../utils/formatters';

interface Props {
  editingTransaction?: Transaction | null;
}

const props = defineProps<Props>();

defineEmits([
  ...useDialogPluginComponent.emits,
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const $q = useQuasar();

const categoryStore = useCategoryStore();
const householdMemberStore = useHouseholdMemberStore();

const entryForm = ref<QForm | null>(null);
const form = ref({
  categoryId: null as string | null,
  date: dayjs().format('YYYY/MM/DD'),
  amount: null as number | null,
  note: '',
  payer: null as string | null,
  isShared: false,
  splitRatio: null as SplitRatioItem[] | null,
  type: 'expense' as 'income' | 'expense',
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

const categoryOptions = computed(() =>
  categoryStore.flatSortedCategoriesForSelect.map(cat => ({
    id: cat.id,
    name: `${'\xA0\xA0\xA0\xA0'.repeat(cat.depth)}${cat.depth > 0 ? '↳ ' : ''}${cat.name}`, // Indent with non-breaking spaces
  }))
);

const payerOptions = computed(() =>
  householdMemberStore.members.filter(member => member.isActive).map(member => ({
    label: member.person?.name,
    value: member.id,
  }))
);

const activeMembers = computed(() =>
  householdMemberStore.members.filter(member => member.isActive)
);

// For managing individual percentage inputs in the UI
const memberSplitPercentages = ref<Record<string, number | null>>({});

const onCategorySelected = (categoryId: string | null) => {
  if (form.value.isShared) { // Only attempt to apply default split if shared
    // If editing and the transaction already has a specific splitRatio,
    // only apply category default if we are NOT editing an existing transaction
    // OR if we ARE editing but the categoryId has actually CHANGED from the original.
    // This prevents overwriting a custom split when the dialog loads for an existing transaction.
    const isNewTransaction = !props.editingTransaction;
    const categoryHasChangedDuringEdit = props.editingTransaction && props.editingTransaction.categoryId !== categoryId;

    if (isNewTransaction || categoryHasChangedDuringEdit) {
      if (categoryId) {
        const category = categoryStore.getCategoryById(categoryId);
        if (category?.defaultSplitRatio) {
          form.value.splitRatio = JSON.parse(JSON.stringify(category.defaultSplitRatio));
        } else {
          // If category has no default, initialize for manual input
          form.value.splitRatio = activeMembers.value.length > 0 ? activeMembers.value.map(m => ({ memberId: m.id, percentage: 0 })) : [];
        }
      } else {
        // No category selected, clear split or set to default for manual input
        form.value.splitRatio = activeMembers.value.length > 0 ? activeMembers.value.map(m => ({ memberId: m.id, percentage: 0 })) : [];
      }
    }
    updateMemberSplitPercentagesFromForm();
  }
};

const onPayerChange = (payerId: string | null) => {
  if (payerId && !form.value.isShared) {
    form.value.splitRatio = [{ memberId: payerId, percentage: 100 }];
  } else if (!payerId && !form.value.isShared) {
    form.value.splitRatio = null;
  }
};

const onSharedChange = (isShared: boolean) => {
  if (isShared) {
    // When isShared becomes true:
    // 1. If we are editing a transaction that was *already* shared and had a splitRatio,
    //    onMounted would have set form.value.splitRatio. We should preserve it.
    // 2. If it's a new transaction, or an existing transaction that was *not* shared before,
    //    then we apply the category default or initialize for manual input.
    const isCurrentlyEditingAndWasAlreadySharedWithSplit =
      props.editingTransaction &&
      props.editingTransaction.isShared === true && // Check if the original was shared
      props.editingTransaction.splitRatio && // And had a split ratio
      props.editingTransaction.isShared === isShared; // And the status hasn't just been toggled to shared

    if (!isCurrentlyEditingAndWasAlreadySharedWithSplit) {
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
    onPayerChange(form.value.payer);
  }
  updateMemberSplitPercentagesFromForm();
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

  const index = form.value.splitRatio.findIndex(sr => sr.memberId === memberId);
  if (numPercentage !== null && !isNaN(numPercentage) && numPercentage >= 0) {
    if (index > -1) {
      form.value.splitRatio[index]!.percentage = numPercentage;
    } else {
      form.value.splitRatio.push({ memberId, percentage: numPercentage });
    }
  } else { // If input is cleared or invalid, remove or set to 0
    if (index > -1) {
      form.value.splitRatio[index]!.percentage = 0; // Or remove: form.value.splitRatio.splice(index, 1);
    }
    memberSplitPercentages.value[memberId] = null; // Clear UI input
  }
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
    if (index === 0 && remainder !== 0) { // Distribute remainder to the first member
      finalPercentage = parseFloat((percentage + remainder).toFixed(2));
    }
    return { memberId: member.id, percentage: finalPercentage };
  });
  updateMemberSplitPercentagesFromForm();
};

onMounted(() => {
  if (props.editingTransaction) {
    const tx = props.editingTransaction;
    form.value = {
      categoryId: tx.categoryId,
      date: dayjs(tx.date).format('YYYY/MM/DD'), // Ensure correct format for q-date
      amount: tx.amount,
      note: tx.note || '',
      payer: tx.payer || null,
      isShared: tx.isShared,
      splitRatio: tx.splitRatio ? JSON.parse(JSON.stringify(tx.splitRatio)) : null,
      type: tx.type,
    };
    // After form.value is populated with editingTransaction data,
    // immediately update the UI-bound memberSplitPercentages.
    // This ensures that the transaction's actual splitRatio is reflected in the UI inputs first.
    updateMemberSplitPercentagesFromForm();
  } else {
    // Set default payer for new transactions
    if (householdMemberStore.members.length > 0) {
      form.value.payer = householdMemberStore.members.find(m => m.isActive)?.id || householdMemberStore.members[0]?.id || null;
      onPayerChange(form.value.payer); // Initialize splitRatio if not shared
    }
  }
  // If it's a new transaction, and we didn't hit the 'editingTransaction' block,
  // call updateMemberSplitPercentagesFromForm to initialize based on any defaults or empty state.
  if (!props.editingTransaction) updateMemberSplitPercentagesFromForm();
});

const onSubmit = async () => {
  if (!entryForm.value) return;
  const isValid = await entryForm.value.validate();
  if (isValid) {
    if (form.value.isShared && totalPercentage.value !== 100 && activeMembers.value.length > 0) {
      $q.notify({ type: 'negative', message: 'Tổng tỷ lệ phân chia cho chi phí chung phải là 100%.' });
      return;
    }
    // The dataToSend should match NewTransactionData or UpdateTransactionPayload
    const dataToSend = { ...form.value };
    // Filter out members with 0 or null percentage from splitRatio if any
    if (dataToSend.splitRatio) {
      dataToSend.splitRatio = dataToSend.splitRatio.filter(sr => sr.percentage && sr.percentage > 0);
      if (dataToSend.splitRatio.length === 0) dataToSend.splitRatio = null;
    }
    onDialogOK(dataToSend);
  }
};

// Watchers for dynamic updates (similar to QuickEntryForm)
watch(() => form.value.categoryId, (newCategoryId) => onCategorySelected(newCategoryId));
watch(() => form.value.isShared, (newIsShared) => onSharedChange(newIsShared));
watch(() => form.value.payer, (newPayer) => onPayerChange(newPayer));

</script>

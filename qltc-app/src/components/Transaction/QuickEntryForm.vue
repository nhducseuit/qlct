<template>
  <q-page padding class="q-pa-md">
    <q-form @submit.prevent="onSubmit" ref="entryForm" class="q-gutter-md">
      <div class="text-h6 q-mb-md">Thêm khoản chi tiêu / thu nhập mới</div>

      <!-- Task 3.2: Danh mục "Chọn nhanh" -->
      <div class="q-mb-md">
        <div class="text-subtitle1">Chọn nhanh:</div>
        <q-scroll-area horizontal style="height: 60px; max-width: 100%;">
          <div class="row no-wrap q-gutter-sm q-pa-xs">
            <q-btn
              v-for="cat in pinnedCategories"
              :key="cat.id"
              :icon="cat.icon ? undefined : 'sym_o_label'"
              :color="form.categoryId === cat.id ? 'primary' : 'grey-7'"
              :label="cat.name"
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

      <!-- Task 3.3: Chọn danh mục đầy đủ -->
      <q-select
        filled
        v-model="form.categoryId"
        :options="categoryOptions"
        label="Hoặc chọn danh mục"
        emit-value
        map-options
        option-value="id"
        option-label="name"
        :rules="[val => !!val || 'Vui lòng chọn danh mục']"
        clearable
        @update:model-value="onCategorySelected"
      />

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

      <!-- Task 3.5: Nhập số tiền -->
      <q-input
        filled
        v-model.number="form.amount"
        label="Số tiền"
        type="number"
        step="1000"
        :rules="[val => val !== null && val > 0 || 'Số tiền phải lớn hơn 0']"
        input-class="text-right"
      >
        <template v-slot:append>
          <span class="text-caption">VND</span>
        </template>
      </q-input>

      <!-- Task 3.6: Input ghi chú -->
      <q-input
        filled
        v-model="form.note"
        label="Ghi chú (không bắt buộc)"
        type="textarea"
        autogrow
      />

      <!-- Task 3.7: Lựa chọn "Ai chi" -->
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

      <!-- Task 3.8: Checkbox "Chi chung" và tỷ lệ chia -->
      <q-checkbox
        v-model="form.isShared"
        label="Chi chung"
        class="q-mt-sm"
        @update:model-value="onSharedChange"
      />

      <q-select
        v-if="form.isShared"
        filled
        v-model="form.splitRatio"
        :options="splitRatioOptions"
        label="Tỷ lệ chia"
        emit-value
        map-options
        hint="Tự động lấy theo danh mục nếu có, hoặc chọn tùy chỉnh."
        class="q-mt-sm"
      />

      <q-btn label="Lưu khoản này" type="submit" color="primary" class="full-width q-mt-lg" />
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar, QForm } from 'quasar';
import { useCategoryStore } from 'src/stores/categoryStore';
import { useTransactionStore } from 'src/stores/transactionStore';
import { type NewTransactionData } from 'src/models/index';
import { dayjs } from 'src/boot/dayjs';
import TablerIcon from 'src/components/Common/TablerIcon.vue'; // Import component icon

const $q = useQuasar();
const categoryStore = useCategoryStore();
const transactionStore = useTransactionStore();

// --- User Management (Mock for now) ---
interface User {
  id: string;
  name: string;
}

const mockUsers = ref<User[]>([
  { id: 'user_1_chong', name: 'Chồng' },
  { id: 'user_2_vo', name: 'Vợ' },
  // Add more users here if needed for testing
]);

const currentUser = ref<User | undefined>(mockUsers.value[0]); // Assume first user is the default
// --- End User Management ---

const entryForm = ref<QForm | null>(null);
const form = ref({
  categoryId: null as string | null,
  date: dayjs().format('YYYY/MM/DD'), // Quasar default date format
  amount: null as number | null,
  note: '',
  payer: currentUser.value?.id as string | null, // Default to current user's ID
  isShared: false,
  splitRatio: '50/50', // Default or from category
  type: 'expense' as 'income' | 'expense', // Default
});

const pinnedCategories = computed(() => categoryStore.pinnedCategories);
const payerOptions = computed(() =>
  mockUsers.value.map(user => ({
    label: user.name,
    value: user.id,
  }))
);

const splitRatioOptions = computed(() => {
  const user1 = mockUsers.value[0];
  const user2 = mockUsers.value.length > 1 ? mockUsers.value[1] : null;

  const options = [{ label: '50/50', value: '50/50' }]; // General default
  if (user1) options.push({ label: `${user1.name} 100%`, value: `${user1.id}:100` });
  if (user2) options.push({ label: `${user2.name} 100%`, value: `${user2.id}:100` });
  if (user1 && user2) options.push({ label: `60/40 (${user1.name}/${user2.name})`, value: `${user1.id}:60;${user2.id}:40` });
  if (user1 && user2) options.push({ label: `40/60 (${user1.name}/${user2.name})`, value: `${user1.id}:40;${user2.id}:60` });
  return options;
});

// Task 3.3: Chuẩn bị options cho q-select (sẽ cải thiện với danh mục cha-con sau)
const categoryOptions = computed(() =>
  categoryStore.visibleCategories.map(cat => ({
    id: cat.id,
    name: `${cat.parentId ? '    ↳ ' : ''}${cat.name}`, // Basic indentation
  }))
);

const selectCategory = (categoryId: string) => {
  form.value.categoryId = categoryId;
  onCategorySelected(categoryId);
};

const onCategorySelected = (categoryId: string | null) => {
  if (categoryId) {
    const category = categoryStore.getCategoryById(categoryId);
    if (category && category.defaultSplitRatio && form.value.isShared) {
      form.value.splitRatio = category.defaultSplitRatio;
    } else if (form.value.isShared) {
      // Nếu là chi chung mà category không có defaultSplitRatio, có thể set một giá trị mặc định chung
      form.value.splitRatio = '50/50';
    }
  }
};

const onPayerChange = (payerId: string | null) => {
  if (payerId && !form.value.isShared) {
    // Nếu không phải chi chung, và đã chọn người chi, thì tỷ lệ là 100% cho người đó
    form.value.splitRatio = `${payerId}:100`;
  } else if (!payerId && !form.value.isShared) {
    // Nếu bỏ chọn người chi và không phải chi chung (trường hợp này ít xảy ra với radio)
    form.value.splitRatio = '50/50'; // Default to a valid string ratio
  }
};

const onSharedChange = (isShared: boolean) => {
  if (isShared) {
    // Khi tick "Chi chung", lấy tỷ lệ từ danh mục nếu có, hoặc set mặc định
    if (form.value.categoryId) {
      const category = categoryStore.getCategoryById(form.value.categoryId);
      if (category && category.defaultSplitRatio) {
        form.value.splitRatio = category.defaultSplitRatio;
      } else {
        form.value.splitRatio = '50/50'; // Default khi không có từ category
      }
    } else {
      form.value.splitRatio = '50/50'; // Default khi chưa chọn category
    }
  } else {
    // Khi bỏ tick "Chi chung", cập nhật lại tỷ lệ dựa trên người chi (nếu có)
    onPayerChange(form.value.payer);
  }
};

const resetForm = () => {
  form.value = {
    categoryId: null,
    date: dayjs().format('YYYY/MM/DD'),
    amount: null,
    note: '',
    payer: currentUser.value?.id ?? null, // Reset to current user's ID
    isShared: false,
    splitRatio: '50/50', // Reset to default
    type: 'expense', // Reset to default
  };
  // entryForm.value?.resetValidation(); // Reset validation status
  // Workaround for resetValidation not always working as expected with initial values
  if (entryForm.value) {
    entryForm.value.resetValidation();
    // Manually trigger re-validation if needed, or ensure components re-evaluate rules
  }
};

const onSubmit = async () => {
  if (!entryForm.value) return;

  const isValid = await entryForm.value.validate();

  if (isValid) {
    // Task 3.10: Logic lưu transaction
    const transactionData: NewTransactionData = {
      categoryId: form.value.categoryId as string, // Ensured by validation
      date: form.value.date, // string in YYYY/MM/DD format
      amount: form.value.amount as number, // Ensured by validation
      note: form.value.note,
      payer: form.value.payer, // string (userId) or null
      isShared: form.value.isShared,
      splitRatio: form.value.isShared ? form.value.splitRatio : (form.value.payer ? `${form.value.payer}:100` : null),
      type: form.value.type,
    };

    await transactionStore.addTransaction(transactionData);
    $q.notify({ type: 'positive', message: 'Đã lưu giao dịch!' });
    resetForm(); // Reset form after successful submission
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

</script>

<style scoped>
.q-scroll-area--horizontal .q-scrollarea__content {
  display: flex;
  flex-wrap: nowrap;
}
</style>

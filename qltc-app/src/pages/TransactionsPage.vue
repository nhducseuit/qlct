<template>
  <q-page padding>
    <!-- Header and Add Transaction Button -->
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5">Quản lý Giao dịch</div>
      <q-btn
        color="primary"
        icon="add_circle_outline"
        label="Thêm Giao dịch"
        @click="navigateToAddTransaction"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center q-my-xl">
      <q-spinner-dots color="primary" size="40px" />
      <p>Đang tải danh sách giao dịch...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="allTransactions.length === 0" class="text-center text-grey-7 q-mt-xl">
      <q-icon name="sym_o_receipt_long" size="3em" />
      <p>Chưa có giao dịch nào.</p>
      <p>Hãy bắt đầu bằng cách thêm một giao dịch mới.</p>
    </div>

    <!-- Transaction List -->
    <div v-else>
      <div v-for="group in groupedTransactions" :key="group.date" class="q-mb-lg">
        <q-item-label header class="bg-grey-2 q-py-sm q-px-md rounded-borders">
          {{ formatDate(group.date, 'dddd, DD MMMM YYYY') }}
        </q-item-label>
        <q-list bordered separator>
          <q-item
            v-for="transaction in group.transactions"
            :key="transaction.id"
            clickable
            v-ripple
            @click="openEditTransactionDialog(transaction)"
          >
            <q-item-section avatar>
              <q-avatar
                :color="transaction.type === 'income' ? 'green-6' : 'red-6'"
                text-color="white"
                :icon="transaction.type === 'income' ? 'arrow_upward' : 'arrow_downward'"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label :lines="1">{{ getCategoryName(transaction.categoryId) || 'Không có danh mục' }}</q-item-label>
              <q-item-label caption :lines="1">{{ transaction.note || 'Không có ghi chú' }}</q-item-label>
              <q-item-label caption :lines="1">
                Người chi/nhận: {{ getMemberName(transaction.payer) || 'N/A' }}
                <q-badge v-if="transaction.isShared" color="info" label="Chi chung" class="q-ml-sm" />
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              <q-item-label class="text-weight-medium" :class="transaction.type === 'income' ? 'text-green-7' : 'text-red-7'">
                {{ formatCurrency(transaction.amount) }}
              </q-item-label>
              <!-- Date is now in the group header, can remove from item if desired -->
              <!-- <q-item-label caption>{{ formatDate(transaction.date) }}</q-item-label> -->
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                @click.stop="confirmDeleteTransaction(transaction.id, transaction.note)"
                class="q-mt-xs"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useTransactionStore } from 'src/stores/transactionStore';
import { useCategoryStore } from 'src/stores/categoryStore';
import { useHouseholdMemberStore } from 'src/stores/householdMemberStore';
import type { Transaction } from 'src/models';
import { dayjs } from 'src/boot/dayjs';
import { formatCurrency } from 'src/utils/formatters'; // Assuming you have or will create this
import TransactionFormDialog from 'src/components/Transaction/TransactionFormDialog.vue'; // Import the dialog
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();
const transactionStore = useTransactionStore();
const categoryStore = useCategoryStore();
const householdMemberStore = useHouseholdMemberStore();

const loading = ref(false);
const allTransactions = computed(() => transactionStore.transactions); // Keep original sorted list

const navigateToAddTransaction = () => {
  void router.push({ name: 'QuickEntry' }); // Assuming 'QuickEntry' is the route name for QuickEntryForm.vue
};

const openEditTransactionDialog = (transactionToEdit: Transaction) => {
  $q.dialog({
    component: TransactionFormDialog,
    componentProps: {
      editingTransaction: transactionToEdit,
    },
  }).onOk((formData) => {
    // formData will have the structure of the form in TransactionFormDialog
    // We need to ensure it matches UpdateTransactionPayload
    // The transactionStore.updateTransaction expects an ID and the update payload
    console.log('Dialog OK, formData:', formData);
    transactionStore.updateTransaction(transactionToEdit.id, formData as Partial<Transaction>)
    .catch(error => {
      // Error notification is handled in the store
      console.error('Failed to update transaction from dialog:', error);
    });
  });
};

const confirmDeleteTransaction = (transactionId: string, transactionNote?: string | null) => {
  const noteDisplay = transactionNote ? `"${transactionNote}"` : 'giao dịch này';
  $q.dialog({
    title: 'Xác nhận Xóa',
    message: `Bạn có chắc chắn muốn xóa ${noteDisplay}? Hành động này không thể hoàn tác.`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Xóa',
      color: 'negative',
    },
  }).onOk(() => {
    transactionStore.deleteTransaction(transactionId)
    .catch(error => {
      // Error notification is handled in the store
      console.error('Failed to delete transaction from page:', error);
    });
  });
};

const getCategoryName = (categoryId: string | null | undefined): string => {
  if (!categoryId) return 'Không xác định';
  return categoryStore.getCategoryById(categoryId)?.name || categoryId;
};

const getMemberName = (memberId: string | null | undefined): string => {
  if (!memberId) return 'Không xác định';
   return householdMemberStore.getMemberById(memberId)?.person?.name || memberId;
};

const formatDate = (dateString: string, format = 'DD/MM/YYYY'): string => {
  return dayjs(dateString).format(format);
};

interface GroupedTransaction {
  date: string; // Date string for the group header (e.g., 'YYYY-MM-DD')
  transactions: Transaction[];
}

const groupedTransactions = computed<GroupedTransaction[]>(() => {
  const groups: Record<string, Transaction[]> = {};

  // Group by date (YYYY-MM-DD)
  allTransactions.value.forEach(tx => {
    const dateKey = dayjs(tx.date).format('YYYY-MM-DD');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(tx);
  });

  // Convert to array and sort transactions within each group by payer name
  return Object.keys(groups)
    .sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf()) // Sort date groups descending
    .map(dateKey => {
      const transactionsInGroup = groups[dateKey]!.sort((a, b) => {
        const nameA = getMemberName(a.payer) || '';
        const nameB = getMemberName(b.payer) || '';
        return nameA.localeCompare(nameB);
      });
      return { date: dateKey, transactions: transactionsInGroup };
    });
});

onMounted(() => {
  // Stores should already be loading their data on app init or auth change.
  // We can add a loading flag if needed for initial display.
  if (transactionStore.transactions.length === 0) {
    loading.value = true; // Set loading to true while data is being fetched
    // Use nextTick to ensure UI updates before potentially long-running async operations
    void nextTick(async () => {
      // Ensure dependent stores are also loaded if not already
      await transactionStore.loadTransactions(); // Explicitly load transactions for this page
      if (categoryStore.categories.length === 0) await categoryStore.loadCategories();
      if (householdMemberStore.members.length === 0) await householdMemberStore.loadMembers();
      loading.value = false;
    });
  }
});
</script>

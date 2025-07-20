
<template>
  <div>
    <q-select
      v-model="selectedPersonId"
      :options="personOptions"
      label="Chọn người xem số dư"
      option-label="name"
      option-value="id"
      emit-value
      map-options
      dense outlined class="q-mb-md"
      @update:model-value="fetchBalances"
    />
    <q-input
      v-model="selectedMonth"
      label="Đến hết tháng"
      mask="####-##"
      fill-mask="0"
      :rules="[val => !val || /^\d{4}-\d{2}$/.test(val) || 'Định dạng tháng không hợp lệ']"
      @update:model-value="fetchBalances"
      hint="Chọn tháng (YYYY-MM)"
      placeholder="YYYY-MM"
      dense outlined class="q-mb-md"
    />
    <div v-if="!selectedPersonId" class="text-grey q-mt-md">
      Vui lòng chọn người để xem số dư.
    </div>
    <div v-else>
      <div v-for="row in balancesTyped" :key="row.counterpartyId" class="q-mb-md">
        <template v-if="row.amount > 0">
          <b>{{ row.personName }}</b> cần trả <b>{{ row.counterpartyName }}</b> <b>{{ formatCurrency(row.amount) }}</b>
        </template>
        <template v-else-if="row.amount < 0">
          <b>{{ row.personName }}</b> cho mượn <b>{{ row.counterpartyName }}</b> <b>{{ formatCurrency(Math.abs(row.amount)) }}</b>
        </template>
        <template v-else>
          Đã thanh toán xong giữa <b>{{ row.personName }}</b> và <b>{{ row.counterpartyName }}</b>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSettlementStore } from 'src/stores/settlementStore';
import { formatCurrency as _formatCurrency } from 'src/utils/formatters';


const store = useSettlementStore();
const selectedPersonId = ref<string | null>(null);
const selectedMonth = ref<string | null>(null); // format: 'YYYY-MM'

const personOptions = computed(() => store.accessiblePersons ?? []);
interface BalanceRow {
  personId: string;
  personName: string;
  amount: number;
  counterpartyId: string;
  counterpartyName: string;
}
const balancesTyped = computed<BalanceRow[]>(() => store.balances as BalanceRow[]);

// Expose formatCurrency to template
function formatCurrency(amount: number) {
  return _formatCurrency(amount);
}

//eslint-disable-next-line @typescript-eslint/no-unused-vars
const columns = [
  { name: 'counterparty', label: 'Đối tác', field: 'counterpartyName' },
  { name: 'amount', label: 'Số dư', field: 'amount', align: 'right' as const },
];


function getEndOfMonthISOString(month: string | null): string | undefined {
  if (!month) return undefined;
  // month: 'YYYY-MM' => last day of month, 23:59:59.999Z
  const [year, m] = month.split('-').map(Number);
  if (!year || !m) return undefined;
  const date = new Date(Date.UTC(year, m, 0, 23, 59, 59, 999));
  return date.toISOString();
}

async function fetchBalances() {
  if (selectedPersonId.value) {
    const untilDate = getEndOfMonthISOString(selectedMonth.value);
    await store.loadBalances(selectedPersonId.value, untilDate);
  }
}

onMounted(async () => {
  await store.loadAccessiblePersons();
});
</script>

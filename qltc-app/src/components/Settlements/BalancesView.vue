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
      dense
      outlined
      class="q-mb-md"
      @update:model-value="fetchBalances"
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

async function fetchBalances() {
  if (selectedPersonId.value) {
    await store.loadBalances(selectedPersonId.value);
  }
}

onMounted(async () => {
  await store.loadAccessiblePersons();
});
</script>

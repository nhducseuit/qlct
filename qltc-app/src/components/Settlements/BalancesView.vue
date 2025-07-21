

<template>
  <div>
    <div class="q-mb-md text-body2 text-primary">
      Chọn hai người và thời gian để xem số dư giữa họ. Số dương: Người 1 cho mượn Người 2. Số âm: Người 1 nợ Người 2.
    </div>
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-3">
        <q-select
          v-model="selectedYear"
          :options="yearOptions"
          label="Năm"
          dense outlined emit-value map-options
          @update:model-value="onYearOrMonthChange"
        />
      </div>
      <div class="col-3">
        <q-select
          v-model="selectedMonth"
          :options="monthOptions"
          label="Tháng"
          dense outlined emit-value map-options
          @update:model-value="onYearOrMonthChange"
        />
      </div>
      <div class="col-3">
        <q-select
          v-model="personOneId"
          :options="personOptions"
          label="Người 1"
          option-label="name"
          option-value="id"
          emit-value map-options dense outlined
        />
      </div>
      <div class="col-3">
        <q-select
          v-model="personTwoId"
          :options="personTwoOptions"
          label="Người 2"
          option-label="name"
          option-value="id"
          emit-value map-options dense outlined
        />
      </div>
    </div>
    <q-btn color="primary" label="Thêm" class="q-mb-md" :disable="!canAdd" @click="addBalanceQuery" />

    <div v-if="balancesList.length === 0" class="text-grey q-mt-md">
      Chưa có cặp số dư nào được chọn.
    </div>
    <div v-else>
      <div v-for="item in balancesList" :key="item.key" class="q-mb-md">
        <template v-if="item.loading">
          <q-spinner size="20px" color="primary" /> Đang tải số dư...
        </template>
        <template v-else-if="item.error">
          <q-icon name="error" color="negative" /> {{ item.error }}
        </template>
        <template v-else-if="item.balance !== null">
          <div v-if="item.balance > 0">
            <b>{{ item.personOneName }}</b> nợ <b>{{ item.personTwoName }}</b> <b>{{ formatCurrency(item.balance) }}</b>
          </div>
          <div v-else-if="item.balance < 0">
            <b>{{ item.personTwoName }}</b> nợ <b>{{ item.personOneName }}</b> <b>{{ formatCurrency(Math.abs(item.balance)) }}</b>
          </div>
          <div v-else>
            Đã thanh toán xong giữa <b>{{ item.personOneName }}</b> và <b>{{ item.personTwoName }}</b>
          </div>
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
const personOneId = ref<string | null>(null);
const personTwoId = ref<string | null>(null);
const selectedYear = ref<number>(new Date().getFullYear());
const selectedMonth = ref<number>(new Date().getMonth() + 1);

const yearOptions = Array.from({ length: 6 }, (_, i) => {
  const y = new Date().getFullYear() - 2 + i;
  return { label: y.toString(), value: y };
});
const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: (i + 1).toString(), value: i + 1 }));

const personOptions = computed(() => store.accessiblePersons ?? []);
const personTwoOptions = computed(() => personOptions.value.filter(p => p.id !== personOneId.value));

interface BalancesListItem {
  key: string;
  personOneId: string;
  personTwoId: string;
  year: number;
  month: number;
  personOneName: string;
  personTwoName: string;
  loading: boolean;
  error: string | null;
  balance: number | null;
}

const balancesList = ref<BalancesListItem[]>([]);

function onYearOrMonthChange() {
  balancesList.value = [];
}

const canAdd = computed(() => {
  return !!personOneId.value && !!personTwoId.value && personOneId.value !== personTwoId.value && !!selectedYear.value && !!selectedMonth.value;
});

function formatCurrency(amount: number) {
  return _formatCurrency(amount);
}

async function addBalanceQuery() {
  if (!canAdd.value) return;
  const key = `${personOneId.value}-${personTwoId.value}-${selectedYear.value}-${selectedMonth.value}`;
  if (balancesList.value.some(item => item.key === key)) return;
  const personOne = personOptions.value.find(p => p.id === personOneId.value);
  const personTwo = personOptions.value.find(p => p.id === personTwoId.value);
  const item: BalancesListItem = {
    key,
    personOneId: personOneId.value ?? '',
    personTwoId: personTwoId.value ?? '',
    year: selectedYear.value ?? 0,
    month: selectedMonth.value ?? 0,
    personOneName: personOne?.name || '',
    personTwoName: personTwo?.name || '',
    loading: true,
    error: null,
    balance: null,
  };
  balancesList.value.push(item);
  try {
    console.debug('[BalancesView] Fetching pair balance', {
      personOneId: personOneId.value,
      personTwoId: personTwoId.value,
      year: selectedYear.value,
      month: selectedMonth.value
    });
    const resp = await store.fetchPairBalance(personOneId.value!, personTwoId.value!, selectedYear.value, selectedMonth.value);
    console.debug('[BalancesView] Pair balance response', resp);
    // Replace item in balancesList to trigger reactivity
    const idx = balancesList.value.findIndex(i => i.key === item.key);
    if (idx !== -1) {
      balancesList.value[idx] = { ...item, balance: resp.balance, loading: false };
    }
  } catch (e) {
    let msg = 'Lỗi khi tải số dư';
    if (e && typeof e === 'object') {
      if ('message' in e && typeof (e as { message?: unknown }).message === 'string') {
        msg = (e as { message: string }).message;
      } else if ('response' in e && typeof (e as { response?: unknown }).response === 'object') {
        const resp = (e as { response?: { data?: { message?: unknown } } }).response;
        if (resp && resp.data && typeof resp.data.message === 'string') {
          msg = resp.data.message;
        }
      }
    }
    console.error('[BalancesView] Error fetching pair balance', e);
    const idx = balancesList.value.findIndex(i => i.key === item.key);
    if (idx !== -1) {
      balancesList.value[idx] = { ...item, error: msg, loading: false };
    }
  }
}

onMounted(async () => {
  await store.loadAccessiblePersons();
});
</script>

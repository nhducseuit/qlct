<template>
  <q-card class="q-my-md">
    <q-card-section>
      <div class="text-h6">Tổng hợp của {{ familyStore.selectedFamily?.name || 'gia đình bạn' }}</div>
      <div class="text-subtitle2">{{ periodLabel }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section v-if="loading">
      <div class="text-center">
        <q-spinner-dots color="primary" size="40px" />
        <p>Đang tải dữ liệu phân tích người...</p>
      </div>
    </q-card-section>

    <q-card-section v-else-if="error">
      <div class="text-negative text-center">
        <q-icon name="error_outline" size="md" />
        <p>{{ error }}</p>
      </div>
    </q-card-section>

    <q-card-section v-else-if="breakdownData && breakdownData.length > 0">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-card bordered flat>
            <q-card-section>
              <div class="text-subtitle1">Bảng phân tích</div>
            </q-card-section>
            <q-table
              :rows="tableRows"
              :columns="columns"
              row-key="personId"
              dense
              flat
              separator="cell"
              :pagination="{ rowsPerPage: 0 }"
              hide-bottom
            />
          </q-card>
        </div>
      </div>
      <div class="q-mt-md">
        <PersonCategoryBudgetCompareChart
          :data="summaryStore.personCategoryBudgetCompare"
          :loading="summaryStore.personCategoryBudgetCompareLoading"
          :error="summaryStore.personCategoryBudgetCompareError"
          :subTitle="periodLabel"
        />
      </div>
    </q-card-section>

    <q-card-section v-else>
      <div class="text-center text-grey-7">
        <q-icon name="sym_o_groups" size="md" />
        <p>Không có dữ liệu phân tích người cho kỳ này.</p>
        <p class="text-caption">Lưu ý: Phân tích người dựa trên các giao dịch có liên quan đến từng người.</p>
      </div>
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { formatKiloCurrency } from 'src/utils/formatters';
import { PeriodType } from 'src/models/summary';
import type { PersonBreakdownItemDto } from 'src/models/summary';
import type { QTableColumn } from 'quasar';
import PersonCategoryBudgetCompareChart from './PersonCategoryBudgetCompareChart.vue';
import { useSummaryStore } from 'src/stores/summaryStore';
import { useFamilyStore } from 'src/stores/familyStore';

interface Props {
  breakdownData: PersonBreakdownItemDto[] | null;
  loading: boolean;
  error: string | null;
  periodLabel: string;
  periodType: string;
  year?: number;
  month?: number;
  quarter?: number;
}

const props = defineProps<Props>();
const summaryStore = useSummaryStore();
const familyStore = useFamilyStore();

const columns: QTableColumn[] = [
  { name: 'personName', required: true, label: 'Người', align: 'left', field: 'personName', sortable: true, style: 'width: 40%' },
  { name: 'totalIncome', label: 'Tổng Thu', field: 'totalIncome', sortable: true, align: 'right', format: val => formatKiloCurrency(val), style: 'width: 30%' },
  { name: 'totalExpense', label: 'Tổng Chi', field: 'totalExpense', sortable: true, align: 'right', format: val => formatKiloCurrency(val), style: 'width: 30%' },
];

const tableRows = computed(() => {
  if (!props.breakdownData) return [];
  return props.breakdownData.map(item => ({
    ...item,
    totalIncome: item.totalIncome ?? 0,
    totalExpense: item.totalExpense ?? 0,
  }));
});

// Load category budget compare chart data when period changes
onMounted(() => {
  void summaryStore.loadPersonCategoryBudgetCompare(
    props.periodType as PeriodType || PeriodType.Yearly,
    props.year ? Number(props.year) : undefined,
    props.month ? Number(props.month) : undefined,
    props.quarter ? Number(props.quarter) : undefined,
    'expense',
  );
});

watch(
  () => [props.periodType, props.year, props.month, props.quarter],
  ([periodType, year, month, quarter]) => {
    void summaryStore.loadPersonCategoryBudgetCompare(
      periodType as PeriodType || PeriodType.Yearly,
      year ? Number(year) : undefined,
      month ? Number(month) : undefined,
      quarter ? Number(quarter) : undefined,
      'expense',
    );
  }
);

// Style block must be outside the script block
</script>
<style scoped>
.q-table th {
  font-weight: bold;
}
</style>

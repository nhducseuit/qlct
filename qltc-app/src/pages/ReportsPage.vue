<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Báo cáo Chi phí & Ngân sách</div>

    <!-- Global Filters -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="text-h6">Bộ lọc chung</div>
      </q-card-section>
      <q-card-section class="row q-col-gutter-md items-end">
        <!-- Year Selector -->
        <div class="col-12 col-md-3 col-sm-4">
          <q-select
            filled
            dense
            v-model="selectedYear"
            :options="yearOptions"
            label="Năm"
            emit-value
            map-options
          />
        </div>

        <!-- Month Selector (for Category Breakdown) -->
        <div class="col-12 col-md-3 col-sm-4">
          <q-select
            filled
            dense
            v-model="selectedMonthForDetail"
            :options="monthOptions"
            label="Tháng (cho chi tiết)"
            emit-value
            map-options
            clearable
            @update:model-value="onGlobalMonthChange"
          />
        </div>

        <!-- Category Selector (Global) -->
        <div class="col-12 col-md-4 col-sm-4">
          <q-select
            filled
            dense
            v-model="selectedCategoryIdsGlobal"
            :options="categoryFilterOptions"
            label="Danh mục"
            multiple
            emit-value
            map-options
            use-chips
            clearable
            options-dense
            :display-value="selectedCategoriesDisplayValue"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Apply Button -->
        <div class="col-12 col-md-2 col-sm-12">
          <q-btn
            color="primary"
            label="Xem báo cáo"
            @click="applyFiltersAndLoadReports"
            class="full-width"
            :loading="isLoadingAnyReport"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Reports Section -->
    <div>
      <!-- Chart 1: Monthly Budget vs Expense Trend -->
      <MonthlyBudgetExpenseTrendChart
        :trend-data="summaryStore.budgetTrend"
        :loading="summaryStore.budgetTrendLoading"
        :error="summaryStore.budgetTrendError"
        :sub-title="budgetTrendSubTitle"
        @month-selected="handleMonthSelectedFromTrend"
      />

      <!-- Chart 2 & Detail Table: Category Breakdown for Selected Month & Categories -->
      <CategoryBreakdownReport
        :breakdown-data="summaryStore.categoryBreakdown"
        :loading="summaryStore.categoryBreakdownLoading"
        :error="summaryStore.categoryBreakdownError"
        :period-label="categoryBreakdownPeriodLabel"
      />

      <!-- Collapsible Overall Totals Summary - REMOVED for now as per feedback to simplify -->
      <!--
      <q-expansion-item
        icon="sym_o_summarize"
        label="Tổng hợp Thu Chi Chung (Theo Năm)"
        class="q-mt-lg"
        header-class="bg-grey-2 text-primary text-weight-medium"
        default-closed
      >
        <TotalsSummaryReport
          :summary-data="summaryStore.totalsSummary"
          :loading="summaryStore.totalsSummaryLoading"
          :error="summaryStore.totalsSummaryError"
          :period-label="`Năm ${selectedYear}`"
        />
      </q-expansion-item>
      -->
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useSummaryStore } from 'src/stores/summaryStore';
import { useCategoryStore } from 'src/stores/categoryStore';
import { PeriodType } from 'src/models/summary';
// import TotalsSummaryReport from 'src/components/Reports/TotalsSummaryReport.vue'; // Removed for now
import CategoryBreakdownReport from 'src/components/Reports/CategoryBreakdownReport.vue';
import MonthlyBudgetExpenseTrendChart from 'src/components/Reports/MonthlyBudgetExpenseTrendChart.vue';
import { dayjs } from 'src/boot/dayjs';

const summaryStore = useSummaryStore();
const categoryStore = useCategoryStore();
const $q = useQuasar();

const currentYear = dayjs().year();
const currentMonth = dayjs().month() + 1; // 1-12

const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map(year => ({ label: String(year), value: year }));
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1).map(m => ({ label: `Tháng ${m}`, value: m }));

const selectedYear = ref<number>(currentYear);
const selectedCategoryIdsGlobal = ref<string[]>([]); // Global category filter

// State for the CategoryBreakdownReport (Chart 2 and its table)
const selectedMonthForDetail = ref<number | undefined>(currentMonth); // Driven by global month filter or trend chart click
const selectedYearForDetail = ref<number>(currentYear); // Primarily driven by global year filter

const categoryFilterOptions = computed(() =>
  categoryStore.visibleCategories
    .map(cat => ({
      label: cat.name,
      value: cat.id,
    })).sort((a,b) => a.label.localeCompare(b.label))
);

const selectedCategoriesDisplayValue = computed(() => {
  if (!selectedCategoryIdsGlobal.value || selectedCategoryIdsGlobal.value.length === 0) {
    return 'Tất cả danh mục';
  }
  if (selectedCategoryIdsGlobal.value.length === categoryFilterOptions.value.length) {
    return 'Tất cả danh mục';
  }
  if (selectedCategoryIdsGlobal.value.length === 1) {
    const found = categoryFilterOptions.value.find(opt => opt.value === selectedCategoryIdsGlobal.value[0]);
    return found?.label || '1 danh mục';
  }
  return `${selectedCategoryIdsGlobal.value.length} danh mục`;
});


const isLoadingAnyReport = computed(() =>
  // summaryStore.totalsSummaryLoading || // TotalsSummaryReport removed for now
  summaryStore.categoryBreakdownLoading ||
  summaryStore.budgetTrendLoading);

const categoryBreakdownPeriodLabel = computed(() => {
  if (!selectedMonthForDetail.value || !selectedYearForDetail.value) return 'Vui lòng chọn một tháng';
  return `Chi tiết cho Tháng ${selectedMonthForDetail.value}/${selectedYearForDetail.value}`;
});

const budgetTrendSubTitle = computed(() => {
  let sub = `Năm ${selectedYear.value}`;
  const trendCategories = selectedCategoryIdsGlobal.value || [];
  const filterOptionsCount = categoryFilterOptions.value.length;

  if (trendCategories.length > 0 && trendCategories.length < filterOptionsCount) {
    sub += ` (Lọc theo ${trendCategories.length} danh mục)`;
  } else if (trendCategories.length === 0 || trendCategories.length === filterOptionsCount) {
    sub += ' (Tất cả danh mục có ngân sách)';
  }
  return sub;
});

const loadDetailReports = async (year: number, month?: number) => {
  // This function will load the CategoryBreakdownReport data
  await summaryStore.loadCategoryBreakdown(
    PeriodType.Monthly,
    year,
    month,
    undefined, // quarter
    undefined, // parentCategoryId
    selectedCategoryIdsGlobal.value.length > 0 ? selectedCategoryIdsGlobal.value : undefined
  );
};

const handleMonthSelectedFromTrend = async (periodYYYYMM: string) => {
  console.log('Month selected from trend:', periodYYYYMM);
  const [yearStr, monthStr] = periodYYYYMM.split('-');
  const year = yearStr ? parseInt(yearStr, 10) : selectedYear.value; // Fallback to global year
  const month = monthStr ? parseInt(monthStr, 10) : undefined;

  selectedYearForDetail.value = year;
  selectedMonthForDetail.value = month; // Update the global month filter as well

  await loadDetailReports(year, month);
  $q.notify({ type: 'info', message: `Đang hiển thị chi tiết cho ${periodYYYYMM}`, position: 'top', timeout: 1500 });
};

// When global month filter changes, update detail year and reload detail reports
const onGlobalMonthChange = (newMonth: number | undefined | null) => {
  // newMonth can be null if q-select is cleared
  selectedMonthForDetail.value = newMonth === null ? undefined : newMonth;
  selectedYearForDetail.value = selectedYear.value; // Ensure detail year matches global year
  if (selectedMonthForDetail.value) { // Only load if a month is actually selected
    void loadDetailReports(selectedYearForDetail.value, selectedMonthForDetail.value);
  } else {
    // Optionally clear or show a placeholder for category breakdown if month is cleared
    summaryStore.categoryBreakdown = null;
  }
};

const applyFiltersAndLoadReports = async () => {
  selectedYearForDetail.value = selectedYear.value; // Sync detail year with global year
  // If global month is not set, but detail month was (e.g. from trend click), keep detail month.
  // Otherwise, if global month is cleared, detail month should also be cleared or defaulted.
  if (selectedMonthForDetail.value === undefined) {
      selectedMonthForDetail.value = currentMonth; // Default to current month if nothing is set
  }

  const promises = [
    // summaryStore.loadTotalsSummary(PeriodType.Yearly, selectedYear.value), // Removed for now
    loadDetailReports(selectedYearForDetail.value, selectedMonthForDetail.value),
    summaryStore.loadBudgetTrend(
      PeriodType.Monthly,
      selectedYear.value,
      selectedCategoryIdsGlobal.value.length > 0 ? selectedCategoryIdsGlobal.value : undefined
    )
  ];
  await Promise.all(promises);
};

onMounted(() => {
  if (categoryStore.categories.length === 0) {
    void categoryStore.loadCategories().then(() => {
      void applyFiltersAndLoadReports();
    });
  } else {
    void applyFiltersAndLoadReports();
  }
});
</script>

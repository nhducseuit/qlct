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
        <div class="col-12 col-md-2 col-sm-6 col-xs-12">
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
        <div class="col-12 col-md-2 col-sm-6 col-xs-12">
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
        <div class="col-12 col-md-3 col-sm-6 col-xs-12">
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

        <!-- Member Selector (Global) -->
        <div class="col-12 col-md-3 col-sm-6 col-xs-12">
          <q-select
            filled
            dense
            v-model="selectedMemberIdsGlobal"
            :options="memberFilterOptions"
            label="Thành viên"
            multiple
            emit-value
            map-options
            use-chips
            clearable
            options-dense
            :display-value="selectedMembersDisplayValue"
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

        <div class="col-12 col-md-4 col-sm-12 col-xs-12 row items-center q-gutter-md">
          <div class="col-12 col-sm-auto">
            <q-checkbox
              v-model="excludeIncomeFilter"
              label="Loại trừ thu nhập"
              dense
            />
          </div>
          <div class="col row q-gutter-sm">
            <!-- Apply Button -->
            <div class="col">
              <q-btn
                color="primary"
                label="Xem báo cáo"
                @click="applyFiltersAndLoadReports"
                class="full-width"
                :loading="isLoadingAnyReport"
              />
            </div>
            <!-- Export PDF Button (Placeholder) -->
            <div class="col-auto">
              <q-btn
                flat
                icon="sym_o_picture_as_pdf"
                @click="exportReportToPdf"
                :disabled="isLoadingAnyReport"            >
                <q-tooltip>Xuất PDF</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Reports Section -->
    <div id="report-content-to-export">
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

      <!-- New Report: Member Breakdown -->
      <q-expansion-item
        icon="sym_o_groups"
        label="Phân tích theo Thành viên"
        caption="Xem chi tiết thu chi theo từng thành viên"
        class="q-mt-lg shadow-1"
        header-class="bg-grey-2 text-primary text-weight-medium rounded-borders"
        default-closed
      >
        <MemberBreakdownReport
          :breakdown-data="summaryStore.memberBreakdown"
          :loading="summaryStore.memberBreakdownLoading"
          :error="summaryStore.memberBreakdownError"
          :period-label="memberBreakdownPeriodLabel"
        />
      </q-expansion-item>
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
import { useHouseholdMemberStore } from 'src/stores/householdMemberStore'; // Import member store
import { PeriodType } from 'src/models/summary';
// import TotalsSummaryReport from 'src/components/Reports/TotalsSummaryReport.vue'; // Removed for now
import CategoryBreakdownReport from 'src/components/Reports/CategoryBreakdownReport.vue';
import MonthlyBudgetExpenseTrendChart from 'src/components/Reports/MonthlyBudgetExpenseTrendChart.vue';
import jsPDF from 'jspdf'; // Import HTMLOptions for better typing
import html2canvas from 'html2canvas';
import MemberBreakdownReport from 'src/components/Reports/MemberBreakdownReport.vue'; // Import new component
import { dayjs } from 'src/boot/dayjs';

const summaryStore = useSummaryStore();
const categoryStore = useCategoryStore();
const householdMemberStore = useHouseholdMemberStore(); // Use member store
const $q = useQuasar();

const pdfExportLoading = ref(false);

const currentYear = dayjs().year();
const currentMonth = dayjs().month() + 1; // 1-12

const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map(year => ({ label: String(year), value: year }));
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1).map(m => ({ label: `Tháng ${m}`, value: m }));

const selectedYear = ref<number>(currentYear);
const selectedCategoryIdsGlobal = ref<string[]>([]); // Global category filter
const selectedMemberIdsGlobal = ref<string[]>([]);   // Global member filter

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

const memberFilterOptions = computed(() =>
  householdMemberStore.members
    .filter(m => m.isActive)
    .map(member => ({
      label: member.name,
      value: member.id,
    })).sort((a,b) => a.label.localeCompare(b.label))
);

const selectedMembersDisplayValue = computed(() => {
  if (!selectedMemberIdsGlobal.value || selectedMemberIdsGlobal.value.length === 0) {
    return 'Tất cả thành viên';
  }
  if (selectedMemberIdsGlobal.value.length === memberFilterOptions.value.length) {
    return 'Tất cả thành viên';
  }
  return `${selectedMemberIdsGlobal.value.length} thành viên`;
});

const isLoadingAnyReport = computed(() =>
  // summaryStore.totalsSummaryLoading || // TotalsSummaryReport removed for now
  summaryStore.categoryBreakdownLoading ||
  summaryStore.budgetTrendLoading ||
  summaryStore.memberBreakdownLoading ||
  pdfExportLoading.value); // Include PDF export loading state

const categoryBreakdownPeriodLabel = computed(() => {
  if (!selectedMonthForDetail.value || !selectedYearForDetail.value) return 'Vui lòng chọn một tháng';
  return `Chi tiết cho Tháng ${selectedMonthForDetail.value}/${selectedYearForDetail.value}`;
});

const budgetTrendSubTitle = computed(() => {
  let sub = `Năm ${selectedYear.value}`;
  const trendCategories = selectedCategoryIdsGlobal.value || [];
  const trendMembers = selectedMemberIdsGlobal.value || [];
  const filterOptionsCount = categoryFilterOptions.value.length;

  if (trendCategories.length > 0 && trendCategories.length < filterOptionsCount) {
    sub += ` (Lọc theo ${trendCategories.length} danh mục)`;
    if (trendMembers.length > 0 && trendMembers.length < memberFilterOptions.value.length) {
      sub += `, ${trendMembers.length} thành viên)`;
    } else sub += ')';
  } else if (trendCategories.length === 0 || trendCategories.length === filterOptionsCount) {
    sub += ' (Tất cả danh mục có ngân sách)';
  }
  return sub;
});

const memberBreakdownPeriodLabel = computed(() => { // Label for the new report
  if (!selectedMonthForDetail.value || !selectedYearForDetail.value) return 'Vui lòng chọn một tháng';
  return `Phân tích thành viên cho Tháng ${selectedMonthForDetail.value}/${selectedYearForDetail.value}`;
});

const excludeIncomeFilter = ref<boolean>(true); // Default to excluding income

const loadDetailReports = async (year: number, month?: number, quarter?: number) => {
  const periodType = PeriodType.Monthly; // Assuming details are always monthly for now

  const promises = [
    summaryStore.loadCategoryBreakdown(
      periodType,
      year,
      month,
      quarter,
      undefined, // parentCategoryId
      selectedCategoryIdsGlobal.value.length > 0 ? selectedCategoryIdsGlobal.value : undefined,
      selectedMemberIdsGlobal.value.length > 0 ? selectedMemberIdsGlobal.value : undefined // Pass selected members
      , excludeIncomeFilter.value ? 'expense' : 'all' // Pass transaction type filter
    ),
    summaryStore.loadMemberBreakdown(
        periodType, year, month, quarter,
        selectedMemberIdsGlobal.value.length > 0 ? selectedMemberIdsGlobal.value : undefined,
        excludeIncomeFilter.value ? 'expense' : 'all' // Pass transaction type filter
      )
  ];
  await Promise.all(promises);
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
    loadDetailReports(selectedYearForDetail.value, selectedMonthForDetail.value, undefined), // Pass undefined for quarter
    summaryStore.loadBudgetTrend(
      PeriodType.Monthly,
      selectedYear.value,
      selectedCategoryIdsGlobal.value.length > 0 ? selectedCategoryIdsGlobal.value : undefined,
      selectedMemberIdsGlobal.value.length > 0 ? selectedMemberIdsGlobal.value : undefined, // Pass selected members
      excludeIncomeFilter.value ? 'expense' : 'all' // Pass transaction type filter
    )
  ];
  await Promise.all(promises);
};

const exportReportToPdf = async () => { // Make async
  const reportContentElement = document.getElementById('report-content-to-export');
  if (!reportContentElement) {
    $q.notify({ type: 'negative', message: 'Không tìm thấy nội dung báo cáo để xuất.' });
    return;
  }

  // Add a class to apply print-friendly styles
  reportContentElement.classList.add('pdf-export-mode');


  pdfExportLoading.value = true;
  $q.loading.show({
    message: 'Đang tạo file PDF...',
  });

  try {
    // Allow DOM to update with the new class
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for re-render

    const canvas = await html2canvas(reportContentElement, {
      scale: 1.5, // REDUCED scale for smaller file size, adjust as needed (1 or 1.5)
      useCORS: true, // If you have external images/resources
      logging: true, // For debugging
      // windowWidth: 800, // Experiment with forcing a width if layout is still too wide
    });

    const imgData = canvas.toDataURL('image/png');
    // const imgData = canvas.toDataURL('image/jpeg', 0.7); // ALTERNATIVE: JPEG for smaller size but lossy

    const pdf = new jsPDF({
      orientation: 'p', // portrait
      unit: 'pt', // points
      format: 'a4', // A4 paper
    });

    const pageMargin = 40; // Points
    const pdfWidth = pdf.internal.pageSize.getWidth() - (pageMargin * 2);
    const pdfHeight = pdf.internal.pageSize.getHeight() - (pageMargin * 2);

    const imgProps = pdf.getImageProperties(imgData);
    const aspectRatio = imgProps.width / imgProps.height;

    const imgRenderHeight = pdfWidth / aspectRatio;
    const currentPosition = pageMargin;

    if (imgRenderHeight <= pdfHeight) {
      // Image fits on one page (or less)
      pdf.addImage(imgData, 'PNG', pageMargin, currentPosition, pdfWidth, imgRenderHeight);
    } else {
      // Image is taller than one page, needs pagination
      let remainingImgHeight = imgProps.height;
      let srcY = 0; // Y-coordinate in the source canvas

      while (remainingImgHeight > 0) {
        const pageChunkHeight = Math.min(remainingImgHeight, (pdfHeight / pdfWidth) * imgProps.width);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgProps.width;
        pageCanvas.height = pageChunkHeight;
        const ctx = pageCanvas.getContext('2d');
        ctx?.drawImage(canvas, 0, srcY, imgProps.width, pageChunkHeight, 0, 0, imgProps.width, pageChunkHeight);

        const pageImgData = pageCanvas.toDataURL('image/png');
        pdf.addImage(pageImgData, 'PNG', pageMargin, pageMargin, pdfWidth, pdfHeight * (pageChunkHeight / ((pdfHeight / pdfWidth) * imgProps.width)) ); // Scale to fit page height if chunk is smaller

        remainingImgHeight -= pageChunkHeight;
        srcY += pageChunkHeight;
        if (remainingImgHeight > 0) {
          pdf.addPage();
        }
      }
    }

    const filename = `BaoCao_${selectedYear.value}${selectedMonthForDetail.value ? `_T${selectedMonthForDetail.value}` : ''}_${dayjs().format('YYYYMMDDHHmmss')}.pdf`;
    pdf.save(filename);
    $q.notify({ type: 'positive', message: 'Đã xuất báo cáo thành công!' });
  } catch (error) {
    console.error('Lỗi khi xuất PDF:', error);
    $q.notify({ type: 'negative', message: 'Có lỗi xảy ra khi xuất PDF.' });
  } finally {
    reportContentElement.classList.remove('pdf-export-mode'); // Clean up class
    pdfExportLoading.value = false;
    $q.loading.hide();
  }
};

onMounted(() => {
  const initialLoadPromises = [];
  if (categoryStore.categories.length === 0) {
    initialLoadPromises.push(categoryStore.loadCategories());
  }
  if (householdMemberStore.members.length === 0) {
    initialLoadPromises.push(householdMemberStore.loadMembers());
  }

  Promise.all(initialLoadPromises)
    .catch(error => {
      // Individual store actions usually have their own $q.notify for errors.
      // This catch is for any unhandled rejection from Promise.all itself.
      console.error('Error during initial data loading for reports page:', error);
      // Optionally, show a general error notification if needed:
      // $q.notify({ type: 'negative', message: 'Lỗi tải dữ liệu ban đầu cho trang báo cáo.' });
    })
    .finally(() => {
      void applyFiltersAndLoadReports(); // Explicitly ignore the promise
    });
});
</script>

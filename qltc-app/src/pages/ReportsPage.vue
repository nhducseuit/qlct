<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Báo cáo Chi phí & Ngân sách</div>

    <!-- Global Filters -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="text-h6">Bộ lọc chung</div>
      </q-card-section>
      <q-card-section class="row q-col-gutter-md items-end">
        <!-- Family Selector -->
        <div class="col-12 col-md-3 col-sm-6 col-xs-12">
          <q-select
            filled
            dense
            v-model="selectedFamilyId"
            :options="familyOptions"
            label="Gia đình"
            emit-value
            map-options
            @update:model-value="onFamilyChange"
          />
        </div>
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

        <div class="col-12 col-md-4 col-sm-12 col-xs-12 row items-end q-gutter-x-md q-gutter-y-sm">
          <div class="col-12 col-sm-auto column">
            <q-checkbox
              v-model="excludeIncomeFilter"
              label="Loại trừ thu nhập"
              dense
            />
          </div>
          <div class="col row q-gutter-sm items-center justify-end">
            <!-- Apply Button -->
            <div class="col-auto">
              <q-btn
                color="primary"
                label="Xem báo cáo"
                @click="applyFiltersAndLoadReports"
                class=""
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
        :selected-member-ids-global="selectedMemberIdsGlobal"
        :exclude-income-filter="excludeIncomeFilter"
        :period-label="categoryBreakdownPeriodLabel"
      />

      <!-- Member Breakdown Report -->
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
      <!-- Person Breakdown Report (only for user's own family, below member breakdown) -->
      <q-expansion-item
        v-if="isUserFamily"
        icon="sym_o_person"
        :label="`Tổng hợp của ${familyStore.selectedFamily?.name || 'gia đình bạn'}`"
        caption="Xem tổng chi tiêu"
        class="q-mt-lg shadow-1"
        header-class="bg-grey-2 text-primary text-weight-medium rounded-borders"
        default-closed
      >
        <PersonBreakdownReport
          :breakdown-data="summaryStore.personBreakdown"
          :loading="summaryStore.personBreakdownLoading"
          :error="summaryStore.personBreakdownError"
          :period-label="memberBreakdownPeriodLabel"
          :period-type="PeriodType.Monthly"
          :year="selectedYearForDetail"
          v-bind="selectedMonthForDetail !== undefined ? { month: selectedMonthForDetail } : {}"
        />
      </q-expansion-item>
      <!-- Collapsible Overall Totals Summary - REMOVED for now as per feedback to simplify -->
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useSummaryStore } from 'src/stores/summaryStore';
import { useCategoryStore } from 'src/stores/categoryStore';
import { useHouseholdMemberStore } from 'src/stores/householdMemberStore';
import { PeriodType } from 'src/models/summary';
import CategoryBreakdownReport from 'src/components/Reports/CategoryBreakdownReport.vue';
import MonthlyBudgetExpenseTrendChart from 'src/components/Reports/MonthlyBudgetExpenseTrendChart.vue';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import MemberBreakdownReport from 'src/components/Reports/MemberBreakdownReport.vue';
import { dayjs } from 'src/boot/dayjs';
import PersonBreakdownReport from 'src/components/Reports/PersonBreakdownReport.vue';
import { useFamilyStore } from 'src/stores/familyStore';
import { useAuthStore } from 'src/stores/authStore';

const summaryStore = useSummaryStore();
const categoryStore = useCategoryStore();
const householdMemberStore = useHouseholdMemberStore();
const familyStore = useFamilyStore();
const $q = useQuasar();
const authStore = useAuthStore();

// Family filter state
const selectedFamilyId = ref<string | null>(familyStore.selectedFamilyId || null);

const familyOptions = computed(() =>
  familyStore.families.map(f => ({ label: f.name, value: f.id }))
);

function onFamilyChange(newFamilyId: string | null) {
  if (newFamilyId) {
    familyStore.selectedFamilyId = newFamilyId;
    void categoryStore.loadCategories();
    void householdMemberStore.loadMembers();
    selectedCategoryIdsGlobal.value = [];
    selectedMemberIdsGlobal.value = [];
    void applyFiltersAndLoadReports();
  }
}

const pdfExportLoading = ref(false);

const currentYear = dayjs().year();
const currentMonth = dayjs().month() + 1;

const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map(year => ({ label: String(year), value: year }));
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1).map(m => ({ label: `Tháng ${m}`, value: m }));

const selectedYear = ref<number>(currentYear);
const selectedCategoryIdsGlobal = ref<string[]>([]);
const selectedMemberIdsGlobal = ref<string[]>([]);
const selectedMonthForDetail = ref<number | undefined>(currentMonth);
const selectedYearForDetail = ref<number>(currentYear);

const categoryFilterOptions = computed(() =>
  categoryStore.visibleCategories
    .filter(cat => cat.familyId === selectedFamilyId.value)
    .map(cat => ({
      label: cat.name,
      value: cat.id,
    })).sort((a,b) => (a.label ?? '').localeCompare(b.label ?? ''))
);

function getSelectedCategoryIdsForFamily() {
  const validCategoryIds = categoryStore.visibleCategories
    .filter(cat => cat.familyId === selectedFamilyId.value)
    .map(cat => cat.id);
  return selectedCategoryIdsGlobal.value.filter(id => validCategoryIds.includes(id));
}

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
    .filter(m => m.isActive && m.familyId === selectedFamilyId.value)
    .map(member => ({
      label: member.person?.name ?? '',
      value: member.id,
    })).sort((a,b) => (a.label ?? '').localeCompare(b.label ?? ''))
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
  summaryStore.categoryBreakdownLoading ||
  summaryStore.budgetTrendLoading ||
  summaryStore.memberBreakdownLoading ||
  pdfExportLoading.value);

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

const memberBreakdownPeriodLabel = computed(() => {
  if (!selectedMonthForDetail.value || !selectedYearForDetail.value) return 'Vui lòng chọn một tháng';
  return `Phân tích thành viên cho Tháng ${selectedMonthForDetail.value}/${selectedYearForDetail.value}`;
});

const excludeIncomeFilter = ref<boolean>(true);

const isUserFamily = computed(() => {
  return !!(selectedFamilyId.value && authStore.user?.familyId && selectedFamilyId.value === authStore.user.familyId);
});

const loadDetailReports = async (year: number, month?: number, quarter?: number) => {
  const periodType = PeriodType.Monthly;
  const allMemberIds = householdMemberStore.members
    .filter(m => m.isActive && m.familyId === selectedFamilyId.value)
    .map(m => m.id);
  const memberIdsToSend = selectedMemberIdsGlobal.value && selectedMemberIdsGlobal.value.length > 0
    ? selectedMemberIdsGlobal.value
    : allMemberIds;
  const promises = [
    summaryStore.loadCategoryBreakdown(
      '',
      periodType,
      year,
      month,
      quarter,
      undefined,
      getSelectedCategoryIdsForFamily().length > 0 ? getSelectedCategoryIdsForFamily() : undefined,
      memberIdsToSend,
      excludeIncomeFilter.value ? 'expense' : 'all',
    ),
    summaryStore.loadMemberBreakdown(
      periodType,
      year,
      month,
      quarter,
      memberIdsToSend,
      excludeIncomeFilter.value ? 'expense' : 'all',
    ),
    (selectedFamilyId.value && familyStore.selectedFamilyId && selectedFamilyId.value === familyStore.selectedFamilyId)
      ? summaryStore.loadPersonBreakdown(
          periodType,
          year,
          month,
          quarter,
          excludeIncomeFilter.value ? 'expense' : 'all',
        )
      : Promise.resolve(),
  ];
  await Promise.all(promises);
};

const handleMonthSelectedFromTrend = async (periodYYYYMM: string) => {
  const [yearStr, monthStr] = periodYYYYMM.split('-');
  const year = yearStr ? parseInt(yearStr, 10) : selectedYear.value;
  const month = monthStr ? parseInt(monthStr, 10) : undefined;
  selectedYearForDetail.value = year;
  selectedMonthForDetail.value = month;
  await loadDetailReports(year, month);
  $q.notify({ type: 'info', message: `Đang hiển thị chi tiết cho ${periodYYYYMM}`, position: 'top', timeout: 1500 });
};

const onGlobalMonthChange = (newMonth: number | undefined | null) => {
  selectedMonthForDetail.value = newMonth === null ? undefined : newMonth;
  selectedYearForDetail.value = selectedYear.value;
  if (selectedMonthForDetail.value) {
    void loadDetailReports(selectedYearForDetail.value, selectedMonthForDetail.value);
  } else {
    summaryStore.categoryBreakdown = null;
  }
};

const applyFiltersAndLoadReports = async () => {
  selectedYearForDetail.value = selectedYear.value;
  if (selectedMonthForDetail.value === undefined) {
      selectedMonthForDetail.value = currentMonth;
  }
  const promises = [
    loadDetailReports(selectedYearForDetail.value, selectedMonthForDetail.value, undefined),
    summaryStore.loadBudgetTrend(
      PeriodType.Monthly,
      selectedYear.value,
      getSelectedCategoryIdsForFamily().length > 0 ? getSelectedCategoryIdsForFamily() : undefined,
      (selectedMemberIdsGlobal.value && selectedMemberIdsGlobal.value.length > 0)
        ? selectedMemberIdsGlobal.value
        : householdMemberStore.members
            .filter(m => m.isActive && m.familyId === selectedFamilyId.value)
            .map(m => m.id),
      excludeIncomeFilter.value ? 'expense' : 'all',
    )
  ];
  await Promise.all(promises);
};

const exportReportToPdf = async () => {
  const reportContentElement = document.getElementById('report-content-to-export');
  if (!reportContentElement) {
    $q.notify({ type: 'negative', message: 'Không tìm thấy nội dung báo cáo để xuất.' });
    return;
  }
  reportContentElement.classList.add('pdf-export-mode');
  pdfExportLoading.value = true;
  $q.loading.show({ message: 'Đang tạo file PDF...' });
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    const canvas = await html2canvas(reportContentElement, {
      scale: 1.5,
      useCORS: true,
      logging: true,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const pageMargin = 40;
    const pdfWidth = pdf.internal.pageSize.getWidth() - (pageMargin * 2);
    const pdfHeight = pdf.internal.pageSize.getHeight() - (pageMargin * 2);
    const imgProps = pdf.getImageProperties(imgData);
    const aspectRatio = imgProps.width / imgProps.height;
    const imgRenderHeight = pdfWidth / aspectRatio;
    const currentPosition = pageMargin;
    if (imgRenderHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', pageMargin, currentPosition, pdfWidth, imgRenderHeight);
    } else {
      let remainingImgHeight = imgProps.height;
      let srcY = 0;
      while (remainingImgHeight > 0) {
        const pageChunkHeight = Math.min(remainingImgHeight, (pdfHeight / pdfWidth) * imgProps.width);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgProps.width;
        pageCanvas.height = pageChunkHeight;
        const ctx = pageCanvas.getContext('2d');
        ctx?.drawImage(canvas, 0, srcY, imgProps.width, pageChunkHeight, 0, 0, imgProps.width, pageChunkHeight);
        const pageImgData = pageCanvas.toDataURL('image/png');
        pdf.addImage(pageImgData, 'PNG', pageMargin, pageMargin, pdfWidth, pdfHeight * (pageChunkHeight / ((pdfHeight / pdfWidth) * imgProps.width)) );
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
    reportContentElement.classList.remove('pdf-export-mode');
    pdfExportLoading.value = false;
    $q.loading.hide();
  }
};

let lastLoadedFamilyId: string | null = null;
watch(
  () => familyStore.selectedFamilyId,
  async (newVal) => {
    if (newVal && newVal !== lastLoadedFamilyId) {
      selectedFamilyId.value = newVal;
      await Promise.all([
        categoryStore.loadCategories(),
        householdMemberStore.loadMembers()
      ]);
      selectedCategoryIdsGlobal.value = [];
      selectedMemberIdsGlobal.value = [];
      void applyFiltersAndLoadReports();
      lastLoadedFamilyId = newVal;
    }
  },
  { immediate: true }
);
</script>




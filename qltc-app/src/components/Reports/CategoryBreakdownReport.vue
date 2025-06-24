<template>
  <q-card class="q-my-md">
    <q-card-section>
      <div class="text-h6">
        Phân tích theo Danh mục
        <q-btn flat dense round icon="sym_o_info" size="sm" class="q-ml-xs">
          <q-tooltip max-width="250px">Click vào một hàng trong bảng danh mục để xem chi tiết giao dịch bên dưới.</q-tooltip>
        </q-btn>
      </div>
      <div class="text-subtitle2">{{ periodLabel }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section v-if="loading">
      <div class="text-center">
        <q-spinner-dots color="primary" size="40px" />
        <p>Đang tải dữ liệu phân tích danh mục...</p>
      </div>
    </q-card-section>

    <q-card-section v-else-if="error">
      <div class="text-negative text-center">
        <q-icon name="error_outline" size="md" />
        <p>{{ error }}</p>
      </div>
    </q-card-section>

    <q-card-section v-else-if="breakdownData && breakdownData.length > 0">
      <q-table
        :rows="tableRows"
        :columns="categorySummaryColumns"
        row-key="categoryId"
        dense
        flat
        separator="cell"
        :pagination="{ rowsPerPage: 0 }"
        hide-bottom
      >
        <template v-slot:body-cell-categoryName="props">
          <q-td :props="props" class="text-left cursor-pointer" @click="onCategoryRowClick(props.row)">
            <q-icon v-if="props.row.icon" :name="props.row.icon" :style="{ color: props.row.color || 'inherit' }" class="q-mr-sm" />
            <span :style="{ color: props.row.color || 'inherit' }">{{ props.row.categoryName }}</span>
          </q-td>
        </template>
      </q-table>
      <div class="q-mt-lg row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-card bordered flat>
            <q-card-section>
              <div class="text-subtitle1">Biểu đồ Chi phí theo Danh mục</div>
            </q-card-section>
            <q-card-section v-if="expensePieChartSeries.length > 0">
              <highcharts :options="expensePieChartOptions"></highcharts>
            </q-card-section>
            <q-card-section v-else class="text-center text-grey-6">
              Không có dữ liệu chi phí để hiển thị biểu đồ.
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-6">
          <q-card bordered flat>
            <q-card-section>
              <div class="text-subtitle1">Chi phí theo Danh mục</div>
            </q-card-section>
            <q-card-section v-if="hasExpenseBudgetBarChartData">
              <highcharts :options="expenseBudgetBarChartOptions"></highcharts>
            </q-card-section>
            <q-card-section v-else class="text-center text-grey-6">
              Không có dữ liệu thu/chi để hiển thị biểu đồ.
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>

    <q-card-section v-else>
      <div class="text-center text-grey-7">
        <q-icon name="sym_o_pie_chart_outline" size="md" />
        <p>Không có dữ liệu phân tích danh mục cho kỳ này.</p>
      </div>
    </q-card-section>

    <!-- Transaction Details for Selected Category -->
    <q-slide-transition>
      <div v-if="selectedCategoryDetails">
        <q-separator class="q-my-md" />
        <q-card-section>
          <div class="text-h6">
            Chi tiết giao dịch cho: {{ selectedCategoryDetails.categoryName }}
            <q-btn flat dense icon="close" @click="selectedCategoryDetails = null" class="float-right" size="sm" round />
          </div>
          <div v-if="transactionStore.categoryPeriodTransactionsLoading" class="text-center q-pa-md">
            <q-spinner-dots color="primary" size="30px" />
            <p>Đang tải giao dịch...</p>
          </div>
          <div v-else-if="transactionStore.categoryPeriodTransactions && transactionStore.categoryPeriodTransactions.length > 0">
            <q-table
              :rows="transactionStore.categoryPeriodTransactions"
              :columns="transactionDetailColumns"
              row-key="id"
              dense
              flat
              separator="cell"
              :pagination="{ rowsPerPage: 5 }"
              class="q-mt-sm"
            >
              <template v-slot:body-cell-amount="props">
                <q-td :props="props" :class="props.row.type === 'income' ? 'text-green' : 'text-red'">
                  {{ formatCurrency(props.row.amount) }}
                </q-td>
              </template>
              <template v-slot:body-cell-date="props">
                <q-td :props="props">
                  {{ formatDate(props.row.date) }}
                </q-td>
              </template>
               <template v-slot:body-cell-payer="props">
                <q-td :props="props">
                  {{ getMemberName(props.row.payer) }}
                </q-td>
              </template>
            </q-table>
            <div class="q-mt-md text-center">
              <q-btn
                color="primary"
                outline
                label="Xem tất cả giao dịch"
                icon="sym_o_receipt_long"
                @click="navigateToTransactionsPage"
              />
            </div>
          </div>
          <div v-else class="text-center text-grey-7 q-pa-md">
            <q-icon name="sym_o_search_off" size="md" />
            <p>Không có giao dịch nào cho danh mục này trong kỳ đã chọn.</p>
          </div>
        </q-card-section>
      </div>
    </q-slide-transition>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { formatCurrency, formatKiloCurrency } from 'src/utils/formatters';
import { type CategoryBreakdownItemDto, PeriodType } from 'src/models/summary';
import type { QTableColumn } from 'quasar';
import { useTransactionStore } from 'src/stores/transactionStore';
import { useHouseholdMemberStore } from 'src/stores/householdMemberStore';
import { dayjs } from 'src/boot/dayjs';

interface Props {
  breakdownData: CategoryBreakdownItemDto[] | null;
  loading: boolean;
  error: string | null;
  periodLabel: string;
  selectedMemberIdsGlobal: string[]; // New prop
  excludeIncomeFilter: boolean; // New prop
  isStrictModeActive: boolean; // New prop
}

const props = defineProps<Props>();

const router = useRouter();
const transactionStore = useTransactionStore();
const householdMemberStore = useHouseholdMemberStore();

const selectedCategoryDetails = ref<CategoryBreakdownItemDto | null>(null);
const categorySummaryColumns: QTableColumn[] = [
  { name: 'categoryName', required: true, label: 'Danh mục', align: 'left', field: 'categoryName', sortable: true, style: 'width: 40%' },
  { name: 'totalIncome', label: 'Tổng thu', field: 'totalIncome', sortable: true, align: 'right', format: val => formatKiloCurrency(val), style: 'width: 20%' },
  { name: 'totalExpense', label: 'Tổng chi', field: 'totalExpense', sortable: true, align: 'right', format: val => formatKiloCurrency(val), style: 'width: 20%' },
  { name: 'netChange', label: 'Thay đổi ròng', field: 'netChange', sortable: true, align: 'right', format: val => formatKiloCurrency(val), style: 'width: 20%' },
];

const tableRows = computed(() => {
  if (!props.breakdownData) return [];
  return props.breakdownData.map(item => ({
    ...item,
    // You can add more processed fields here if needed for the table
  }));
});

const transactionDetailColumns: QTableColumn[] = [
  { name: 'date', label: 'Ngày', field: 'date', sortable: true, align: 'left' },
  { name: 'note', label: 'Ghi chú', field: 'note', sortable: true, align: 'left', classes: 'ellipsis', style: 'max-width: 200px' },
  { name: 'payer', label: 'Người chi/nhận', field: 'payer', sortable: true, align: 'left' },
  { name: 'amount', label: 'Số tiền', field: 'amount', sortable: true, align: 'right' },
];

const getMemberName = (memberId?: string | null): string => {
  if (!memberId) return 'N/A';
  return householdMemberStore.getMemberById(memberId)?.name || memberId;
};

const formatDate = (dateString: string, format = 'DD/MM/YYYY'): string => {
  return dayjs(dateString).format(format);
};

const onCategoryRowClick = (categoryRow: CategoryBreakdownItemDto) => {
  selectedCategoryDetails.value = categoryRow;
  // Extract period from periodLabel (e.g., "Chi tiết cho Tháng 6/2025")
  // This is a bit brittle; ideally, the raw period info (year, month) would be passed to this component
  // or derived more robustly.
  const periodMatch = props.periodLabel.match(/Tháng (\d{1,2})\/(\d{4})/);
  let month: number | undefined;
  let year: number | undefined;

  if (periodMatch) {
    month = periodMatch[1] ? parseInt(periodMatch[1], 10) : undefined;
    year = periodMatch[2] ? parseInt(periodMatch[2], 10) : undefined;
  } else {
    // Fallback or error if periodLabel format is unexpected
    // For now, let's assume it's always monthly for this detail view
    console.warn('Could not parse month/year from periodLabel:', props.periodLabel);
    // Potentially try to get year from a global store or default
    year = dayjs().year(); // A fallback, might not be accurate for the report context
  }

  if (year) { // Ensure year is available
    void transactionStore.loadTransactionsForCategoryPeriod(
      categoryRow.categoryId,
      PeriodType.Monthly, // Assuming the breakdown is always monthly for this detail
      year,
      month,
      undefined, // quarter
      props.selectedMemberIdsGlobal, // Pass selected members
      props.excludeIncomeFilter ? 'expense' : 'all', // Pass transaction type filter
      props.isStrictModeActive, // Pass strict mode flag
    );
  }
};

const navigateToTransactionsPage = () => {
  // TODO: Optionally pass filters to TransactionsPage via query params
  // e.g., router.push({ name: 'Transactions', query: { categoryId: selectedCategoryDetails.value?.categoryId, ... } });
  void router.push({ name: 'Transactions' });
};

// Highcharts data and options
const expensePieChartOptions = computed(() => {
  return {
    chart: {
      type: 'pie',
      height: 300, // Optional: set a height
    },
    title: {
      text: null, // Already have a title in card section
    },
    tooltip: {
      pointFormatter: function (this: Highcharts.Point) {
        // Using 'as any' because 'this' context in pointFormatter is tricky with TS
        // Highcharts types might need specific setup for this.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return `${(this as any).series.name}: <b>${formatCurrency(this.y as number)}</b> (${(this.percentage as number).toFixed(1)}%)`;
      } // Retain formatCurrency for detailed transaction amounts
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %'
        },
        point: { // Add point events for click handling
          events: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            click: function (event: Highcharts.PointClickEventObject) {
              // 'this' is the Point object, which will have the 'id' we added
              const clickedPoint = this as unknown as Highcharts.Point & { id?: string };
              if (clickedPoint.id) {
                findAndCallOnCategoryRowClick(clickedPoint.id);
              }
            }
          }
        }
      }
    },
    series: [{
      name: 'Chi phí',
      colorByPoint: true,
      data: expensePieChartSeries.value,
    }]
  };
});

const expensePieChartSeries = computed(() => {
  return props.breakdownData
    ?.filter(item => item.totalExpense > 0)
    .map(item => ({
      name: item.categoryName,
      id: item.categoryId, // Add categoryId here for click handling
      y: item.totalExpense,
      color: item.color || undefined, // Highcharts can auto-assign colors if undefined
    })) || [];
});

const hasExpenseBudgetBarChartData = computed(() => {
  const seriesValue = expenseBudgetBarChartSeries.value;
  // Check if there's expense data or budget data to show
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return seriesValue.some(s => (s.data as unknown as any[])?.length > 0);
});

const expenseBudgetBarChartOptions = computed(() => { // Renamed
  const categories = props.breakdownData?.map(item => item.categoryName) || [];
  const options: Highcharts.Options = { // Add type for better intellisense
    chart: {
      type: 'bar',
      height: categories.length * 40 + 100 > 300 ? categories.length * 40 + 100 : 300, // Dynamic height
    },
    title: {
      text: '',
    },
    xAxis: {
      categories: categories,
      title: {
        text: null,
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Số tiền (VND)',
        align: 'high',
      },
      labels: {
        overflow: 'justify',
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
            return formatKiloCurrency(this.value as number);
        }
      },
    },
    tooltip: {
      valueSuffix: ' VND',
      formatter: function (this: Highcharts.Point) {
        return `<b>${this.x}</b><br/>${this.series.name}: ${formatCurrency(this.y as number)}`;
      }
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
          formatter: function (this: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            return formatKiloCurrency(this.y as number);
          }
        }
      },
      // Add point events for click handling on series points (bars)
      series: { // Apply to all series of type 'bar' or specific series if needed
        point: {
          events: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            click: function (event: Highcharts.PointClickEventObject) {
              // 'this.index' will give the index of the clicked bar,
              // which corresponds to the index in props.breakdownData
              const categoryIndex = this.index;
              if (props.breakdownData && props.breakdownData[categoryIndex]) {
                const categoryItem = props.breakdownData[categoryIndex];
                onCategoryRowClick(categoryItem); // Directly call with the item
              }
            }
          }
        }
      }
    },
    series: expenseBudgetBarChartSeries.value, // Renamed
  };
  return options;
});

const expenseBudgetBarChartSeries = computed(() => { // Renamed
  const expenseData = props.breakdownData?.map(item => item.totalExpense) || [];
  const budgetData = props.breakdownData?.map(item => item.budgetLimit ?? 0) || []; // Use 0 if budgetLimit is null/undefined

  return [
    {
      name: 'Tổng Chi',
      data: expenseData,
      color: '#F44336', // Red
    } as Highcharts.SeriesBarOptions, // Add type assertion for series
    {
      name: 'Ngân sách',
      data: budgetData,
      color: '#2196F3', // Blue
    } as Highcharts.SeriesBarOptions,
  ];
});

// Helper function to find category item by ID and call onCategoryRowClick
// This is mainly for the pie chart where we store 'id' on the point
const findAndCallOnCategoryRowClick = (categoryId: string) => {
  const categoryItem = props.breakdownData?.find(item => item.categoryId === categoryId);
  if (categoryItem) {
    onCategoryRowClick(categoryItem);
  }
};
</script>

<style scoped>
/* Add any specific styles if needed */
.q-table th {
  font-weight: bold;
}
</style>

<template>
  <q-card class="q-my-md">
    <q-card-section>
      <div class="text-h6">Phân tích theo Danh mục</div>
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
        :columns="columns"
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
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from 'src/utils/formatters';
import type { CategoryBreakdownItemDto } from 'src/models/summary';
import type { QTableColumn } from 'quasar';

interface Props {
  breakdownData: CategoryBreakdownItemDto[] | null;
  loading: boolean;
  error: string | null;
  periodLabel: string;
}

const props = defineProps<Props>();

const columns: QTableColumn[] = [
  { name: 'categoryName', required: true, label: 'Danh mục', align: 'left', field: 'categoryName', sortable: true, style: 'width: 60%' },
  // { name: 'totalIncome', label: 'Tổng thu', field: 'totalIncome', sortable: true, align: 'right', format: val => formatCurrency(val) },
  { name: 'totalExpense', label: 'Tổng chi', field: 'totalExpense', sortable: true, align: 'right', format: val => formatCurrency(val), style: 'width: 40%' },
  // { name: 'netChange', label: 'Thay đổi ròng', field: 'netChange', sortable: true, align: 'right', format: val => formatCurrency(val) },
];

const tableRows = computed(() => {
  if (!props.breakdownData) return [];
  return props.breakdownData.map(item => ({
    ...item,
    // You can add more processed fields here if needed for the table
  }));
});

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
      }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %'
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
            return formatCurrency(this.value as number);
        }
      },
    },
    tooltip: {
      valueSuffix: ' VND',
      formatter: function (this: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        return `<b>${this.x}</b><br/>${this.series.name}: ${formatCurrency(this.y as number)}`;
      }
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
          formatter: function (this: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            return formatCurrency(this.y as number);
          }
        },
      },
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

const onCategoryRowClick = (categoryRow: CategoryBreakdownItemDto) => {
  // Placeholder for potential drill-down or detail view
  console.log('Category row clicked:', categoryRow);
  // Emitting an event or calling a store action could happen here
  // For example, to filter other reports by this category or show sub-categories.
};

</script>

<style scoped>
/* Add any specific styles if needed */
.q-table th {
  font-weight: bold;
}
</style>

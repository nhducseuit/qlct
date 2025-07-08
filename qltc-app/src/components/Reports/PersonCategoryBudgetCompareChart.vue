<template>
  <q-card class="q-my-md">
    <q-card-section>
      <div class="text-h6">So sánh Chi tiêu với Ngân sách theo Danh mục (Tổng hợp các thành viên)</div>
      <div class="text-subtitle2">{{ subTitle }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section v-if="loading">
      <div class="text-center">
        <q-spinner-dots color="primary" size="40px" />
        <p>Đang tải dữ liệu biểu đồ...</p>
      </div>
    </q-card-section>

    <q-card-section v-else-if="error">
      <div class="text-negative text-center">
        <q-icon name="error_outline" size="md" />
        <p>{{ error }}</p>
      </div>
    </q-card-section>

    <q-card-section v-else-if="hasDataToShow">
      <highcharts :options="chartOptions"></highcharts>
    </q-card-section>

    <q-card-section v-else>
      <div class="text-center text-grey-7">
        <q-icon name="sym_o_bar_chart" size="md" />
        <p>Không có dữ liệu để hiển thị biểu đồ ngân sách theo danh mục.</p>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from 'src/utils/formatters';

interface CategoryBudgetCompareItem {
  categoryName: string;
  totalExpense: number;
  budgetLimit: number;
}

interface Props {
  data: CategoryBudgetCompareItem[] | null;
  loading: boolean;
  error: string | null;
  subTitle?: string;
}

const props = defineProps<Props>();

const hasDataToShow = computed(() => {
  return (props.data?.length ?? 0) > 0;
});

const chartOptions = computed((): Highcharts.Options => {
  const categories = props.data?.map(item => item.categoryName) || [];
  const expenseData = props.data?.map(item => item.totalExpense) || [];
  const budgetData = props.data?.map(item => item.budgetLimit) || [];

  return {
    chart: {
      type: 'column',
    },
    title: { text: '' },
    xAxis: {
      categories,
      title: { text: 'Danh mục' },
    },
    yAxis: {
      min: 0,
      title: { text: 'Số tiền (VND)' },
      labels: {
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          return formatCurrency(this.value as number);
        }
      }
    },
    tooltip: {
      shared: true,
      pointFormatter: function (this: Highcharts.Point) {
        const color = typeof this.color === 'string' ? this.color : '#000';
        const seriesName = (this.series && 'name' in this.series) ? this.series.name : '';
        return `<span style="color:${color}">●</span> ${seriesName}: <b>${formatCurrency(this.y as number)}</b><br/>`;
      }
    },
    plotOptions: {
      column: {
        grouping: true,
        dataLabels: {
          enabled: true,
          formatter: function (this: Highcharts.Point) {
            return formatCurrency(this.y as number);
          }
        }
      }
    },
    series: [
      { type: 'column', name: 'Chi tiêu', data: expenseData, color: '#F44336' },
      { type: 'column', name: 'Ngân sách', data: budgetData, color: '#1976D2' },
    ],
  };
});
</script>

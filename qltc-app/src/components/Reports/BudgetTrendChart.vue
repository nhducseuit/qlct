<template>
  <q-card class="q-my-md">
    <q-card-section>
      <div class="text-h6">Xu hướng Chi phí vs. Ngân sách</div>
      <div class="text-subtitle2">{{ subTitle }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section v-if="loading">
      <div class="text-center">
        <q-spinner-dots color="primary" size="40px" />
        <p>Đang tải dữ liệu xu hướng...</p>
      </div>
    </q-card-section>

    <q-card-section v-else-if="error">
      <div class="text-negative text-center">
        <q-icon name="error_outline" size="md" />
        <p>{{ error }}</p>
      </div>
    </q-card-section>

    <q-card-section v-else-if="hasTrendDataToShow">
      <highcharts :options="chartOptions"></highcharts>
    </q-card-section>

    <q-card-section v-else>
      <div class="text-center text-grey-7">
        <q-icon name="sym_o_trending_up" size="md" />
        <p>Không có dữ liệu xu hướng ngân sách cho lựa chọn này.</p>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from 'src/utils/formatters';
import type { BudgetTrendItemDto } from 'src/models/summary';
// Highcharts types can be imported if needed for more specific typing,
// but for options, Highcharts.Options is often sufficient.
// import { Highcharts } from 'src/boot/highcharts'; // If you exported it

interface Props {
  trendData: BudgetTrendItemDto[] | null;
  loading: boolean;
  error: string | null;
  subTitle?: string; // e.g., "Năm 2023 - Hàng tháng"
}

const props = defineProps<Props>();

const hasTrendDataToShow = computed(() => {
  const series = chartSeries.value;
  // Cast individual series to 'any' to safely access 'data' property
  // Then check if data is an array before getting length.
  const s1 = series[0] as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const s2 = series[1] as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const series1DataLength = (s1?.data && Array.isArray(s1.data)) ? s1.data.length : 0;
  const series2DataLength = (s2?.data && Array.isArray(s2.data)) ? s2.data.length : 0;
  return series1DataLength > 0 || series2DataLength > 0;
});

const chartOptions = computed((): Highcharts.Options => {
  const periods = props.trendData?.map(item => item.period) || [];

  return {
    chart: {
      type: 'line', // or 'column'
    },
    title: {
      text: '',
    },
    xAxis: {
      categories: periods,
      title: { text: 'Kỳ' },
    },
    yAxis: {
      title: { text: 'Số tiền (VND)' },
      labels: {
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          return formatCurrency(this.value as number);
        }
      }
    },
    tooltip: {
      shared: true,
      crosshairs: true,
      pointFormatter: function (this: Highcharts.Point) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return `<span style="color:${(this as any).color}">●</span> ${(this as any).series.name}: <b>${formatCurrency(this.y as number)}</b><br/>`;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any, // Cast the entire tooltip object to 'any' to allow 'crosshairs'
    series: chartSeries.value,
  };
});

const chartSeries = computed((): Highcharts.SeriesOptionsType[] => {
  const budgetData = props.trendData?.map(item => item.totalBudgetLimit) || [];
  const expenseData = props.trendData?.map(item => item.totalActualExpenses) || [];

  return [
    { type: 'line', name: 'Ngân sách', data: budgetData, color: '#1976D2' /* Primary Blue */ },
    { type: 'line', name: 'Chi phí thực tế', data: expenseData, color: '#F44336' /* Red */ },
  ];
});

</script>

<template>
  <q-card class="q-my-md">
    <q-card-section>
      <div class="text-h6">Xu hướng Ngân sách & Chi phí (Hàng tháng)</div>
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

    <q-card-section v-else-if="hasData">
      <highcharts :options="chartOptions" @chart-loaded="onChartLoaded"></highcharts>
    </q-card-section>

    <q-card-section v-else>
      <div class="text-center text-grey-7">
        <q-icon name="sym_o_trending_up" size="md" />
        <p>Không có dữ liệu xu hướng cho lựa chọn này.</p>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { formatCurrency } from 'src/utils/formatters';
import type { BudgetTrendItemDto } from 'src/models/summary';
import type { Highcharts } from 'src/boot/highcharts'; // Import Highcharts type if needed

interface Props {
  trendData: BudgetTrendItemDto[] | null;
  loading: boolean;
  error: string | null;
  subTitle?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['month-selected']);

const chartRef = ref<Highcharts.Chart | null>(null);

const onChartLoaded = (chart: Highcharts.Chart) => {
  chartRef.value = chart;
};

const hasData = computed(() => {
  const series = chartSeries.value;
  // Check if either series has data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return series.some(s => ((s as any)?.data && Array.isArray((s as any).data) ? (s as any).data.length : 0) > 0);
});

const chartOptions = computed((): Highcharts.Options => {
  const periods = props.trendData?.map(item => item.period.substring(5)) || []; // Extract MM from YYYY-MM

  return {
    chart: {
      type: 'line',
    },
    title: {
      text: '', // Use null to explicitly indicate no title text
    },
    xAxis: {
      categories: periods,
      title: { text: 'Tháng' },
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
      crosshairs: true, // Highcharts handles boolean fine, cast the whole object if TS complains
      pointFormatter: function (this: Highcharts.Point) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return `<span style="color:${(this as any).color}">●</span> ${(this as any).series.name}: <b>${formatCurrency(this.y as number)}</b><br/>`;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any, // Cast entire tooltip object to any to allow 'crosshairs'
    plotOptions: {
      series: {
        cursor: 'pointer',
        point: {
          events: {
            click: function (event: Highcharts.PointClickEventObject) {
              // 'this' context here is the Highcharts.Point object
              // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
              const point = this as any;
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const _event = event; // Or use event if needed later
              const originalPeriod = props.trendData?.[this.index]?.period;
              if (originalPeriod) {
                emit('month-selected', originalPeriod);
              }
            }
          }
        }
      }
    },
    series: chartSeries.value,
  };
});

const chartSeries = computed((): Highcharts.SeriesOptionsType[] => {
  const budgetData = props.trendData?.map(item => item.totalBudgetLimit) || [];
  const expenseData = props.trendData?.map(item => item.totalActualExpenses) || [];

  return [
    { type: 'line', name: 'Ngân sách', data: budgetData, color: '#1976D2' /* Primary Blue */, zIndex: 1 },
    { type: 'line', name: 'Chi phí thực tế', data: expenseData, color: '#F44336' /* Red */, zIndex: 2 },
  ];
});

</script>

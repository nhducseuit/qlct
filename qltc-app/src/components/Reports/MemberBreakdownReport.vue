<template>
  <q-card class="q-my-md">
    <q-card-section>
      <div class="text-h6">Phân tích theo Thành viên</div>
      <div class="text-subtitle2">{{ periodLabel }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section v-if="loading">
      <div class="text-center">
        <q-spinner-dots color="primary" size="40px" />
        <p>Đang tải dữ liệu phân tích thành viên...</p>
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
              row-key="memberId"
              dense
              flat
              separator="cell"
              :pagination="{ rowsPerPage: 0 }"
              hide-bottom
            />
          </q-card>
        </div>
        <div class="col-12 col-md-6">
          <q-card bordered flat>
            <q-card-section>
              <div class="text-subtitle1">Biểu đồ Thu/Chi theo Thành viên</div>
            </q-card-section>
            <highcharts :options="memberBarChartOptions" v-if="hasBarChartData"></highcharts>
            <q-card-section v-else class="text-center text-grey-6">Không có dữ liệu để hiển thị biểu đồ.</q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>

    <q-card-section v-else>
      <div class="text-center text-grey-7">
        <q-icon name="sym_o_groups" size="md" />
        <p>Không có dữ liệu phân tích thành viên cho kỳ này.</p>
        <p class="text-caption">Lưu ý: Phân tích thành viên dựa trên các giao dịch "Chi chung" có tỷ lệ chia.</p>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency, formatKiloCurrency } from 'src/utils/formatters';
import type { MemberBreakdownItemDto } from 'src/models/summary';
import type { QTableColumn } from 'quasar';

interface Props {
  breakdownData: MemberBreakdownItemDto[] | null;
  loading: boolean;
  error: string | null;
  periodLabel: string;
}

const props = defineProps<Props>();

const columns: QTableColumn[] = [
  { name: 'memberName', required: true, label: 'Thành viên', align: 'left', field: 'memberName', sortable: true, style: 'width: 40%' },
  { name: 'totalPaidAmount', label: 'Tổng chi trực tiếp', field: 'totalPaidAmount', sortable: true, align: 'right', format: val => formatKiloCurrency(val), style: 'width: 20%' },
  { name: 'totalExpense', label: 'Tổng Chi (phần được chia)', field: 'totalExpense', sortable: true, align: 'right', format: val => formatKiloCurrency(val), style: 'width: 20%' },
];

const tableRows = computed(() => {
  if (!props.breakdownData) return [];
  return props.breakdownData.map(item => ({
    ...item,
  }));
});

const hasBarChartData = computed(() => {
  const seriesValue = memberBarChartSeries.value;
  // Check if there's any data in any series
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return seriesValue.some(s => ((s as any)?.data && Array.isArray((s as any).data) ? (s as any).data.length : 0) > 0);
});

const memberBarChartOptions = computed((): Highcharts.Options => {
  const memberNames = props.breakdownData?.map(item => item.memberName) || [];
  return {
    chart: {
      type: 'bar',
      height: memberNames.length * 60 + 100 > 300 ? memberNames.length * 60 + 100 : 300, // Dynamic height
    },
    title: {
      text: '',
    },
    xAxis: {
      categories: memberNames,
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
          formatter: function (this: Highcharts.Point) { // Use Highcharts.Point for 'this' context
            return formatKiloCurrency(this.y as number);
          }
        },
      },
    },
    series: memberBarChartSeries.value,
  };
});

const memberBarChartSeries = computed((): Highcharts.SeriesOptionsType[] => {
  const paidData = props.breakdownData?.map(item => item.totalPaidAmount) || [];
  const expenseData = props.breakdownData?.map(item => item.totalExpense) || [];

  return [
    { type: 'bar', name: 'Tổng chi trực tiếp', data: paidData, color: '#1976D2' /* Blue */ },
    { type: 'bar', name: 'Tổng Chi (phần được chia)', data: expenseData, color: '#F44336' /* Red */ },
  ];
});
</script>

<style scoped>
.q-table th {
  font-weight: bold;
}
</style>

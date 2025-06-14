<template>
  <q-card class="q-my-md">
    <q-card-section>
      <div class="text-h6">Tổng hợp Thu Chi</div>
      <div class="text-subtitle2">{{ periodLabel }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section v-if="loading">
      <div class="text-center">
        <q-spinner-dots color="primary" size="40px" />
        <p>Đang tải dữ liệu...</p>
      </div>
    </q-card-section>

    <q-card-section v-else-if="error">
      <div class="text-negative text-center">
        <q-icon name="error_outline" size="md" />
        <p>{{ error }}</p>
      </div>
    </q-card-section>

    <q-card-section v-else-if="summaryData && summaryData.length > 0">
      <q-list separator>
        <q-item v-for="item in summaryData" :key="item.period">
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ item.period }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Tổng thu</q-item-label>
            <q-item-label class="text-green">{{ formatCurrency(item.totalIncome) }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Tổng chi</q-item-label>
            <q-item-label class="text-red">{{ formatCurrency(item.totalExpense) }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Thay đổi ròng</q-item-label>
            <q-item-label :class="item.netChange >= 0 ? 'text-green' : 'text-red'">
              {{ formatCurrency(item.netChange) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

     <q-card-section v-else>
      <div class="text-center text-grey-7">
        <q-icon name="sym_o_visibility_off" size="md" />
        <p>Không có dữ liệu cho kỳ này.</p>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { formatCurrency } from 'src/utils/formatters';
import type { PeriodSummaryDto } from 'src/models/summary';

interface Props {
  summaryData: PeriodSummaryDto[] | null;
  loading: boolean;
  error: string | null;
  periodLabel: string;
}

defineProps<Props>();

</script>

<style scoped>
.text-green { color: var(--q-positive); }
.text-red { color: var(--q-negative); }
</style>

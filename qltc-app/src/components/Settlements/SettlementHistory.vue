<template>
  <q-card class="q-mt-lg">
    <q-card-section>
      <div class="text-h6">Lịch sử Thanh toán</div>
    </q-card-section>

    <q-separator />

    <q-card-section v-if="settlementStore.settlementHistoryLoading">
      <div class="text-center q-pa-md">
        <q-spinner-dots color="primary" size="40px" />
        <p>Đang tải lịch sử thanh toán...</p>
      </div>
    </q-card-section>

    <q-card-section v-else-if="settlementStore.settlementHistoryError">
      <div class="text-center text-negative q-pa-md">
        <q-icon name="error_outline" size="40px" />
        <p>{{ settlementStore.settlementHistoryError }}</p>
      </div>
    </q-card-section>

    <q-card-section v-else-if="!settlements || settlements.length === 0">
      <div class="text-center text-grey-7 q-pa-md">
        <q-icon name="history" size="40px" />
        <p>Chưa có lịch sử thanh toán nào được ghi nhận.</p>
      </div>
    </q-card-section>

    <template v-else>
      <q-list bordered separator>
        <q-item v-for="settlement in settlements" :key="settlement.id">
          <q-item-section avatar>
            <q-avatar color="secondary" text-color="white" icon="receipt_long" />
          </q-item-section>

          <q-item-section>
            <q-item-label>
              <span class="text-weight-medium">{{ settlement.payer.personName }}</span>
              đã trả cho
              <span class="text-weight-medium">{{ settlement.payee.personName }}</span>
            </q-item-label>
            <q-item-label caption lines="1">
              Ghi chú: {{ settlement.note || 'Không có' }}
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-item-label class="text-weight-bold text-primary">
              {{ formatCurrency(settlement.amount) }}
            </q-item-label>
            <q-item-label caption>
              {{ formatDate(settlement.date) }} ({{ timeAgo(settlement.date) }})
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div v-if="totalPages > 1" class="q-pa-lg flex flex-center">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          direction-links
          boundary-links
          icon-first="skip_previous"
          icon-last="skip_next"
          icon-prev="fast_rewind"
          icon-next="fast_forward"
          @update:model-value="fetchSettlementsForPage"
        />
      </div>
    </template>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useSettlementStore } from 'src/stores/settlementStore';
import type { GetSettlementsQueryDto } from 'src/models/settlement';
import { formatCurrency } from 'src/utils/formatters';
import { dayjs } from 'src/boot/dayjs';

const settlementStore = useSettlementStore();

const settlements = computed(() => settlementStore.settlementHistory?.items || []);
const meta = computed(() => settlementStore.settlementHistory?.meta);

const currentPage = ref(meta.value?.currentPage || 1);
const totalPages = computed(() => meta.value?.totalPages || 1);
const itemsPerPage = 10; // Or get from store/config if dynamic

const formatDate = (dateString: string): string => {
  return dayjs(dateString).format('DD/MM/YYYY HH:mm');
};

const timeAgo = (dateString: string): string => {
  return dayjs(dateString).fromNow();
};

const fetchSettlementsForPage = async (page: number) => {
  const query: GetSettlementsQueryDto = {
    page: page,
    limit: itemsPerPage,
  };
  await settlementStore.loadSettlementHistory(query);
};

onMounted(() => {
  if (!settlementStore.settlementHistory || settlementStore.settlementHistory.meta.currentPage !== currentPage.value) {
    void fetchSettlementsForPage(currentPage.value);
  }
});

watch(meta, (newMeta) => {
  if (newMeta) {
    currentPage.value = newMeta.currentPage;
  }
}, { deep: true });

</script>

<style scoped>
/* Add any specific styles if needed */
</style>

<template>
  <q-card class="q-mt-lg">
    <q-card-section>
      <div class="text-h6">Lịch sử Thanh toán</div>
    </q-card-section>

    <q-separator />


    <q-card-section v-if="settlementStore.settlementsLoading">
      <div class="text-center q-pa-md">
        <q-spinner-dots color="primary" size="40px" />
        <p>Đang tải lịch sử thanh toán...</p>
      </div>
    </q-card-section>

    <q-card-section v-else-if="settlementStore.settlementsError">
      <div class="text-center text-negative q-pa-md">
        <q-icon name="error_outline" size="40px" />
        <p>{{ settlementStore.settlementsError }}</p>
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
              <span class="text-weight-medium">{{ settlement.payerName }}</span>
              đã trả cho
              <span class="text-weight-medium">{{ settlement.payeeName }}</span>
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
import { ref, computed, onMounted } from 'vue';
import { useSettlementStore } from 'src/stores/settlementStore';
import { formatCurrency } from 'src/utils/formatters';
import { dayjs } from 'src/boot/dayjs';

const settlementStore = useSettlementStore();

const settlements = computed(() =>
  Array.isArray(settlementStore.settlements)
    ? settlementStore.settlements.map(s => {
        let payerName = 'N/A';
        let payeeName = 'N/A';
        // Use s.date if present, else s.createdAt
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        const date = (s as any).date || (s as any).createdAt;
        if ('payerId' in s && s.payerId) {
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
          payerName = settlementStore.accessiblePersons.find(p => p.id === (s as any).payerId)?.name || 'N/A';
        } else if (s.payer && s.payer.personName) {
          payerName = s.payer.personName;
        }
        if ('payeeId' in s && s.payeeId) {
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
          payeeName = settlementStore.accessiblePersons.find(p => p.id === (s as any).payeeId)?.name || 'N/A';
        } else if (s.payee && s.payee.personName) {
          payeeName = s.payee.personName;
        }
        return {
          ...s,
          payerName,
          payeeName,
          date,
        };
      })
    : []
);
const currentPage = ref(1);
const totalPages = computed(() => settlementStore.settlementsMeta?.totalPages || 1);
const itemsPerPage = 10;


// Format as date only (not datetime)
const formatDate = (dateString: string): string => {
  return dayjs(dateString).format('DD/MM/YYYY');
};

const timeAgo = (dateString: string): string => {
  return dayjs(dateString).fromNow();
};

const fetchSettlementsForPage = async (page: number) => {
  await settlementStore.loadSettlements({ page, limit: itemsPerPage });
  // If your backend returns meta info, update totalPages here
};

onMounted(() => {
  void fetchSettlementsForPage(currentPage.value);
});

// If you have meta info, watch and update currentPage/totalPages accordingly

</script>

<style scoped>
/* Add any specific styles if needed */
</style>

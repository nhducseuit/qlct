<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5">Cân đối Chi Tiêu Chung</div>
      <q-btn
        color="primary"
        icon="add_circle_outline"
        label="Ghi nhận Thanh toán"
        @click="openRecordSettlementDialog"
        :disabled="!canRecordSettlement"
      >
        <q-tooltip v-if="!canRecordSettlement">Cần ít nhất 2 thành viên đang hoạt động để ghi nhận thanh toán.</q-tooltip>
      </q-btn>
    </div>

    <!-- Loading, Error, Empty States -->
    <div v-if="settlementStore.balancesLoading" class="text-center">
      <q-spinner-dots color="primary" size="40px" />
      <p>Đang tải thông tin cân đối...</p>
    </div>

    <div v-else-if="settlementStore.balancesError" class="text-center text-negative">
      <q-icon name="error_outline" size="40px" color="negative" />
      <p>{{ settlementStore.balancesError }}</p>
    </div>

    <div v-else-if="!settlementStore.balances || settlementStore.balances.balances.length === 0" class="text-center text-grey-7">
      <q-icon name="info_outline" size="40px" />
      <p>Hiện tại không có khoản chi tiêu chung nào cần cân đối.</p>
    </div>

    <div v-else>
      <q-list bordered separator>
        <q-item v-for="balance in settlementStore.balances.balances" :key="`${balance.memberOneId}-${balance.memberTwoId}`">
          <q-item-section>
            <q-item-label>
              <template v-if="balance.netAmountMemberOneOwesMemberTwo > 0">
                {{ balance.memberOneName }} <span class="text-negative text-weight-medium">cần trả cho</span> {{ balance.memberTwoName }}
              </template>
              <template v-else>
                {{ balance.memberOneName }} <span class="text-positive text-weight-medium">sẽ nhận từ</span> {{ balance.memberTwoName }}
              </template>
            </q-item-label>
            <q-item-label caption>
              Số tiền: {{ formatCurrency(Math.abs(balance.netAmountMemberOneOwesMemberTwo)) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-chip
              :color="balance.netAmountMemberOneOwesMemberTwo > 0 ? 'red' : 'green'"
              text-color="white"
              :label="balance.netAmountMemberOneOwesMemberTwo > 0 ? 'Cần trả' : 'Sẽ nhận'"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useSettlementStore } from 'src/stores/settlementStore';
import { useHouseholdMemberStore } from 'src/stores/householdMemberStore';
import { formatCurrency } from 'src/utils/formatters'; // You might need to create this utility
import RecordSettlementDialog from './RecordSettlementDialog.vue'; // Import the dialog component

const $q = useQuasar();
const settlementStore = useSettlementStore();
const householdMemberStore = useHouseholdMemberStore();

const canRecordSettlement = computed(() => {
  return householdMemberStore.members.filter(m => m.isActive).length >= 2;
});

const openRecordSettlementDialog = () => {
  if (!canRecordSettlement.value) return;

  $q.dialog({
    component: RecordSettlementDialog,
    // componentProps: { /* pass any props to the dialog if needed */ }
  }).onOk(() => {
    console.log('Settlement dialog confirmed OK');
    // Balances are already reloaded by the store after successful settlement
  }).onCancel(() => {
    console.log('Settlement dialog cancelled');
  }).onDismiss(() => {
    console.log('Settlement dialog dismissed');
  });
};

onMounted(() => {
  // Ensure household members are loaded for the dialog's dropdowns
  if (householdMemberStore.members.length === 0) {
    void householdMemberStore.loadMembers();
  }
  // Load balances if not already loaded or empty (could be empty due to no transactions)
  if (!settlementStore.balances) { // Load if balances object itself is null
    void settlementStore.loadBalances();
  }
});
</script>

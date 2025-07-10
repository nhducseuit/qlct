<template>
  <q-page padding>
    <div class="q-gutter-y-md">
      <q-btn
        color="primary"
        label="Ghi nhận Thanh toán"
        class="q-mb-md"
        @click="openRecordDialog"
      />
      <balances-view />
      <settlement-history />
      <record-settlement-dialog
        ref="recordDialogRef"
        v-model="showRecordDialog"
        @ok="onSettlementRecorded"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BalancesView from 'src/components/Settlements/BalancesView.vue';
import SettlementHistory from 'src/components/Settlements/SettlementHistory.vue';
import RecordSettlementDialog from 'src/components/Settlements/RecordSettlementDialog.vue';

const showRecordDialog = ref(false);
const recordDialogRef = ref();

function openRecordDialog() {
  recordDialogRef.value?.resetForm();
  showRecordDialog.value = true;
}

function onSettlementRecorded() {
  // Optionally trigger refresh of balances/history via store or event bus
}
</script>

<style scoped>
/* Add any page-specific styles if needed */
</style>

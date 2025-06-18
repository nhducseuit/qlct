<template>
  <q-page padding>
    <div class="q-gutter-y-md"> <!-- Changed from q-gutter-y-lg to q-gutter-y-md -->
      <!-- Balances View -->
      <balances-view />

      <!-- Settlement History View -->
      <settlement-history />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import BalancesView from 'src/components/Settlements/BalancesView.vue';
import SettlementHistory from 'src/components/Settlements/SettlementHistory.vue';

// No specific logic needed here for now,
// as child components handle their own data fetching via stores.

console.log('SettlementsPage loaded');
</script>

<style scoped>
/* Add any page-specific styles if needed */
</style>

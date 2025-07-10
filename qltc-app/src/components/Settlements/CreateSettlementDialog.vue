<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width:350px;max-width:90vw;">
      <q-card-section>
        <div class="text-h6">Create Settlement</div>
      </q-card-section>
      <q-card-section>
        <q-form @submit.prevent="submit">
          <q-select
            v-model="form.payerId"
            :options="personOptions"
            label="Payer"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            :disable="loading"
            :rules="[val => !!val || 'Payer is required']"
            class="q-mb-md"
          />
          <q-select
            v-model="form.payeeId"
            :options="payeeOptions"
            label="Payee"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            :disable="loading"
            :rules="[val => !!val || 'Payee is required']"
            class="q-mb-md"
          />
          <q-input
            v-model.number="form.amount"
            type="number"
            label="Amount"
            :disable="loading"
            :rules="[val => val > 0 || 'Amount must be positive']"
            class="q-mb-md"
          />
          <q-input
            v-model="form.note"
            label="Note"
            :disable="loading"
            class="q-mb-md"
          />
        </q-form>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup :disable="loading" />
        <q-btn color="primary" label="Create" @click="submit" :loading="loading" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useSettlementStore } from 'src/stores/settlementStore';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue', 'settlement-created']);

const store = useSettlementStore();
const loading = ref(false);

const form = ref({
  payerId: '',
  payeeId: '',
  amount: null,
  note: ''
});

const personOptions = computed(() => store.accessiblePersons);
const payeeOptions = computed(() =>
  personOptions.value.filter((p: { id: string }) => p.id !== form.value.payerId)
);

watch(() => props.modelValue, (val) => {
  if (val) {
    form.value = { payerId: '', payeeId: '', amount: null, note: '' };
  }
});

async function submit() {
  if (!form.value.payerId || !form.value.payeeId || !form.value.amount || form.value.amount <= 0) return;
  loading.value = true;
  try {
    if (form.value.amount == null) return;
    await store.createSettlement({
      ...form.value,
      amount: Number(form.value.amount),
    });
    emit('settlement-created');
    emit('update:modelValue', false);
    // Optionally show a success notification
   } catch {
     // Optionally show error notification
   } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void store.loadAccessiblePersons();
});
</script>

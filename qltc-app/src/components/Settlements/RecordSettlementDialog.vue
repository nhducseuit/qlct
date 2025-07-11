<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="width: 500px; max-width: 90vw;">
      <q-form @submit.prevent="onSubmit">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Ghi nhận Thanh toán</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            filled
            v-model="form.payerId"
            :options="payerOptions"
            label="Người trả tiền"
            emit-value
            map-options
            :rules="[val => !!val || 'Vui lòng chọn người trả.']"
            @update:model-value="clearPayeeIfSame"
          />

          <q-select
            filled
            v-model="form.payeeId"
            :options="payeeOptions"
            label="Người nhận tiền"
            emit-value
            map-options
            :rules="[
              val => !!val || 'Vui lòng chọn người nhận.',
              val => val !== form.payerId || 'Người nhận phải khác người trả.'
            ]"
          />

          <q-input
            filled
            v-model.number="form.amount"
            label="Số tiền thanh toán"
            type="number"
            step="1000"
            :rules="[
              val => val !== null && val > 0 || 'Số tiền phải lớn hơn 0.'
            ]"
            input-class="text-right"
          >
            <template v-slot:append>
              <span class="text-caption">VND</span>
            </template>
          </q-input>



          <q-input
            filled
            v-model="form.note"
            label="Ghi chú (không bắt buộc)"
            type="textarea"
            autogrow
          />

          <q-input
            filled
            v-model="form.date"
            label="Ngày thanh toán"
            type="date"
            :rules="[val => !!val || 'Vui lòng chọn ngày thanh toán.']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Hủy bỏ" color="grey-8" v-close-popup />
          <q-btn label="Lưu Thanh toán" type="submit" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { useSettlementStore } from 'src/stores/settlementStore';

defineEmits([
  ...useDialogPluginComponent.emits,
]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const settlementStore = useSettlementStore();

import dayjs from 'dayjs';
const form = ref({
  payerId: '',
  payeeId: '',
  amount: null as number | null,
  note: '',
  date: dayjs().format('YYYY-MM-DD'),
});

const personOptions = computed(() =>
  settlementStore.accessiblePersons.map(person => ({
    label: person.name,
    value: person.id,
  }))
);

const payerOptions = personOptions;
const payeeOptions = computed(() =>
  personOptions.value.filter(person => person.value !== form.value.payerId)
);

const clearPayeeIfSame = (payerId: string) => {
  if (form.value.payeeId === payerId) {
    form.value.payeeId = '';
  }
};

// Expose a resetForm method for parent to call
defineExpose({
  resetForm: () => {
    form.value = { payerId: '', payeeId: '', amount: null, note: '', date: dayjs().format('YYYY-MM-DD') };
  }
});

const onSubmit = async () => {
  if (form.value.payerId === form.value.payeeId) {
    // Optionally show error
    return;
  }
  await settlementStore.createSettlement({
    payerId: form.value.payerId,
    payeeId: form.value.payeeId,
    amount: Number(form.value.amount),
    note: form.value.note,
    date: form.value.date,
  });
  onDialogOK();
};
</script>

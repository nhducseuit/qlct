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
            v-model="form.payerMembershipId"
            :options="payerOptions"
            label="Người trả tiền"
            emit-value
            map-options
            :rules="[val => !!val || 'Vui lòng chọn người trả.']"
            @update:model-value="clearPayeeIfSame"
          />

          <q-select
            filled
            v-model="form.payeeMembershipId"
            :options="payeeOptions"
            label="Người nhận tiền"
            emit-value
            map-options
            :rules="[
              val => !!val || 'Vui lòng chọn người nhận.',
              val => val !== form.payerMembershipId || 'Người nhận phải khác người trả.'
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
            v-model="form.date"
            label="Ngày thanh toán"
            mask="date"
            :rules="['date']"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.date" minimal />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input
            filled
            v-model="form.note"
            label="Ghi chú (không bắt buộc)"
            type="textarea"
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Hủy bỏ" color="grey-8" v-close-popup />
          <q-btn label="Lưu Thanh toán" type="submit" color="primary" :loading="settlementStore.createSettlementLoading" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDialogPluginComponent, QForm } from 'quasar';
import { useSettlementStore } from 'src/stores/settlementStore';
import { useHouseholdMemberStore } from 'src/stores/householdMemberStore';
import type { CreateSettlementDto } from 'src/models/settlement';
import { dayjs } from 'src/boot/dayjs';

defineEmits([
  ...useDialogPluginComponent.emits,
]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const settlementStore = useSettlementStore();
const householdMemberStore = useHouseholdMemberStore();

// const entryForm = ref<QForm | null>(null); // Not strictly needed for validation if using q-form's submit
const form = ref<CreateSettlementDto>({
  payerMembershipId: '',
  payeeMembershipId: '',
  amount: null as unknown as number, // Initialize with null for validation
  date: dayjs().format('YYYY/MM/DD'), // Quasar default date format
  note: '',
});

const activeMembers = computed(() =>
  householdMemberStore.members.filter(member => member.isActive)
);

const memberOptions = computed(() =>
  activeMembers.value.map(member => ({
    label: member.person?.name,
    value: member.id,
  }))
);

const payerOptions = computed(() => memberOptions.value);
const payeeOptions = computed(() =>
  memberOptions.value.filter(member => member.value !== form.value.payerMembershipId)
);

// Ensure payee is cleared if payer is selected and they are the same
const clearPayeeIfSame = (payerId: string) => {
  if (form.value.payeeMembershipId === payerId) {
    form.value.payeeMembershipId = '';
  }
};

const onSubmit = async () => {
  // QForm's @submit.prevent handles validation triggering automatically
  // if rules are set on individual components.

  if (form.value.payerMembershipId === form.value.payeeMembershipId) {
    settlementStore.createSettlementError = 'Người trả và người nhận không được giống nhau.';
    return;
  }

  const settlementData: CreateSettlementDto = {
    ...form.value,
    date: dayjs(form.value.date, 'YYYY/MM/DD').toISOString(), // Convert to ISO string for backend
  };

  const result = await settlementStore.recordSettlement(settlementData);
  if (result) {
    onDialogOK(); // Closes the dialog and signals success
  }
};

</script>

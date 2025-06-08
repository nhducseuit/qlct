<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card class="q-dialog-plugin" style="width: 400px; max-width: 90vw;">
      <q-form @submit.prevent="onSubmit" ref="memberFormRef" class="q-gutter-md">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editingMember ? 'Sửa Thành viên' : 'Thêm Thành viên Mới' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-input
            filled
            v-model="formData.name"
            label="Tên thành viên *"
            lazy-rules
            :rules="[val => !!val || 'Tên không được để trống']"
            autofocus
          />

          <q-checkbox
            v-model="formData.isActive"
            label="Đang hoạt động"
            class="q-mt-md"
          />

          <!-- Order field can be added later if manual ordering is needed from the form -->
          <!-- <q-input
            v-if="editingMember"
            filled
            v-model.number="formData.order"
            label="Thứ tự (không bắt buộc)"
            type="number"
            class="q-mt-md"
          /> -->

        </q-card-section>

        <q-card-actions align="right" class="text-primary q-pb-md q-pr-md">
          <q-btn flat label="Hủy" @click="onDialogCancel" />
          <q-btn color="primary" :label="editingMember ? 'Lưu' : 'Thêm'" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDialogPluginComponent, QForm } from 'quasar';
import type { HouseholdMember } from 'src/models';
import type { CreateHouseholdMemberPayload, UpdateHouseholdMemberPayload } from 'src/services/householdMemberApiService';

interface Props {
  editingMember?: HouseholdMember | null;
}

const props = defineProps<Props>();

defineEmits([
  ...useDialogPluginComponent.emits,
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const memberFormRef = ref<QForm | null>(null);
const formData = ref<Partial<CreateHouseholdMemberPayload | UpdateHouseholdMemberPayload>>({
  name: '',
  isActive: true, // Default to active for new members
  order: undefined, // Let backend handle order for new members initially
});

onMounted(() => {
  if (props.editingMember) {
    formData.value = {
      name: props.editingMember.name,
      isActive: props.editingMember.isActive,
      order: props.editingMember.order ?? undefined, // Use undefined if null
    };
  }
});

const onSubmit = async () => {
  if (!memberFormRef.value) return;
  const isValid = await memberFormRef.value.validate();
  if (isValid) {
    onDialogOK(formData.value);
  }
};
</script>

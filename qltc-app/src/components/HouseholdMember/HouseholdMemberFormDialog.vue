<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card class="q-dialog-plugin" style="width: 400px; max-width: 90vw;">
      <q-form @submit.prevent="onSubmit" ref="memberFormRef" class="q-gutter-md">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editingMember ? 'Sửa Thành viên' : 'Thêm Thành viên Mới' }}</div>
        </q-card-section>


        <q-card-section class="q-pt-md">
          <q-tabs v-model="mode" dense class="q-mb-md">
            <q-tab name="link" label="Liên kết người đã có" />
            <q-tab name="create" label="Tạo người mới" />
          </q-tabs>

          <div v-if="mode === 'link'">
            <q-select
              filled
              v-model="selectedPerson"
              :options="personOptions"
              option-label="name"
              option-value="id"
              label="Chọn người đã có *"
              use-input
              input-debounce="300"
              @filter="filterPersons"
              :loading="personLoading"
              :rules="[val => !!val || 'Vui lòng chọn người']"
              autofocus
            />
          </div>

          <div v-else>
            <q-input
              filled
              v-model="formData.name"
              label="Tên người mới *"
              lazy-rules
              :rules="[val => !!val || 'Tên không được để trống']"
              autofocus
            />
            <q-input
              filled
              v-model="formData.email"
              label="Email"
              type="email"
              class="q-mt-sm"
            />
            <q-input
              filled
              v-model="formData.phone"
              label="Số điện thoại"
              class="q-mt-sm"
            />
          </div>

          <q-checkbox
            v-model="formData.isActive"
            label="Đang hoạt động"
            class="q-mt-md"
          />
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
import type { CreateHouseholdMemberPayload } from 'src/services/householdMemberApiService';

interface Props {
  editingMember?: HouseholdMember | null;
}

const props = defineProps<Props>();

defineEmits([
  ...useDialogPluginComponent.emits,
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const memberFormRef = ref<QForm | null>(null);
const formData = ref<Partial<CreateHouseholdMemberPayload & { email?: string; phone?: string }>>({
  name: '',
  email: '',
  phone: '',
  isActive: true,
  // Do not include 'order' at all unless it is a number
});

const mode = ref<'link' | 'create'>('link');
import type { Person } from 'src/services/personApiService';
const selectedPerson = ref<Person | null>(null);
const personOptions = ref<Person[]>([]);
const personLoading = ref(false);

onMounted(() => {
  if (props.editingMember) {
    formData.value = {
      ...(props.editingMember.person?.name !== undefined ? { name: props.editingMember.person.name } : {}),
      ...(props.editingMember.person?.email !== undefined ? { email: props.editingMember.person.email } : {}),
      ...(props.editingMember.person?.phone !== undefined ? { phone: props.editingMember.person.phone } : {}),
      isActive: props.editingMember.isActive,
      ...(typeof props.editingMember.order === 'number' ? { order: props.editingMember.order } : {}),
    };
    mode.value = 'create'; // Editing always uses create mode
  }
});

import { searchPersonsAPI } from 'src/services/personApiService';
const filterPersons = async (val: string, update: (cb: () => void) => void) => {
  personLoading.value = true;
  try {
    const results = await searchPersonsAPI(val);
    personOptions.value = results;
  } catch {
    personOptions.value = [];
  } finally {
    personLoading.value = false;
    update(() => {});
  }
};

const onSubmit = async () => {
  if (!memberFormRef.value) return;
  const isValid = await memberFormRef.value.validate();
  if (!isValid) return;
  if (mode.value === 'link') {
    if (!selectedPerson.value) return;
    onDialogOK({ personId: selectedPerson.value.id, isActive: formData.value.isActive });
  } else {
    onDialogOK(formData.value);
  }
};
</script>

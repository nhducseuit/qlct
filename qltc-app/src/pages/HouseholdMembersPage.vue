<template>
  <q-page padding>
    <!-- Header and Add Member Button -->
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5">Quản lý Thành viên Gia đình</div>
      <q-btn
        color="primary"
        icon="person_add"
        label="Thêm Thành viên"
        @click="openAddMemberDialog()"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center q-my-xl">
      <q-spinner-dots color="primary" size="40px" />
      <p>Đang tải danh sách thành viên...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="members.length === 0" class="text-center text-grey-7 q-mt-xl">
      <q-icon name="sym_o_people" size="3em" />
      <p>Chưa có thành viên nào.</p>
      <p>Hãy bắt đầu bằng cách thêm thành viên mới.</p>
    </div>

    <!-- Member List -->
    <q-list bordered separator v-else>
      <q-item
        v-for="member in members"
        :key="member.id"
        :class="{ 'bg-grey-3 text-grey-6': !member.isActive }"
      >
        <q-item-section avatar>
          <q-avatar
            :color="member.isActive ? 'primary' : 'grey-5'"
            text-color="white"
            icon="person"
          />
        </q-item-section>

        <q-item-section>
          <q-item-label :lines="1">{{ member.name }}</q-item-label>
          <q-item-label caption :lines="1">
            {{ member.isActive ? 'Đang hoạt động' : 'Không hoạt động' }}
            <span v-if="member.order !== null && member.order !== undefined"> - Thứ tự: {{ member.order }}</span>
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row q-gutter-xs">
            <q-btn
              flat dense round
              :icon="member.isActive ? 'toggle_on' : 'toggle_off'"
              :disable="!member.isActive && members.filter(m => m.isActive).length === 1"
              :class="{'cursor-not-allowed': !member.isActive && members.filter(m => m.isActive).length === 1}"
              :color="member.isActive ? 'green' : 'grey'"
              @click="toggleMemberActiveStatus(member)"
              size="sm"
            ><q-tooltip>{{ member.isActive ? 'Hủy kích hoạt' : 'Kích hoạt' }}</q-tooltip></q-btn>
            <q-btn
              flat dense round icon="edit" color="info"
              @click="openEditMemberDialog(member)"
              size="sm"
            ><q-tooltip>Sửa</q-tooltip></q-btn>
            <q-btn
              flat dense round icon="delete" color="negative"
              @click="confirmDeleteMember(member.id, member.name)"
              size="sm"
              :disable="!member.isActive && members.filter(m => m.isActive).length === 1"
              :class="{'cursor-not-allowed': !member.isActive && members.filter(m => m.isActive).length === 1}"
            ><q-tooltip>Xóa</q-tooltip></q-btn>
            <!-- Reorder Buttons (only for active members) -->
            <template v-if="member.isActive">
              <q-btn
                flat dense round icon="arrow_upward" color="primary"
                @click="moveMemberUp(member.id)" size="sm"
              ><q-tooltip>Lên</q-tooltip></q-btn>
              <q-btn
                flat dense round icon="arrow_downward" color="primary"
                @click="moveMemberDown(member.id)" size="sm"
              ><q-tooltip>Xuống</q-tooltip></q-btn>
            </template>
            <!-- TODO: Add toggle active status button -->
          </div>
        </q-item-section>
      </q-item>
    </q-list>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHouseholdMemberStore } from 'src/stores/householdMemberStore';
import type { HouseholdMember } from 'src/models';
import { useQuasar } from 'quasar';
import HouseholdMemberFormDialog from 'src/components/HouseholdMember/HouseholdMemberFormDialog.vue';
import type { CreateHouseholdMemberPayload, UpdateHouseholdMemberPayload } from 'src/services/householdMemberApiService';

const $q = useQuasar();
const householdMemberStore = useHouseholdMemberStore();

const loading = ref(false);
const members = computed(() => householdMemberStore.members);

const openAddMemberDialog = () => {
  $q.dialog({
    component: HouseholdMemberFormDialog,
    componentProps: {
      // No editingMember prop for adding
    },
  }).onOk((formData: CreateHouseholdMemberPayload) => {
    householdMemberStore.addMember(formData)
    .catch(error => {
      // Error notification is handled in the store
      console.error('Failed to add household member from dialog:', error);
    });
  });
};

const openEditMemberDialog = (member: HouseholdMember) => {
  $q.dialog({
    component: HouseholdMemberFormDialog,
    componentProps: {
      editingMember: member,
    },
  }).onOk( (formData: UpdateHouseholdMemberPayload) => {
    householdMemberStore.updateMember(member.id, formData)
    .catch(error => {
      // Error notification is handled in the store
      console.error('Failed to update household member from dialog:', error);
    });
  });
};

const confirmDeleteMember = (memberId: string, memberName: string) => {
  $q.dialog({
    title: 'Xác nhận Xóa',
    message: `Bạn có chắc chắn muốn xóa thành viên "${memberName}"? Hành động này không thể hoàn tác.`,
    // TODO: Consider adding a warning if the member is used in transactions or split ratios.
    // This check would ideally be on the backend, which currently has a TODO for it.
    // message: `Bạn có chắc chắn muốn xóa thành viên "${memberName}"? Nếu thành viên này đã có giao dịch hoặc được sử dụng trong tỷ lệ chia, việc xóa có thể gây ra lỗi dữ liệu.`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Xóa',
      color: 'negative',
    },
  }).onOk(() => {
    householdMemberStore.deleteMember(memberId)
    .catch(error => {
      // Error notification is handled in the store
      console.error('Failed to delete household member from page:', error);
    });
  });
};

const toggleMemberActiveStatus = (member: HouseholdMember) => {
  householdMemberStore.updateMember(member.id, { isActive: !member.isActive })
  .then(() => {
    // Notification is handled by the store or WebSocket update
  })
  .catch(error => {
    // Error notification is handled in the store
    console.error('Failed to toggle member active status from page:', error);
  });
};

const moveMemberUp = async (id: string) => {
  await householdMemberStore.reorderMember(id, 'up');
};

const moveMemberDown = async (id: string) => {
  await householdMemberStore.reorderMember(id, 'down');
};

onMounted(() => {
  // Ensure data is loaded when the component is mounted, especially for direct navigation.
  if (members.value.length === 0) {
    loading.value = true;
    void householdMemberStore.loadMembers().finally(() => {
      loading.value = false;
    });
  }
});
</script>

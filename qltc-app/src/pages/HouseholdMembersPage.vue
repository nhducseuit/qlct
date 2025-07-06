<template>
  <q-page padding>
    <!-- Header (Add Member Button hidden for all users) -->
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5">Quản lý Thành viên Gia đình</div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center q-my-xl">
      <q-spinner-dots color="primary" size="40px" />
      <p>Đang tải danh sách thành viên...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="familyGroups.length === 0" class="text-center text-grey-7 q-mt-xl">
      <q-icon name="sym_o_people" size="3em" />
      <p>Chưa có thành viên nào.</p>
    </div>

    <!-- Hierarchical Family-Member List -->
    <q-list bordered separator v-else>
      <template v-for="family in familyGroups" :key="family.id">
        <q-item class="bg-grey-2">
          <q-item-section>
            <q-item-label class="text-bold">{{ family.name }}</q-item-label>
            <q-item-label caption v-if="family.parentId">(Nhóm con)</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-for="member in family.members" :key="member.id" :class="{ 'bg-grey-3 text-grey-6': !member.isActive }">
          <q-item-section avatar>
            <q-avatar :color="member.isActive ? 'primary' : 'grey-5'" text-color="white" icon="person" />
          </q-item-section>
          <q-item-section>
            <!-- Editable name and info left-aligned -->
            <div class="row items-center">
              <q-input
                v-model="member.person.name"
                dense
                borderless
                @blur="householdMemberStore.updateMember(member.id, { name: member.person.name })"
                :readonly="loading"
                style="max-width: 200px; min-width: 120px;"
                class="q-mr-md"
              />
              <span class="text-caption text-grey-7 q-mr-md">
                <span v-if="member.person?.email">{{ member.person.email }}</span>
                <span v-if="member.person?.email && member.person?.phone"> | </span>
                <span v-if="member.person?.phone">{{ member.person.phone }}</span>
              </span>
            </div>
          </q-item-section>
          <q-item-section side class="q-gutter-x-sm" style="min-width: 220px; max-width: 300px;">
            <!-- Controls right-aligned -->
            <q-toggle
              v-model="member.isActive"
              color="primary"
              checked-icon="check"
              unchecked-icon="close"
              @update:model-value="val => householdMemberStore.updateMember(member.id, { isActive: val })"
              :disable="loading"
              size="sm"
              class="q-mr-sm"
            />
            <!-- Removed status and order text as requested -->
            <!-- Order change buttons are disabled for now -->
          </q-item-section>
        </q-item>
      </template>
    </q-list>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHouseholdMemberStore } from 'src/stores/householdMemberStore';
// import HouseholdMemberFormDialog from 'src/components/HouseholdMember/HouseholdMemberFormDialog.vue';
// import type { CreateHouseholdMemberPayload } from 'src/services/householdMemberApiService';

// const $q = useQuasar();
const householdMemberStore = useHouseholdMemberStore();

const loading = ref(false);
const familyGroups = computed(() => householdMemberStore.familyGroups);





onMounted(async () => {
  loading.value = true;
  await householdMemberStore.loadMembersHierarchical();
  await householdMemberStore.loadMembers();
  loading.value = false;
});
</script>

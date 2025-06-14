<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Công cụ quản lý chi tiêu gia đình nhỏ xinh ( ´ ω ` )
        </q-toolbar-title>

        <div v-if="authStore.isAuthenticated && authStore.user" class="q-mr-md">
          {{ isDevMode ? `DEV Mode: ${authStore.user.email}` : `Chào, ${authStore.user.email}` }}
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      v-if="authStore.isAuthenticated"
    >
      <q-list>
        <q-item-label
          header
        >
          Truy cập nhanh
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <!-- Page container will render login/register if not authenticated, or main content if authenticated -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from 'src/stores/authStore';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';

const authStore = useAuthStore();

const isDevMode = computed(() => import.meta.env.DEV);

const linksList: EssentialLinkProps[] = [
  {
    title: 'Thêm chi tiêu / thu nhập',
    caption: 'Thêm chi tiêu / thu nhập',
    icon: 'sym_o_edit_square', // Hoặc 'edit_note'
    link: { name: 'QuickEntry' }
  },
  {
    title: 'Danh sách ghi chú thu/chi',
    caption: 'Danh sách ghi chú thu/chi',
    icon: 'receipt_long', // Or 'list_alt', 'request_quote'
    link: { name: 'Transactions' }
  },
  {
    title: 'Quản lý Danh mục thu/chi',
    caption: 'Quản lý danh mục thu/chi',
    icon: 'sym_o_category', // Hoặc 'category'
    link: { name: 'categoriesManagement' }
  },
  {
    title: 'Thành viên',
    caption: 'Quản lý thành viên gia đình',
    icon: 'sym_o_groups', // Or 'people'
    link: { name: 'HouseholdMembers' }
  },
  {
    title: 'Báo cáo & Thống kê',
    caption: 'Xem các báo cáo tài chính',
    icon: 'sym_o_monitoring', // Or 'bar_chart', 'analytics'
    link: { name: 'Reports' }
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

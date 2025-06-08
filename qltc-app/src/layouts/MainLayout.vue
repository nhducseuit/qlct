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
          QLTC App
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
          Essential Links
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
    title: 'Nhập liệu',
    caption: 'Thêm thu/chi',
    icon: 'sym_o_edit_square', // Hoặc 'edit_note'
    link: { name: 'home' }
  },
  {
    title: 'Quản lý Danh mục',
    caption: 'Thiết lập danh mục thu/chi',
    icon: 'sym_o_category', // Hoặc 'category'
    link: { name: 'categoriesManagement' }
  }
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

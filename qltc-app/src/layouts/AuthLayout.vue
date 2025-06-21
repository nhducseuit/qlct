<template>
  <q-layout view="lHh Lhh lff"> <!-- Or any simple view -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// This layout provides the minimal structure for pages like login/register
// that need a q-page but don't use the full MainLayout.
</script>

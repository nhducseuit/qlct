<template>
  <div class="q-pa-sm">
    <q-input
      v-model="searchTerm"
      label="Tìm kiếm icon"
      dense
      clearable
      class="q-mb-sm"
    />
    <q-scroll-area style="height: 200px; max-width: 100%;">
      <div class="row q-gutter-sm">
        <q-btn
          v-for="iconName in filteredIcons"
          :key="iconName"
          flat
          dense
          padding="sm"
          @click="selectIcon(iconName)"
        >
          <TablerIcon :name="iconName" size="md" />
          <q-tooltip :delay="500">{{ iconName.replace('Icon', '') }}</q-tooltip>
        </q-btn>
        <div v-if="!filteredIcons.length" class="text-grey-7 q-pa-md">
          Không tìm thấy icon.
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import * as TablerIcons from '@tabler/icons-vue';
import TablerIcon from 'src/components/Common/TablerIcon.vue';

const emit = defineEmits<{
  (e: 'icon-selected', iconName: string): void;
}>();

// Lấy danh sách tên các icon từ TablerIcons (bỏ qua các thành phần không phải component icon)
const allIconNames = Object.keys(TablerIcons).filter(
  // Attempting a more specific type for a Vue component's render function.
  // VNode is a common return type, but can also be null/void.
  // If this is still too broad or causes issues, `(...args: unknown[]) => unknown` might be a step up from `any`.
  (key) => typeof (TablerIcons as Record<string, { render?: (...args: unknown[]) => unknown }>)[key] === 'object' && !!(TablerIcons as Record<string, { render?: (...args: unknown[]) => unknown }>)[key]?.render
);

const searchTerm = ref('');

const filteredIcons = computed(() => {
  if (!searchTerm.value) {
    return allIconNames.slice(0, 100); // Giới hạn số lượng icon hiển thị ban đầu cho performance
  }
  return allIconNames.filter(name => name.toLowerCase().includes(searchTerm.value.toLowerCase()));
});

const selectIcon = (iconName: string) => {
  emit('icon-selected', iconName);
};
</script>

<template>
      <component :is="iconComponent" v-if="iconComponent" :size="resolvedSize" :stroke-width="props.strokeWidth" />
</template>

<script setup lang="ts">
import { shallowRef, watchEffect, computed, type Component } from 'vue';
import * as TablerIcons from '@tabler/icons-vue';

const props = defineProps({
  name: { type: String, required: true }, // e.g., 'icon-home', 'home'
  size: { type: [String, Number], default: 24 },
  strokeWidth: { type: [String, Number], default: 2 },
});

// Map Quasar size aliases to pixel values for the underlying SVG component
const resolvedSize = computed(() => {
  if (typeof props.size === 'number') {
    return props.size; // Already a number
  }
  const parsed = parseInt(props.size, 10);
  switch (props.size) {
    case 'xs': return 16; // Example mapping in pixels
    case 'sm': return 20; // Example mapping
    case 'md': return 24; // Example mapping (Tabler Icons default)
    case 'lg': return 32; // Example mapping
    case 'xl': return 48; // Example mapping
    default:
      // If it's a string but not a recognized alias, try parsing as number or default
      return isNaN(parsed) ? 24 : parsed;
  }
});

const iconComponent = shallowRef<Component | null>(null);

watchEffect( () => {
  const iconName = props.name.startsWith('Icon') ? props.name : `Icon${props.name.charAt(0).toUpperCase() + props.name.slice(1).replace(/-/g, '')}`;
  iconComponent.value = (TablerIcons as unknown as Record<string, Component>)[iconName] || null;
});
</script>

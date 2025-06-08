<template>
  <q-item
    :class="{ 'bg-grey-2': isSelected, 'q-pl-lg': isSubItem }"
    clickable
    v-ripple
  >
    <q-item-section avatar v-if="category.icon && !isSubItem">
      <q-avatar :style="{ backgroundColor: category.color || '#e0e0e0' }" text-color="white" size="md">
        <TablerIcon :name="category.icon" />
      </q-avatar>
    </q-item-section>

    <q-item-section avatar v-if="category.icon && isSubItem" style="min-width: 30px;">
       <TablerIcon :name="category.icon" size="xs" />
    </q-item-section>

     <q-item-section :class="{'text-grey-5': category.isHidden }">
      <q-item-label :lines="1">{{ category.name }}</q-item-label>
      <q-item-label caption v-if="category.budgetLimit">
        Hạn mức: {{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(category.budgetLimit) }}
      </q-item-label>
    </q-item-section>

    <q-item-section side>
      <div class="row items-center q-gutter-xs">
        <q-btn
          flat
          dense
          round
          icon="arrow_upward"
          color="grey-7"
          @click.stop="$emit('move-up', category.id)"
          size="sm"
        >
          <q-tooltip>Di chuyển lên</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          round
          icon="arrow_downward"
          color="grey-7"
          @click.stop="$emit('move-down', category.id)"
          size="sm"
        >
          <q-tooltip>Di chuyển xuống</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          round
          :icon="'push_pin'"
          :color="category.isPinned ? 'deep-orange' : 'grey'"
          @click.stop="$emit('toggle-pin', category.id)"
          size="sm"
        >
          <q-tooltip>{{ category.isPinned ? 'Bỏ ghim' : 'Ghim lên chọn nhanh' }}</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          round
          :icon="category.isHidden ? 'visibility_off' : 'visibility'"
          :color="category.isHidden ? 'grey' : 'primary'"
          @click.stop="$emit('toggle-hide', category.id)"
           size="sm"
        >
          <q-tooltip>{{ category.isHidden ? 'Hiện danh mục' : 'Ẩn danh mục' }}</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          round
          icon="edit"
          color="primary"
          @click.stop="$emit('edit', category)"
           size="sm"
        >
          <q-tooltip>Sửa danh mục</q-tooltip>
        </q-btn>
         <q-btn
          v-if="!isSubItem"
          flat
          dense
          round
          icon="add_circle"
          color="positive"
          @click.stop="$emit('add-sub', category.id)"
          size="sm"
        >
          <q-tooltip>Thêm danh mục con</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          round
          icon="delete"
          color="negative"
          @click.stop="$emit('delete', category.id)"
           size="sm"
        >
          <q-tooltip>Xóa danh mục</q-tooltip>
        </q-btn>
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import type { Category } from 'src/models';
import TablerIcon from 'src/components/Common/TablerIcon.vue';

interface Props {
  category: Category;
  isSelected?: boolean;
  isSubItem?: boolean;
}

defineProps<Props>();

defineEmits<{
  (e: 'edit', category: Category): void;
  (e: 'delete', id: string): void;
  (e: 'toggle-pin', id: string): void;
  (e: 'toggle-hide', id: string): void;
  (e: 'add-sub', parentId: string): void;
  (e: 'move-up', id: string): void;
  (e: 'move-down', id: string): void;
}>();
</script>

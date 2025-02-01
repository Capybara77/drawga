<script setup lang="ts">
import EllipseIcon from '@/icons/EllipseIcon.vue';
import EraserIcon from '@/icons/EraserIcon.vue';
import ImageIcon from '@/icons/ImageIcon.vue';
import LineIcon from '@/icons/LineIcon.vue';
import PenIcon from '@/icons/PenIcon.vue';
import PointerIcon from '@/icons/PointerIcon.vue';
import RectangleIcon from '@/icons/RectangleIcon.vue';
import TextIcon from '@/icons/TextIcon.vue';
import { useCursorStore } from '@/stores/cursor';
import type { MyCursor } from '@/types';
import type { Component } from 'vue';

type CursorItem = {
  name: string;
  key: MyCursor;
  title: string;
  icon: Component;
};

const items: CursorItem[] = [
  { name: 'Курсор', key: 'pointer', title: "Курсор - 'f' или 1", icon: PointerIcon },
  { name: 'Ластик', key: 'eraser', title: "Ластик - 'e' или 2", icon: EraserIcon },
  { name: 'Карандаш', key: 'pen', title: "Карандаш - 'p' или 3", icon: PenIcon },
  {
    name: 'Прямоугольник',
    key: 'rectangle',
    title: "Прямоугольник - 'r' или 4",
    icon: RectangleIcon,
  },
  { name: 'Прямая линия', key: 'line', title: "Прямая линия - 'v' или 5", icon: LineIcon },
  { name: 'Окружность', key: 'ellipse', title: "Окружность - 'c' или 6", icon: EllipseIcon },
  { name: 'Текст', key: 'text', title: "Текст - 't' или 7", icon: TextIcon },
  { name: 'Изображение', key: 'image', title: "Изображение - 'i' или 8", icon: ImageIcon },
];

const cursorStore = useCursorStore();

const pickCursor = (newCursor: MyCursor) => {
  cursorStore.setCursor(newCursor);
};
</script>

<template>
  <div class="cursor-container">
    <div
      v-for="item in items"
      :key="item.key"
      :class="'cursor-item' + (cursorStore.cursor === item.key ? ' active-shape' : '')"
      :title="item.title"
      @click="() => pickCursor(item.key)"
    >
      <button class="top-btn" :data-shape-option="item.key" :id="item.key + '-btn'">
        <component :is="item.icon"></component>
      </button>
    </div>
  </div>
</template>

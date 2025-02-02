<script setup lang="ts">
import EllipseIcon from '@/icons/cursors/EllipseIcon.vue';
import EraserIcon from '@/icons/cursors/EraserIcon.vue';
import ImageIcon from '@/icons/cursors/ImageIcon.vue';
import LineIcon from '@/icons/cursors/LineIcon.vue';
import PenIcon from '@/icons/cursors/PenIcon.vue';
import PointerIcon from '@/icons/cursors/PointerIcon.vue';
import RectangleIcon from '@/icons/cursors/RectangleIcon.vue';
import TextIcon from '@/icons/cursors/TextIcon.vue';
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

<style>
.cursor-container {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translate(-50%, 0);

  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 1rem;
  border: 2px solid var(--clr-border);
  border-radius: 5px;
  background-color: var(--clr-background-transparent);
  padding: 5px 10px;
}

.shape-btn {
  background-color: var(--clr-background-icons);
  border: 2px solid var(--clr-border);
  padding: 6px;
  border-radius: 5px;

  cursor: pointer;

  transition: background-color 100ms ease;
}

.cursor-icon {
  pointer-events: none;
  width: 20px;
  height: 100%;

  color: var(--clr-icon);
}

.fill-icon {
  fill: var(--clr-fill);
}

.top-btn {
  padding: 6px;
  border-radius: 5px;

  position: relative;
  background-color: inherit;
  border: none;
  outline: none;
  cursor: pointer !important;

  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  font-weight: bold;
}

#pointer-btn::after {
  content: '1';
  position: absolute;
  bottom: 1px;
  right: -1px;
  width: 10px;
  height: 10px;
  color: var(--clr-text);
}

#eraser-btn::after {
  content: '2';
  position: absolute;
  bottom: 1px;
  right: -1px;
  width: 10px;
  height: 10px;
  color: var(--clr-text);
}

#pen-btn::after {
  content: '3';
  position: absolute;
  bottom: 1px;
  right: -1px;
  width: 10px;
  height: 10px;
  color: var(--clr-text);
}

#rectangle-btn::after {
  content: '4';
  position: absolute;
  bottom: 1px;
  right: -1px;
  width: 10px;
  height: 10px;
  color: var(--clr-text);
}

#line-btn::after {
  content: '5';
  position: absolute;
  bottom: 1px;
  right: -1px;
  width: 10px;
  height: 10px;
  color: var(--clr-text);
}

#ellipse-btn::after {
  content: '6';
  position: absolute;
  bottom: 1px;
  right: -1px;
  width: 10px;
  height: 10px;
  color: var(--clr-text);
}

#text-btn::after {
  content: '7';
  position: absolute;
  bottom: 1px;
  right: -1px;
  width: 10px;
  height: 10px;
  color: var(--clr-text);
}

#image-btn::after {
  content: '8';
  position: absolute;
  bottom: 1px;
  right: -1px;
  width: 10px;
  height: 10px;
  color: var(--clr-text);
}

.active-shape {
  background-color: var(--clr-primary-active);
  color: var(--clr-primary);
}
</style>

<script setup lang="ts">
import { useParticipantsStore } from "@/stores/participants";
import { useZoomStore } from "@/stores/zoom";

const { offsetX, offsetY } = defineProps<{
  offsetX: number;
  offsetY: number;
}>();

const participantsStore = useParticipantsStore();
const zoomStore = useZoomStore();

const translateById = (userX: number, userY: number): string => {
  const x = userX * zoomStore.zoom + offsetX;
  const y = userY * zoomStore.zoom + offsetY;

  return `translate(${x}px, ${y}px)`;
};

const colorById = (id: string): number => {
  return [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
};

// * 137 разносит оттенки по кругу: у похожих id суммы близкие, а цвета — нет.
// светлота 45% — чтобы белый текст читался и на жёлтом, и на голубом
const userColor = (id: string) => `hsl(${(colorById(id) * 137) % 360}, 70%, 45%)`;
</script>

<template>
  <div
    v-for="{ id, name, x, y } in participantsStore.list"
    :key="id"
    class="cursor"
    :style="{ transform: translateById(x, y), '--user-color': userColor(id) }"
  >
    <!-- кончик стрелки — в точке (0, 0), ровно там, где мышь у автора -->
    <svg class="cursor-arrow" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M1 1 L1 15 L5 11 L8 17 L10.5 16 L7.5 10 L13 10 Z" />
    </svg>
    <span class="cursor-name">{{ name }}</span>
  </div>
</template>

<style scoped>
.cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100000;
  pointer-events: none;
  /* курсор приходит рывками по сети — сглаживаем короткой линейной анимацией */
  transition: transform 80ms linear;
}

.cursor-arrow {
  display: block;
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.35));
}

.cursor-arrow path {
  fill: var(--user-color);
  stroke: #fff;
  stroke-width: 1.5;
  stroke-linejoin: round;
}

/* плашка своим цветом: имя не сливается ни с полотном, ни с рисунками */
.cursor-name {
  position: absolute;
  top: 16px;
  left: 12px;
  padding: 2px 8px;
  border-radius: 4px 10px 10px 10px;
  background: var(--user-color);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.3);
}

@media (prefers-reduced-motion: reduce) {
  .cursor {
    transition: none;
  }
}
</style>

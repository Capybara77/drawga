<script setup lang="ts">
import { useZoomStore } from '@/stores/zoom/';

const zoomStore = useZoomStore();
</script>

<template>
  <div class="zoom-container">
    <button class="zoom-btn" id="zoom-decrease" @click="zoomStore.decreaseZoom">
      <span>-</span>
    </button>
    <div class="zoom-current-container">
      <span id="zoom-current">{{ zoomStore.percentage }}</span>
    </div>
    <button class="zoom-btn" id="zoom-increase" @click="zoomStore.increaseZoom">
      <span>+</span>
    </button>
  </div>
</template>

<style>
.zoom-container {
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--clr-border);
  border-radius: 5px;
  background-color: var(--clr-background-transparent);
  padding: 0 10px;
}

.zoom-container > * {
  cursor: pointer;
}

.zoom-current-container {
  font-size: 1rem;
  padding: 8px;
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 41px;
  color: var(--clr-text);
}

.zoom-btn {
  padding: 6px;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  color: var(--clr-text);
  font-size: 1.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 150ms ease-in-out;
}

.zoom-btn:hover {
  border: 1px solid var(--clr-border);
}
</style>

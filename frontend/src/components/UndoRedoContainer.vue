<script setup lang="ts">
import { useAllObjectsStore } from "@/stores/allObjects";
import Undo from "@primeicons/vue/undo";

const allObjectsStore = useAllObjectsStore()
</script>

<template>
  <div class="undo-container">
    <button class='undoredo-btn' id="undo" :disabled="!allObjectsStore.canUndo" title="undo button"
      @click="allObjectsStore.undo()">
      <Undo />
    </button>
    <button class='undoredo-btn' id="redo" :disabled="!allObjectsStore.canRedo" title="redo button"
      @click="allObjectsStore.redo()">
      <Undo />
    </button>
  </div>
</template>

<style scoped>
.undo-container {
  position: absolute;
  bottom: 10px;
  /* ponytail: сразу справа от зума (10px отступ + 139px ширина зума + 8px зазор) */
  left: 157px;
  height: 59px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--clr-border);
  border-radius: 5px;
  background-color: var(--clr-background-transparent);
  padding: 0 10px;
}

.undoredo-btn {
  cursor: pointer;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 5px;
  color: var(--clr-text);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 150ms ease-in-out;
}

.undoredo-btn svg {
  width: 18px;
  height: 18px;
}

.undoredo-btn:hover:not(:disabled) {
  background-color: var(--clr-hover);
}

.undoredo-btn:focus-visible {
  outline: 2px solid var(--clr-primary);
  outline-offset: 1px;
}

.undoredo-btn:disabled {
  cursor: default;
  opacity: 0.35;
}

/* redo — та же иконка, отражённая по горизонтали */
#redo svg {
  transform: scaleX(-1);
}
</style>

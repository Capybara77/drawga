<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
  onClick: (color: string) => void;
  colorsList: string[];
}>();
</script>

<template>
  <div class="color-list" id="color-list" v-if="props.isOpen">
    <div
      v-for="color in props.colorsList"
      :key="color"
      class="color-item"
      :id="'color-item-#' + color"
      :style="{ backgroundColor: `#${color}` }"
      @click="() => props.onClick(color)"
    ></div>
  </div>
</template>

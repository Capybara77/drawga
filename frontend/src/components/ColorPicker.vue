<script setup lang="ts">
const { colorsList } = defineProps<{
  isOpen: boolean;
  colorsList: string[];
}>();

defineEmits<{
  colorClick: [color: string];
}>();
</script>

<template>
  <div class="color-list" id="color-list" v-if="isOpen">
    <div
      v-for="color in colorsList"
      :key="color"
      class="color-item"
      :id="'color-item-#' + color"
      :style="{ backgroundColor: `#${color}` }"
      @click="$emit('colorClick', color)"
    ></div>
  </div>
</template>

<style scoped>
.color-item {
  width: 30px;
  height: 30px;
  border-radius: 4px;
}
</style>

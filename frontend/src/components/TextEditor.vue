<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from "vue";

defineProps<{
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}>();

defineEmits<{
  commit: [text: string];
  commitTemp: [text: string];
}>();

const textarea = useTemplateRef<HTMLTextAreaElement>("textarea");

const handleBlur = () => {
  const area = textarea.value;

  if (area) area.blur();
};

const handleFocus = () => {
  const area = textarea.value;

  if (area) area.focus();
};

onMounted(async () => {
  handleFocus();
});

onUnmounted(() => {
  handleBlur();
});
</script>

<template>
  <textarea
    ref="textarea"
    @blur="$emit('commit', textarea?.value ?? '')"
    @input="$emit('commitTemp', textarea?.value ?? '')"
    @keydown.esc="handleBlur"
    :style="{
      top: `${y}px`,
      left: `${x}px`,
      fontSize: `${fontSize}px`,
      color: `#${color}`,
      fontFamily,
    }"
  >
  </textarea>
</template>

<style scoped>
textarea {
  position: fixed;
  background: transparent;
  border: none;
  resize: none;
  outline: none;
  line-height: 1.25;
  padding: 0;
  margin: 0;
}
</style>

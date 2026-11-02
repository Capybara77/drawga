<script setup lang="ts">
import { onClickOutside, useDraggable, useResizeObserver } from "@vueuse/core";
import { onMounted, useTemplateRef } from "vue";

const props = defineProps<{
  x: number;
  y: number;
  src: string;
  width: number;
  height: number;
}>();

const emits = defineEmits<{
  commit: [{ x: number; y: number; width: number; height: number }];
  // commitTemp: [text: string];
}>();

const editor = useTemplateRef("editor");
const image = useTemplateRef("image");

const { style, x, y } = useDraggable(editor, {
  initialValue: {
    x: props.x,
    y: props.y,
  },
  preventDefault: true,
  handle: image,
});

onMounted(() => {
  if (editor.value) editor.value.style.width = `${props.width}px`;
});

// useResizeObserver(editor, (entries) => {
//   const entry = entries[0];
//   const { width, height } = entry.contentRect;
//   emits("commitTemp", `resize w: ${width} / h: ${height}`);
// });

onClickOutside(editor, (event) => {
  if (!editor.value) return;

  emits("commit", {
    x: x.value,
    y: y.value,
    width: editor.value?.clientWidth,
    height: editor.value?.clientHeight,
  });
});
</script>

<template>
  <div
    ref="editor"
    class="image-editor"
    draggable="true"
    :style="[
      style,
      {
        aspectRatio: `${width} / ${height}`,
      },
    ]"
  >
    <img ref="image" :src />
  </div>
</template>

<style scoped>
.image-editor {
  resize: horizontal;
  overflow: hidden;
  position: fixed;
  /* outline, а не border: рамка не сдвигает картинку и не уменьшает clientWidth */
  outline: 2px dashed black;
}
.image-editor img {
  display: block;
  width: 100%;
  height: 100%;
}
</style>

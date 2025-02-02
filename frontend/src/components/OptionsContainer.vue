<script setup lang="ts">
import { useOptionsStore } from '@/stores/options';
import { useCursorStore } from '@/stores/cursor';
import type { MyCursor } from '@/types';
import { computed, ref } from 'vue';
import ColorPicker from './ColorPicker.vue';

const cursorStore = useCursorStore();
const optionsStore = useOptionsStore();

const hiddenCursors: MyCursor[] = ['pointer', 'eraser', 'text', 'image'];
const isOptionsHidden = computed(() => hiddenCursors.includes(cursorStore.cursor as MyCursor));

const isFillColorOpen = ref(false);
const isBorderColorOpen = ref(false);
const isTextColorOpen = ref(false);

const closeAllPickers = () => {
  isFillColorOpen.value = false;
  isBorderColorOpen.value = false;
  isTextColorOpen.value = false;
};

const toggleFillColor = () => {
  closeAllPickers();
  isFillColorOpen.value = !isFillColorOpen.value;
};

const toggleBorderColor = () => {
  closeAllPickers();
  isBorderColorOpen.value = !isBorderColorOpen.value;
};

const toggleTextColor = () => {
  closeAllPickers();
  isTextColorOpen.value = !isTextColorOpen.value;
};

const pickColor = (color: string, variant: 'fill' | 'border' | 'text') => {
  switch (variant) {
    case 'fill':
      optionsStore.setFillColor(color);
      break;
    case 'border':
      optionsStore.setBorderColor(color);
      break;
    case 'text':
      optionsStore.setTextColor(color);
      break;
    default:
      break;
  }
  closeAllPickers();
};
</script>

<template>
  <div class="options-wrapper" :style="{ display: isOptionsHidden ? 'none' : 'flex' }">
    <div class="options-color-container" id="options-color-fill">
      <p>Цвет зарисовки</p>
      <div class="color-container">
        <div
          class="color-picker"
          @click="toggleFillColor"
          :style="{ backgroundColor: optionsStore.colors.fillColor }"
        ></div>

        <ColorPicker
          :is-open="isFillColorOpen"
          :colors-list="optionsStore.allOptions.colors"
          @click="(color) => pickColor(color, 'fill')"
        />

        <div class="color-picker-input">
          <p>#</p>
          <input
            placeholder="000000"
            type="text"
            id="color-picker-input"
            v-model="optionsStore.colors.fillColor"
          />
        </div>
      </div>
    </div>
    <div class="options-color-container" id="options-color-border">
      <p>Цвет границы</p>
      <div class="color-container">
        <div
          class="color-picker"
          id="stroke-color-picker"
          @click="toggleBorderColor"
          :style="{ backgroundColor: optionsStore.colors.borderColor }"
        ></div>

        <ColorPicker
          :is-open="isBorderColorOpen"
          :colors-list="optionsStore.allOptions.colors"
          @click="(color) => pickColor(color, 'border')"
        />

        <div class="color-picker-input" id="stroke-color-picker-container">
          <p>#</p>
          <input
            placeholder="000000"
            type="text"
            id="stroke-color-picker-input"
            v-model="optionsStore.colors.borderColor"
          />
        </div>
      </div>
    </div>
    <div class="options-color-container" id="options-color-text">
      <p>Цвет текста</p>
      <div class="color-container">
        <div
          class="color-picker"
          id="text-color-picker"
          @click="toggleTextColor"
          :style="{ backgroundColor: optionsStore.colors.textColor }"
        ></div>

        <ColorPicker
          :is-open="isTextColorOpen"
          :colors-list="optionsStore.allOptions.colors"
          @click="(color) => pickColor(color, 'text')"
        />

        <div class="color-picker-input" id="text-color-picker-container">
          <p>#</p>
          <input
            placeholder="000000"
            type="text"
            id="text-color-picker-input"
            v-model="optionsStore.colors.textColor"
          />
        </div>
      </div>
    </div>
    <div class="options-container" id="width-options-container">
      <p>Толщина линии</p>
      <div class="options-btns-container">
        <div v-for="lineSize in optionsStore.allOptions.lineWidths">
          <button
            :class="
              'option-btn width-btn' +
              (optionsStore.lineWidth === lineSize.value ? ' active-option' : '')
            "
            :data-line-width="lineSize.value"
            :key="lineSize.value"
            @click="() => optionsStore.setLineWidth(lineSize.value)"
          >
            {{ lineSize.label }}
          </button>
        </div>
      </div>
    </div>
    <div class="options-container" id="font-size-options-container">
      <p>Размер текста</p>
      <div class="options-btns-container">
        <div v-for="textSize in optionsStore.allOptions.textSizes">
          <button
            :class="
              'option-btn font-size-btn ' +
              (optionsStore.textSize === textSize.value ? 'active-option' : '')
            "
            :data-font-size="textSize.value"
            :key="textSize.value"
            @click="() => optionsStore.setTextSize(textSize.value)"
          >
            {{ textSize.label }}
          </button>
        </div>
      </div>
    </div>
    <div class="options-container" id="opacity-options-container">
      <p>Прозрачность линии</p>
      <input
        type="range"
        min="0.1"
        max="1"
        step="0.1"
        id="input-opacity"
        v-model.lazy="optionsStore.opacity"
      />
    </div>
    <div class="options-container" id="fill-style-options-container">
      <p>Стиль заливки</p>
      <div class="fill-style-options-container">
        <button
          v-for="fillStyle in optionsStore.allOptions.fillStyles"
          @click="() => optionsStore.setFillStyle(fillStyle)"
          :key="fillStyle"
          :class="
            'fill-style-btn ' + (optionsStore.fillStyle === fillStyle ? 'active-fill-style' : '')
          "
        >
          {{ fillStyle }}
        </button>
      </div>
    </div>
  </div>
</template>

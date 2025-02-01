<script setup lang="ts">
import { useColorsStore } from '@/stores/colors';
import { useCursorStore } from '@/stores/cursor';
import type { MyCursor } from '@/types';
import { computed, ref } from 'vue';
import ColorPicker from './ColorPicker.vue';

const cursorStore = useCursorStore();
const colorsStore = useColorsStore();

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
      colorsStore.setFillColor(color);
      break;
    case 'border':
      colorsStore.setBorderColor(color);
      break;
    case 'text':
      colorsStore.setTextColor(color);
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
          :style="{ backgroundColor: colorsStore.fillColor }"
        ></div>

        <ColorPicker
          :is-open="isFillColorOpen"
          :colors-list="colorsStore.allColors"
          @click="(color) => pickColor(color, 'fill')"
        />

        <div class="color-picker-input">
          <p>#</p>
          <input
            placeholder="000000"
            type="text"
            id="color-picker-input"
            v-model="colorsStore.fillColor"
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
          :style="{ backgroundColor: colorsStore.borderColor }"
        ></div>

        <ColorPicker
          :is-open="isBorderColorOpen"
          :colors-list="colorsStore.allColors"
          @click="(color) => pickColor(color, 'border')"
        />

        <div class="color-picker-input" id="stroke-color-picker-container">
          <p>#</p>
          <input
            placeholder="000000"
            type="text"
            id="stroke-color-picker-input"
            v-model="colorsStore.borderColor"
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
          :style="{ backgroundColor: colorsStore.textColor }"
        ></div>

        <ColorPicker
          :is-open="isTextColorOpen"
          :colors-list="colorsStore.allColors"
          @click="(color) => pickColor(color, 'text')"
        />

        <div class="color-picker-input" id="text-color-picker-container">
          <p>#</p>
          <input
            placeholder="000000"
            type="text"
            id="text-color-picker-input"
            v-model="colorsStore.textColor"
          />
        </div>
      </div>
    </div>
    <div class="options-container" id="width-options-container">
      <p>Толщина линии</p>
      <div class="options-btns-container">
        <div>
          <button class="option-btn width-btn" id="small-width-btn" data-line-width="5">
            smol
          </button>
        </div>
        <div>
          <button
            class="option-btn width-btn active-option"
            id="middle-width-btn"
            data-line-width="12"
          >
            norm
          </button>
        </div>
        <div>
          <button class="option-btn width-btn" id="large-width-btn" data-line-width="20">
            larj
          </button>
        </div>
      </div>
    </div>
    <div class="options-container" id="font-size-options-container">
      <p>Размер текста</p>
      <div class="options-btns-container">
        <div>
          <button class="option-btn font-size-btn" id="font-s-btn" data-font-size="0.875rem">
            S
          </button>
        </div>
        <div>
          <button
            class="option-btn font-size-btn active-option"
            id="font-m-btn"
            data-font-size="1rem"
          >
            M
          </button>
        </div>
        <div>
          <button class="option-btn font-size-btn" id="font-l-btn" data-font-size="1.2rem">
            L
          </button>
        </div>
        <div>
          <button class="option-btn font-size-btn" id="font-xl-btn" data-font-size="1.5rem">
            XL
          </button>
        </div>
      </div>
    </div>
    <div class="options-container" id="opacity-options-container">
      <p>Прозрачность линии</p>
      <input type="range" min="0.1" max="1" value="1" step="0.1" id="input-opacity" />
    </div>
    <div class="options-container" id="fill-style-options-container">
      <p>Стиль заливки</p>
      <div class="fill-style-options-container">
        <button class="fill-style-btn active-fill-style" data-fill-option="hachure">hachure</button>
        <button class="fill-style-btn" data-fill-option="solid">solid</button>
        <button class="fill-style-btn" data-fill-option="zigzag">zigzag</button>
        <button class="fill-style-btn" data-fill-option="cross-hatch">cross-hatch</button>
        <button class="fill-style-btn" data-fill-option="dashed">dashed</button>
        <button class="fill-style-btn" data-fill-option="zigzag-line">zigzag-line</button>
      </div>
    </div>
  </div>
</template>

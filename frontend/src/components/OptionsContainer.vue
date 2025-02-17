<script setup lang="ts">
import { useCursorStore } from '@/stores/cursor';
import { useOptionsStore } from '@/stores/options';
import type { MyCursor } from '@/types';
import { computed, ref } from 'vue';
import ColorPicker from './ColorPicker.vue';

const cursorStore = useCursorStore();
const optionsStore = useOptionsStore();

const cursorsForHideAll: MyCursor[] = ['pointer', 'eraser', 'text', 'image'];
const showFill: MyCursor[] = ['ellipse', 'line', 'line', 'pointer', 'rectangle'];
const showStroke: MyCursor[] = ['ellipse', 'rectangle'];
const showText: MyCursor[] = ['text'];
const showFillType: MyCursor[] = ['rectangle', 'ellipse'];

const isOptionsHidden = computed(() => cursorsForHideAll.includes(cursorStore.cursor as MyCursor));

const isFillColor = computed(() => showFill.includes(cursorStore.cursor as MyCursor));
const isStrokeColor = computed(() => showStroke.includes(cursorStore.cursor as MyCursor));
const isTextColor = computed(() => showText.includes(cursorStore.cursor as MyCursor));
const isFillType = computed(() => showFillType.includes(cursorStore.cursor as MyCursor));

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
    <div class="options-color-container" id="options-color-fill" v-if="isFillColor">
      <p>Цвет зарисовки</p>
      <div class="color-container">
        <div
          class="color-picker"
          @click="toggleFillColor"
          :style="{ backgroundColor: optionsStore.getterColors.fillColor }"
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
    <div class="options-color-container" id="options-color-border" v-if="isStrokeColor">
      <p>Цвет границы</p>
      <div class="color-container">
        <div
          class="color-picker"
          id="stroke-color-picker"
          @click="toggleBorderColor"
          :style="{ backgroundColor: optionsStore.getterColors.borderColor }"
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
    <div class="options-color-container" id="options-color-text" v-if="isTextColor">
      <p>Цвет текста</p>
      <div class="color-container">
        <div
          class="color-picker"
          id="text-color-picker"
          @click="toggleTextColor"
          :style="{ backgroundColor: optionsStore.getterColors.textColor }"
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
        <div v-for="lineSize in optionsStore.allOptions.lineWidths" :key="lineSize.label">
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
    <div class="options-container" id="font-size-options-container" v-if="isTextColor">
      <p>Размер текста</p>
      <div class="options-btns-container">
        <div v-for="textSize in optionsStore.allOptions.textSizes" :key="textSize.label">
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
    <div class="options-container" id="fill-style-options-container" v-if="isFillType">
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

<style>
.options-wrapper {
  width: 200px;
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translate(0, -60%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 2px solid var(--clr-border);
  border-radius: 5px;
  padding: 10px;
  background-color: var(--clr-background-transparent);
}

.options-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 0.5rem;
}

/* ======================== ВЫБОР ЦВЕТА  ======================== */

.options-color-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.color-container input {
  width: 100px;
  padding: 8px 10px;
}

.color-picker {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background-color: var(--clr-default);
  cursor: pointer;
}

#stroke-color-picker {
  background-color: var(--clr-primary);
}

.color-picker-input {
  outline: 2px solid var(--clr-border);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  padding-left: 7px;
  color: var(--clr-text);
}

.color-picker-input input {
  border: none;
  outline: none;
  background-color: var(--clr-background-transparent);
  color: var(--clr-text);
}

.color-list {
  position: absolute;
  left: 30px;
  top: -2px;
  border: 2px solid var(--clr-border);
  background-color: var(--clr-background-transparent);
  z-index: var(--z-index-4);
  padding: 5px;
  border-radius: 4px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
}

.color-item {
  width: 30px;
  height: 30px;
  border-radius: 4px;
}

/* =========================== ШИРИНА =========================== */

.options-btns-container {
  display: flex;
  justify-content: stretch;
  align-items: center;
  gap: 10px;
}

.option-btn {
  width: 100%;
  background-color: var(--clr-background-transparent);
  border: none;
  outline: 2px solid var(--clr-border);
  padding: 6px;
  border-radius: 5px;
  cursor: pointer;
  color: var(--clr-text);
}

/* .options-btns-container > div {
    flex: 1 1 0;
} */

.active-option {
  outline: 2px solid var(--clr-primary);

  /* color: var(--clr-primary); */
}

/*  ======================== ПРОЗРАЧНОСТЬ  ======================== */

#input-opacity {
  width: 100%;
  cursor: pointer;
}

input[type='range'] {
  appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 5px;
  background-color: var(--clr-primary);
}

input[type='range']::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: var(--clr-primary-dark);
  transition: background 0.3s ease-in-out;
}

input[type='range']::-moz-range-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: var(--clr-primary-dark);
  transition: background 0.3s ease-in-out;
}

input[type='range']::-webkit-slider-runnable-track {
  appearance: none;
  box-shadow: none;
  border: none;
  background: transparent;
}

/* ======================== ЗАЛИВКА ======================== */

.fill-style-options-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.15rem;
}

.fill-style-btn {
  background-color: var(--clr-background-transparent);
  border: none;
  border-radius: 7px;
  aspect-ratio: 1 / 1;
  font-size: 0.9rem;
  color: var(--clr-text);
  transition: border 200ms ease;
  cursor: pointer;
  position: relative;
}

.active-fill-style {
  outline: 2px solid var(--clr-primary);

  /* color: var(--clr-primary-dark); */
}

.options-color-container,
.options-container > p {
  color: var(--clr-text);
}
</style>

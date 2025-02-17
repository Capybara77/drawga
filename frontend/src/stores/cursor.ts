import type { MyCursor } from '@/types';
import { defineStore } from 'pinia';

export const constantsForKeyboard: Record<string, MyCursor> = {
  1: 'pointer',
  2: 'eraser',
  3: 'pointer',
  4: 'rectangle',
  5: 'line',
  6: 'ellipse',
  7: 'text',
  8: 'image',
};

export const useCursorStore = defineStore('cursor', {
  state: () => ({
    cursor: 'pointer' as MyCursor,
  }),
  actions: {
    setCursor(cursor: MyCursor) {
      this.cursor = cursor;
    },
  },
});

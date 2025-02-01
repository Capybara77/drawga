import type { MyCursor } from '@/types';
import { defineStore } from 'pinia';

export const useCursorStore = defineStore('cursor', {
  state: () => ({
    /** @type {MyCursor} */
    cursor: 'pointer',
  }),
  actions: {
    setCursor(cursor: MyCursor) {
      this.cursor = cursor;
    },
  },
});

import type { MyCursor } from '@/types';
import { defineStore } from 'pinia';

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

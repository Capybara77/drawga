import { round10 } from '@/utils';
import { defineStore } from 'pinia';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

const defaultState = {
  zoom: 1,
};

export const useZoomStore = defineStore('zoom', {
  state: () => defaultState,
  getters: {
    percentage: (state) => {
      return `${Math.floor(state.zoom * 100)}%`;
    },
  },
  actions: {
    increaseZoom() {
      if (this.zoom === MAX_ZOOM) {
        return;
      }

      this.zoom = round10(this.zoom + MIN_ZOOM, -1);
    },
    decreaseZoom() {
      if (this.zoom === MIN_ZOOM) {
        return;
      }

      this.zoom = round10(this.zoom - MIN_ZOOM, -1);
    },
  },
});

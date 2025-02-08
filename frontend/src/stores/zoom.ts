import { defineStore } from 'pinia';

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
      this.zoom += 0.1;
    },
    decreaseZoom() {
      this.zoom -= 0.1;
    },
  },
});

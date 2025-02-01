import { defineStore } from 'pinia';

export const useColorsStore = defineStore('colors', {
  state: () => ({
    fillColor: 'rgb(95, 61, 196)',
    borderColor: 'rgb(95, 61, 196)',
    textColor: 'rgb(0, 0, 0)',
    allColors: [
      'rgb(0, 0, 0)',
      'rgb(52, 58, 64)',
      'rgb(73, 80, 87)',
      'rgb(201, 42, 42)',
      'rgb(166, 30, 77)',
      'rgb(134, 46, 156)',
      'rgb(95, 61, 196)',
      'rgb(54, 79, 199)',
      'rgb(24, 100, 171)',
      'rgb(11, 114, 133)',
      'rgb(8, 127, 91)',
      'rgb(43, 138, 62)',
      'rgb(92, 148, 13)',
      'rgb(230, 119, 0)',
      'rgb(217, 72, 15)',
    ],
  }),
  actions: {
    setFillColor(color: string) {
      this.fillColor = color;
    },
    setBorderColor(color: string) {
      this.borderColor = color;
    },
    setTextColor(color: string) {
      this.textColor = color;
    },
  },
});

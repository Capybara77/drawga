import { defineStore } from 'pinia';

const defaultState = {
  allOptions: {
    colors: [
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
    lineWidths: [
      {
        value: 5,
        label: 'smol',
      },
      {
        value: 12,
        label: 'norm',
      },
      {
        value: 20,
        label: 'larj',
      },
    ],
    textSizes: [
      {
        value: '0.875rem',
        label: 'S',
      },
      {
        value: '1rem',
        label: 'M',
      },
      {
        value: '1.2rem',
        label: 'L',
      },
      {
        value: '1.5rem',
        label: 'XL',
      },
    ],
    fillStyles: ['hachure', 'solid', 'zigzag', 'cross-hatch', 'dashed', 'zigzag-line'],
  },
  colors: {
    fillColor: 'rgb(95, 61, 196)',
    borderColor: 'rgb(95, 61, 196)',
    textColor: 'rgb(0, 0, 0)',
  },
  lineWidth: 12,
  textSize: '1rem',
  fillStyle: 'hachure',
  opacity: 0.5,
};

export const useOptionsStore = defineStore('options', {
  state: () => defaultState,
  actions: {
    setFillColor(color: string) {
      this.colors.fillColor = color;
    },
    setBorderColor(color: string) {
      this.colors.borderColor = color;
    },
    setTextColor(color: string) {
      this.colors.textColor = color;
    },
    setLineWidth(width: number) {
      this.lineWidth = width;
    },
    setTextSize(size: string) {
      this.textSize = size;
    },
    setFillStyle(style: string) {
      this.fillStyle = style;
    },
    setOpacity(value: number) {
      this.opacity = value;
    },
  },
});

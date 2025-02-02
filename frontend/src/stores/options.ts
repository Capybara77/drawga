import { defineStore } from 'pinia';

const defaultState = {
  allOptions: {
    colors: [
      '000000',
      '343a40',
      '495057',
      'c92a2a',
      'a61e4d',
      '862e9c',
      '5f3dc4',
      '364fc7',
      '1864ab',
      '0b7285',
      '087f5b',
      '2b8a3e',
      '5c940d',
      'e67700',
      'd9480f',
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
    fillColor: '5f3dc4',
    borderColor: 'a61e4d',
    textColor: '000000',
  },
  lineWidth: 12,
  textSize: '1rem',
  fillStyle: 'hachure',
  opacity: 1,
};

export const useOptionsStore = defineStore('options', {
  state: () => defaultState,
  getters: {
    getterColors: (state) => ({
      fillColor: '#' + state.colors.fillColor,
      borderColor: '#' + state.colors.borderColor,
      textColor: '#' + state.colors.textColor,
    }),
    getterColorsWithOpacity: (state) => {
      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `${r}, ${g}, ${b}`;
      };

      return {
        fillColor: `rgba(${hexToRgb(state.colors.fillColor)}, ${state.opacity})`,
        borderColor: `rgba(${hexToRgb(state.colors.borderColor)}, ${state.opacity})`,
        textColor: `rgba(${hexToRgb(state.colors.textColor)}, ${state.opacity})`,
      };
    },
  },
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

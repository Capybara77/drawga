import { defineStore } from 'pinia';

// Замыкание
(function () {
  /**
   * Корректировка округления десятичных дробей.
   *
   * @param {String}  type  Тип корректировки.
   * @param {Number}  value Число.
   * @param {Integer} exp   Показатель степени (десятичный логарифм основания корректировки).
   * @returns {Number} Скорректированное значение.
   */
  function decimalAdjust(type: string, value: number | (string | number)[], exp: number) {
    // Если степень не определена, либо равна нулю...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Если значение не является числом, либо степень не является целым числом...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Сдвиг разрядов
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? +value[1] - exp : -exp)));
    // Обратный сдвиг
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? +value[1] + exp : exp));
  }

  // Десятичное округление к ближайшему
  if (!Math.round10) {
    Math.round10 = function (value: any, exp: any) {
      return decimalAdjust('round', value, exp);
    };
  }
})();

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
      this.zoom = Math.round10(this.zoom + 0.1, -1);
    },
    decreaseZoom() {
      if (this.zoom === 0.1) {
        return;
      }

      this.zoom = Math.round10(this.zoom - 0.1, -1);
    },
  },
});

/**
 * Десятичное округление к ближайшему.
 *
 * @param {number | (string | number)[]} value Значение для округления.
 * @param {number} exp Показатель степени (десятичный логарифм основания корректировки).
 * @returns {number} Округленное значение.
 */
export function round10(value: number | (string | number)[], exp: number): number {
  // Если степень не определена, либо равна нулю...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math.round(value as number);
  }

  value = +value; // Преобразуем значение в число
  exp = +exp; // Преобразуем показатель в число

  // Если значение не является числом, либо показатель не является целым числом...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }

  // Сдвиг разрядов
  value = value.toString().split('e');
  value = Math.round(+(value[0] + 'e' + (value[1] ? +value[1] - exp : -exp)));

  // Обратный сдвиг
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? +value[1] + exp : exp));
}

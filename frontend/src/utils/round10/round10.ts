/**
 * Десятичное округление к ближайшему.
 *
 * @param {number | (string | number)[]} value Значение для округления.
 * @param {number} exp Показатель степени (десятичный логарифм основания корректировки).
 * @returns {number} Округленное значение.
 */
export function round10(value: number | (string | number)[], exp: number): number {
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math.round(value as number);
  }

  value = +value;
  exp = +exp;

  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }

  value = value.toString().split('e');
  value = Math.round(+(value[0] + 'e' + (value[1] ? +value[1] - exp : -exp)));

  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? +value[1] + exp : exp));
}

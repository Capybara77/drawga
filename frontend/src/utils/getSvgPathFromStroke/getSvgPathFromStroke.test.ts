import { describe, it, expect } from 'vitest';
import { getSvgPathFromStroke } from './getSvgPathFromStroke'; // Указываем правильный путь к файлу с функцией

describe('getSvgPathFromStroke', () => {
  it('возвращает пустую строку, если передано менее 4 точек', () => {
    expect(getSvgPathFromStroke([])).toBe('');
    expect(getSvgPathFromStroke([[0, 0]])).toBe('');
    expect(
      getSvgPathFromStroke([
        [0, 0],
        [1, 1],
      ]),
    ).toBe('');
    expect(
      getSvgPathFromStroke([
        [0, 0],
        [1, 1],
        [2, 2],
      ]),
    ).toBe('');
  });

  it('создаёт корректный путь для 4 точек', () => {
    const points = [
      [0, 0],
      [10, 10],
      [20, 20],
      [30, 30],
    ];
    const result = getSvgPathFromStroke(points);
    expect(result).toBe('M0.00,0.00 Q10.00,10.00 15.00,15.00 T25.00,25.00 Z');
  });

  it('создаёт корректный путь для 5 точек', () => {
    const points = [
      [0, 0],
      [10, 10],
      [20, 20],
      [30, 30],
      [40, 40],
    ];
    const result = getSvgPathFromStroke(points);
    expect(result).toBe('M0.00,0.00 Q10.00,10.00 15.00,15.00 T25.00,25.00 35.00,35.00 Z');
  });

  it('не добавляет "Z" в конец пути, если closed = false', () => {
    const points = [
      [0, 0],
      [10, 10],
      [20, 20],
      [30, 30],
    ];
    const result = getSvgPathFromStroke(points, false);
    expect(result).toBe('M0.00,0.00 Q10.00,10.00 15.00,15.00 T25.00,25.00 ');
  });
});

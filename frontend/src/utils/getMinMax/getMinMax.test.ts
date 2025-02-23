import { describe, it, expect } from 'vitest';
import { getMinMax } from './getMinMax';

describe('getMinMax', () => {
  it('должен возвращать значение, если оно находится в диапазоне [min, max]', () => {
    const result = getMinMax(10, 20, 15);
    expect(result).toBe(15);
  });

  it('должен возвращать min, если значение меньше min', () => {
    const result = getMinMax(10, 20, 5);
    expect(result).toBe(10);
  });

  it('должен возвращать max, если значение больше max', () => {
    const result = getMinMax(10, 20, 25);
    expect(result).toBe(20);
  });

  it('должен возвращать min, если значение равно min', () => {
    const result = getMinMax(10, 20, 10);
    expect(result).toBe(10);
  });

  it('должен возвращать max, если значение равно max', () => {
    const result = getMinMax(10, 20, 20);
    expect(result).toBe(20);
  });

  it('должен работать с отрицательными числами', () => {
    const result = getMinMax(-20, -10, -15);
    expect(result).toBe(-15);
  });

  it('должен корректно обрабатывать равные min и max', () => {
    const result = getMinMax(10, 10, 15);
    expect(result).toBe(10);
  });

  it('должен обрабатывать случай, когда min больше max', () => {
    const result = getMinMax(20, 10, 15);
    expect(result).toBe(10);
  });
});

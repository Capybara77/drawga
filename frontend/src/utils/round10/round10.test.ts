import { describe, it, expect } from 'vitest';

import { round10 } from './round10';

describe('round10', () => {
  it('должен корректно округлять числа до десятых (exp = -1)', () => {
    expect(round10(1.234, -1)).toBe(1.2);
    expect(round10(1.567, -1)).toBe(1.6);
    expect(round10(1.005, -1)).toBe(1.0);
  });

  it('должен корректно округлять числа до сотых (exp = -2)', () => {
    expect(round10(1.234, -2)).toBe(1.23);
    expect(round10(1.235, -2)).toBe(1.24);
    expect(round10(1.345, -2)).toBe(1.35);
  });

  it('должен корректно округлять числа до единиц (exp = 0)', () => {
    expect(round10(1.5, 0)).toBe(2);
    expect(round10(1.4, 0)).toBe(1);
    expect(round10(123.9, 0)).toBe(124);
  });

  it('должен корректно округлять числа до десятков (exp = 1)', () => {
    expect(round10(123.456, 1)).toBe(120);
    expect(round10(156.789, 1)).toBe(160);
    expect(round10(145.234, 1)).toBe(150);
  });

  it('должен возвращать NaN для недопустимых входных данных', () => {
    expect(round10('abc' as unknown as number, -2)).toBeNaN();
    expect(round10(123, 'xyz' as unknown as number)).toBeNaN();
    expect(round10(NaN, -2)).toBeNaN();
    expect(round10(123, NaN)).toBeNaN();
  });

  it('должен работать с целыми числами', () => {
    expect(round10(123, 0)).toBe(123);
    expect(round10(123, 1)).toBe(120);
    expect(round10(123, -1)).toBe(123);
  });

  it('должен обрабатывать большие числа', () => {
    expect(round10(123456789.123456, -3)).toBe(123456789.123);
    expect(round10(123456789.5, 0)).toBe(123456790);
  });
});

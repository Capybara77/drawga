import { describe, it, expect } from 'vitest';
import { generateId } from './generateId';

describe('generateId', () => {
  it('возвращает строку заданной длины', () => {
    const length = 10;
    const result = generateId(length);
    expect(result.length).toBe(length);
  });

  it('возвращает разные значения при нескольких вызовах', () => {
    const result1 = generateId(10);
    const result2 = generateId(10);
    expect(result1).not.toBe(result2);
  });

  it('возвращает пустую строку, если длина равна 0', () => {
    const result = generateId(0);
    expect(result).toBe('');
  });

  it('корректно работает с минимальной длиной 8', () => {
    const result = generateId(8);
    expect(result.length).toBe(8);
  });
});

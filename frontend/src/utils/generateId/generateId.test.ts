import { describe, it, expect } from 'vitest';
import { generateId } from './generateId';

describe('generateId', () => {
  it('возвращает строку заданной длины', () => {
    const length = 10;
    const result = generateId(length);
    expect(result.length).toBe(length);
  });

  it('возвращает строку, состоящую только из букв', () => {
    const result = generateId(20);
    expect(result).toMatch(/^[A-Za-z]+$/);
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

  it('корректно работает с минимальной длиной 1', () => {
    const result = generateId(1);
    expect(result.length).toBe(1);
    expect(result).toMatch(/^[A-Za-z]$/);
  });
});

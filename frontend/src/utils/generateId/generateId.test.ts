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

  it('возвращает пустую строку, если длина меньше либо равна 0', () => {
    expect(() => generateId(0)).toThrow('Invalid length');
    expect(() => generateId(-5)).toThrow('Invalid length');
  });

  it('возвращает пустую строку, если длина равна NaN', () => {
    expect(() => generateId(NaN)).toThrow('Invalid length');
  });

  it('корректно работает с минимальной длиной 8', () => {
    const result = generateId(8);
    expect(result.length).toBe(8);
  });

  it('использует только разрешённые символы, мудила', () => {
    const result = generateId(20);
    const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    expect(result.split('').every((char) => allowedChars.includes(char))).toBe(true);
  });

  it('не охуевает от большой длины', () => {
    const result = generateId(1000);
    expect(result.length).toBe(1000);
  });
});

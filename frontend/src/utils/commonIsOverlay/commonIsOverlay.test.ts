import { describe, it, expect } from 'vitest';
import { commonIsOverlay } from './commonIsOverlay';

describe('commonIsOverlay', () => {
  it('возвращает false, если области не пересекаются', () => {
    const result = commonIsOverlay(0, 0, 10, 10, 100, 200, 100, 200);
    expect(result).toBe(false);
  });

  it('возвращает true, если области пересекаются', () => {
    const result = commonIsOverlay(50, 50, 10, 10, 40, 60, 40, 60);
    expect(result).toBe(true);
  });

  it('возвращает true, если экран сдвинут, и области все равно пересекаются', () => {
    const result = commonIsOverlay(50, 50, 20, 20, 60, 100, 60, 100);
    expect(result).toBe(true);
  });

  it('возвращает false, если Xmin и Xmax за пределами экрана', () => {
    const result = commonIsOverlay(0, 0, 10, 10, 200, 300, 100, 200);
    expect(result).toBe(false);
  });

  it('возвращает true, если экран полностью покрывает область ограничения', () => {
    const result = commonIsOverlay(50, 50, 0, 0, 30, 70, 30, 70);
    expect(result).toBe(true);
  });

  it('возвращает false, если ни одна из областей не пересекается по осям X или Y', () => {
    const result = commonIsOverlay(0, 0, 0, 0, 200, 250, 200, 250);
    expect(result).toBe(false);
  });
});

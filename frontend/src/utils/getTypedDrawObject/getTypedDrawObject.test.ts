import { describe, it, expect } from 'vitest';
import { getTypedDrawObject } from './getTypedDrawObject'; // Указываем правильный путь к файлу с функцией
import { RoughCanvas } from 'roughjs/bin/canvas';
import { RectangleObject, EllipseObject, LineObject, CurveObject } from '@/constructors';

describe('getTypedDrawObject', () => {
  const roughCanvas = {} as RoughCanvas; // Мокаем RoughCanvas
  const ctx = {} as CanvasRenderingContext2D; // Мокаем CanvasRenderingContext2D

  it('создаёт объект типа RectangleObject при передаче "rectangle"', () => {
    const inputStr = JSON.stringify({
      drawType: 'rectangle',
      objId: '123',
      zoom: 1,
      width: 100,
      height: 50,
      left: 10,
      top: 20,
    });

    const result = getTypedDrawObject(inputStr, roughCanvas, ctx);
    expect(result).toBeInstanceOf(RectangleObject);
    if (result instanceof RectangleObject) {
      expect(result.objId).toBe('123');
      expect(result.zoom).toBe(1);
    }
  });

  it('создаёт объект типа EllipseObject при передаче "ellipse"', () => {
    const inputStr = JSON.stringify({
      drawType: 'ellipse',
      objId: '456',
      zoom: 1,
      width: 80,
      height: 60,
      left: 15,
      top: 25,
    });

    const result = getTypedDrawObject(inputStr, roughCanvas, ctx);
    expect(result).toBeInstanceOf(EllipseObject);
    if (result instanceof EllipseObject) {
      expect(result.objId).toBe('456');
      expect(result.zoom).toBe(1);
    }
  });

  it('создаёт объект типа LineObject при передаче "line"', () => {
    const inputStr = JSON.stringify({
      drawType: 'line',
      objId: '789',
      zoom: 1,
      x1: 10,
      y1: 20,
      x2: 30,
      y2: 40,
    });

    const result = getTypedDrawObject(inputStr, roughCanvas, ctx);
    expect(result).toBeInstanceOf(LineObject);
    if (result instanceof LineObject) {
      expect(result.objId).toBe('789');
      expect(result.zoom).toBe(1);
    }
  });

  it('создаёт объект типа CurveObject при передаче "curve"', () => {
    const inputStr = JSON.stringify({
      drawType: 'curve',
      objId: '101112',
      zoom: 1,
      path: [
        [10, 20],
        [30, 40],
        [50, 60],
      ],
    });

    const result = getTypedDrawObject(inputStr, roughCanvas, ctx);
    expect(result).toBeInstanceOf(CurveObject);
    if (result instanceof CurveObject) {
      expect(result.objId).toBe('101112');
      expect(result.zoom).toBe(1);
    }
  });

  it('возвращает null для неизвестного типа', () => {
    const inputStr = JSON.stringify({
      drawType: 'unknown',
      objId: '131415',
      zoom: 1,
    });

    const result = getTypedDrawObject(inputStr, roughCanvas, ctx);
    expect(result).toBeNull();
  });
});

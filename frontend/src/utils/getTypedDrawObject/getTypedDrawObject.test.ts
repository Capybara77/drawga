import { describe, it, expect, vi } from 'vitest';
import { getTypedDrawObject } from './getTypedDrawObject'; // Указываем правильный путь к файлу с функцией
import { RoughCanvas } from 'roughjs/bin/canvas';
import { RectangleObject, EllipseObject, LineObject, CurveObject } from '@/constructors';

const roughCanvas = {
  draw: vi.fn(),
  rectangle: vi.fn(),
  ellipse: vi.fn(),
} as unknown as RoughCanvas;

const ctx = {
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
} as unknown as CanvasRenderingContext2D;

describe('getTypedDrawObject error handling', () => {
  const roughCanvas = {} as RoughCanvas;
  const ctx = {} as CanvasRenderingContext2D;

  describe('невалидный JSON', () => {
    it('возвращает null при невалидном JSON', () => {
      const invalidJson = '{drawType: rectangle}'; // отсутствуют кавычки
      expect(getTypedDrawObject(invalidJson, roughCanvas, ctx)).toBeNull();
    });

    it('возвращает null при пустой строке', () => {
      expect(getTypedDrawObject('', roughCanvas, ctx)).toBeNull();
    });
  });

  describe('отсутствующие поля', () => {
    it('возвращает null при отсутствии drawType', () => {
      const noDrawType = JSON.stringify({
        objId: '123',
        zoom: 1,
        width: 100,
        height: 50,
      });
      expect(getTypedDrawObject(noDrawType, roughCanvas, ctx)).toBeNull();
    });

    it('возвращает null при отсутствии обязательных полей для rectangle', () => {
      const noWidth = JSON.stringify({
        drawType: 'rectangle',
        objId: '123',
        zoom: 1,
        height: 50,
      });
      expect(getTypedDrawObject(noWidth, roughCanvas, ctx)).toBeNull();
    });

    it('возвращает null при отсутствии обязательных полей для line', () => {
      const noCoords = JSON.stringify({
        drawType: 'line',
        objId: '123',
        zoom: 1,
      });
      expect(getTypedDrawObject(noCoords, roughCanvas, ctx)).toBeNull();
    });
  });

  describe('неправильные типы данных', () => {
    it('возвращает null при строковом значении вместо числового', () => {
      const invalidType = JSON.stringify({
        drawType: 'rectangle',
        objId: '123',
        zoom: '1', // должно быть числом
        width: '100', // должно быть числом
        height: 50,
      });
      expect(getTypedDrawObject(invalidType, roughCanvas, ctx)).toBeNull();
    });

    it('возвращает null при массиве вместо числа', () => {
      const invalidArray = JSON.stringify({
        drawType: 'ellipse',
        objId: '123',
        zoom: 1,
        width: [100],
        height: 50,
      });
      expect(getTypedDrawObject(invalidArray, roughCanvas, ctx)).toBeNull();
    });
  });

  describe('отрицательные значения', () => {
    it('возвращает null при отрицательной ширине', () => {
      const negativeWidth = JSON.stringify({
        drawType: 'rectangle',
        objId: '123',
        zoom: 1,
        width: -100,
        height: 50,
      });
      expect(getTypedDrawObject(negativeWidth, roughCanvas, ctx)).toBeNull();
    });

    it('возвращает null при отрицательной высоте', () => {
      const negativeHeight = JSON.stringify({
        drawType: 'ellipse',
        objId: '123',
        zoom: 1,
        width: 100,
        height: -50,
      });
      expect(getTypedDrawObject(negativeHeight, roughCanvas, ctx)).toBeNull();
    });

    it('возвращает null при отрицательном zoom', () => {
      const negativeZoom = JSON.stringify({
        drawType: 'rectangle',
        objId: '123',
        zoom: -1,
        width: 100,
        height: 50,
      });
      expect(getTypedDrawObject(negativeZoom, roughCanvas, ctx)).toBeNull();
    });
  });
});

describe('getTypedDrawObject', () => {
  it('создаёт объект типа RectangleObject при передаче "rectangle"', () => {
    const inputStr = JSON.stringify({
      drawType: 'rectangle',
      userId: '123',
      color: 'red',
      objId: '123',
      zoom: 1,
      width: 100,
      height: 50,
      left: 10,
      top: 20,
      tempObj: 123,
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
      color: 'red',
      userId: '123',
      zoom: 1,
      tempObj: '12',
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
      userId: '1',
      color: 'red',
      tempObj: '1',
      width: 1,
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
      color: 'red',
      objId: '101112',
      userId: '123',
      tempObj: '132',
      width: 1,
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

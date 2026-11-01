import { describe, it, expect, vi } from "vite-plus/test";
import { getTypedDrawObject } from "./getTypedDrawObject"; // Указываем правильный путь к файлу с функцией
import { RoughCanvas } from "roughjs/bin/canvas";
import { RectangleObject, EllipseObject, LineObject, CurveObject, TextObject } from "@/constructors";

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

describe("getTypedDrawObject error handling", () => {
  const roughCanvas = {} as RoughCanvas;
  const ctx = {} as CanvasRenderingContext2D;

  describe("невалидный JSON", () => {
    it("возвращает null при невалидном JSON", () => {
      const invalidJson = "{drawType: rectangle}"; // отсутствуют кавычки
      expect(getTypedDrawObject(invalidJson, roughCanvas, ctx)).toBeNull();
    });

    it("возвращает null при пустой строке", () => {
      expect(getTypedDrawObject("", roughCanvas, ctx)).toBeNull();
    });
  });

  describe("отсутствующие поля", () => {
    it("возвращает null при отсутствии drawType", () => {
      const noDrawType = JSON.stringify({
        objId: "123",
        zoom: 1,
        width: 100,
        height: 50,
      });
      expect(getTypedDrawObject(noDrawType, roughCanvas, ctx)).toBeNull();
    });

    it("возвращает null при отсутствии обязательных полей для rectangle", () => {
      const noWidth = JSON.stringify({
        drawType: "rectangle",
        objId: "123",
        zoom: 1,
        height: 50,
      });
      expect(getTypedDrawObject(noWidth, roughCanvas, ctx)).toBeNull();
    });

    it("возвращает null при отсутствии обязательных полей для line", () => {
      const noCoords = JSON.stringify({
        drawType: "line",
        objId: "123",
        zoom: 1,
      });
      expect(getTypedDrawObject(noCoords, roughCanvas, ctx)).toBeNull();
    });
  });

  describe("неправильные типы данных", () => {
    it("возвращает null при строковом значении вместо числового", () => {
      const invalidType = JSON.stringify({
        drawType: "rectangle",
        objId: "123",
        zoom: "1", // должно быть числом
        width: "100", // должно быть числом
        height: 50,
      });
      expect(getTypedDrawObject(invalidType, roughCanvas, ctx)).toBeNull();
    });

    it("возвращает null при массиве вместо числа", () => {
      const invalidArray = JSON.stringify({
        drawType: "ellipse",
        objId: "123",
        zoom: 1,
        width: [100],
        height: 50,
      });
      expect(getTypedDrawObject(invalidArray, roughCanvas, ctx)).toBeNull();
    });
  });

  describe("отрицательные значения", () => {
    it("возвращает null при отрицательной ширине", () => {
      const negativeWidth = JSON.stringify({
        drawType: "rectangle",
        objId: "123",
        zoom: 1,
        width: -100,
        height: 50,
      });
      expect(getTypedDrawObject(negativeWidth, roughCanvas, ctx)).toBeNull();
    });

    it("возвращает null при отрицательной высоте", () => {
      const negativeHeight = JSON.stringify({
        drawType: "ellipse",
        objId: "123",
        zoom: 1,
        width: 100,
        height: -50,
      });
      expect(getTypedDrawObject(negativeHeight, roughCanvas, ctx)).toBeNull();
    });

    it("возвращает null при отрицательном zoom", () => {
      const negativeZoom = JSON.stringify({
        drawType: "rectangle",
        objId: "123",
        zoom: -1,
        width: 100,
        height: 50,
      });
      expect(getTypedDrawObject(negativeZoom, roughCanvas, ctx)).toBeNull();
    });
  });
});

describe("getTypedDrawObject", () => {
  it('создаёт объект типа RectangleObject при передаче "rectangle"', () => {
    const inputStr = JSON.stringify({
      drawType: "rectangle",
      userId: "123",
      color: "red",
      objId: "123",
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
      expect(result.objId).toBe("123");
      expect(result.zoom).toBe(1);
    }
  });

  it('создаёт объект типа EllipseObject при передаче "ellipse"', () => {
    const inputStr = JSON.stringify({
      drawType: "ellipse",
      objId: "456",
      color: "red",
      userId: "123",
      zoom: 1,
      tempObj: "12",
      width: 80,
      height: 60,
      left: 15,
      top: 25,
    });

    const result = getTypedDrawObject(inputStr, roughCanvas, ctx);
    expect(result).toBeInstanceOf(EllipseObject);
    if (result instanceof EllipseObject) {
      expect(result.objId).toBe("456");
      expect(result.zoom).toBe(1);
    }
  });

  it('создаёт объект типа LineObject при передаче "line"', () => {
    const inputStr = JSON.stringify({
      drawType: "line",
      objId: "789",
      zoom: 1,
      userId: "1",
      color: "red",
      tempObj: "1",
      width: 1,
      x1: 10,
      y1: 20,
      x2: 30,
      y2: 40,
    });

    const result = getTypedDrawObject(inputStr, roughCanvas, ctx);
    expect(result).toBeInstanceOf(LineObject);
    if (result instanceof LineObject) {
      expect(result.objId).toBe("789");
      expect(result.zoom).toBe(1);
    }
  });

  it('создаёт объект типа CurveObject при передаче "curve"', () => {
    const inputStr = JSON.stringify({
      drawType: "curve",
      color: "red",
      objId: "101112",
      userId: "123",
      tempObj: "132",
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
      expect(result.objId).toBe("101112");
      expect(result.zoom).toBe(1);
    }
  });

  it("линия с сервера рисуется переданным roughCanvas, а не тем, что пришёл в JSON", () => {
    const inputStr = JSON.stringify({
      drawType: "line",
      color: "red",
      objId: "line-1",
      userId: "123",
      tempObj: false,
      width: 1,
      zoom: 1,
      startPoint: [0, 0],
      endPoint: [10, 10],
      roughCanvas: {}, // так сериализуется roughCanvas в JSON
    });
    const lineCanvas = { line: vi.fn() } as unknown as RoughCanvas;

    const result = getTypedDrawObject(inputStr, lineCanvas, ctx);
    result?.draw(0, 0, 1);

    expect(lineCanvas.line).toHaveBeenCalledOnce();
  });

  it('создаёт объект типа TextObject при передаче "text"', () => {
    const inputStr = JSON.stringify({
      drawType: "text",
      color: "#e67700",
      objId: "text-1",
      userId: "123",
      tempObj: false,
      width: 0,
      zoom: 1,
      x: 10,
      y: 20,
      text: "привет\nмир",
      fontSize: 24,
      fontFamily: "Pangolin",
      ctx: {}, // так сериализуется ctx в JSON
    });

    const result = getTypedDrawObject(inputStr, roughCanvas, ctx);
    expect(result).toBeInstanceOf(TextObject);
    if (result instanceof TextObject) {
      expect(result.objId).toBe("text-1");
      expect(result.text).toBe("привет\nмир");
      expect(result.x).toBe(10);
      expect(result.y).toBe(20);
      // цвет пришёл с # — повторно не добавляется
      expect(result.color).toBe("#e67700");
    }
  });

  it("текст с сервера рисуется переданным ctx, по строке на fillText", () => {
    const inputStr = JSON.stringify({
      drawType: "text",
      color: "#e67700",
      objId: "text-2",
      userId: "123",
      tempObj: false,
      width: 0,
      zoom: 1,
      x: 0,
      y: 0,
      text: "раз\nдва",
      fontSize: 24,
      fontFamily: "Pangolin",
      ctx: {},
    });
    const textCtx = { fillText: vi.fn() } as unknown as CanvasRenderingContext2D;

    getTypedDrawObject(inputStr, roughCanvas, textCtx)?.draw(0, 0, 1);

    expect(textCtx.fillText).toHaveBeenCalledTimes(2);
  });

  it("возвращает null для неизвестного типа", () => {
    const inputStr = JSON.stringify({
      drawType: "unknown",
      objId: "131415",
      zoom: 1,
    });

    const result = getTypedDrawObject(inputStr, roughCanvas, ctx);
    expect(result).toBeNull();
  });
});

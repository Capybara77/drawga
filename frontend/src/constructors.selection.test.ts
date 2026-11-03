import { describe, expect, it } from "vite-plus/test";
import type { RoughCanvas } from "roughjs/bin/canvas";
import {
  CurveObject,
  EllipseObject,
  ImageObject,
  LineObject,
  RectangleObject,
  TextObject,
} from "./constructors";

const ctx = {
  font: "",
  measureText(line: string) {
    return { width: line.length * 10 };
  },
} as unknown as CanvasRenderingContext2D;
const roughCanvas = {} as RoughCanvas;
const base = { color: "c", width: 2, userId: "u" };
const shape = { ...base, fillStyle: "solid", stroke: "s", strokeWidth: 2, roughCanvas };

const newRect = () =>
  new RectangleObject({ ...shape, startPoint: [300, 200], endPoint: [100, 100] });
const newEllipse = () =>
  new EllipseObject({ ...shape, startPoint: [100, 100], endPoint: [130, 120], isCircle: false });
const newLine = () => new LineObject({ ...base, roughCanvas, startPoint: [0, 0], endPoint: [100, 0] });
const newCurve = () =>
  new CurveObject({
    ...base,
    ctx,
    zoom: 1,
    pointsList: [
      [0, 0],
      [100, 0],
      [100, 100],
    ],
  });
const newImage = () =>
  new ImageObject({ ...base, ctx, src: "", x: 10, y: 20, width: 30, height: 40 });
const newText = () =>
  new TextObject({
    ...base,
    ctx,
    x: 100,
    y: 200,
    fontSize: 20,
    text: "abc\nabcdef",
    fontFamily: "serif",
    objId: "t",
  });

describe("bounds", () => {
  it("прямоугольник нормализуется, даже если рисовали справа налево", () => {
    expect(newRect().bounds()).toEqual({ x: 100, y: 100, width: 200, height: 100 });
  });

  it("у эллипса startPoint — центр, а endPoint — угол", () => {
    expect(newEllipse().bounds()).toEqual({ x: 70, y: 80, width: 60, height: 40 });
  });

  it("линия, кривая и картинка", () => {
    expect(newLine().bounds()).toEqual({ x: 0, y: 0, width: 100, height: 0 });
    expect(newCurve().bounds()).toEqual({ x: 0, y: 0, width: 100, height: 100 });
    expect(newImage().bounds()).toEqual({ x: 10, y: 20, width: 30, height: 40 });
  });

  it("текст: самая длинная строка и все строки по высоте", () => {
    expect(newText().bounds()).toEqual({ x: 100, y: 200, width: 60, height: 50 });
  });
});

describe("withBounds", () => {
  it.each([
    ["прямоугольник", newRect],
    ["эллипс", newEllipse],
    ["линия", newLine],
    ["кривая", newCurve],
    ["картинка", newImage],
    ["текст", newText],
  ])("%s: новый объект с тем же objId, исходный не меняется", (_name, create) => {
    const original = create();
    const before = original.bounds();
    const next = { ...before, x: before.x + 7, y: before.y + 9 };

    const moved = original.withBounds(next);

    expect(moved).not.toBe(original);
    expect(moved.objId).toBe(original.objId);
    expect(moved.constructor).toBe(original.constructor);
    expect(moved.bounds()).toEqual(next);
    expect(original.bounds()).toEqual(before);
  });

  it("ресайз фигуры попадает в новый прямоугольник и сохраняет направление", () => {
    const resized = newRect().withBounds({ x: 0, y: 0, width: 400, height: 50 });

    expect(resized.startPoint).toEqual([400, 50]);
    expect(resized.endPoint).toEqual([0, 0]);
  });

  it("ресайз эллипса оставляет центр в центре", () => {
    const resized = newEllipse().withBounds({ x: 0, y: 0, width: 120, height: 20 });

    expect(resized.startPoint).toEqual([60, 10]);
    expect(resized.bounds()).toEqual({ x: 0, y: 0, width: 120, height: 20 });
  });

  it("ресайз кривой масштабирует все точки", () => {
    const resized = newCurve().withBounds({ x: 10, y: 10, width: 50, height: 200 });

    expect(resized.pointsList).toEqual([
      [10, 10],
      [60, 10],
      [60, 210],
    ]);
  });

  it("ресайз текста меняет шрифт по высоте", () => {
    const resized = newText().withBounds({ x: 0, y: 0, width: 999, height: 100 });

    expect(resized.fontSize).toBe(40);
    expect(resized.x).toBe(0);
  });

  it("у линии с нулевой высотой не появляется NaN", () => {
    const resized = newLine().withBounds({ x: 10, y: 5, width: 200, height: 0 });

    expect(resized.startPoint).toEqual([10, 5]);
    expect(resized.endPoint).toEqual([210, 5]);
  });
});

describe("containsPoint", () => {
  it("прямоугольник и картинка — весь прямоугольник с допуском", () => {
    expect(newRect().containsPoint(200, 150, 0)).toBe(true);
    expect(newRect().containsPoint(95, 150, 10)).toBe(true);
    expect(newRect().containsPoint(95, 150, 0)).toBe(false);
    expect(newImage().containsPoint(15, 25, 0)).toBe(true);
  });

  it("линия — близко к отрезку, а не к концам", () => {
    expect(newLine().containsPoint(50, 4, 5)).toBe(true);
    expect(newLine().containsPoint(50, 20, 5)).toBe(false);
  });

  it("кривая — близко к сегментам, пустой угол её рамки не считается", () => {
    expect(newCurve().containsPoint(50, 3, 5)).toBe(true);
    expect(newCurve().containsPoint(100, 50, 5)).toBe(true);
    expect(newCurve().containsPoint(10, 90, 5)).toBe(false);
  });

  it("эллипс — внутри овала, угол рамки не считается", () => {
    expect(newEllipse().containsPoint(100, 100, 0)).toBe(true);
    expect(newEllipse().containsPoint(72, 82, 0)).toBe(false);
  });
});

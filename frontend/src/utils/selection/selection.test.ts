import { describe, expect, it } from "vite-plus/test";
import type { BaseObject } from "@/constructors";
import {
  handleAt,
  MIN_SIZE,
  moveRect,
  rectFromPoints,
  rectInside,
  remapRect,
  resizeRect,
  topObjectAt,
  unionRects,
} from "./selection";

const rect = { x: 100, y: 100, width: 200, height: 100 };

describe("handleAt", () => {
  it("находит угол с учётом допуска", () => {
    expect(handleAt(rect, 98, 103, 10)).toBe("nw");
    expect(handleAt(rect, 300, 100, 10)).toBe("ne");
    expect(handleAt(rect, 100, 200, 10)).toBe("sw");
    expect(handleAt(rect, 305, 195, 10)).toBe("se");
  });

  it("середина и дальние точки — не ручка", () => {
    expect(handleAt(rect, 200, 150, 10)).toBeNull();
    expect(handleAt(rect, 320, 100, 10)).toBeNull();
  });
});

describe("moveRect", () => {
  it("сдвигает, не меняя размер", () => {
    expect(moveRect(rect, 10, -20)).toEqual({ x: 110, y: 80, width: 200, height: 100 });
  });
});

describe("resizeRect", () => {
  it("se тянет правый нижний угол, левый верхний стоит", () => {
    expect(resizeRect(rect, "se", 50, 20)).toEqual({ x: 100, y: 100, width: 250, height: 120 });
  });

  it("nw тянет левый верхний угол, правый нижний стоит", () => {
    expect(resizeRect(rect, "nw", 50, 20)).toEqual({ x: 150, y: 120, width: 150, height: 80 });
  });

  it("ne и sw двигают свои стороны", () => {
    expect(resizeRect(rect, "ne", 10, 10)).toEqual({ x: 100, y: 110, width: 210, height: 90 });
    expect(resizeRect(rect, "sw", 10, 10)).toEqual({ x: 110, y: 100, width: 190, height: 110 });
  });

  it("за противоположный угол не вывернуть: остаётся минимальный размер у той же стороны", () => {
    expect(resizeRect(rect, "se", -1000, -1000)).toEqual({
      x: 100,
      y: 100,
      width: MIN_SIZE,
      height: MIN_SIZE,
    });
    expect(resizeRect(rect, "nw", 1000, 1000)).toEqual({
      x: 300 - MIN_SIZE,
      y: 200 - MIN_SIZE,
      width: MIN_SIZE,
      height: MIN_SIZE,
    });
  });

  it("нулевая сторона горизонтальной линии не прыгает к минимальному размеру", () => {
    const flat = { x: 0, y: 50, width: 100, height: 0 };

    expect(resizeRect(flat, "se", 10, 0).height).toBe(0);
  });
});

describe("topObjectAt", () => {
  const obj = (objId: string, hit: boolean) =>
    ({ objId, containsPoint: () => hit }) as unknown as BaseObject;

  it("берёт верхний из попавших — последний в массиве", () => {
    const objects = [obj("A", true), obj("B", true), obj("C", false)];

    expect(topObjectAt(objects, 0, 0, 5)?.objId).toBe("B");
  });

  it("мимо всех — undefined", () => {
    expect(topObjectAt([obj("A", false)], 0, 0, 5)).toBeUndefined();
  });
});

describe("rectFromPoints", () => {
  it("нормализует любое направление", () => {
    expect(rectFromPoints(50, 60, 10, 20)).toEqual({ x: 10, y: 20, width: 40, height: 40 });
  });
});

describe("rectInside", () => {
  const outer = { x: 0, y: 0, width: 100, height: 100 };

  it("целиком внутри — да, вылез краем — нет", () => {
    expect(rectInside({ x: 10, y: 10, width: 20, height: 20 }, outer)).toBe(true);
    expect(rectInside({ x: 90, y: 10, width: 20, height: 20 }, outer)).toBe(false);
  });
});

describe("unionRects", () => {
  it("общая рамка нескольких прямоугольников", () => {
    expect(
      unionRects([
        { x: 0, y: 10, width: 10, height: 10 },
        { x: 20, y: 0, width: 5, height: 5 },
      ]),
    ).toEqual({ x: 0, y: 0, width: 25, height: 20 });
  });

  it("пустой список — null", () => {
    expect(unionRects([])).toBeNull();
  });
});

describe("remapRect", () => {
  it("переводит прямоугольник вместе с рамкой группы", () => {
    const from = { x: 0, y: 0, width: 100, height: 100 };
    const to = { x: 10, y: 10, width: 200, height: 50 };

    expect(remapRect({ x: 50, y: 50, width: 10, height: 20 }, from, to)).toEqual({
      x: 110,
      y: 35,
      width: 20,
      height: 10,
    });
  });

  it("нулевая сторона группы не даёт NaN", () => {
    const from = { x: 0, y: 5, width: 100, height: 0 };
    const to = { x: 0, y: 8, width: 100, height: 0 };

    expect(remapRect({ x: 0, y: 5, width: 100, height: 0 }, from, to).y).toBe(8);
  });
});

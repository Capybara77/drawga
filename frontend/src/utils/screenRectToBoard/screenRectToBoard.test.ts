import { describe, expect, it } from "vitest";
import { screenRectToBoard } from "./screenRectToBoard";

describe("screenRectToBoard", () => {
  const rect = { x: 192, y: 160, width: 400, height: 200 };

  it("без зума и сдвига координаты не меняются", () => {
    expect(screenRectToBoard(rect, 0, 0, 1)).toEqual(rect);
  });

  it("вычитает сдвиг из позиции, но не из размера", () => {
    expect(screenRectToBoard(rect, 50, -30, 1)).toEqual({
      x: 142,
      y: 190,
      width: 400,
      height: 200,
    });
  });

  it("делит позицию и размер на зум", () => {
    expect(screenRectToBoard(rect, 0, 0, 2)).toEqual({ x: 96, y: 80, width: 200, height: 100 });
  });

  it("отрисовка возвращает исходный экранный прямоугольник", () => {
    const [offsetX, offsetY, zoom] = [37, -12, 1.5];
    const board = screenRectToBoard(rect, offsetX, offsetY, zoom);

    // формула из ImageObject.draw
    expect(board.x * zoom + offsetX).toBeCloseTo(rect.x);
    expect(board.y * zoom + offsetY).toBeCloseTo(rect.y);
    expect(board.width * zoom).toBeCloseTo(rect.width);
    expect(board.height * zoom).toBeCloseTo(rect.height);
  });
});

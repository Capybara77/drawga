import { describe, expect, it } from "vitest";
import { ImageObject, TextObject } from "./constructors";

// ширина строки — 10 на символ, если шрифт выставлен без зума
const ctx = {
  font: "",
  measureText(line: string) {
    return { width: line.length * 10 };
  },
} as unknown as CanvasRenderingContext2D;

const newText = (text: string) =>
  new TextObject({
    x: 100,
    y: 200,
    color: "000000",
    ctx,
    fontSize: 20,
    text,
    userId: "u",
    fontFamily: "serif",
    width: 0,
    objId: "t",
  });

describe("TextObject.isOverlay", () => {
  // как вызывает ластик в isHit: «экран» 1×1 под курсором
  const hitByEraser = (
    text: TextObject,
    cursorX: number,
    cursorY: number,
    offsetX = 0,
    offsetY = 0,
    zoom = 1,
  ) => text.isOverlay(offsetX - cursorX, offsetY - cursorY, 1, 1, zoom);

  it("ластик попадает внутрь строки", () => {
    expect(hitByEraser(newText("abc"), 110, 210)).toBe(true);
  });

  it("ластик не попадает за шириной и высотой строки", () => {
    const text = newText("abc");

    expect(hitByEraser(text, 132, 210)).toBe(false); // ширина 30
    expect(hitByEraser(text, 110, 227)).toBe(false); // высота 20 * 1.25 = 25
    expect(hitByEraser(text, 98, 210)).toBe(false);
    expect(hitByEraser(text, 110, 198)).toBe(false);
  });

  it("у многострочного текста ширина — по самой длинной строке, высота — по числу строк", () => {
    const text = newText("a\nabcde");

    expect(hitByEraser(text, 145, 210)).toBe(true);
    expect(hitByEraser(text, 110, 245)).toBe(true);
    expect(hitByEraser(text, 110, 252)).toBe(false);
  });

  it("меряет шрифтом без зума", () => {
    newText("abc").isOverlay(0, 0, 800, 600, 2);

    expect(ctx.font).toBe("20px serif");
  });

  it("при зуме ластик попадает по ширине текста на экране", () => {
    const text = newText("abc");

    // правый край на экране: (100 + 30) * 2 + 50 = 310
    expect(hitByEraser(text, 300, 460, 50, 50, 2)).toBe(true);
    expect(hitByEraser(text, 320, 460, 50, 50, 2)).toBe(false);
  });

  it("при зуме ластик попадает по высоте текста на экране", () => {
    const text = newText("abc");

    // низ на экране: (200 + 25) * 2 + 50 = 500
    expect(hitByEraser(text, 300, 490, 50, 50, 2)).toBe(true);
    expect(hitByEraser(text, 300, 510, 50, 50, 2)).toBe(false);
  });

  it("отрисовка: виден только текст, пересекающий экран", () => {
    expect(newText("abc").isOverlay(0, 0, 800, 600, 1)).toBe(true);
    expect(newText("abc").isOverlay(-1000, 0, 800, 600, 1)).toBe(false);
    expect(newText("abc").isOverlay(0, -1000, 800, 600, 1)).toBe(false);
  });
});

describe("ImageObject.isOverlay", () => {
  const image = new ImageObject({
    x: 100,
    y: 200,
    width: 400,
    height: 300,
    src: "",
    userId: "u",
    ctx,
    color: "",
  });

  // как вызывает ластик в isHit: «экран» 1×1 под курсором
  const hitByEraser = (cursorX: number, cursorY: number, offsetX = 0, offsetY = 0, zoom = 1) =>
    image.isOverlay(offsetX - cursorX, offsetY - cursorY, 1, 1, zoom);

  it("ластик попадает внутрь картинки и по её углам", () => {
    expect(hitByEraser(300, 350)).toBe(true);
    expect(hitByEraser(100, 200)).toBe(true);
    expect(hitByEraser(500, 500)).toBe(true);
  });

  it("ластик не попадает снаружи", () => {
    expect(hitByEraser(98, 350)).toBe(false);
    expect(hitByEraser(502, 350)).toBe(false);
    expect(hitByEraser(300, 198)).toBe(false);
    expect(hitByEraser(300, 502)).toBe(false);
  });

  it("ластик учитывает зум и сдвиг", () => {
    // правый край на экране: (100 + 400) * 2 + 50 = 1050
    expect(hitByEraser(1040, 800, 50, 50, 2)).toBe(true);
    expect(hitByEraser(1060, 800, 50, 50, 2)).toBe(false);
  });

  it("отрисовка: виден только прямоугольник, пересекающий экран", () => {
    expect(image.isOverlay(0, 0, 800, 600, 1)).toBe(true);
    expect(image.isOverlay(-1000, 0, 800, 600, 1)).toBe(false);
    expect(image.isOverlay(0, -1000, 800, 600, 1)).toBe(false);
  });
});

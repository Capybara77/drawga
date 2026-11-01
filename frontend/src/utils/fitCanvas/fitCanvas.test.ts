import { describe, it, expect, vi } from "vite-plus/test";
import { fitCanvas } from "./fitCanvas";

describe("fitCanvas", () => {
  it("на ретине буфер канваса в dpr раз больше, а рисуем по-прежнему в CSS-пикселях", () => {
    const canvas = document.createElement("canvas");
    const ctx = { setTransform: vi.fn() } as unknown as CanvasRenderingContext2D;

    fitCanvas(canvas, ctx, 800, 600, 2);

    expect(canvas.width).toBe(1600);
    expect(canvas.height).toBe(1200);
    expect(canvas.style.width).toBe("800px");
    expect(canvas.style.height).toBe("600px");
    expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
  });

  it("дробный dpr (зум браузера 125%) округляет буфер до целых пикселей", () => {
    const canvas = document.createElement("canvas");
    const ctx = { setTransform: vi.fn() } as unknown as CanvasRenderingContext2D;

    fitCanvas(canvas, ctx, 801, 601, 1.25);

    expect(canvas.width).toBe(1001);
    expect(canvas.height).toBe(751);
  });
});

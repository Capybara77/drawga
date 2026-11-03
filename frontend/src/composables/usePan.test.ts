import { describe, expect, it } from "vite-plus/test";
import { isPanStart } from "./usePan";

const LEFT = 0;
const MIDDLE = 1;
const RIGHT = 2;

describe("isPanStart", () => {
  it("средняя кнопка двигает доску с любым инструментом", () => {
    expect(isPanStart(MIDDLE, false, "curve")).toBe(true);
  });

  it("левая кнопка двигает с зажатым пробелом", () => {
    expect(isPanStart(LEFT, true, "curve")).toBe(true);
  });

  it("левая кнопка двигает инструментом «рука»", () => {
    expect(isPanStart(LEFT, false, "hand")).toBe(true);
  });

  it("левая кнопка с другим инструментом рисует, а не двигает", () => {
    expect(isPanStart(LEFT, false, "curve")).toBe(false);
    expect(isPanStart(LEFT, false, "pointer")).toBe(false);
  });

  it("правая кнопка рукой не двигает", () => {
    expect(isPanStart(RIGHT, false, "hand")).toBe(false);
  });
});

import { describe, it, expect, beforeEach } from "vite-plus/test";
import { getMyName } from "./myName";

// 🎓 ТЗ: имя этого браузера — придумываем один раз и помним в localStorage

describe("getMyName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("в первый раз придумывает непустое имя и запоминает его", () => {
    const name = getMyName(localStorage);

    expect(name.length).toBeGreaterThan(0);
    expect(localStorage.getItem("drawga-name")).toBe(name);
  });

  it("если имя уже есть — возвращает его", () => {
    localStorage.setItem("drawga-name", "Енот");

    expect(getMyName(localStorage)).toBe("Енот");
  });

  it("если хранилище недоступно (приватный режим) — всё равно даёт имя и не падает", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    } as unknown as Storage;

    expect(getMyName(broken).length).toBeGreaterThan(0);
  });
});

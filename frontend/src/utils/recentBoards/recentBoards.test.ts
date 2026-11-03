import { beforeEach, describe, expect, it } from "vite-plus/test";
import { getRecentBoards, rememberBoard } from "./recentBoards";

const memoryStorage = (): Pick<Storage, "getItem" | "setItem"> => {
  const data = new Map<string, string>();

  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
};

describe("recentBoards", () => {
  let storage: ReturnType<typeof memoryStorage>;

  beforeEach(() => {
    storage = memoryStorage();
  });

  it("сначала пусто", () => {
    expect(getRecentBoards(storage)).toEqual([]);
  });

  it("последняя открытая доска идёт первой, без дублей", () => {
    rememberBoard(storage, "a", 1);
    rememberBoard(storage, "b", 2);
    rememberBoard(storage, "a", 3);

    expect(getRecentBoards(storage)).toEqual([
      { id: "a", openedAt: 3 },
      { id: "b", openedAt: 2 },
    ]);
  });

  it("хранит не больше 20 досок", () => {
    for (let i = 0; i < 25; i++) {
      rememberBoard(storage, `b${i}`, i);
    }

    const boards = getRecentBoards(storage);

    expect(boards).toHaveLength(20);
    expect(boards[0].id).toBe("b24");
  });

  it("битое значение не ломает страницу", () => {
    storage.setItem("recentBoards", "{не json");
    expect(getRecentBoards(storage)).toEqual([]);

    storage.setItem("recentBoards", '{"a":1}');
    expect(getRecentBoards(storage)).toEqual([]);
  });

  it("недоступный localStorage не ломает страницу", () => {
    const broken: Pick<Storage, "getItem" | "setItem"> = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };

    expect(getRecentBoards(broken)).toEqual([]);
    expect(() => rememberBoard(broken, "a", 1)).not.toThrow();
  });
});

import { describe, it, expect, beforeEach } from "vite-plus/test";
import { createPinia, setActivePinia } from "pinia";
import type { BaseObject } from "@/constructors";
import { useAllObjectsStore } from "./allObjects";

// для стора важен только objId, рисовать объекты не нужно
const obj = (objId: string) => ({ objId }) as BaseObject;
const ids = (objects: BaseObject[]) => objects.map((o) => o.objId);

describe("allObjects store", () => {
  let store: ReturnType<typeof useAllObjectsStore>;
  const [A, B, C] = [obj("A"), obj("B"), obj("C")];

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAllObjectsStore();
  });

  it("в начале отменять и возвращать нечего", () => {
    expect(store.canUndo).toBe(false);
    expect(store.canRedo).toBe(false);
  });

  it("undo убирает нарисованное, redo возвращает", () => {
    store.add(A);
    store.add(B);

    store.undo();
    expect(ids(store.objects)).toEqual(["A"]);
    expect(store.canRedo).toBe(true);

    store.redo();
    expect(ids(store.objects)).toEqual(["A", "B"]);
    expect(store.canRedo).toBe(false);
  });

  it("undo после ластика возвращает стёртое, а не убирает последний рисунок", () => {
    store.add(A);
    store.add(B);
    store.add(C);
    store.remove([B]);
    expect(ids(store.objects)).toEqual(["A", "C"]);

    store.undo();
    expect(ids(store.objects).sort()).toEqual(["A", "B", "C"]);

    store.redo();
    expect(ids(store.objects)).toEqual(["A", "C"]);
  });

  it("одно движение ластиком отменяется одним undo", () => {
    store.add(A);
    store.add(B);
    store.add(C);

    store.remove([A]);
    store.remove([B], true); // продолжение того же движения

    expect(ids(store.objects)).toEqual(["C"]);

    store.undo();
    expect(ids(store.objects).sort()).toEqual(["A", "B", "C"]);
  });

  it("новое действие очищает redo", () => {
    store.add(A);
    store.undo();
    store.add(B);

    expect(store.canRedo).toBe(false);
  });

  it("пустой remove ничего не пишет в журнал", () => {
    store.remove([]);

    expect(store.canUndo).toBe(false);
  });

  it("чужие объекты (receive) не отменяются", () => {
    store.receive(A);

    expect(ids(store.objects)).toEqual(["A"]);
    expect(store.canUndo).toBe(false);
  });

  it("каждое изменение подменяет массив objects — на это завязан watch канваса", () => {
    store.add(A);
    let before = store.objects;
    store.undo();
    expect(store.objects).not.toBe(before);

    before = store.objects;
    store.redo();
    expect(store.objects).not.toBe(before);
  });
});

// 🎓 ТЗ на синхронизацию по сокету — эти тесты должен сделать зелёными пользователь
describe("allObjects store: синхронизация по сокету", () => {
  let store: ReturnType<typeof useAllObjectsStore>;
  const [A, B, C] = [obj("A"), obj("B"), obj("C")];

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAllObjectsStore();
  });

  it("receiveRemove убирает объекты по objId и не пишет в журнал", () => {
    store.receive(A);
    store.receive(B);
    store.receive(C);

    store.receiveRemove(["A", "C"]);

    expect(ids(store.objects)).toEqual(["B"]);
    expect(store.canUndo).toBe(false);
  });

  it("receiveRemove не ломает свой журнал: undo своего рисунка работает дальше", () => {
    store.add(A);
    store.receive(B);

    store.receiveRemove(["B"]);
    store.undo();

    expect(ids(store.objects)).toEqual([]);
  });

  it("undo рисунка возвращает, что изменилось на доске: объект убран", () => {
    store.add(A);

    expect(store.undo()).toEqual({ type: "remove", objects: [A] });
  });

  it("undo ластика возвращает, что изменилось на доске: объекты вернулись", () => {
    store.add(A);
    store.add(B);
    store.remove([A, B]);

    expect(store.undo()).toEqual({ type: "add", objects: [A, B] });
  });

  it("redo возвращает то же действие, что было в журнале", () => {
    store.add(A);
    store.undo();
    expect(store.redo()).toEqual({ type: "add", objects: [A] });

    store.remove([A]);
    store.undo();
    expect(store.redo()).toEqual({ type: "remove", objects: [A] });
  });

  it("undo/redo с пустым журналом возвращают undefined", () => {
    expect(store.undo()).toBeUndefined();
    expect(store.redo()).toBeUndefined();
  });

  it("clear очищает redo, как и любое новое действие", () => {
    store.add(A);
    store.undo();
    store.clear();

    expect(store.canRedo).toBe(false);
  });
});

// 🎓 ТЗ на живой прогресс рисования: черновики чужих фигур, пока автор ещё ведёт мышь
describe("allObjects store: черновики (temp)", () => {
  let store: ReturnType<typeof useAllObjectsStore>;
  const draft = (objId: string, step: number) => ({ objId, step }) as unknown as BaseObject;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAllObjectsStore();
  });

  it("в начале черновиков нет", () => {
    expect(store.previews).toEqual([]);
  });

  it("receiveTemp показывает черновик, но не кладёт его на доску и в журнал", () => {
    store.receiveTemp(draft("A", 1));

    expect(ids(store.previews)).toEqual(["A"]);
    expect(store.objects).toEqual([]);
    expect(store.canUndo).toBe(false);
  });

  it("новый кадр той же фигуры заменяет старый, а не добавляется", () => {
    const next = draft("A", 2);
    store.receiveTemp(draft("A", 1));
    store.receiveTemp(next);

    expect(store.previews).toEqual([next]);
  });

  it("черновики разных фигур живут вместе", () => {
    store.receiveTemp(draft("A", 1));
    store.receiveTemp(draft("B", 1));

    expect(ids(store.previews)).toEqual(["A", "B"]);
  });

  it("готовая фигура (receive) убирает свой черновик", () => {
    store.receiveTemp(draft("A", 1));
    store.receiveTemp(draft("B", 1));

    store.receive(obj("A"));

    expect(ids(store.previews)).toEqual(["B"]);
    expect(ids(store.objects)).toEqual(["A"]);
  });

  it("каждый кадр подменяет массив previews — чтобы watch канваса мог смотреть на ссылку", () => {
    store.receiveTemp(draft("A", 1));
    const before = store.previews;

    store.receiveTemp(draft("A", 2));

    expect(store.previews).not.toBe(before);
  });

  it("receiveTemp должен игнорировать объект, если фигура с таким objId уже лежит в objects", () => {
    store.receive(obj("A"));

    store.receiveTemp(obj("A"));

    expect(ids(store.objects)).toEqual(["A"]);
    expect(ids(store.previews)).toEqual([]);
  });
});

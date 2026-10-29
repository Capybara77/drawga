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

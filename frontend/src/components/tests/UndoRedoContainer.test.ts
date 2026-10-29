import { describe, it, expect, beforeEach } from "vite-plus/test";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia, type Pinia } from "pinia";
import type { BaseObject } from "@/constructors";
import { useAllObjectsStore } from "@/stores/allObjects";
import UndoRedoContainer from "../UndoRedoContainer.vue";

// компонент берёт всё из стора allObjects — тест работает с настоящим стором
const obj = (objId: string) => ({ objId }) as BaseObject;

describe("UndoRedoContainer.vue", () => {
  let pinia: Pinia;
  let store: ReturnType<typeof useAllObjectsStore>;

  const mountContainer = () => mount(UndoRedoContainer, { global: { plugins: [pinia] } });

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    store = useAllObjectsStore();
  });

  it("рендерит две кнопки: отменить и вернуть", () => {
    const wrapper = mountContainer();

    expect(wrapper.find("#undo").exists()).toBe(true);
    expect(wrapper.find("#redo").exists()).toBe(true);
  });

  it("на пустой доске обе кнопки выключены", () => {
    const wrapper = mountContainer();

    expect(wrapper.find("#undo").attributes("disabled")).toBeDefined();
    expect(wrapper.find("#redo").attributes("disabled")).toBeDefined();
  });

  it("после рисования включается «отменить»", async () => {
    const wrapper = mountContainer();

    store.add(obj("A"));
    await wrapper.vm.$nextTick();

    expect(wrapper.find("#undo").attributes("disabled")).toBeUndefined();
    expect(wrapper.find("#redo").attributes("disabled")).toBeDefined();
  });

  it("клик по «отменить» отменяет последнее действие", async () => {
    store.add(obj("A"));
    const wrapper = mountContainer();

    await wrapper.find("#undo").trigger("click");

    expect(store.objects).toHaveLength(0);
    expect(wrapper.find("#undo").attributes("disabled")).toBeDefined();
    expect(wrapper.find("#redo").attributes("disabled")).toBeUndefined();
  });

  it("клик по «вернуть» возвращает отменённое", async () => {
    store.add(obj("A"));
    store.undo();
    const wrapper = mountContainer();

    await wrapper.find("#redo").trigger("click");

    expect(store.objects.map((o) => o.objId)).toEqual(["A"]);
    expect(wrapper.find("#redo").attributes("disabled")).toBeDefined();
  });
});

import { describe, it, expect } from "vite-plus/test";
import { getHistoryHotkey, isTyping } from "./hotkeys";

// 🎓 ТЗ на горячие клавиши — сделать зелёным должен пользователь

// нажать клавишу на элементе и вернуть событие — так у события будет настоящий target
const pressOn = (el: Element, init: KeyboardEventInit = {}): KeyboardEvent => {
  document.body.append(el);
  let pressed!: KeyboardEvent;
  el.addEventListener("keydown", (e) => (pressed = e as KeyboardEvent));
  el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, ...init }));
  el.remove();

  return pressed;
};

const press = (init: KeyboardEventInit): KeyboardEvent =>
  pressOn(document.createElement("canvas"), init);

const input = (type: string): HTMLInputElement => {
  const el = document.createElement("input");
  el.type = type;
  return el;
};

describe("getHistoryHotkey", () => {
  it("Ctrl+Z — отменить", () => {
    expect(getHistoryHotkey(press({ code: "KeyZ", ctrlKey: true }))).toBe("undo");
  });

  it("Cmd+Z на маке — тоже отменить", () => {
    expect(getHistoryHotkey(press({ code: "KeyZ", metaKey: true }))).toBe("undo");
  });

  it("Ctrl+Shift+Z — вернуть", () => {
    expect(getHistoryHotkey(press({ code: "KeyZ", ctrlKey: true, shiftKey: true }))).toBe("redo");
  });

  it("Ctrl+Y — тоже вернуть", () => {
    expect(getHistoryHotkey(press({ code: "KeyY", ctrlKey: true }))).toBe("redo");
  });

  it("работает в русской раскладке: смотрим на клавишу (code), а не на букву (key)", () => {
    expect(getHistoryHotkey(press({ code: "KeyZ", key: "я", ctrlKey: true }))).toBe("undo");
  });

  it("Z без Ctrl/Cmd — не наш шорткат", () => {
    expect(getHistoryHotkey(press({ code: "KeyZ" }))).toBeUndefined();
  });

  it("Ctrl с другой клавишей — не наш шорткат", () => {
    expect(getHistoryHotkey(press({ code: "KeyS", ctrlKey: true }))).toBeUndefined();
  });
});

describe("isTyping", () => {
  it("в текстовом поле (hex цвета) человек печатает — шорткаты не трогаем", () => {
    expect(isTyping(pressOn(input("text"), { code: "Digit3" }))).toBe(true);
  });

  it("в textarea тоже печатает", () => {
    expect(isTyping(pressOn(document.createElement("textarea"), { code: "Digit3" }))).toBe(true);
  });

  it("ползунок прозрачности — не печать: после него шорткаты должны работать", () => {
    expect(isTyping(pressOn(input("range"), { code: "Digit3" }))).toBe(false);
  });

  it("на канвасе — не печать", () => {
    expect(isTyping(press({ code: "Digit3" }))).toBe(false);
  });
});

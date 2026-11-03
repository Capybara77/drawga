import { describe, it, expect } from "vite-plus/test";
import type { BaseObject } from "@/constructors";
import { toServerMessages } from "./toServerMessages.ts";

// 🎓 ТЗ: что изменилось на доске → какие сообщения уйдут в socket.send
// бэкенд понимает "drawObj:::<объект>" и "delete:::{"objId": ...}" (DrawController.DeleteHistory)
const obj = (objId: string) => ({ objId, drawType: "line" }) as BaseObject;

describe("toServerMessages", () => {
  it("появившийся объект уходит как drawObj с объектом целиком", () => {
    const A = obj("A");

    expect(toServerMessages({ type: "add", objects: [A] })).toEqual([
      ["drawObj", JSON.stringify(A)],
    ]);
  });

  it("убранные объекты уходят отдельным delete на каждый, только с objId", () => {
    expect(toServerMessages({ type: "remove", objects: [obj("A"), obj("B")] })).toEqual([
      ["delete", JSON.stringify({ objId: "A" })],
      ["delete", JSON.stringify({ objId: "B" })],
    ]);
  });

  it("замена уходит как все delete, потом все drawObj — сервер хранит только историю сообщений", () => {
    const before = [obj("A"), obj("B")];
    const after = [{ ...obj("A"), color: "red" }, { ...obj("B"), color: "red" }] as BaseObject[];

    expect(toServerMessages({ type: "replace", before, after })).toEqual([
      ["delete", JSON.stringify({ objId: "A" })],
      ["delete", JSON.stringify({ objId: "B" })],
      ["drawObj", JSON.stringify(after[0])],
      ["drawObj", JSON.stringify(after[1])],
    ]);
  });

  it("пустое изменение — ни одного сообщения", () => {
    expect(toServerMessages({ type: "remove", objects: [] })).toEqual([]);
  });
});

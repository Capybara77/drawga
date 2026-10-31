import { describe, it, expect, beforeEach } from "vite-plus/test";
import { createPinia, setActivePinia } from "pinia";
import { useParticipantsStore } from "./participants";

// 🎓 ТЗ: стор участников доски — чьи курсоры сейчас видно и где они.
// now передаём явно, чтобы тесты не зависели от часов

describe("participants store", () => {
  let store: ReturnType<typeof useParticipantsStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useParticipantsStore();
  });

  it("в начале никого нет", () => {
    expect(store.list).toEqual([]);
  });

  it("moveCursor добавляет участника: id, имя, координаты и когда видели", () => {
    store.moveCursor({ id: "a", name: "Енот", x: 10, y: 20 }, 1000);

    expect(store.list).toEqual([{ id: "a", name: "Енот", x: 10, y: 20, seenAt: 1000 }]);
  });

  it("новое движение того же участника обновляет его, а не добавляет второго", () => {
    store.moveCursor({ id: "a", name: "Енот", x: 10, y: 20 }, 1000);
    store.moveCursor({ id: "a", name: "Енотик", x: 30, y: 40 }, 2000);

    expect(store.list).toEqual([{ id: "a", name: "Енотик", x: 30, y: 40, seenAt: 2000 }]);
  });

  it("разные участники живут вместе", () => {
    store.moveCursor({ id: "a", name: "Енот", x: 0, y: 0 }, 1000);
    store.moveCursor({ id: "b", name: "Барсук", x: 0, y: 0 }, 1000);

    expect(store.list.map((p) => p.name)).toEqual(["Енот", "Барсук"]);
  });

  it("removeStale убирает тех, кого не видели дольше ttl, остальных оставляет", () => {
    store.moveCursor({ id: "a", name: "Енот", x: 0, y: 0 }, 1000);
    store.moveCursor({ id: "b", name: "Барсук", x: 0, y: 0 }, 5000);

    store.removeStale(7000, 3000); // сейчас 7000, держим 3 секунды

    expect(store.list.map((p) => p.id)).toEqual(["b"]);
  });
});

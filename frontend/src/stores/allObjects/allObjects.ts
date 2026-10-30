import { BaseObject } from "@/constructors";
import { defineStore } from "pinia";

// запись в журнале: что сделали и с какими объектами
export type Action = { type: "add" | "remove"; objects: BaseObject[] };

type State = {
  objects: BaseObject[]; // что сейчас на доске
  undoStack: Action[];
  redoStack: Action[];
};

const without = (objects: BaseObject[], toDrop: BaseObject[]) => {
  const dropIds = new Set(toDrop.map((o) => o.objId));
  return objects.filter((o) => !dropIds.has(o.objId));
};

// objects всегда заменяем новым массивом, а не мутируем — watch канваса смотрит на ссылку
export const useAllObjectsStore = defineStore("allObjects", {
  state: (): State => ({
    objects: [],
    undoStack: [],
    redoStack: [],
  }),
  actions: {
    // объект пришёл с сервера (чужой или загрузка доски) — в журнал не пишем
    receive(obj: BaseObject) {
      this.objects = [...this.objects, obj];
    },
    receiveRemove(toRemove: string[]) {
      this.objects = this.objects.filter((o) => !toRemove.includes(o.objId));
    },
    clear() {
      this.undoStack.push({ type: "remove", objects: this.objects });
      this.objects = [];
      this.redoStack = [];
    },
    add(obj: BaseObject) {
      this.objects = [...this.objects, obj];
      this.undoStack.push({ type: "add", objects: [obj] });
      this.redoStack = [];
    },
    // merge = продолжение того же движения ластиком: дописываем в последнюю запись
    remove(toRemove: BaseObject[], merge = false) {
      if (toRemove.length === 0) {
        return;
      }

      this.objects = without(this.objects, toRemove);

      const last = this.undoStack.at(-1);
      if (merge && last?.type === "remove") {
        last.objects.push(...toRemove);
      } else {
        this.undoStack.push({ type: "remove", objects: toRemove });
      }
      this.redoStack = [];
    },
    undo(): Action | undefined {
      const action = this.undoStack.pop();
      if (!action) {
        return;
      }

      // делаем наоборот
      // ponytail: стёртое возвращается поверх остальных, исходный порядок не храним
      this.objects =
        action.type === "add"
          ? without(this.objects, action.objects)
          : [...this.objects, ...action.objects];
      this.redoStack.push(action);

      return { ...action, type: action.type === "add" ? "remove" : "add" };
    },
    redo(): Action | undefined {
      const action = this.redoStack.pop();
      if (!action) {
        return;
      }

      // делаем то же самое ещё раз
      this.objects =
        action.type === "add"
          ? [...this.objects, ...action.objects]
          : without(this.objects, action.objects);
      this.undoStack.push(action);

      return action;
    },
  },
  getters: {
    canUndo: (state) => state.undoStack.length > 0,
    canRedo: (state) => state.redoStack.length > 0,
    peek: (state) => state.objects.at(-1),
    size: (state) => state.objects.length,
  },
});

import { beforeEach, describe, expect, it } from "vite-plus/test";
import { createPinia, setActivePinia } from "pinia";
import type { RoughCanvas } from "roughjs/bin/canvas";
import { RectangleObject } from "@/constructors";
import { useAllObjectsStore } from "@/stores/allObjects";
import { useSelection } from "./useSelection";

const newRect = (objId: string, startPoint: number[], endPoint: number[]) => {
  const rect = new RectangleObject({
    color: "c",
    width: 2,
    userId: "u",
    fillStyle: "solid",
    stroke: "s",
    strokeWidth: 2,
    roughCanvas: {} as RoughCanvas,
    startPoint,
    endPoint,
  });
  rect.objId = objId;
  return rect;
};

describe("useSelection", () => {
  let store: ReturnType<typeof useAllObjectsStore>;
  let selection: ReturnType<typeof useSelection>;

  const selectedIds = () => selection.selected.value.map((o) => o.objId);
  const boundsOf = (objId: string) => store.objects.find((o) => o.objId === objId)?.bounds();
  const click = (x: number, y: number, additive = false) => {
    selection.press(x, y, 1, additive);
    selection.release();
  };
  // выделяем рамкой от пустого места
  const marquee = (x1: number, y1: number, x2: number, y2: number, additive = false) => {
    selection.press(x1, y1, 1, additive);
    selection.drag(x2, y2);
    selection.release();
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAllObjectsStore();
    selection = useSelection();
    store.add(newRect("A", [100, 100], [200, 200]));
    store.add(newRect("B", [500, 500], [600, 600]));
  });

  describe("один объект", () => {
    it("клик по объекту выделяет, клик мимо снимает", () => {
      click(150, 150);
      expect(selectedIds()).toEqual(["A"]);

      click(0, 0);
      expect(selectedIds()).toEqual([]);
    });

    it("клик без движения не пишет в журнал", () => {
      selection.press(150, 150, 1);

      expect(selection.release()).toBeUndefined();
      expect(store.undoStack).toHaveLength(2);
    });

    it("перетаскивание: черновик во время движения, на доске старое до отпускания", () => {
      selection.press(150, 150, 1);
      selection.drag(160, 170);

      expect(selection.drafts.value[0].bounds()).toEqual({
        x: 110,
        y: 120,
        width: 100,
        height: 100,
      });
      expect(selection.drafts.value[0].tempObj).toBe(true);
      expect(boundsOf("A")?.x).toBe(100);
    });

    it("отпускание заменяет объект и возвращает действие для сокета", () => {
      selection.press(150, 150, 1);
      selection.drag(160, 170);
      const action = selection.release();

      expect(action?.type).toBe("replace");
      expect(selection.drafts.value).toEqual([]);
      expect(boundsOf("A")).toEqual({ x: 110, y: 120, width: 100, height: 100 });
      expect(store.objects.find((o) => o.objId === "A")?.tempObj).toBe(false);
      expect(selectedIds()).toEqual(["A"]);

      store.undo();
      expect(boundsOf("A")?.x).toBe(100);
    });

    it("ручка выделенного объекта ресайзит, а не двигает", () => {
      click(150, 150);

      selection.press(200, 200, 1);
      selection.drag(250, 230);
      selection.release();

      expect(boundsOf("A")).toEqual({ x: 100, y: 100, width: 150, height: 130 });
    });

    it("допуск ручки в экранных пикселях: при зуме он меньше на доске", () => {
      click(150, 150);

      expect(selection.cursorAt(205, 205, 1)).toBe("nwse-resize");
      expect(selection.cursorAt(205, 205, 4)).not.toBe("nwse-resize");
    });

    it("зажатие внутри рамки двигает выделенный, даже если сверху другой объект", () => {
      store.add(newRect("C", [140, 140], [160, 160]));
      click(110, 110);

      selection.press(150, 150, 1);
      selection.drag(155, 150);
      selection.release();

      expect(boundsOf("A")?.x).toBe(105);
      expect(boundsOf("C")?.x).toBe(140);
    });

    it("чужое удаление убирает объект из выделения", () => {
      click(150, 150);

      store.receiveRemove(["A"]);

      expect(selectedIds()).toEqual([]);
    });

    it("deselect сбрасывает выделение", () => {
      click(150, 150);
      selection.deselect();

      expect(selectedIds()).toEqual([]);
    });

    it("cursorAt: над объектом move, над пустым местом default", () => {
      expect(selection.cursorAt(150, 150, 1)).toBe("move");
      expect(selection.cursorAt(0, 0, 1)).toBe("default");
    });
  });

  describe("рамка", () => {
    it("пока тянем, рамка видна; после отпускания пропадает", () => {
      selection.press(650, 650, 1);
      selection.drag(450, 450);

      expect(selection.marquee.value).toEqual({ x: 450, y: 450, width: 200, height: 200 });

      selection.release();
      expect(selection.marquee.value).toBeNull();
    });

    it("выделяет только объекты целиком внутри, в любом направлении", () => {
      marquee(650, 650, 450, 450);
      expect(selectedIds()).toEqual(["B"]);

      marquee(50, 50, 550, 550);
      expect(selectedIds()).toEqual(["A"]);

      marquee(50, 50, 650, 650);
      expect(selectedIds()).toEqual(["A", "B"]);
    });

    it("рамка не пишет в журнал и не шлёт действие", () => {
      selection.press(50, 50, 1);
      selection.drag(650, 650);

      expect(selection.release()).toBeUndefined();
      expect(store.undoStack).toHaveLength(2);
    });

    it("новая рамка заменяет выделение, а с Shift добавляет к нему", () => {
      click(150, 150);
      marquee(450, 450, 650, 650);
      expect(selectedIds()).toEqual(["B"]);

      click(150, 150);
      marquee(450, 450, 650, 650, true);
      expect(selectedIds()).toEqual(["A", "B"]);
    });
  });

  describe("Shift+клик", () => {
    it("добавляет объект и убирает его повторным кликом", () => {
      click(150, 150);

      click(550, 550, true);
      expect(selectedIds()).toEqual(["A", "B"]);

      click(150, 150, true);
      expect(selectedIds()).toEqual(["B"]);
    });
  });

  describe("группа", () => {
    beforeEach(() => {
      marquee(50, 50, 650, 650);
    });

    it("рамка группы — объединение объектов", () => {
      expect(selection.box.value).toEqual({ x: 100, y: 100, width: 500, height: 500 });
    });

    it("перетаскивание двигает всех одним действием и одним undo", () => {
      selection.press(300, 300, 1);
      selection.drag(310, 320);
      expect(selection.drafts.value).toHaveLength(2);
      expect(selection.box.value).toEqual({ x: 110, y: 120, width: 500, height: 500 });

      const action = selection.release();

      expect(action?.type).toBe("replace");
      expect(boundsOf("A")?.x).toBe(110);
      expect(boundsOf("B")?.y).toBe(520);
      expect(selectedIds()).toEqual(["A", "B"]);

      store.undo();
      expect(boundsOf("A")?.x).toBe(100);
      expect(boundsOf("B")?.y).toBe(500);
    });

    it("ресайз масштабирует всех относительно рамки группы", () => {
      selection.press(600, 600, 1);
      selection.drag(1100, 1100);
      selection.release();

      expect(boundsOf("A")).toEqual({ x: 100, y: 100, width: 200, height: 200 });
      expect(boundsOf("B")).toEqual({ x: 900, y: 900, width: 200, height: 200 });
    });

    it("порядок слоёв внутри группы сохраняется", () => {
      selection.press(300, 300, 1);
      selection.drag(310, 300);
      selection.release();

      expect(store.objects.map((o) => o.objId)).toEqual(["A", "B"]);
    });

    it("клик мимо снимает всю группу", () => {
      click(800, 800);

      expect(selectedIds()).toEqual([]);
    });
  });
});

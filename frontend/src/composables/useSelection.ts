import { computed, ref, shallowRef } from "vue";
import type { BaseObject } from "@/constructors";
import { useAllObjectsStore } from "@/stores/allObjects";
import type { Action } from "@/stores/allObjects/allObjects";
import type { Rect } from "@/types";
import {
  handleAt,
  inRect,
  moveRect,
  rectFromPoints,
  rectInside,
  remapRect,
  resizeRect,
  topObjectAt,
  unionRects,
  type Handle,
} from "@/utils/selection/selection";

// допуски в экранных пикселях, на доске они зависят от зума
const HANDLE_TOLERANCE = 10;
const HIT_TOLERANCE = 5;

type Gesture =
  | {
      kind: "transform";
      handle: Handle | null;
      startX: number;
      startY: number;
      before: BaseObject[];
      box: Rect;
    }
  | { kind: "marquee"; startX: number; startY: number; baseIds: string[] };

export const useSelection = () => {
  const store = useAllObjectsStore();

  const selectedIds = ref<string[]>([]);
  // ищем по id: чужая замена или удаление сами обновят выделение; порядок — как на доске
  const selected = computed(() =>
    store.objects.filter((o) => selectedIds.value.includes(o.objId)),
  );
  // копии с новой геометрией, пока тянем; на доску попадают при отпускании
  const drafts = shallowRef<BaseObject[]>([]);
  const marquee = ref<Rect | null>(null);
  const box = computed(() =>
    unionRects((drafts.value.length ? drafts.value : selected.value).map((o) => o.bounds())),
  );

  let gesture: Gesture | null = null;

  const startTransform = (handle: Handle | null, x: number, y: number) => {
    const rect = box.value;

    gesture = rect
      ? { kind: "transform", handle, startX: x, startY: y, before: selected.value, box: rect }
      : null;
  };

  const press = (x: number, y: number, zoom: number, additive = false) => {
    const rect = box.value;
    const hit = topObjectAt(store.objects, x, y, HIT_TOLERANCE / zoom);

    gesture = null;

    if (additive && hit) {
      selectedIds.value = selectedIds.value.includes(hit.objId)
        ? selectedIds.value.filter((id) => id !== hit.objId)
        : [...selectedIds.value, hit.objId];

      return;
    }

    if (!additive && rect) {
      const handle = handleAt(rect, x, y, HANDLE_TOLERANCE / zoom);

      if (handle || inRect(rect, x, y)) {
        startTransform(handle, x, y);

        return;
      }
    }

    if (hit) {
      selectedIds.value = [hit.objId];
      startTransform(null, x, y);

      return;
    }

    gesture = {
      kind: "marquee",
      startX: x,
      startY: y,
      baseIds: additive ? selectedIds.value : [],
    };
    selectedIds.value = gesture.baseIds;
  };

  const drag = (x: number, y: number) => {
    if (!gesture) return;

    const { startX, startY } = gesture;

    if (gesture.kind === "marquee") {
      marquee.value = rectFromPoints(startX, startY, x, y);

      return;
    }

    const dx = x - startX;
    const dy = y - startY;
    const { before, box: from, handle } = gesture;
    const to = handle ? resizeRect(from, handle, dx, dy) : moveRect(from, dx, dy);

    drafts.value = before.map((o) => {
      const next = o.withBounds(remapRect(o.bounds(), from, to));

      next.tempObj = true;

      return next;
    });
  };

  const release = (): Action | undefined => {
    const finished = gesture;
    const after = drafts.value;

    gesture = null;
    drafts.value = [];

    if (finished?.kind === "marquee") {
      const area = marquee.value;

      marquee.value = null;

      if (area) {
        const inside = store.objects
          .filter((o) => rectInside(o.bounds(), area))
          .map((o) => o.objId);

        selectedIds.value = [...new Set([...finished.baseIds, ...inside])];
      }

      return;
    }

    if (!finished || after.length === 0) return;

    after.forEach((o) => {
      o.tempObj = false;
    });
    store.replace(finished.before, after);

    return { type: "replace", before: finished.before, after };
  };

  const deselect = () => {
    selectedIds.value = [];
    gesture = null;
    drafts.value = [];
    marquee.value = null;
  };

  const cursorAt = (x: number, y: number, zoom: number) => {
    const rect = box.value;
    const handle = rect ? handleAt(rect, x, y, HANDLE_TOLERANCE / zoom) : null;

    if (handle) return handle === "nw" || handle === "se" ? "nwse-resize" : "nesw-resize";

    return (rect && inRect(rect, x, y)) || topObjectAt(store.objects, x, y, HIT_TOLERANCE / zoom)
      ? "move"
      : "default";
  };

  return { selected, drafts, marquee, box, press, drag, release, deselect, cursorAt };
};

import type { BaseObject } from "@/constructors";
import type { Rect } from "@/types";

export type Handle = "nw" | "ne" | "sw" | "se";

export const MIN_SIZE = 8;

const handlePoints = ({ x, y, width, height }: Rect): [Handle, number, number][] => [
  ["nw", x, y],
  ["ne", x + width, y],
  ["sw", x, y + height],
  ["se", x + width, y + height],
];

export const inRect = ({ x, y, width, height }: Rect, px: number, py: number, tolerance = 0) =>
  px >= x - tolerance &&
  px <= x + width + tolerance &&
  py >= y - tolerance &&
  py <= y + height + tolerance;

export const rectInside = (inner: Rect, outer: Rect) =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.width <= outer.x + outer.width &&
  inner.y + inner.height <= outer.y + outer.height;

export const rectFromPoints = (x1: number, y1: number, x2: number, y2: number): Rect => ({
  x: Math.min(x1, x2),
  y: Math.min(y1, y2),
  width: Math.abs(x2 - x1),
  height: Math.abs(y2 - y1),
});

export const unionRects = (rects: Rect[]): Rect | null => {
  if (rects.length === 0) return null;

  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));

  return {
    x,
    y,
    width: Math.max(...rects.map((r) => r.x + r.width)) - x,
    height: Math.max(...rects.map((r) => r.y + r.height)) - y,
  };
};

// переводит точку из старого прямоугольника в новый
export const remap = (from: Rect, to: Rect) => {
  const scaleX = from.width ? to.width / from.width : 1;
  const scaleY = from.height ? to.height / from.height : 1;

  return ([x, y]: number[]) => [to.x + (x - from.x) * scaleX, to.y + (y - from.y) * scaleY];
};

export const remapRect = (rect: Rect, from: Rect, to: Rect): Rect => {
  const map = remap(from, to);
  const [x, y] = map([rect.x, rect.y]);
  const [right, bottom] = map([rect.x + rect.width, rect.y + rect.height]);

  return { x, y, width: right - x, height: bottom - y };
};

export const handleAt = (rect: Rect, px: number, py: number, tolerance: number): Handle | null => {
  for (const [handle, x, y] of handlePoints(rect)) {
    if (Math.abs(px - x) <= tolerance && Math.abs(py - y) <= tolerance) return handle;
  }

  return null;
};

export const moveRect = (rect: Rect, dx: number, dy: number): Rect => ({
  ...rect,
  x: rect.x + dx,
  y: rect.y + dy,
});

// ponytail: за противоположный угол не выворачиваем, упираемся в минимальный размер
export const resizeRect = (rect: Rect, handle: Handle, dx: number, dy: number): Rect => {
  // нулевая сторона (горизонтальная линия) остаётся нулевой, а не прыгает к MIN_SIZE
  const minWidth = Math.min(MIN_SIZE, rect.width);
  const minHeight = Math.min(MIN_SIZE, rect.height);
  const next = { ...rect };

  if (handle.includes("e")) {
    next.width = Math.max(rect.width + dx, minWidth);
  } else {
    next.width = Math.max(rect.width - dx, minWidth);
    next.x = rect.x + rect.width - next.width;
  }

  if (handle.includes("s")) {
    next.height = Math.max(rect.height + dy, minHeight);
  } else {
    next.height = Math.max(rect.height - dy, minHeight);
    next.y = rect.y + rect.height - next.height;
  }

  return next;
};

// последний в массиве нарисован сверху
export const topObjectAt = <T extends BaseObject>(
  objects: readonly T[],
  x: number,
  y: number,
  tolerance: number,
) => objects.filter((o) => o.containsPoint(x, y, tolerance)).at(-1);

export const distanceToSegment = (
  px: number,
  py: number,
  [ax, ay]: number[],
  [bx, by]: number[],
) => {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared
    ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared))
    : 0;

  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};

const HANDLE_SIZE = 8;
const ACCENT = "#4f8cff";

// rect в координатах доски, рисуем в экранных: толщина и ручки постоянны при любом зуме
const toScreen = (rect: Rect, offsetX: number, offsetY: number, zoom: number): Rect => ({
  x: rect.x * zoom + offsetX,
  y: rect.y * zoom + offsetY,
  width: rect.width * zoom,
  height: rect.height * zoom,
});

export const drawSelectionBox = (
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  offsetX: number,
  offsetY: number,
  zoom: number,
) => {
  const screen = toScreen(rect, offsetX, offsetY, zoom);

  ctx.save();
  ctx.strokeStyle = ACCENT;
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.strokeRect(screen.x, screen.y, screen.width, screen.height);

  for (const [, x, y] of handlePoints(screen)) {
    const left = x - HANDLE_SIZE / 2;
    const top = y - HANDLE_SIZE / 2;

    ctx.fillRect(left, top, HANDLE_SIZE, HANDLE_SIZE);
    ctx.strokeRect(left, top, HANDLE_SIZE, HANDLE_SIZE);
  }

  ctx.restore();
};

// контур отдельного объекта внутри группы
export const drawObjectOutline = (
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  offsetX: number,
  offsetY: number,
  zoom: number,
) => {
  const screen = toScreen(rect, offsetX, offsetY, zoom);

  ctx.save();
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(screen.x, screen.y, screen.width, screen.height);
  ctx.restore();
};

export const drawMarquee = (
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  offsetX: number,
  offsetY: number,
  zoom: number,
) => {
  const screen = toScreen(rect, offsetX, offsetY, zoom);

  ctx.save();
  ctx.strokeStyle = ACCENT;
  ctx.fillStyle = "rgba(79, 140, 255, 0.12)";
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.fillRect(screen.x, screen.y, screen.width, screen.height);
  ctx.strokeRect(screen.x, screen.y, screen.width, screen.height);
  ctx.restore();
};

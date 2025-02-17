export const commonIsOverlay = (
  screenX: number,
  screenY: number,
  offsetX: number,
  offsetY: number,
  Xmin: number,
  Xmax: number,
  Ymin: number,
  Ymax: number,
): boolean => {
  const screenX1 = screenX + offsetX;
  const screenY1 = screenY + offsetY;

  const a1 = Xmin >= screenX && Xmin <= screenX1;
  const a2 = Xmax >= screenX && Xmax <= screenX1;

  const b1 = Ymin >= screenY && Ymin <= screenY1;
  const b2 = Ymax >= screenY && Ymax <= screenY1;

  const c1 = screenX >= Xmin && screenX <= Xmax;
  const c2 = screenX1 >= Xmin && screenX1 <= Xmax;

  const e1 = screenY >= Ymin && screenY <= Ymax;
  const e2 = screenY1 >= Ymin && screenY1 <= Ymax;

  if (
    ((a1 || a2) && (b1 || b2)) ||
    ((c1 || c2) && (e1 || e2)) ||
    ((a1 || a2) && (e1 || e2)) ||
    ((c1 || c2) && (b1 || b2))
  ) {
    return true;
  }

  return false;
};

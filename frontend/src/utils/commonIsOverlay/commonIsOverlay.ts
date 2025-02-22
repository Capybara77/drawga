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

  const isMinXInRange = Xmin >= screenX && Xmin <= screenX1;
  const isMaxXInRange = Xmax >= screenX && Xmax <= screenX1;

  const isMinYInRange = Ymin >= screenY && Ymin <= screenY1;
  const isMaxYInRange = Ymax >= screenY && Ymax <= screenY1;

  const isScreenXInBounds = screenX >= Xmin && screenX <= Xmax;
  const isScreenX1InBounds = screenX1 >= Xmin && screenX1 <= Xmax;

  const isScreenYInBounds = screenY >= Ymin && screenY <= Ymax;
  const isScreenY1InBounds = screenY1 >= Ymin && screenY1 <= Ymax;

  if (
    ((isMinXInRange || isMaxXInRange) && (isMinYInRange || isMaxYInRange)) ||
    ((isScreenXInBounds || isScreenX1InBounds) && (isScreenYInBounds || isScreenY1InBounds)) ||
    ((isMinXInRange || isMaxXInRange) && (isScreenYInBounds || isScreenY1InBounds)) ||
    ((isScreenXInBounds || isScreenX1InBounds) && (isMinYInRange || isMaxYInRange))
  ) {
    return true;
  }

  return false;
};

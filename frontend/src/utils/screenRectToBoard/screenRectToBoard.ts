type Rect = { x: number; y: number; width: number; height: number };

// обратное к отрисовке: экран = доска * zoom + offset
export const screenRectToBoard = (
  { x, y, width, height }: Rect,
  offsetX: number,
  offsetY: number,
  zoom: number,
): Rect => ({
  x: (x - offsetX) / zoom,
  y: (y - offsetY) / zoom,
  width: width / zoom,
  height: height / zoom,
});

// буфер канваса — в физических пикселях экрана (на ретине их в dpr раз больше), иначе всё мылится.
// setTransform — чтобы весь остальной код рисовал как раньше, в CSS-пикселях.
// Смена width/height сбрасывает трансформацию, поэтому зовём на каждый ресайз.
export const fitCanvas = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
) => {
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
};

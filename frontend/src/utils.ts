import type { RoughCanvas } from 'roughjs/bin/canvas';
import {
  BaseObject,
  RectangleObject,
  EllipseObject,
  LineObject,
  CurveObject,
  TextObject,
} from './constructors';

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

export function getTypedDrawObject(
  str: string,
  roughCanvas: RoughCanvas,
  ctx: CanvasRenderingContext2D,
): BaseObject | null {
  const parsedString = JSON.parse(str);
  const type: string = parsedString.typeName;

  switch (type) {
    case 'rectangle':
      const r = new RectangleObject(parsedString);

      r.roughCanvas = roughCanvas;
      r.objId = parsedString.objId;
      r.zoom = parsedString.zoom;

      return r;
    case 'ellipse': {
      const e = new EllipseObject(parsedString);
      e.roughCanvas = roughCanvas;

      e.objId = parsedString.objId;
      e.zoom = parsedString.zoom;

      return e;
    }
    case 'line': {
      const l = new LineObject(parsedString);

      l.zoom = parsedString.zoom;
      l.objId = parsedString.objId;
      return l;
    }
    case 'curve': {
      const c = new CurveObject(parsedString);

      c.ctx = ctx;
      c.objId = parsedString.objId;
      c.zoom = parsedString.zoom;

      return c;
    }
    case 'text': {
      const {
        color,
        width,
        userId,
        zoom,
        objId,
        left,
        top,
        fontFamily,
        text,
        inputId,
        fontSize,
        textColor,
        height,
      } = parsedString as TextObject;

      const t = new TextObject(
        fontFamily,
        color,
        userId,
        null,
        top,
        left,
        text,
        inputId,
        fontSize,
        textColor,
        width,
        height,
      );
      t.objId = objId;
      t.zoom = zoom;

      return t;
    }
    default:
      return null;
  }
}

export function animateCursor(trailerX: number, trailerY: number, trailer: HTMLDivElement) {
  const keyFrames = {
    transform: `translate(${trailerX}px, ${trailerY}px)`,
  };

  trailer.animate(keyFrames, {
    fill: 'forwards',
  });
}

export function average(a: number, b: number) {
  return (a + b) / 2;
}

export function getSvgPathFromStroke(points: number[][], closed = true) {
  const len = points.length;

  if (len < 4) {
    return ``;
  }

  let a = points[0];
  let b = points[1];

  const c = points[2];

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
    2,
  )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
  }

  if (closed) {
    result += 'Z';
  }

  return result;
}

export function generateId(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function cleanCanvas(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
}

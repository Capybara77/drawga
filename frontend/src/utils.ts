// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

import { RoughCanvas } from 'roughjs/bin/canvas';
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

// Функция debounce
export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export function getTypedDrawObject(
  str: string,
  roughCanvas: RoughCanvas,
  ctx: CanvasRenderingContext2D,
): BaseObject {
  const json: BaseObject = JSON.parse(str);
  const type: string = json.drawType;

  switch (type) {
    case 'rectangle':
      const r = new RectangleObject(json);

      r.roughCanvas = roughCanvas;
      r.objId = json.objId;
      r.zoom = json.zoom;

      return r;
    case 'ellipse': {
      const e = new EllipseObject(json);
      e.roughCanvas = roughCanvas;

      e.objId = json.objId;
      e.zoom = json.zoom;

      return e;
    }
    case 'line': {
      const l = new LineObject(json);

      l.zoom = json.zoom;
      l.objId = json.objId;
      return l;
    }
    case 'curve': {
      const c = new CurveObject(json);

      c.ctx = ctx;
      c.objId = json.objId;
      c.zoom = json.zoom;

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
      } = json as TextObject;

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

export function changeColor(
  color: string,
  ctx: CanvasRenderingContext2D,
  trailer: HTMLDivElement,
  alpha: number,
) {
  ctx.fillStyle = rgbToRgba(color, alpha);
  // ctx.strokeStyle = color;
  trailer.style.backgroundColor = color;
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

export function hexToRgbA(hex: string, alpha = '1') {
  let c: string[];
  let cc: number;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    cc = +('0x' + c.join(''));
    return 'rgba(' + [(cc >> 16) & 255, (cc >> 8) & 255, cc & 255].join(',') + ',' + alpha + ')';
  }
  throw new Error('Bad Hex');
}

export function rgbToRgba(color: string, alpha: number) {
  const colorArr = color.slice(color.indexOf('(') + 1, color.indexOf(')')).split(', ');

  // (25, 25, 25) / 25, 25, 25/ [25, 25, 25]

  return 'rgba(' + colorArr[0] + ', ' + colorArr[1] + ', ' + colorArr[2] + ', ' + alpha + ')';
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

export function reDraw(
  objects: BaseObject[],
  offsetXCustom: number,
  offsetYCustom: number,
  screenWidth: number,
  screenHeight: number,
) {
  // let counter: number = 0;

  for (let index = 0; index < objects.length; index++) {
    const element = objects[index];

    if (element.isOverlay(offsetXCustom, offsetYCustom, screenWidth, screenHeight)) {
      element.draw(offsetXCustom, offsetYCustom);
      // counter++;
    } else {
    }
  }
  // console.log(objects.length + "  " + counter);
}

export function createOptions(): HTMLDivElement[] {
  const optionsWrapper = document.querySelector('.options-wrapper') as HTMLDivElement;

  const optionsColorStroke = document.getElementById('options-color-fill') as HTMLDivElement;

  const optionsColorBorder = document.getElementById('options-color-border') as HTMLDivElement;

  const optionsFillStyleContainer = document.getElementById(
    'fill-style-options-container',
  ) as HTMLDivElement;

  const optionsFontSizeContainer = document.getElementById(
    'font-size-options-container',
  ) as HTMLDivElement;

  const optionsColorText = document.getElementById('options-color-text') as HTMLDivElement;

  const optionsWidthContainer = document.getElementById(
    'width-options-container',
  ) as HTMLDivElement;

  const optionsOpacityContainer = document.getElementById(
    'opacity-options-container',
  ) as HTMLDivElement;

  return [
    optionsWrapper,
    optionsColorStroke,
    optionsColorBorder,
    optionsFillStyleContainer,
    optionsFontSizeContainer,
    optionsColorText,
    optionsWidthContainer,
    optionsOpacityContainer,
  ];
}

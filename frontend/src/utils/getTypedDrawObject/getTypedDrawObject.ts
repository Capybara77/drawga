import {
  BaseObject,
  RectangleObject,
  EllipseObject,
  LineObject,
  CurveObject,
} from '@/constructors';
import type { RoughCanvas } from 'roughjs/bin/canvas';

/**
 * Создаёт типизированный объект рисования из JSON строки
 * @param str - JSON строка с данными объекта
 * @param roughCanvas - Инстанс RoughCanvas для рендеринга
 * @param ctx - Контекст канваса для рисования
 * @returns Типизированный объект рисования или null в случае ошибки
 */
export function getTypedDrawObject(
  str: string,
  roughCanvas: RoughCanvas,
  ctx: CanvasRenderingContext2D,
): BaseObject | null {
  if (!str) {
    return null;
  }

  let parsedString: BaseObject;

  try {
    parsedString = JSON.parse(str);
  } catch (err) {
    console.error('getTypedDrawObject error', err);
    return null;
  }

  const { color, drawType: type, objId, tempObj, userId, width, zoom } = parsedString;

  if (
    color === undefined ||
    type === undefined ||
    objId === undefined ||
    userId === undefined ||
    tempObj === undefined ||
    width === undefined ||
    zoom === undefined
  ) {
    return null;
  }

  if (zoom <= 0) {
    return null;
  }

  switch (type) {
    case 'rectangle': {
      const r = new RectangleObject(parsedString);

      r.roughCanvas = roughCanvas;
      r.objId = parsedString.objId;
      r.zoom = zoom;

      return r;
    }
    case 'ellipse': {
      const e = new EllipseObject(parsedString);
      e.roughCanvas = roughCanvas;

      e.objId = parsedString.objId;
      e.zoom = zoom;

      return e;
    }
    case 'line': {
      const l = new LineObject(parsedString);

      l.zoom = zoom;
      l.objId = parsedString.objId;
      return l;
    }
    case 'curve': {
      const c = new CurveObject(parsedString);

      c.ctx = ctx;
      c.objId = parsedString.objId;
      c.zoom = zoom;

      return c;
    }
    case 'text': {
      // const {
      //   color,
      //   width,
      //   userId,
      //   zoom,
      //   objId,
      //   left,
      //   top,
      //   fontFamily,
      //   text,
      //   inputId,
      //   fontSize,
      //   textColor,
      //   height,
      // } = parsedString as TextObject;
      // const t = new TextObject(
      //   fontFamily,
      //   color,
      //   userId,
      //   null,
      //   top,
      //   left,
      //   text,
      //   inputId,
      //   fontSize,
      //   textColor,
      //   width,
      //   height,
      // );
      // t.objId = objId;
      // t.zoom = zoom;
      // return t;
    }
    default:
      return null;
  }
}

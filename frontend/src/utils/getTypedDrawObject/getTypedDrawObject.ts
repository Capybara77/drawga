import {
  BaseObject,
  RectangleObject,
  EllipseObject,
  LineObject,
  CurveObject,
  TextObject,
} from '@/constructors';
import type { RoughCanvas } from 'roughjs/bin/canvas';

export function getTypedDrawObject(
  str: string,
  roughCanvas: RoughCanvas,
  ctx: CanvasRenderingContext2D,
): BaseObject | null {
  const parsedString: BaseObject = JSON.parse(str);
  const type: string = parsedString.drawType;

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
    // case 'text': {
    //   const {
    //     color,
    //     width,
    //     userId,
    //     zoom,
    //     objId,
    //     left,
    //     top,
    //     fontFamily,
    //     text,
    //     inputId,
    //     fontSize,
    //     textColor,
    //     height,
    //   } = parsedString as TextObject;

    //   const t = new TextObject(
    //     fontFamily,
    //     color,
    //     userId,
    //     null,
    //     top,
    //     left,
    //     text,
    //     inputId,
    //     fontSize,
    //     textColor,
    //     width,
    //     height,
    //   );
    //   t.objId = objId;
    //   t.zoom = zoom;

    //   return t;
    // }
    default:
      return null;
  }
}

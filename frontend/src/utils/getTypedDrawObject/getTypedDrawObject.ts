import {
  BaseObject,
  RectangleObject,
  EllipseObject,
  LineObject,
  CurveObject,
} from "@/constructors";
import type { RoughCanvas } from "roughjs/bin/canvas";
import type { CurveProps, EllipseProps, LineProps, RectangleProps } from "@/types";

// как объект приходит по сети: поля конструктора без canvas-ссылок (их не сериализовать) + служебные
type Serialized<T extends string, P> = Omit<P, "roughCanvas" | "ctx"> & {
  drawType: T;
  objId: string;
  tempObj: boolean;
  zoom: number;
};

type SerializedDrawObject =
  | Serialized<"rectangle", RectangleProps>
  | Serialized<"ellipse", EllipseProps>
  | Serialized<"line", LineProps>
  | Serialized<"curve", CurveProps>;

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

  let parsedString: SerializedDrawObject;

  try {
    parsedString = JSON.parse(str);
  } catch (err) {
    console.error("getTypedDrawObject error", err);
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

  switch (parsedString.drawType) {
    case "rectangle": {
      const r = new RectangleObject({ ...parsedString, roughCanvas });
      r.objId = objId;
      r.zoom = zoom;
      return r;
    }
    case "ellipse": {
      const e = new EllipseObject({ ...parsedString, roughCanvas });
      e.objId = objId;
      e.zoom = zoom;
      return e;
    }
    case "line": {
      const l = new LineObject({ ...parsedString, roughCanvas });
      l.objId = objId;
      l.zoom = zoom;
      return l;
    }
    case "curve": {
      const c = new CurveObject({ ...parsedString, ctx });
      c.objId = objId;
      c.zoom = zoom;
      return c;
    }
    // text: восстановление TextObject было тут закомментировано — вернуть, когда дойдём до текста
    default:
      return null;
  }
}

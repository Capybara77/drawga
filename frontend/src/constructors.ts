/* oxlint-disable @typescript-eslint/no-unused-vars */
import getStroke from "perfect-freehand";
import type { Drawable } from "roughjs/bin/core";
import type {
  BaseProps,
  CurveProps,
  EllipseProps,
  ImageProps,
  LineProps,
  MyCursor,
  Rect,
  RectangleProps,
  TextProps,
} from "./types";
import { generateId, commonIsOverlay, getSvgPathFromStroke } from "./utils";
import { distanceToSegment, inRect, remap } from "./utils/selection/selection";

// копия объекта без конструктора: те же ctx, roughCanvas и уже загруженная картинка
const copyOf = <T extends object>(obj: T): T =>
  Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);

const rectOfPoints = (points: number[][]): Rect => {
  if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);

  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
};

export abstract class BaseObject {
  color;
  width;
  userId;
  drawType: MyCursor = "pointer";
  tempObj: boolean = false;
  zoom: number = 1;
  objId: string = generateId(6);

  constructor({ color, width, userId }: BaseProps) {
    this.color = color;
    this.width = width;
    this.userId = userId;
  }

  draw(offsetX: number, offsetY: number, zoom: number) {
    // console.log('offset:', offsetX, offsetY);
  }

  isOverlay(x: number, y: number, offsetX: number, offsetY: number, zoom: number): boolean {
    return true;
  }

  isCloseToPoints(x: number, y: number, delta: number): boolean {
    return true;
  }

  // прямоугольник объекта в координатах доски
  abstract bounds(): Rect;

  // копия с тем же objId, вписанная в новый прямоугольник; исходный объект не меняется
  abstract withBounds(next: Rect): BaseObject;

  containsPoint(x: number, y: number, tolerance: number): boolean {
    return inRect(this.bounds(), x, y, tolerance);
  }
}

export class TextObject extends BaseObject {
  drawType: MyCursor = "text";
  ctx;
  x;
  y;
  fontSize;
  fontFamily;
  text;

  constructor({ x, y, color, ctx, fontSize, text, userId, fontFamily, objId }: TextProps) {
    super({ color, userId, width: 0 });

    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.userId = userId;
    this.fontSize = fontSize;
    this.text = text;
    this.color = color;
    this.fontFamily = fontFamily;
    this.objId = objId;
  }

  draw(offsetX: number, offsetY: number, zoom: number): void {
    this.ctx.font = `${this.fontSize * zoom}px ${this.fontFamily}`;
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = `#${this.color}`;

    this.text.split("\n").forEach((line, index) => {
      const lineHeight = this.fontSize * 1.25 * zoom;
      const newX = this.x * zoom + offsetX;
      const newY = this.y * zoom + offsetY;

      this.ctx.fillText(line, newX, newY + lineHeight / 2 + index * lineHeight);
    });
  }

  isOverlay(x: number, y: number, offsetX: number, offsetY: number, zoom: number): boolean {
    const rect = this.bounds();

    x *= -1;
    y *= -1;

    const Xmin = rect.x * zoom;
    const Xmax = (rect.x + rect.width) * zoom;
    const Ymin = rect.y * zoom;
    const Ymax = (rect.y + rect.height) * zoom;

    return commonIsOverlay(x, y, offsetX, offsetY, Xmin, Xmax, Ymin, Ymax);
  }

  bounds(): Rect {
    this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;

    const lines = this.text.split("\n");
    const width = Math.max(...lines.map((line) => this.ctx.measureText(line).width));

    return { x: this.x, y: this.y, width, height: lines.length * this.fontSize * 1.25 };
  }

  // ponytail: у текста только шрифт, поэтому ширина рамки следует за высотой, а не за курсором
  withBounds(next: Rect) {
    const copy = copyOf(this);

    copy.x = next.x;
    copy.y = next.y;
    copy.fontSize = (this.fontSize * next.height) / this.bounds().height;

    return copy;
  }
}

export class CurveObject extends BaseObject {
  pointsList;
  ctx;
  drawType: MyCursor = "curve";
  constructor({ color, ctx, pointsList, userId, width }: CurveProps) {
    super({ color, width, userId });
    this.pointsList = pointsList;
    this.ctx = ctx;
    this.userId = userId;
  }

  draw(offsetX: number, offsetY: number, zoom: number): void {
    const newLines: number[][] = [];

    for (let index = 0; index < this.pointsList.length; index++) {
      const element = this.pointsList[index];

      newLines.push([element[0] * zoom + offsetX, element[1] * zoom + offsetY]);
    }

    const outlinePoints = getStroke(newLines, {
      size: this.width * zoom,
      thinning: 0.5,
      smoothing: 0.2,
      easing: (a) => a * 0.8,
      simulatePressure: true,
    });

    const pathData = getSvgPathFromStroke(outlinePoints);

    const myPath = new Path2D(pathData);

    const tempColor = this.ctx.fillStyle;
    this.ctx.fillStyle = this.color;
    this.ctx.fill(myPath);
    this.ctx.fillStyle = tempColor;
  }

  isCloseToPoints(x: number, y: number, delta: number) {
    if (this.pointsList.length === 0) return false;

    for (let index = 0; index < this.pointsList.length; index++) {
      const element = this.pointsList[index];

      if (Math.sqrt(Math.pow(x - element[0], 2) + Math.pow(y - element[1], 2)) < delta) {
        return true;
      }
    }

    return false;
  }

  isOverlay(x: number, y: number, offsetX: number, offsetY: number, zoom: number): boolean {
    x *= -1;
    y *= -1;

    if (this.pointsList.length === 0) return false;

    let Xmin = this.pointsList[0][0];
    let Xmax = this.pointsList[0][0];
    let Ymin = this.pointsList[0][1];
    let Ymax = this.pointsList[0][1];

    for (let index = 0; index < this.pointsList.length; index++) {
      const element = this.pointsList[index];
      Xmin = Xmin > element[0] ? element[0] : Xmin;
      Xmax = Xmax < element[0] ? element[0] : Xmax;
      Ymin = Ymin > element[1] ? element[1] : Ymin;
      Ymax = Ymax < element[1] ? element[1] : Ymax;
    }

    Xmin *= zoom;
    Ymin *= zoom;
    Xmax *= zoom;
    Ymax *= zoom;

    return commonIsOverlay(x, y, offsetX, offsetY, Xmin, Xmax, Ymin, Ymax);
  }

  bounds(): Rect {
    return rectOfPoints(this.pointsList);
  }

  withBounds(next: Rect) {
    const copy = copyOf(this);

    copy.pointsList = this.pointsList.map(remap(this.bounds(), next));

    return copy;
  }

  containsPoint(x: number, y: number, tolerance: number): boolean {
    return this.pointsList.some(
      (point, index) =>
        distanceToSegment(x, y, point, this.pointsList[index + 1] ?? point) <= tolerance,
    );
  }
}

export class LineObject extends BaseObject {
  startPoint;
  endPoint;
  roughCanvas;
  drawType: MyCursor = "line";

  constructor({ color, endPoint, roughCanvas, startPoint, userId, width }: LineProps) {
    super({ color, width, userId });
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.roughCanvas = roughCanvas;
    this.userId = userId;
  }

  draw(offsetX: number, offsetY: number, zoom: number): void {
    this.roughCanvas.line(
      this.startPoint[0] * zoom + offsetX,
      this.startPoint[1] * zoom + offsetY,
      this.endPoint[0] * zoom + offsetX,
      this.endPoint[1] * zoom + offsetY,
      {
        strokeWidth: this.width * zoom,
        stroke: this.color,
        seed: 1,
      },
    );
  }

  isOverlay(x: number, y: number, offsetX: number, offsetY: number, zoom: number): boolean {
    x *= -1;
    y *= -1;

    let Xmin = Math.min(this.startPoint[0], this.endPoint[0]);
    let Xmax = Math.max(this.startPoint[0], this.endPoint[0]);
    let Ymin = Math.min(this.startPoint[1], this.endPoint[1]);
    let Ymax = Math.max(this.startPoint[1], this.endPoint[1]);

    Xmin *= zoom;
    Ymin *= zoom;
    Xmax *= zoom;
    Ymax *= zoom;

    return commonIsOverlay(x, y, offsetX, offsetY, Xmin, Xmax, Ymin, Ymax);
  }

  isCloseToPoints(x: number, y: number, delta: number): boolean {
    if (
      Math.sqrt(Math.pow(x - this.startPoint[0], 2) + Math.pow(y - this.startPoint[1], 2)) < delta
    ) {
      return true;
    }

    if (Math.sqrt(Math.pow(x - this.endPoint[0], 2) + Math.pow(y - this.endPoint[1], 2)) < delta) {
      return true;
    }

    return false;
  }

  bounds(): Rect {
    return rectOfPoints([this.startPoint, this.endPoint]);
  }

  withBounds(next: Rect) {
    const copy = copyOf(this);
    const map = remap(this.bounds(), next);

    copy.startPoint = map(this.startPoint);
    copy.endPoint = map(this.endPoint);

    return copy;
  }

  containsPoint(x: number, y: number, tolerance: number): boolean {
    return distanceToSegment(x, y, this.startPoint, this.endPoint) <= tolerance;
  }
}

export class RectangleObject extends BaseObject {
  startPoint;
  endPoint;
  roughCanvas;
  fillStyle;
  drawType: MyCursor = "rectangle";
  stroke;
  strokeWidth;
  drawableObj: Drawable | null = null;

  constructor({
    color,
    endPoint,
    fillStyle,
    roughCanvas,
    startPoint,
    stroke,
    strokeWidth,
    userId,
    width,
  }: RectangleProps) {
    super({ color, width, userId });
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.roughCanvas = roughCanvas;
    this.fillStyle = fillStyle;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.userId = userId;
  }

  draw(offsetX: number, offsetY: number, zoom: number): void {
    const width: number = (this.endPoint[0] - this.startPoint[0]) * zoom;
    const height: number = (this.endPoint[1] - this.startPoint[1]) * zoom;

    this.roughCanvas.rectangle(
      this.startPoint[0] * zoom + offsetX,
      this.startPoint[1] * zoom + offsetY,
      width,
      height,
      {
        strokeWidth: this.width * zoom,
        fill: this.color,
        fillStyle: this.fillStyle,
        seed: 1,
        stroke: this.stroke,
      },
    );
  }

  isOverlay(x: number, y: number, offsetX: number, offsetY: number, zoom: number): boolean {
    x *= -1;
    y *= -1;

    let Xmin = Math.min(this.startPoint[0], this.endPoint[0]);
    let Xmax = Math.max(this.startPoint[0], this.endPoint[0]);
    let Ymin = Math.min(this.startPoint[1], this.endPoint[1]);
    let Ymax = Math.max(this.startPoint[1], this.endPoint[1]);

    Xmin *= zoom;
    Ymin *= zoom;
    Xmax *= zoom;
    Ymax *= zoom;

    return commonIsOverlay(x, y, offsetX, offsetY, Xmin, Xmax, Ymin, Ymax);
  }

  bounds(): Rect {
    return rectOfPoints([this.startPoint, this.endPoint]);
  }

  withBounds(next: Rect) {
    const copy = copyOf(this);
    const map = remap(this.bounds(), next);

    copy.startPoint = map(this.startPoint);
    copy.endPoint = map(this.endPoint);

    return copy;
  }
}

export class EllipseObject extends BaseObject {
  startPoint;
  endPoint;
  roughCanvas;
  fillStyle;
  drawType: MyCursor = "ellipse";
  stroke;
  strokeWidth;
  drawableObj: Drawable | null = null;
  isCircle;

  constructor({
    color,
    endPoint,
    fillStyle,
    isCircle,
    roughCanvas,
    startPoint,
    stroke,
    strokeWidth,
    userId,
    width,
  }: EllipseProps) {
    super({ color, width, userId });
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.roughCanvas = roughCanvas;
    this.fillStyle = fillStyle;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.isCircle = isCircle;
    this.userId = userId;
  }

  draw(offsetX: number, offsetY: number, zoom: number): void {
    const width = (this.endPoint[0] - this.startPoint[0]) * zoom;
    const height = (this.endPoint[1] - this.startPoint[1]) * zoom;

    this.roughCanvas.ellipse(
      this.startPoint[0] * zoom + offsetX,
      this.startPoint[1] * zoom + offsetY,
      width * 2,
      height * 2,
      {
        strokeWidth: this.width * zoom,
        fill: this.color,
        fillStyle: this.fillStyle,
        seed: 1,
        stroke: this.stroke,
      },
    );
  }

  isOverlay(x: number, y: number, offsetX: number, offsetY: number, zoom: number): boolean {
    x *= -1;
    y *= -1;

    let Xmin = Math.min(this.startPoint[0], this.endPoint[0]);
    let Xmax = Math.max(this.startPoint[0], this.endPoint[0]);
    let Ymin = Math.min(this.startPoint[1], this.endPoint[1]);
    let Ymax = Math.max(this.startPoint[1], this.endPoint[1]);

    Xmin *= zoom;
    Ymin *= zoom;
    Xmax *= zoom;
    Ymax *= zoom;

    if (this.startPoint[0] < this.endPoint[0]) {
      Xmin += Xmin - Xmax;
    } else {
      Xmax -= Xmin - Xmax;
    }
    if (this.startPoint[1] < this.endPoint[1]) {
      Ymin += Ymin - Ymax;
    } else {
      Ymax -= Ymin - Ymax;
    }

    return commonIsOverlay(x, y, offsetX, offsetY, Xmin, Xmax, Ymin, Ymax);
  }

  closeToCentre(x: number, y: number): boolean {
    if (
      Math.sqrt(Math.pow(x - this.startPoint[0], 2) + Math.pow(y - this.startPoint[1], 2)) <
      Math.max(
        Math.min(
          Math.abs(Math.abs(this.startPoint[0]) - Math.abs(this.endPoint[0])),
          Math.abs(Math.abs(this.startPoint[1]) - Math.abs(this.endPoint[1])),
        ),
        10,
      )
    ) {
      return true;
    }
    return false;
  }

  // startPoint — центр, endPoint — угол описанного прямоугольника
  bounds(): Rect {
    const radiusX = Math.abs(this.endPoint[0] - this.startPoint[0]);
    const radiusY = Math.abs(this.endPoint[1] - this.startPoint[1]);

    return {
      x: this.startPoint[0] - radiusX,
      y: this.startPoint[1] - radiusY,
      width: radiusX * 2,
      height: radiusY * 2,
    };
  }

  withBounds(next: Rect) {
    const copy = copyOf(this);
    const map = remap(this.bounds(), next);

    copy.startPoint = map(this.startPoint);
    copy.endPoint = map(this.endPoint);

    return copy;
  }

  containsPoint(x: number, y: number, tolerance: number): boolean {
    const { width, height } = this.bounds();
    const dx = (x - this.startPoint[0]) / (width / 2 + tolerance);
    const dy = (y - this.startPoint[1]) / (height / 2 + tolerance);

    return dx * dx + dy * dy <= 1;
  }
}

export class ImageObject extends BaseObject {
  drawType: MyCursor = "image";

  ctx;
  x;
  y;
  src;
  width;
  height;
  image;

  constructor({ x, y, userId, color = "", width, height, src, ctx }: ImageProps) {
    super({ color, userId, width });

    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.userId = userId;
    this.color = color;
    this.width = width;
    this.height = height;
    this.src = src;

    this.image = new Image(width, height);
    this.image.src = src;
  }

  draw(offsetX: number, offsetY: number, zoom: number): void {
    this.ctx.drawImage(
      this.image,
      this.x * zoom + offsetX,
      this.y * zoom + offsetY,
      this.width * zoom,
      this.height * zoom,
    );
  }

  isOverlay(x: number, y: number, offsetX: number, offsetY: number, zoom: number): boolean {
    x *= -1;
    y *= -1;

    let Xmin = this.x;
    let Xmax = this.x + this.width;
    let Ymin = this.y;
    let Ymax = this.y + this.height;

    Xmin *= zoom;
    Ymin *= zoom;
    Xmax *= zoom;
    Ymax *= zoom;

    return commonIsOverlay(x, y, offsetX, offsetY, Xmin, Xmax, Ymin, Ymax);
  }

  bounds(): Rect {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  withBounds(next: Rect) {
    const copy = copyOf(this);

    copy.x = next.x;
    copy.y = next.y;
    copy.width = next.width;
    copy.height = next.height;

    return copy;
  }
}

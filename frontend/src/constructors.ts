/* eslint-disable @typescript-eslint/no-unused-vars */
import getStroke from 'perfect-freehand';
import type { Drawable } from 'roughjs/bin/core';
import type {
  BaseProps,
  CurveProps,
  EllipseProps,
  LineProps,
  MyCursor,
  RectangleProps,
} from './types';
import { generateId, commonIsOverlay, getSvgPathFromStroke } from './utils';

export abstract class BaseObject {
  color;
  width;
  userId;
  drawType: MyCursor = 'pointer';
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
}

export class TextObject extends BaseObject {
  drawType: MyCursor = 'text';
  inputElement: HTMLTextAreaElement | null;
  top: number;
  left: number;
  fontFamily: string;
  text: string;
  inputId: string;
  fontSize: string;
  textColor: string;
  height: number;

  constructor(
    fontFamily: string,
    color: string,
    userId: string,
    inputElement: HTMLTextAreaElement | null,
    top: number,
    left: number,
    text: string,
    inputId: string,
    fontSize: string,
    textColor: string,
    width: number,
    height: number,
  ) {
    super({ color, width, userId });

    this.userId = userId;
    this.top = top;
    this.left = left;
    this.fontFamily = fontFamily;
    this.text = text;
    this.inputId = inputId;
    this.inputElement = inputElement ?? null;
    this.fontSize = fontSize;
    this.textColor = textColor;
    this.height = height;

    if (inputElement !== null) {
      inputElement.value = text;
    }
  }

  draw(offsetX: number, offsetY: number, zoom: number): void {
    if (this.inputElement === null) {
      return;
    }

    this.inputElement.style.left = this.left * zoom + offsetX + 'px';
    this.inputElement.style.top = this.top * zoom + offsetY + 'px';
    this.inputElement.style.fontSize = `${this.zoom * 32}px`;
    this.inputElement.style.width = `${this.width * zoom}px`;
    this.inputElement.style.height = `${this.height * zoom}px`;
  }

  isOverlay(x: number, y: number, offsetX: number, offsetY: number): boolean {
    return true;
  }
}

export class CurveObject extends BaseObject {
  pointsList;
  ctx;
  drawType: MyCursor = 'curve';
  constructor({ color, ctx, pointsList, userId, width, zoom }: CurveProps) {
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
}

export class LineObject extends BaseObject {
  startPoint;
  endPoint;
  roughCanvas;
  drawType: MyCursor = 'line';

  constructor({ color, endPoint, roughCanvas, startPoint, userId, width }: LineProps) {
    super({ color, width, userId });
    console.log('roughCanvas', roughCanvas);
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.roughCanvas = roughCanvas;
    this.userId = userId;
  }

  draw(offsetX: number, offsetY: number, zoom: number): void {
    console.log(' this.roughCanvas', this.roughCanvas);
    console.log(' this.roughCanvas.line', this.roughCanvas.line);
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
}

export class RectangleObject extends BaseObject {
  startPoint;
  endPoint;
  roughCanvas;
  fillStyle;
  drawType: MyCursor = 'rectangle';
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
}

export class EllipseObject extends BaseObject {
  startPoint;
  endPoint;
  roughCanvas;
  fillStyle;
  drawType: MyCursor = 'ellipse';
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
    this.userId = this.userId;
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
}

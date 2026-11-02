import { RoughCanvas } from "roughjs/bin/canvas";

export type MyCursor =
  | "pointer"
  | "curve"
  | "ellipse"
  | "rectangle"
  | "line"
  | "text"
  | "image"
  | "eraser";

export type BaseProps = {
  color: string;
  width: number;
  userId: string;
};

export type CurveProps = {
  pointsList: number[][];
  color: string;
  width: number;
  ctx: CanvasRenderingContext2D;
  userId: string;
  zoom: number;
};

export type LineProps = {
  color: string;
  width: number;
  startPoint: number[];
  endPoint: number[];
  roughCanvas: RoughCanvas;
  userId: string;
};

export type RectangleProps = {
  color: string;
  width: number;
  startPoint: number[];
  endPoint: number[];
  fillStyle: string;
  roughCanvas: RoughCanvas;
  stroke: string;
  strokeWidth: number;
  userId: string;
};

export type EllipseProps = {
  color: string;
  width: number;
  startPoint: number[];
  endPoint: number[];
  fillStyle: string;
  roughCanvas: RoughCanvas;
  stroke: string;
  strokeWidth: number;
  isCircle: boolean;
  userId: string;
};

export type TextProps = {
  color: string;
  x: number;
  y: number;
  ctx: CanvasRenderingContext2D;
  text: string;
  fontSize: number;
  fontFamily: string;
  userId: string;
  width: number;
  objId: string;
};

export type ImageProps = {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  userId: string;
  ctx: CanvasRenderingContext2D;
  color: string;
};

import { RoughCanvas } from 'roughjs/bin/canvas';

export type MyCursor =
  | 'pointer'
  | 'pen'
  | 'ellipse'
  | 'rectangle'
  | 'line'
  | 'text'
  | 'image'
  | 'eraser';

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

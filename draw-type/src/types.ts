import getStroke from 'perfect-freehand';
import { RoughCanvas } from 'roughjs/bin/canvas';
import { Drawable } from 'roughjs/bin/core';
import { getSvgPathFromStroke, hexToRgbA, makeid } from './utils';

export abstract class BaseObject {
    color;
    width;
    userId;
    typeName: string = '';
    tempObj: boolean = false;
    zoom: number = 1;
    objId: string = makeid(5);

    constructor(color: string, width: number, userId: string) {
        this.color = color;
        this.width = width;
        this.userId = userId;
    }

    draw(offsetX: number, offsetY: number) {
        console.log('offset:', offsetX, offsetY);
    }

    isOverlay(x: number, y: number, offsetX: number, offsetY: number): boolean {
        return true;
    }
}

export class CurveObject extends BaseObject {
    pointsList;
    ctx;
    typeName: string = 'curve';
    constructor(
        pointsList: number[][],
        color: string,
        width: number,
        ctx: CanvasRenderingContext2D,
        userId: string
    ) {
        super(color, width, userId);
        this.pointsList = pointsList;
        this.ctx = ctx;
        this.userId = userId;
    }

    draw(offsetX: number, offsetY: number): void {
        let newLines: number[][] = [];

        for (let index = 0; index < this.pointsList.length; index++) {
            let element = this.pointsList[index];
            newLines.push([
                element[0] * this.zoom + offsetX,
                element[1] * this.zoom + offsetY,
            ]);
        }

        const outlinePoints = getStroke(newLines, {
            size: this.width * this.zoom,
            thinning: 0.7,
        });

        const pathData = getSvgPathFromStroke(outlinePoints);

        const myPath = new Path2D(pathData);

        let tempColor = this.ctx.fillStyle;

        this.ctx.fillStyle = this.color.startsWith('#')
            ? hexToRgbA(this.color)
            : this.color;
        this.ctx.fill(myPath);
        this.ctx.fillStyle = tempColor;
    }

    isCloseToPoints(x: number, y: number, delta: number) {
        if (this.pointsList.length === 0) return false;

        for (let index = 0; index < this.pointsList.length; index++) {
            const element = this.pointsList[index];
            if (
                Math.sqrt(
                    Math.pow(x - element[0], 2) + Math.pow(y - element[1], 2)
                ) < delta
            ) {
                return true;
            }
        }

        return false;
    }

    isOverlay(x: number, y: number, offsetX: number, offsetY: number): boolean {
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

        Xmin *= this.zoom;
        Ymin *= this.zoom;
        Xmax *= this.zoom;
        Ymax *= this.zoom;

        let screenX = x;
        let screenY = y;
        let screenX1 = x + offsetX;
        let screenY1 = y + offsetY;

        //console.log("xObj = " + Xmin + " yObj = " + Ymin + " x1Obj = " + Xmax + " y1Obj = " + Ymax);
        //console.log("xS = " + screenX + " yS = " + screenY + " x1S = " + screenX1 + " y1S = " + screenY1);

        if (
            (((Xmin >= screenX && Xmin <= screenX1) ||
                (Xmax >= screenX && Xmax <= screenX1)) &&
                ((Ymin >= screenY && Ymin <= screenY1) ||
                    (Ymax >= screenY && Ymax <= screenY1))) ||
            (((screenX >= Xmin && screenX <= Xmax) ||
                (screenX1 >= Xmin && screenX1 <= Xmax)) &&
                ((screenY >= Ymin && screenY <= Ymax) ||
                    (screenY1 >= Ymin && screenY1 <= Ymax))) ||
            (((Xmin >= screenX && Xmin <= screenX1) ||
                (Xmax >= screenX && Xmax <= screenX1)) &&
                ((screenY >= Ymin && screenY <= Ymax) ||
                    (screenY1 >= Ymin && screenY1 <= Ymax))) ||
            (((screenX >= Xmin && screenX <= Xmax) ||
                (screenX1 >= Xmin && screenX1 <= Xmax)) &&
                ((Ymin >= screenY && Ymin <= screenY1) ||
                    (Ymax >= screenY && Ymax <= screenY1)))
        ) {
            return true;
        }

        return false;
    }
}

export class LineObject extends BaseObject {
    startPoint;
    endPoint;
    roughCanvas;
    typeName: string = 'line';

    constructor(
        color: string,
        width: number,
        startPoint: number[],
        endPoint: number[],
        roughCanvas: RoughCanvas,
        userId: string
    ) {
        super(color, width, userId);
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.roughCanvas = roughCanvas;
        this.userId = userId;
    }

    draw(offsetX: number, offsetY: number): void {
        this.roughCanvas.line(
            this.startPoint[0] * this.zoom + offsetX,
            this.startPoint[1] * this.zoom + offsetY,
            this.endPoint[0] * this.zoom + offsetX,
            this.endPoint[1] * this.zoom + offsetY,
            {
                strokeWidth: this.width * this.zoom,
                stroke: this.color,
                seed: 1,
            }
        );
    }

    isOverlay(x: number, y: number, offsetX: number, offsetY: number): boolean {
        x *= -1;
        y *= -1;

        let Xmin = Math.min(this.startPoint[0], this.endPoint[0]);
        let Xmax = Math.max(this.startPoint[0], this.endPoint[0]);
        let Ymin = Math.min(this.startPoint[1], this.endPoint[1]);
        let Ymax = Math.max(this.startPoint[1], this.endPoint[1]);

        Xmin *= this.zoom;
        Ymin *= this.zoom;
        Xmax *= this.zoom;
        Ymax *= this.zoom;

        let screenX = x;
        let screenY = y;
        let screenX1 = x + offsetX;
        let screenY1 = y + offsetY;

        if (
            (((Xmin >= screenX && Xmin <= screenX1) ||
                (Xmax >= screenX && Xmax <= screenX1)) &&
                ((Ymin >= screenY && Ymin <= screenY1) ||
                    (Ymax >= screenY && Ymax <= screenY1))) ||
            (((screenX >= Xmin && screenX <= Xmax) ||
                (screenX1 >= Xmin && screenX1 <= Xmax)) &&
                ((screenY >= Ymin && screenY <= Ymax) ||
                    (screenY1 >= Ymin && screenY1 <= Ymax))) ||
            (((Xmin >= screenX && Xmin <= screenX1) ||
                (Xmax >= screenX && Xmax <= screenX1)) &&
                ((screenY >= Ymin && screenY <= Ymax) ||
                    (screenY1 >= Ymin && screenY1 <= Ymax))) ||
            (((screenX >= Xmin && screenX <= Xmax) ||
                (screenX1 >= Xmin && screenX1 <= Xmax)) &&
                ((Ymin >= screenY && Ymin <= screenY1) ||
                    (Ymax >= screenY && Ymax <= screenY1)))
        ) {
            return true;
        }

        return false;
    }

    isCloseToPoints(x: number, y: number, delta: number): boolean {
        if (
            Math.sqrt(
                Math.pow(x - this.startPoint[0], 2) +
                    Math.pow(y - this.startPoint[1], 2)
            ) < delta
        ) {
            return true;
        }

        if (
            Math.sqrt(
                Math.pow(x - this.endPoint[0], 2) +
                    Math.pow(y - this.endPoint[1], 2)
            ) < delta
        ) {
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
    typeName: string = 'rectangle';
    stroke;
    strokeWidth;
    drawableObj: Drawable | null = null;

    constructor(
        color: string,
        width: number,
        startPoint: number[],
        endPoint: number[],
        fillStyle: string,
        roughCanvas: RoughCanvas,
        stroke: string,
        strokeWidth: number,
        userId: string
    ) {
        super(color, width, userId);
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.roughCanvas = roughCanvas;
        this.fillStyle = fillStyle;
        this.stroke = stroke;
        this.strokeWidth = strokeWidth;
        this.userId = userId;
    }

    draw(offsetX: number, offsetY: number): void {
        let width: number = (this.endPoint[0] - this.startPoint[0]) * this.zoom;
        let height: number =
            (this.endPoint[1] - this.startPoint[1]) * this.zoom;

        this.roughCanvas.rectangle(
            this.startPoint[0] * this.zoom + offsetX,
            this.startPoint[1] * this.zoom + offsetY,
            width,
            height,
            {
                strokeWidth: this.width * this.zoom,
                fill: this.color,
                fillStyle: this.fillStyle,
                seed: 1,
                stroke: this.stroke,
            }
        );
    }

    isOverlay(x: number, y: number, offsetX: number, offsetY: number): boolean {
        x *= -1;
        y *= -1;

        let Xmin = Math.min(this.startPoint[0], this.endPoint[0]);
        let Xmax = Math.max(this.startPoint[0], this.endPoint[0]);
        let Ymin = Math.min(this.startPoint[1], this.endPoint[1]);
        let Ymax = Math.max(this.startPoint[1], this.endPoint[1]);

        Xmin *= this.zoom;
        Ymin *= this.zoom;
        Xmax *= this.zoom;
        Ymax *= this.zoom;

        let screenX = x;
        let screenY = y;
        let screenX1 = x + offsetX;
        let screenY1 = y + offsetY;

        if (
            (((Xmin >= screenX && Xmin <= screenX1) ||
                (Xmax >= screenX && Xmax <= screenX1)) &&
                ((Ymin >= screenY && Ymin <= screenY1) ||
                    (Ymax >= screenY && Ymax <= screenY1))) ||
            (((screenX >= Xmin && screenX <= Xmax) ||
                (screenX1 >= Xmin && screenX1 <= Xmax)) &&
                ((screenY >= Ymin && screenY <= Ymax) ||
                    (screenY1 >= Ymin && screenY1 <= Ymax))) ||
            (((Xmin >= screenX && Xmin <= screenX1) ||
                (Xmax >= screenX && Xmax <= screenX1)) &&
                ((screenY >= Ymin && screenY <= Ymax) ||
                    (screenY1 >= Ymin && screenY1 <= Ymax))) ||
            (((screenX >= Xmin && screenX <= Xmax) ||
                (screenX1 >= Xmin && screenX1 <= Xmax)) &&
                ((Ymin >= screenY && Ymin <= screenY1) ||
                    (Ymax >= screenY && Ymax <= screenY1)))
        ) {
            return true;
        }

        return false;
    }
}

export class EllipseObject extends BaseObject {
    startPoint;
    endPoint;
    roughCanvas;
    fillStyle;
    typeName: string = 'ellipse';
    stroke;
    strokeWidth;
    drawableObj: Drawable | null = null;
    isCircle;

    constructor(
        color: string,
        width: number,
        startPoint: number[],
        endPoint: number[],
        fillStyle: string,
        roughCanvas: RoughCanvas,
        stroke: string,
        strokeWidth: number,
        isCircle: boolean,
        userId: string
    ) {
        super(color, width, userId);
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.roughCanvas = roughCanvas;
        this.fillStyle = fillStyle;
        this.stroke = stroke;
        this.strokeWidth = strokeWidth;
        this.isCircle = isCircle;
        this.userId = this.userId;
    }

    draw(offsetX: number, offsetY: number): void {
        let width: number = (this.endPoint[0] - this.startPoint[0]) * this.zoom;
        let height: number =
            (this.endPoint[1] - this.startPoint[1]) * this.zoom;

        this.roughCanvas.ellipse(
            this.startPoint[0] * this.zoom + offsetX,
            this.startPoint[1] * this.zoom + offsetY,
            width * 2,
            height * 2,
            {
                strokeWidth: this.width * this.zoom,
                fill: this.color,
                fillStyle: this.fillStyle,
                seed: 1,
                stroke: this.stroke,
            }
        );
    }

    isOverlay(x: number, y: number, offsetX: number, offsetY: number): boolean {
        x *= -1;
        y *= -1;

        let Xmin = Math.min(this.startPoint[0], this.endPoint[0]);
        let Xmax = Math.max(this.startPoint[0], this.endPoint[0]);
        let Ymin = Math.min(this.startPoint[1], this.endPoint[1]);
        let Ymax = Math.max(this.startPoint[1], this.endPoint[1]);

        Xmin *= this.zoom;
        Ymin *= this.zoom;
        Xmax *= this.zoom;
        Ymax *= this.zoom;

        let screenX = x;
        let screenY = y;
        let screenX1 = x + offsetX;
        let screenY1 = y + offsetY;

        if (
            (((Xmin >= screenX && Xmin <= screenX1) ||
                (Xmax >= screenX && Xmax <= screenX1)) &&
                ((Ymin >= screenY && Ymin <= screenY1) ||
                    (Ymax >= screenY && Ymax <= screenY1))) ||
            (((screenX >= Xmin && screenX <= Xmax) ||
                (screenX1 >= Xmin && screenX1 <= Xmax)) &&
                ((screenY >= Ymin && screenY <= Ymax) ||
                    (screenY1 >= Ymin && screenY1 <= Ymax))) ||
            (((Xmin >= screenX && Xmin <= screenX1) ||
                (Xmax >= screenX && Xmax <= screenX1)) &&
                ((screenY >= Ymin && screenY <= Ymax) ||
                    (screenY1 >= Ymin && screenY1 <= Ymax))) ||
            (((screenX >= Xmin && screenX <= Xmax) ||
                (screenX1 >= Xmin && screenX1 <= Xmax)) &&
                ((Ymin >= screenY && Ymin <= screenY1) ||
                    (Ymax >= screenY && Ymax <= screenY1)))
        ) {
            return true;
        }

        return false;
    }

    closeToCentre(x: number, y: number): boolean {
        if (
            Math.sqrt(
                Math.pow(x - this.startPoint[0], 2) +
                    Math.pow(y - this.startPoint[1], 2)
            ) <
            Math.max(
                Math.min(
                    Math.abs(
                        Math.abs(this.startPoint[0]) -
                            Math.abs(this.endPoint[0])
                    ),
                    Math.abs(
                        Math.abs(this.startPoint[1]) -
                            Math.abs(this.endPoint[1])
                    )
                ),
                10
            )
        ) {
            return true;
        }
        return false;
    }
}

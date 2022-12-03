import { RoughCanvas } from 'roughjs/bin/canvas';
import {
    BaseObject,
    EllipseObject,
    RectangleObject,
    LineObject,
    CurveObject,
} from './types';

export function getTypedDrawObject(
    str: string,
    roughCanvas: RoughCanvas,
    ctx: CanvasRenderingContext2D
): BaseObject | null {
    let json: BaseObject = JSON.parse(str);
    let type: string = json.typeName;

    switch (type) {
        case 'rectangle':
            let {
                color,
                width,
                startPoint,
                endPoint,
                fillStyle,
                stroke,
                strokeWidth,
                userId,
                zoom,
                objId,
            } = json as RectangleObject;

            let r = new RectangleObject(
                color,
                width,
                startPoint,
                endPoint,
                fillStyle,
                roughCanvas,
                stroke,
                strokeWidth,
                userId
            );

            r.objId = objId;
            r.zoom = zoom;

            return r;
        case 'ellipse': {
            let {
                color,
                width,
                startPoint,
                endPoint,
                fillStyle,
                stroke,
                strokeWidth,
                isCircle,
                userId,
                zoom,
                objId,
            } = json as EllipseObject;

            let e = new EllipseObject(
                color,
                width,
                startPoint,
                endPoint,
                fillStyle,
                roughCanvas,
                stroke,
                strokeWidth,
                isCircle,
                userId
            );
            e.objId = objId;
            e.zoom = zoom;

            return e;
        }
        case 'line': {
            let { color, width, startPoint, endPoint, userId, zoom, objId } =
                json as LineObject;

            let l = new LineObject(
                color,
                width,
                startPoint,
                endPoint,
                roughCanvas,
                userId
            );

            l.zoom = zoom;
            l.objId = objId;
            return l;
        }
        case 'curve': {
            let { pointsList, color, width, userId, zoom, objId } =
                json as CurveObject;

            let c = new CurveObject(pointsList, color, width, ctx, userId);
            c.objId = objId;
            c.zoom = zoom;

            return c;
        }
        default:
            return null;
    }
}

export function animateCursor(
    trailerX: number,
    trailerY: number,
    trailer: HTMLDivElement
) {
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
    alpha: number
) {
    ctx.fillStyle = rgbaToRgba(color, alpha);
    // ctx.strokeStyle = color;
    trailer.style.backgroundColor = color;

    const list = document.getElementsByClassName(
        'trailer'
    ) as HTMLCollectionOf<HTMLElement>;

    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        item.style.backgroundColor = color;
    }
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
        2
    )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
        b[1],
        c[1]
    ).toFixed(2)} T`;

    for (let i = 2, max = len - 1; i < max; i++) {
        a = points[i];
        b = points[i + 1];
        result += `${average(a[0], b[0]).toFixed(2)},${average(
            a[1],
            b[1]
        ).toFixed(2)} `;
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
        return (
            'rgba(' +
            [(cc >> 16) & 255, (cc >> 8) & 255, cc & 255].join(',') +
            ',' +
            alpha +
            ')'
        );
    }
    throw new Error('Bad Hex');
}

export function rgbaToRgba(color: string, alpha: number) {
    let colorArr = color
        .slice(color.indexOf('(') + 1, color.indexOf(')'))
        .split(', ');

    return (
        'rgba(' +
        colorArr[0] +
        ', ' +
        colorArr[1] +
        ', ' +
        colorArr[2] +
        ', ' +
        alpha +
        ')'
    );
}

export function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}

export function cleanCanvas(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(
        0,
        0,
        document.documentElement.clientWidth,
        document.documentElement.clientHeight
    );
}

export function reDraw(
    objects: BaseObject[],
    offsetXCustom: number,
    offsetYCustom: number,
    screenWidth: number,
    screenHeight: number
) {
    //let counter: number = 0;

    for (let index = 0; index < objects.length; index++) {
        const element = objects[index];

        if (
            element.isOverlay(
                offsetXCustom,
                offsetYCustom,
                screenWidth,
                screenHeight
            )
        ) {
            element.draw(offsetXCustom, offsetYCustom);
            //counter++;
        } else {
        }
    }
    //console.log(objects.length + "  " + counter);
}

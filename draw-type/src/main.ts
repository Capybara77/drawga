import {
    BaseObject,
    CurveObject,
    EllipseObject,
    LineObject,
    RectangleObject,
} from './types';
import {
    reDraw,
    animateCursor,
    makeid,
    changeColor,
    rgbaToRgba,
    hexToRgbA,
    cleanCanvas,
    getTypedDrawObject,
} from './utils';
import rough from 'roughjs';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
// ============= CONST

let allObjects: BaseObject[] = [];

let offsetXCustom: number = 0;
let offsetYCustom: number = 0;
let cursorX: number = 0;
let cursorY: number = 0;
let step: number = 1;
let counter: number = 0;
let currentLine: number[][] = [];
let currentZoom: number = 1;

let isDraw: boolean = false;
let isResize: boolean = false;

const trailer = document.getElementById('me') as HTMLDivElement;
const myId: string = makeid(20);

let currentBorderColor = 'rgb(95, 61, 196)';
let currentShape: string = 'pointer';
let currentFillStyle: string = 'hachure';

const zoomContainer = document.getElementById('zoom-current') as HTMLDivElement;

// ================================================== SETTINGS

const settingsButton = document.querySelector(
    '.settings-show-btn'
) as HTMLButtonElement;
const settingsContainer = document.querySelector(
    '.settings-container'
) as HTMLDivElement;

const activeThemeValue = localStorage.getItem('theme') || 'lightTheme';
const activeThemeElement = document.getElementById(
    activeThemeValue
) as HTMLInputElement;
activeThemeElement.checked = true;
document.documentElement.className = activeThemeValue;

const themeOptions = document.querySelectorAll('input[type="radio"]');

settingsButton?.addEventListener('click', () => {
    const isHidden = settingsContainer.style.display === 'none';

    if (isHidden) {
        settingsContainer.style.display = 'flex';
    } else {
        settingsContainer.style.display = 'none';
    }
});

themeOptions.forEach((item) => {
    item.addEventListener('click', () => {
        document.documentElement.className = item.id;

        localStorage.setItem('theme', item.id);
    });
});

// ======================================== LOCAL FUNCTIONS
function fullReDraw() {
    cleanCanvas(ctx);
    reDraw(
        allObjects,
        offsetXCustom,
        offsetYCustom,
        document.documentElement.clientWidth,
        document.documentElement.clientHeight
    );
}

function setNewZoom() {
    for (let index = 0; index < allObjects.length; index++) {
        const element = allObjects[index];

        element.zoom = currentZoom;
    }
}

//  ====================================== CANVAS

const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
canvasElement.height = document.documentElement.clientHeight;
canvasElement.width = document.documentElement.clientWidth;
const ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D;
ctx.lineWidth = 12;

let prevX = 0;
let prevY = 0;

const roughCanvas = rough.canvas(canvasElement);

// ====================================== FILL STYLE

const fillStyleBtns = document.querySelectorAll('.fill-style-btn');
fillStyleBtns.forEach((modeButton) => {
    modeButton.addEventListener('click', (event) => {
        if (event.target === null) return;
        const elem = event.target as HTMLElement;

        fillStyleBtns.forEach((op) => {
            if (op !== elem) {
                op.classList.remove('active-fill-style');
            }
        });

        elem.classList.add('active-fill-style');

        currentFillStyle = elem.dataset.fillOption as string;
    });
});

// ====================================== SHAPE

const shapeBtns = document.querySelectorAll('.top-btn');
shapeBtns.forEach((shapeButton) => {
    shapeButton.addEventListener('click', (event) => {
        if (event.target === null) return;
        const elem = event.target as HTMLElement;
        if (elem.id === 'save-btn' || elem.id === 'clear-btn') {
            return;
        }

        shapeBtns.forEach((op) => {
            if (op !== elem) {
                op.classList.remove('active-shape');
            }
        });

        elem.classList.add('active-shape');

        currentShape = elem.dataset.shapeOption as string;
    });
});

// ======================== SOCKET
let socket: WebSocket;
let new_uri: string = '';
const loc: Location = window.location;

if (loc.protocol === 'https:') {
    new_uri = 'wss:';
} else {
    new_uri = 'ws:';
}

new_uri += '/' + loc.host;
new_uri += loc.pathname + '/ws' + loc.search;

if (typeof WebSocket !== 'undefined') {
}
socket = new WebSocket(new_uri);

SetSocketEvents(socket);

function SetSocketEvents(socket: WebSocket) {
    socket.onmessage = OnSocketMessage;
    socket.onclose = OnSocketClose;
}

function OnSocketMessage(msg: MessageEvent) {
    try {
        const data = msg.data.split(':::');
        const command = data[0];

        if (command === 'move') {
            const lineWidth = ctx.lineWidth;
            const strokeStyle = ctx.strokeStyle;

            canvasElement.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(data[1], data[2]);
            ctx.lineTo(data[3], data[4]);
            ctx.lineWidth = data[5];
            ctx.strokeStyle = data[6];
            ctx.stroke();

            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;
        }

        if (command === 'clear') {
            allObjects = [];
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        }

        if (command === 'cur') {
            const userId = data[1];
            let t;

            t = document.getElementById(userId);

            if (t === null) {
                t = document.createElement('div');
                t.id = userId;
                t.className = 'trailer';
                document.body.appendChild(t);
                return;
            }

            const keyFrames = {
                transform: `translate(${+data[2] + offsetXCustom}px, ${
                    +data[3] + offsetYCustom
                }px)`,
            };

            t.animate(keyFrames, {
                fill: 'forwards',
            });
        }

        if (command === 'disconnect') {
            Toastify({
                text: 'User disconnected',
                duration: 2000,
                //destination: "http://skorobogach-i-galoshi.tk/",
                newWindow: true,
                close: true,
                gravity: 'bottom', // `top` or `bottom`
                position: 'right', // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background:
                        'linear-gradient(to right, rgb(227 135 22), rgb(221 45 45))',
                },
                onClick: function () {}, // Callback after click
            }).showToast();

            let list = document.getElementsByClassName('trailer');

            if (list.length === 0) return;

            for (var i = 0; i < list.length; i++) {
                if (list[i].id !== 'me') {
                    document.body.removeChild(list[i]);
                    i--;
                }
            }
        }

        if (command === 'message') {
            Toastify({
                text: data[1],
                duration: 6000,
                //destination: "http://skorobogach-i-galoshi.tk/",
                newWindow: true,
                close: true,
                gravity: 'bottom', // `top` or `bottom`
                position: 'right', // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background:
                        'linear-gradient(to right, rgb(227 135 22), rgb(221 45 45))',
                },
                onClick: function () {}, // Callback after click
            }).showToast();
        }

        if (command === 'drawObj') {
            let o = getTypedDrawObject(data[1], roughCanvas, ctx) as BaseObject;

            o.zoom = currentZoom;

            allObjects.push(o);

            o.draw(offsetXCustom, offsetYCustom);
        }

        if (command === 'delete') {
            let dataToDelete = data[1];

            allObjects = allObjects.filter(
                (object) => JSON.stringify(object) !== dataToDelete
            );

            fullReDraw();
        }
    } catch (e) {
        console.error(e);
    }
}

function OnSocketClose() {
    Toastify({
        text: 'Lost connection. Click here',
        duration: 0,
        newWindow: true,
        close: false,
        gravity: 'bottom', // `top` or `bottom`
        position: 'right', // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: 'linear-gradient(to right, #00b09b, #96c93d)',
        },
        onClick: function () {
            location.reload();
        }, // Callback after click
    }).showToast();
    //socket = new WebSocket(new_uri);
    //SetSocketEvents(socket);
}

// ================================== MOUSE event

let cursorXStart = 0;
let cursorYStart = 0;

window.addEventListener('mousedown', (event) => {
    if (event.which === 2) {
        isResize = true;
        cursorX = event.clientX - offsetXCustom;
        cursorY = event.clientY - offsetYCustom;
        return;
    }

    if (event.button !== 0) return;
    event.stopPropagation();
    const element = event.target as HTMLElement;

    if (element.id !== 'canvas') return;
    if (element === null) return;

    isDraw = true;

    counter = 0;
    currentLine = [];

    cursorXStart = event.clientX;
    cursorYStart = event.clientY;
});

window.addEventListener('mouseup', (e) => {
    if (isResize) {
        isResize = false;
        return;
    }
    isDraw = false;

    const element = e.target as HTMLElement;
    if (element.id !== 'canvas') return;

    switch (currentShape) {
        case 'pointer':
            break;

        case 'pen': {
            let pointsToDraw: number[][] = [];
            for (let index = 0; index < currentLine.length; index++) {
                const element = currentLine[index];
                pointsToDraw.push([
                    element[0] * currentZoom,
                    element[1] * currentZoom,
                ]);
            }

            let curve = new CurveObject(
                currentLine,
                ctx.fillStyle as string,
                +ctx.lineWidth,
                ctx,
                myId
            );
            curve.zoom = currentZoom;
            allObjects.push(curve);

            fullReDraw();
            break;
        }
        case 'line': {
            fullReDraw();

            let line = new LineObject(
                ctx.fillStyle as string,
                +ctx.lineWidth,
                [
                    (cursorXStart - offsetXCustom) / currentZoom,
                    (cursorYStart - offsetYCustom) / currentZoom,
                ],
                [
                    (e.clientX - offsetXCustom) / currentZoom,
                    (e.clientY - offsetYCustom) / currentZoom,
                ],
                roughCanvas,
                myId
            );

            line.zoom = currentZoom;
            allObjects.push(line);
            fullReDraw();
            break;
        }
        case 'rectangle': {
            fullReDraw();

            let rect = new RectangleObject(
                ctx.fillStyle as string,
                +ctx.lineWidth,
                [
                    (cursorXStart - offsetXCustom) / currentZoom,
                    (cursorYStart - offsetYCustom) / currentZoom,
                ],
                [
                    (e.clientX - offsetXCustom) / currentZoom,
                    (e.clientY - offsetYCustom) / currentZoom,
                ],
                currentFillStyle,
                roughCanvas,
                currentBorderColor as string,
                ctx.lineWidth,
                myId
            );

            rect.zoom = currentZoom;
            rect.draw(offsetXCustom, offsetYCustom);
            allObjects.push(rect);
            break;
        }

        case 'ellipse':
            fullReDraw();

            let ellipse = new EllipseObject(
                ctx.fillStyle as string,
                +ctx.lineWidth,
                [
                    (cursorXStart - offsetXCustom) / currentZoom,
                    (cursorYStart - offsetYCustom) / currentZoom,
                ],
                [
                    (e.clientX - offsetXCustom) / currentZoom,
                    (e.clientY - offsetYCustom) / currentZoom,
                ],
                currentFillStyle,
                roughCanvas,
                currentBorderColor,
                ctx.lineWidth,
                false,
                myId
            );

            ellipse.zoom = currentZoom;
            ellipse.draw(offsetXCustom, offsetYCustom);
            allObjects.push(ellipse);
            break;
        default:
            break;
    }

    let messageToServer: string =
        'drawObj:::' +
        JSON.stringify(allObjects[allObjects.length - 1]) +
        ':::';

    socket.send(messageToServer.length as unknown as string);
    socket.send(messageToServer);
});

window.addEventListener('mousemove', (e) => {
    if (e.button !== 0) return;
    const elem = e.target as HTMLElement;
    const trailerX = e.clientX - trailer.offsetWidth / 2;
    const trailerY = e.clientY - trailer.offsetHeight / 2;

    if (elem.id === 'canvas') {
        animateCursor(trailerX, trailerY, trailer as HTMLDivElement);

        let memessageToServer: string =
            'cur:::' +
            myId +
            ':::' +
            +(trailerX - offsetXCustom) +
            ':::' +
            +(trailerY - offsetYCustom) +
            ':::';

        socket.send(memessageToServer.length as unknown as string);
        socket.send(memessageToServer);
    }

    if (isResize) {
        offsetXCustom = e.clientX - cursorX;
        offsetYCustom = e.clientY - cursorY;

        fullReDraw();
        return;
    }

    if (!isDraw) return;

    const cursorXCurrent = e.clientX;
    const cursorYCurrent = e.clientY;

    switch (currentShape) {
        case 'eraser': {
            allObjects = allObjects.filter((item) => {
                if (item.typeName === "curve"){
                    if ((item as CurveObject).isCloseToPoints(e.clientX, e.clientY, 10)){
                        return false;
                    }
                }

                return true;
            });
            fullReDraw();
            break;
        }
        case 'pointer':
            break;

        case 'pen':
            if (prevX == null || prevY == null || !isDraw) {
                prevX = e.clientX;
                prevY = e.clientY;
                return;
            }

            let currentX = e.clientX;
            let currentY = e.clientY;

            counter++;
            if (counter % step === 0) {
                currentLine.push([
                    (currentX - offsetXCustom) / currentZoom,
                    (currentY - offsetYCustom) / currentZoom,
                ]);

                fullReDraw();

                let pointsToDraw: number[][] = [];
                for (let index = 0; index < currentLine.length; index++) {
                    const element = currentLine[index];
                    pointsToDraw.push([
                        element[0] * currentZoom,
                        element[1] * currentZoom,
                    ]);
                }

                new CurveObject(
                    pointsToDraw,
                    ctx.fillStyle as string,
                    ctx.lineWidth,
                    ctx,
                    myId
                ).draw(offsetXCustom, offsetYCustom);
            }

            prevX = currentX;
            prevY = currentY;
            break;

        case 'line':
            fullReDraw();

            let line = new LineObject(
                ctx.fillStyle as string,
                +ctx.lineWidth,
                [
                    (cursorXStart - offsetXCustom) / currentZoom,
                    (cursorYStart - offsetYCustom) / currentZoom,
                ],
                [
                    (cursorXCurrent - offsetXCustom) / currentZoom,
                    (cursorYCurrent - offsetYCustom) / currentZoom,
                ],
                roughCanvas,
                myId
            );
            line.zoom = currentZoom;
            line.draw(offsetXCustom, offsetYCustom);

            break;
        case 'ellipse':
            fullReDraw();

            let ellipse = new EllipseObject(
                ctx.fillStyle as string,
                +ctx.lineWidth,
                [
                    (cursorXStart - offsetXCustom) / currentZoom,
                    (cursorYStart - offsetYCustom) / currentZoom,
                ],
                [
                    (cursorXCurrent - offsetXCustom) / currentZoom,
                    (cursorYCurrent - offsetYCustom) / currentZoom,
                ],
                currentFillStyle,
                roughCanvas,
                currentBorderColor,
                ctx.lineWidth,
                false,
                myId
            );

            ellipse.zoom = currentZoom;
            ellipse.draw(offsetXCustom, offsetYCustom);

            break;
        case 'rectangle':
            fullReDraw();

            let rect = new RectangleObject(
                ctx.fillStyle as string,
                +ctx.lineWidth,
                [
                    (cursorXStart - offsetXCustom) / currentZoom,
                    (cursorYStart - offsetYCustom) / currentZoom,
                ],
                [
                    (cursorXCurrent - offsetXCustom) / currentZoom,
                    (cursorYCurrent - offsetYCustom) / currentZoom,
                ],
                currentFillStyle,
                roughCanvas,
                currentBorderColor,
                ctx.lineWidth,
                myId
            );

            rect.zoom = currentZoom;
            rect.draw(offsetXCustom, offsetYCustom);
            break;

        default:
            break;
    }
});

window.addEventListener('resize', () => {
    fullReDraw();
});

// ======================SCROLL EVENT
window.addEventListener('wheel', (event: WheelEvent) => {
    // + отдалаяем, - прибавляем
    let screenCentreX: number = document.documentElement.clientWidth / 2;
    let screenCentreY: number = document.documentElement.clientHeight / 2;

    let normalOffsetX: number =
        (offsetXCustom + (currentZoom - 1) * screenCentreX) / currentZoom;
    let normalOffsetY: number =
        (offsetYCustom + (currentZoom - 1) * screenCentreY) / currentZoom;

    currentZoom += event.deltaY < 0 ? 0.05 : -0.1;

    if (currentZoom <= 0.1) {
        currentZoom = 0.1;
    } else if (currentZoom >= 5) {
        currentZoom = 5;
    }

    if (event.deltaY < 0) {
        offsetXCustom =
            normalOffsetX + (currentZoom - 1) * (normalOffsetX - screenCentreX);
        offsetYCustom =
            normalOffsetY + (currentZoom - 1) * (normalOffsetY - screenCentreY);
    } else {
        offsetXCustom =
            normalOffsetX + (currentZoom - 1) * (normalOffsetX - screenCentreX);
        offsetYCustom =
            normalOffsetY + (currentZoom - 1) * (normalOffsetY - screenCentreY);
    }

    setNewZoom();
    fullReDraw();

    zoomContainer.innerHTML = `${Math.floor(currentZoom * 100)}%`;
});

// ===================== CTRL Z

let bufferObj: BaseObject[] = [];

document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key.toLocaleLowerCase() === 'z') {
        if (event.shiftKey) {
            if (bufferObj.length === 0) {
                return;
            }

            let lastBufferElement = bufferObj.pop() as BaseObject;
            allObjects.push(lastBufferElement);
            lastBufferElement.draw(offsetXCustom, offsetYCustom);
            let messageToServer: string =
                'drawObj:::' + JSON.stringify(lastBufferElement) + ':::';
            socket.send(messageToServer.length as unknown as string);
            socket.send(messageToServer);
            return;
        }

        let userObjects: BaseObject[] = allObjects.filter(
            (object) => object.userId === myId
        );

        if (userObjects.length === 0) {
            return;
        }

        let lastUserObject = userObjects[userObjects.length - 1];
        allObjects = allObjects.filter((item) => item !== lastUserObject);

        let a = JSON.stringify(lastUserObject);

        bufferObj.push(lastUserObject);

        fullReDraw();

        let messageToServer: string = 'delete:::' + a;
        socket.send(messageToServer.length as unknown as string);
        socket.send(messageToServer);
    }
});

// ================================== CLEAR ALL

let clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
clearBtn.addEventListener('click', () => {
    allObjects = [];
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    socket.send('clear:::'.length as unknown as string);
    socket.send('clear:::');
});

// ================================== SAVE

let saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
saveBtn.addEventListener('click', () => {
    let data = canvasElement.toDataURL('imag/png');
    let a = document.createElement('a');
    a.href = data;
    a.download = 'sketch.png';
    a.click();
});

//  ============================ ЦВЕТА КОНСТАНТЫ

const colorPickerButton = document.querySelector(
    '.color-picker'
) as HTMLButtonElement;
const colorListContainer = document.getElementById(
    'color-list'
) as HTMLDivElement;
const colorsItemList = document.querySelectorAll('#color-item');
const colorPickerInput = document.getElementById(
    'color-picker-input'
) as HTMLInputElement;

const strokeColorPickerButton = document.getElementById(
    'stroke-color-picker'
) as HTMLButtonElement;
const strokeColorListContainer = document.getElementById(
    'stroke-color-list'
) as HTMLDivElement;
const strokeColorsItemList = document.querySelectorAll('#stroke-color-item');
const strokeColorPickerInput = document.getElementById(
    'stroke-color-picker-input'
) as HTMLInputElement;

// ============================ ВЫБРАТЬ ЦВЕТ ЗАРИСОВКИ

colorPickerButton.addEventListener('click', (event) => {
    strokeColorListContainer.style.display = 'none';

    event.stopPropagation();
    const visible = colorListContainer.style.display === 'grid';
    if (visible) {
        colorListContainer.style.display = 'none';
    } else {
        colorListContainer.style.display = 'grid';
    }
});

for (let i = 0; i < colorsItemList.length; i++) {
    const element = colorsItemList[i];

    element.addEventListener('click', (e) => {
        const element = e.target as HTMLDivElement;
        if (element === null) return;
        const clickedColor = element.style.backgroundColor;
        colorPickerButton.style.backgroundColor = clickedColor;
        changeColor(clickedColor, ctx, trailer);
        colorListContainer.style.display = 'none';
    });
}

colorPickerInput.addEventListener('input', (event) => {
    const element = event.target as HTMLInputElement;
    if (element === null) return;
    const newColor = '#' + element.value;
    if (newColor.length > 1) {
        colorPickerButton.style.backgroundColor = newColor;
        changeColor(newColor, ctx, trailer);
    }
});

document.documentElement.addEventListener('click', (event) => {
    if (
        colorListContainer.style.display === 'grid' &&
        event.target !== colorListContainer
    ) {
        colorListContainer.style.display = 'none';
    }
});

// ============================ ВЫБРАТЬ ЦВЕТ ГРАНИЦЫ

strokeColorPickerButton.addEventListener('click', (event) => {
    colorListContainer.style.display = 'none';

    event.stopPropagation();
    const visible = strokeColorListContainer.style.display === 'grid';
    if (visible) {
        strokeColorListContainer.style.display = 'none';
    } else {
        strokeColorListContainer.style.display = 'grid';
    }
});

for (let i = 0; i < strokeColorsItemList.length; i++) {
    const element = strokeColorsItemList[i];

    element.addEventListener('click', (e) => {
        const element = e.target as HTMLDivElement;
        if (element === null) return;
        const clickedColor = element.style.backgroundColor;
        strokeColorPickerButton.style.backgroundColor = clickedColor;
        currentBorderColor = clickedColor;
        // changeColor(clickedColor, ctx, trailer);
        strokeColorListContainer.style.display = 'none';

        // console.log(currentBorderColor);
    });
}

strokeColorPickerInput.addEventListener('input', (event) => {
    const element = event.target as HTMLInputElement;
    if (element === null) return;
    const newColor = '#' + element.value;
    if (newColor.length > 1) {
        strokeColorPickerButton.style.backgroundColor = newColor;
        currentBorderColor = newColor;
        // changeColor(newColor, ctx, trailer);
    }
});

document.documentElement.addEventListener('click', (event) => {
    if (
        strokeColorListContainer.style.display === 'grid' &&
        event.target !== strokeColorListContainer
    ) {
        strokeColorListContainer.style.display = 'none';
    }
});

//  ===================================== ТОЛЩИНА

const widthBtns = document.querySelectorAll('.width-btn');

widthBtns.forEach((optionButton) => {
    optionButton.addEventListener('click', (event) => {
        if (event.target === null) return;

        const elem = event.target as HTMLElement;
        ctx.lineWidth = parseInt(elem.dataset.lineWidth as string);
        optionButton.classList.add('active-width');

        widthBtns.forEach((op) => {
            if (op !== elem) {
                op.classList.remove('active-width');
            }
        });
    });
});

// ============================== ПРОЗРАЧНОСТЬ

const inputOpacity = document.getElementById(
    'input-opacity'
) as HTMLInputElement;

inputOpacity.addEventListener('change', () => {
    const newColor = (ctx.fillStyle as string).startsWith('#')
        ? hexToRgbA(ctx.fillStyle as string, inputOpacity.value)
        : rgbaToRgba(ctx.fillStyle as string, +inputOpacity.value);
    ctx.fillStyle = newColor;
});

// ============================== ZOOM

const decreaseZoomBtn = document.getElementById(
    'zoom-decrease'
) as HTMLButtonElement;
const increaseZoomBtn = document.getElementById(
    'zoom-increase'
) as HTMLButtonElement;

decreaseZoomBtn.addEventListener('click', () => {
    currentZoom -= 0.1;
    if (currentZoom <= 0.1) {
        currentZoom = 0.1;
    }

    setNewZoom();
    fullReDraw();

    zoomContainer.innerHTML = `${Math.floor(currentZoom * 100)}%`;
});

increaseZoomBtn.addEventListener('click', () => {
    currentZoom += 0.1;
    if (currentZoom >= 5) {
        currentZoom = 5;
    }

    setNewZoom();
    fullReDraw();

    zoomContainer.innerHTML = `${Math.floor(currentZoom * 100)}%`;
});

zoomContainer.addEventListener('click', (event: MouseEvent) => {
    event.stopPropagation();
    currentZoom = 1;
    setNewZoom();
    fullReDraw();
    zoomContainer.innerHTML = '100%';
});

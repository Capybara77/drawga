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
    rgbToRgba,
    hexToRgbA,
    cleanCanvas,
    getTypedDrawObject,
} from './utils';
import rough from 'roughjs';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

// ============= CONST

let allObjects: BaseObject[] = [];

let offsetXCustom = 0;
let offsetYCustom = 0;
let cursorX = 0;
let cursorY = 0;
let step = 1;
let counter = 0;
let currentLine: number[][] = [];
let currentZoom = 1;

let isDraw = false;
let isResize = false;
let isOnCanvas = false;
let isSpacePressed = false;
let isColorPickerOpened = false;

const trailer = document.getElementById('me') as HTMLDivElement;
const myId: string = makeid(20);

let currentBorderColor = 'rgb(95, 61, 196)';
let currentShape: string = 'pointer';
let currentFillStyle: string = 'hachure';

const zoomContainer = document.getElementById('zoom-current') as HTMLDivElement;

const confirmWrapper = document.querySelector(
    '.confirm-wrapper'
) as HTMLDivElement;

// ================================================== OPTIONS

const optionsWrapper = document.querySelector(
    '.options-wrapper'
) as HTMLDivElement;

const optionsColorBorder = document.getElementById(
    'options-color-border'
) as HTMLDivElement;

const fillStyleOptionsContainer = document.querySelector(
    '.fill-style-options'
) as HTMLDivElement;

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

settingsButton.addEventListener('click', () => {
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

//  ====================================== CANVAS

const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
canvasElement.height = document.documentElement.clientHeight;
canvasElement.width = document.documentElement.clientWidth;
const ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D;
ctx.lineWidth = 12;
ctx.fillStyle = 'rgb(54, 79, 199)';
trailer.style.backgroundColor = 'rgb(54, 79, 199)';

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

// ====================================== КУРСОР

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

        showOptions(elem.id);
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
                transform: `translate(${
                    +data[2] * currentZoom + offsetXCustom
                }px, ${+data[3] * currentZoom + offsetYCustom}px)`,
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
                    // background:
                    //     'linear-gradient(to right, rgb(227 135 22), rgb(221 45 45))',

                    background:
                        'linear-gradient(90deg, rgba(255,244,0,1) 0%, rgba(255,162,0,1) 48%, rgba(255,0,0,1) 100%)',
                    color: 'black',
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
                        'linear-gradient(90deg, rgba(0,255,141,1) 0%, rgba(0,206,255,1) 100%)',
                    color: 'black',
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
                (object) =>
                    object.objId !==
                    (JSON.parse(dataToDelete) as BaseObject).objId
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
            background:
                'linear-gradient(90deg, rgba(255,244,0,1) 0%, rgba(255,162,0,1) 48%, rgba(255,0,0,1) 100%)',
            color: 'black',
        },
        onClick: function () {
            location.reload();
        }, // Callback after click
    }).showToast();
    //socket = new WebSocket(new_uri);
    //SetSocketEvents(socket);
}

// ================================== SPACE BAR move

window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        isSpacePressed = true;
        canvasElement.style.cursor = 'grabbing';
    }
});

window.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        isSpacePressed = false;
        canvasElement.style.cursor = 'default';
    }
});

// ================================== MOUSE event

let cursorXStart = 0;
let cursorYStart = 0;

// left button=0 buttons=1
// wheel button=1 buttons=4
// right button=2 buttons=2

window.addEventListener('pointerdown', (event) => {
    event.stopPropagation();

    if (event.button === 1 || (isSpacePressed && event.button === 0)) {
        isResize = true;
        cursorX = event.clientX - offsetXCustom;
        cursorY = event.clientY - offsetYCustom;

        canvasElement.style.cursor = 'grabbing';
        return;
    }
    if (event.button === 0) {
        const element = event.target as HTMLElement;

        if (element.id !== 'canvas') {
            isOnCanvas = false;
            return;
        }

        if (element === null) return;

        isDraw = true;
        isOnCanvas = true;

        counter = 0;
        currentLine = [];

        cursorXStart = event.clientX;
        cursorYStart = event.clientY;
    }
});

window.addEventListener('pointerup', (event) => {
    if (event.button === 1) {
        canvasElement.style.cursor = 'default';
    }
    if (event.button === 2) return;
    if (isResize) {
        isResize = false;
        return;
    }
    isDraw = false;

    const element = event.target as HTMLElement;
    if (element.id !== 'canvas') return;

    if (isOnCanvas === false) return;

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
                    (event.clientX - offsetXCustom) / currentZoom,
                    (event.clientY - offsetYCustom) / currentZoom,
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
                    event.shiftKey
                        ? (event.clientX - offsetXCustom) / currentZoom
                        : (event.clientX - offsetXCustom) / currentZoom,
                    event.shiftKey
                        ? (cursorYStart - offsetYCustom) / currentZoom +
                          ((event.clientX - offsetXCustom) / currentZoom -
                              (cursorXStart - offsetXCustom) / currentZoom)
                        : (event.clientY - offsetYCustom) / currentZoom,
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
                    event.shiftKey
                        ? (event.clientX - offsetXCustom) / currentZoom
                        : (event.clientX - offsetXCustom) / currentZoom,
                    event.shiftKey
                        ? (cursorYStart - offsetYCustom) / currentZoom +
                          ((event.clientX - offsetXCustom) / currentZoom -
                              (cursorXStart - offsetXCustom) / currentZoom)
                        : (event.clientY - offsetYCustom) / currentZoom,
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

window.addEventListener('pointermove', (event) => {
    const element = event.target as HTMLElement;

    const trailerX = event.clientX - trailer.offsetWidth / 2;
    const trailerY = event.clientY - trailer.offsetHeight / 2;

    if (element.id === 'canvas') {
        animateCursor(trailerX, trailerY, trailer as HTMLDivElement);

        let memessageToServer: string =
            'cur:::' +
            myId +
            ':::' +
            +(event.clientX / currentZoom - offsetXCustom / currentZoom) +
            ':::' +
            +(event.clientY / currentZoom - offsetYCustom / currentZoom) +
            ':::';

        socket.send(memessageToServer.length as unknown as string);
        socket.send(memessageToServer);
    }

    if (isResize) {
        offsetXCustom = event.clientX - cursorX;
        offsetYCustom = event.clientY - cursorY;

        fullReDraw();
        return;
    }

    if (!isDraw) return;

    const cursorXCurrent = event.clientX;
    const cursorYCurrent = event.clientY;

    switch (currentShape) {
        case 'pointer': {
            break;
        }

        case 'eraser': {
            let prevCount = allObjects.length;
            allObjects = allObjects.filter((item) => {
                if (item.typeName === 'curve') {
                    if (
                        (item as CurveObject).isCloseToPoints(
                            event.clientX / currentZoom -
                                offsetXCustom / currentZoom,
                            event.clientY / currentZoom -
                                offsetYCustom / currentZoom,
                            10
                        )
                    ) {
                        deleteObj(item);

                        return false;
                    }
                } else if (item.typeName === 'rectangle') {
                    if (
                        (item as RectangleObject).isOverlay(
                            -event.clientX + offsetXCustom,
                            -event.clientY + offsetYCustom,
                            1,
                            1
                        )
                    ) {
                        deleteObj(item);
                        return false;
                    }
                } else if (item.typeName === 'line') {
                    if (
                        (item as LineObject).isCloseToPoints(
                            event.clientX / currentZoom -
                                offsetXCustom / currentZoom,
                            event.clientY / currentZoom -
                                offsetYCustom / currentZoom,
                            25
                        )
                    ) {
                        deleteObj(item);
                        return false;
                    }
                } else if (item.typeName === 'ellipse') {
                    if (
                        (item as EllipseObject).closeToCentre(
                            event.clientX / currentZoom -
                                offsetXCustom / currentZoom,
                            event.clientY / currentZoom -
                                offsetYCustom / currentZoom
                        )
                    ) {
                        deleteObj(item);
                        return false;
                    }
                }

                return true;
            });

            if (prevCount !== allObjects.length) {
                fullReDraw();
            }
            break;
        }

        case 'pen': {
            if (prevX == null || prevY == null || !isDraw) {
                prevX = event.clientX;
                prevY = event.clientY;
                return;
            }

            let currentX = event.clientX;
            let currentY = event.clientY;

            counter++;
            if (counter % step === 0) {
                currentLine.push([
                    (currentX - offsetXCustom) / currentZoom,
                    (currentY - offsetYCustom) / currentZoom,
                ]);

                fullReDraw();

                let curve = new CurveObject(
                    currentLine,
                    ctx.fillStyle as string,
                    ctx.lineWidth,
                    ctx,
                    myId
                );
                curve.zoom = currentZoom;
                curve.draw(offsetXCustom, offsetYCustom);
            }

            prevX = currentX;
            prevY = currentY;
            break;
        }

        case 'rectangle': {
            fullReDraw();

            if (event.shiftKey) {
            }

            let rect = new RectangleObject(
                ctx.fillStyle as string,
                +ctx.lineWidth,
                [
                    (cursorXStart - offsetXCustom) / currentZoom,
                    (cursorYStart - offsetYCustom) / currentZoom,
                ],
                [
                    event.shiftKey
                        ? (cursorXCurrent - offsetXCustom) / currentZoom
                        : (cursorXCurrent - offsetXCustom) / currentZoom,
                    event.shiftKey
                        ? (cursorYStart - offsetYCustom) / currentZoom +
                          ((cursorXCurrent - offsetXCustom) / currentZoom -
                              (cursorXStart - offsetXCustom) / currentZoom)
                        : (cursorYCurrent - offsetYCustom) / currentZoom,
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
                    (cursorXCurrent - offsetXCustom) / currentZoom,
                    (cursorYCurrent - offsetYCustom) / currentZoom,
                ],
                roughCanvas,
                myId
            );
            line.zoom = currentZoom;
            line.draw(offsetXCustom, offsetYCustom);

            break;
        }

        case 'ellipse': {
            fullReDraw();

            let ellipse = new EllipseObject(
                ctx.fillStyle as string,
                +ctx.lineWidth,
                [
                    (cursorXStart - offsetXCustom) / currentZoom,
                    (cursorYStart - offsetYCustom) / currentZoom,
                ],
                [
                    event.shiftKey
                        ? (event.clientX - offsetXCustom) / currentZoom
                        : (event.clientX - offsetXCustom) / currentZoom,
                    event.shiftKey
                        ? (cursorYStart - offsetYCustom) / currentZoom +
                          ((event.clientX - offsetXCustom) / currentZoom -
                              (cursorXStart - offsetXCustom) / currentZoom)
                        : (event.clientY - offsetYCustom) / currentZoom,
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
        }

        default:
            break;
    }
});

window.addEventListener('resize', () => {
    fullReDraw();
});

// ====================== SCROLL EVENT
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

// ===================== KEYDOWN event

let bufferObj: BaseObject[] = [];

document.addEventListener('keydown', function (event) {
    const keyValue = event.key.toLowerCase();
    const codeValue = event.code;
    const isCtrl = event.ctrlKey;

    if (isCtrl && codeValue === 'KeyZ') {
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

    // shortcut

    if (isColorPickerOpened === true) return;

    if (keyValue === '1' || codeValue === 'KeyF') {
        const cursorId = 'pointer-btn';
        shortCutShape(cursorId);
        showOptions(cursorId);
    }

    if (keyValue === '2' || codeValue === 'KeyE') {
        const cursorId = 'eraser-btn';
        shortCutShape(cursorId);
        showOptions(cursorId);
    }

    if (keyValue === '3' || codeValue === 'KeyP') {
        const cursorId = 'pen-btn';
        shortCutShape(cursorId);
        showOptions(cursorId);
    }

    if (keyValue === '4' || codeValue === 'KeyR') {
        const cursorId = 'rectangle-btn';
        shortCutShape(cursorId);
        showOptions(cursorId);
    }

    if (keyValue === '5' || codeValue === 'KeyV') {
        const cursorId = 'line-btn';
        shortCutShape(cursorId);
        showOptions(cursorId);
    }

    if (keyValue === '6' || codeValue === 'KeyC') {
        const cursorId = 'ellipse-btn';
        shortCutShape(cursorId);
        showOptions(cursorId);
    }

    if (keyValue === '7' || codeValue === 'KeyT') {
        const cursorId = 'text-btn';
        shortCutShape(cursorId);
        showOptions(cursorId);
    }

    if (keyValue === '8' || codeValue === 'KeyI') {
        const cursorId = 'image-btn';
        shortCutShape(cursorId);
        showOptions(cursorId);
    }
});

function shortCutShape(id: string) {
    const element = document.getElementById(id) as HTMLButtonElement;
    shapeBtns.forEach((op) => {
        if (op !== element) {
            op.classList.remove('active-shape');
        }
    });

    element.classList.add('active-shape');

    currentShape = element.dataset.shapeOption as string;
}

// ================================== СОХРАНИТЬ

const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
saveBtn.addEventListener('click', () => {
    let data = canvasElement.toDataURL('imag/png');
    let a = document.createElement('a');
    a.href = data;
    a.download = 'sketch.png';
    a.click();
});

// ================================== ОЧИСТИТЬ

const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
clearBtn.addEventListener('click', () => {
    confirmWrapper.style.display = 'flex';
});

// ================================== СОХРАНИТЬ НА СЕРВЕРЕ

const saveServerBtn = document.getElementById(
    'save-server-btn'
) as HTMLButtonElement;
saveServerBtn.addEventListener('click', () => {
    let message: string = 'save';
    socket.send(message.length as unknown as string);
    socket.send(message);
});

// ================================== ПОДТВЕРДИТЬ УДАЛЕНИЕ

const confirmAgreeBtn = document.getElementById(
    'confirm-agree'
) as HTMLButtonElement;
const confirmCanselBtn = document.getElementById(
    'confirm-cancel'
) as HTMLButtonElement;

confirmCanselBtn.addEventListener('click', () => {
    confirmWrapper.style.display = 'none';
});

confirmAgreeBtn.addEventListener('click', () => {
    allObjects = [];
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    socket.send('clear:::'.length as unknown as string);
    socket.send('clear:::');

    settingsContainer.style.display = 'none';
    currentShape = 'pointer';

    shapeBtns.forEach((shapeButton) => {
        shapeButton.classList.remove('active-shape');
    });
    document.getElementById('pointer-btn')?.classList.add('active-shape');

    confirmWrapper.style.display = 'none';
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
    if (isColorPickerOpened === true) {
        isColorPickerOpened = false;
    } else {
        isColorPickerOpened = true;
    }

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
        changeColor(clickedColor, ctx, trailer, +inputOpacity.value);
        colorListContainer.style.display = 'none';

        trailer.style.backgroundColor = element.style.backgroundColor;
    });
}

colorPickerInput.addEventListener('input', (event) => {
    const element = event.target as HTMLInputElement;
    if (element === null) return;
    const newColor = '#' + element.value;
    if (newColor.length > 1) {
        colorPickerButton.style.backgroundColor = newColor;

        ctx.fillStyle = hexToRgbA(newColor, inputOpacity.value);
        trailer.style.backgroundColor = newColor;
    }
});

colorPickerInput.addEventListener('focus', () => {
    isColorPickerOpened = true;
});

colorPickerInput.addEventListener('blur', () => {
    isColorPickerOpened = false;
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
    if (isColorPickerOpened === true) {
        isColorPickerOpened = false;
    } else {
        isColorPickerOpened = true;
    }

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
        strokeColorListContainer.style.display = 'none';
    });
}

strokeColorPickerInput.addEventListener('input', (event) => {
    const element = event.target as HTMLInputElement;
    if (element === null) return;
    const newColor = '#' + element.value;
    if (newColor.length > 1) {
        strokeColorPickerButton.style.backgroundColor = newColor;
        currentBorderColor = newColor;
    }
});

strokeColorPickerInput.addEventListener('focus', () => {
    console.log('f');
    isColorPickerOpened = true;
});

strokeColorPickerInput.addEventListener('blur', () => {
    console.log('b');
    isColorPickerOpened = false;
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
        : rgbToRgba(ctx.fillStyle as string, +inputOpacity.value);
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

// ======================================== LOCAL FUNCTIONS

function deleteObj(obj: BaseObject) {
    bufferObj.push(obj);

    let a = JSON.stringify(obj);

    let messageToServer: string = 'delete:::' + a;
    socket.send(messageToServer.length as unknown as string);
    socket.send(messageToServer);
}

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

function showOptions(cursorId: string) {
    const cursorName = cursorId.split('-')[0];
    switch (cursorName) {
        case 'pointer':
            optionsWrapper.style.display = 'none';
            break;
        case 'eraser':
            optionsWrapper.style.display = 'none';
            break;
        case 'pen':
            optionsWrapper.style.display = 'flex';
            optionsColorBorder.style.display = 'none';
            fillStyleOptionsContainer.style.display = 'none';
            break;
        case 'rectangle':
            optionsWrapper.style.display = 'flex';
            optionsColorBorder.style.display = 'flex';
            fillStyleOptionsContainer.style.display = 'flex';
            break;
        case 'line':
            optionsWrapper.style.display = 'flex';
            optionsColorBorder.style.display = 'none';
            fillStyleOptionsContainer.style.display = 'none';
            break;
        case 'ellipse':
            optionsWrapper.style.display = 'flex';
            optionsColorBorder.style.display = 'flex';
            fillStyleOptionsContainer.style.display = 'flex';
            break;

        case 'text':
            optionsWrapper.style.display = 'none';
            break;

        case 'image':
            optionsWrapper.style.display = 'none';
            break;

        default:
            break;
    }
}

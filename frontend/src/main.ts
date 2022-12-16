import {
    BaseObject,
    CurveObject,
    EllipseObject,
    LineObject,
    RectangleObject,
    TextObject,
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
import { Socket } from './socket';

//  ====================================== CANVAS

const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
canvasElement.height = document.documentElement.clientHeight;
canvasElement.width = document.documentElement.clientWidth;
const ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D;
ctx.lineWidth = 12;
ctx.fillStyle = 'rgb(54, 79, 199)';
// trailer.style.backgroundColor = 'rgb(54, 79, 199)';

let prevX = 0;
let prevY = 0;

const roughCanvas = rough.canvas(canvasElement);

// ============= CONST
type MyCursor =
    | 'pointer'
    | 'pen'
    | 'ellipse'
    | 'rectangle'
    | 'line'
    | 'text'
    | 'image'
    | 'eraser';

export let allObjects: BaseObject[] = [];

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
let isTyping = false;

const trailer = document.getElementById('me') as HTMLDivElement;
const myId: string = makeid(20);

let currentBorderColor = 'rgb(95, 61, 196)';
let currentCursor: MyCursor = 'pointer';
let currentFillStyle = 'hachure';
// let currentCursor = 'pointer';
let currentFontSize = '10rem';
let currentTextColor = '';

const zoomContainer = document.getElementById('zoom-current') as HTMLDivElement;

const confirmWrapper = document.querySelector(
    '.confirm-wrapper'
) as HTMLDivElement;

const mainContainer = document.querySelector(
    '.main-container'
) as HTMLDivElement;

// ================================================== OPTIONS

const optionsWrapper = document.querySelector(
    '.options-wrapper'
) as HTMLDivElement;

const optionsColorStroke = document.getElementById(
    'options-color-fill'
) as HTMLDivElement;

const optionsColorBorder = document.getElementById(
    'options-color-border'
) as HTMLDivElement;

const optionsFillStyleContainer = document.getElementById(
    'fill-style-options-container'
) as HTMLDivElement;

const optionsFontSizeContainer = document.getElementById(
    'font-size-options-container'
) as HTMLDivElement;

const optionsColorText = document.getElementById(
    'options-color-text'
) as HTMLDivElement;

const optionsWidthContainer = document.getElementById(
    'width-options-container'
) as HTMLDivElement;

const optionsOpacityContainer = document.getElementById(
    'opacity-options-container'
) as HTMLDivElement;

// ================================================== SETTINGS

const settingsButton = document.querySelector(
    '.settings-show-btn'
) as HTMLButtonElement;
const settingsContainer = document.querySelector(
    '.settings-container'
) as HTMLDivElement;

settingsButton.addEventListener('click', () => {
    const isHidden = settingsContainer.style.display === 'none';

    if (isHidden) {
        settingsContainer.style.display = 'flex';
    } else {
        settingsContainer.style.display = 'none';
    }
});

const activeThemeValue = localStorage.getItem('theme') || 'darkTheme';
const changeThemeBtn = document.getElementById(
    'change-theme-btn'
) as HTMLButtonElement;
const themeText = document.getElementById('theme-inner-text') as HTMLDivElement;

const moonIcon = document.getElementById(
    'moon-icon-container'
) as HTMLDivElement;
const sunIcon = document.getElementById('sun-icon-container') as HTMLDivElement;

document.documentElement.className = activeThemeValue;

if (activeThemeValue === 'darkTheme') {
    themeText.innerHTML = 'Светлая тема';
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
} else {
    themeText.innerHTML = 'Темная тема';
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
}

changeThemeBtn.addEventListener('click', changeCurrentTheme);

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

        currentCursor = elem.dataset.shapeOption as MyCursor;

        showOptions(elem.id);
    });
});

// ======================== SOCKET

let socket: WebSocket = Socket.socket;
let new_uri: string = '';
const loc: Location = window.location;

const toastifyStyle = {
    background:
        document.documentElement.className === 'lightTheme'
            ? 'rgba(255, 255, 255, 0.8)'
            : 'rgba(49, 49, 49, 0.8)',
    color:
        document.documentElement.className === 'lightTheme'
            ? 'rgb(51, 51, 51)'
            : 'rgb(233, 233, 233)',
    border: '2px solid rgb(95, 61, 196)',
    borderRadius: '5px',
    boxShadow: 'none',
    fill: 'red',
};

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

        switch (command) {
            case 'move': {
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
                break;
            }
            case 'clear': {
                allObjects = [];
                ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                break;
            }
            case 'cur': {
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
                break;
            }
            case 'disconnect': {
                Toastify({
                    text: 'Пользователь отключился',
                    duration: 2000,
                    //destination: "http://skorobogach-i-galoshi.tk/",
                    newWindow: true,
                    close: true,
                    gravity: 'bottom', // `top` or `bottom`
                    position: 'right', // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: toastifyStyle,
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
                break;
            }
            case 'message': {
                Toastify({
                    text: data[1],
                    duration: 6000,
                    //destination: "http://skorobogach-i-galoshi.tk/",
                    newWindow: true,
                    close: true,
                    gravity: 'bottom', // `top` or `bottom`
                    position: 'right', // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: toastifyStyle,
                    onClick: function () {}, // Callback after click
                }).showToast();
                break;
            }
            case 'drawObj': {
                let o = getTypedDrawObject(
                    data[1],
                    roughCanvas,
                    ctx
                ) as BaseObject;

                if (o.typeName === 'text') {
                    let textObj = o as TextObject;
                    let oldInputs = document.querySelectorAll(
                        '#' + textObj.inputId
                    );
                    for (let index = 0; index < oldInputs.length; index++) {
                        const element = oldInputs[index];
                        element.remove();
                    }

                    const newInput = document.createElement('textarea');
                    newInput.id = textObj.inputId;
                    newInput.classList.add('text-element');
                    mainContainer.prepend(newInput);
                    newInput.addEventListener('input', textChangedEvent);
                    newInput.value = textObj.text;

                    textObj.inputElement = newInput;
                }

                o.zoom = currentZoom;

                allObjects.push(o);

                o.draw(offsetXCustom, offsetYCustom);
                break;
            }
            case 'delete': {
                let dataToDelete = data[1];

                allObjects = allObjects.filter(
                    (object) =>
                        object.objId !==
                        (JSON.parse(dataToDelete) as BaseObject).objId
                );

                fullReDraw();
                break;
            }

            default:
                break;
        }
    } catch (e) {
        console.error(e);
    }
}

function OnSocketClose() {
    Toastify({
        text: 'Соединение прервано. Нажмите здесь.',
        duration: 0,
        newWindow: true,
        close: false,
        gravity: 'bottom', // `top` or `bottom`
        position: 'right', // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: toastifyStyle,
        onClick: function () {
            location.reload();
        }, // Callback after click
    }).showToast();
    //socket = new WebSocket(new_uri);
    //SetSocketEvents(socket);
}

// ================================== SPACE BAR move

window.addEventListener('keydown', (event) => {
    const switchTheme = event.ctrlKey && event.shiftKey && event.key === 'T';
    const isDownloadFile = event.ctrlKey && event.key.toLowerCase() === 'd';
    const isSaveOnServer = event.ctrlKey && event.shiftKey && event.key === 'O';

    if (event.code === 'Space') {
        isSpacePressed = true;
    }
    if (switchTheme) {
        event.preventDefault();
        changeCurrentTheme();
    }
    if (isDownloadFile) {
        event.preventDefault();
        downloadFile();
    }

    if (isSaveOnServer) {
        event.preventDefault();
        saveOnServer();
    }
});

window.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        isSpacePressed = false;
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

        // canvasElement.style.cursor = 'grabbing';
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

        if (currentCursor === 'text') {
            // в #main-container

            const newInput = document.createElement('textarea');
            const newId = makeid(5);
            newInput.id = newId;
            newInput.classList.add('text-element');
            newInput.style.fontSize = currentFontSize;
            newInput.style.color = currentTextColor;
            // newInput.style.resize = 'none';
            newInput.style.border = 'none';
            newInput.style.outline = '2px dashed rgba(0, 0, 0, 0.5)';

            let textObj = new TextObject(
                'Roboto',
                ctx.fillStyle as string,
                myId,
                newInput,
                (event.clientY - offsetYCustom) / currentZoom,
                (event.clientX - offsetXCustom) / currentZoom,
                '',
                newInput.id,
                currentFontSize,
                currentTextColor,
                500,
                150
            );
            textObj.zoom = currentZoom;
            textObj.draw(offsetXCustom, offsetYCustom);
            allObjects.push(textObj);

            let messageToServer: string =
                'drawObj:::' + JSON.stringify(textObj) + ':::';

            socket.send(messageToServer.length as unknown as string);
            socket.send(messageToServer);

            mainContainer.prepend(newInput);
            // newInput.focus();
            // document.getElementById(newId)?.focus();

            // newInput.style.fontSize = textObj.

            newInput.addEventListener('focus', (event) => {
                newInput.style.outline = '2px solid black';
                isTyping = true;
            });

            newInput.addEventListener('blur', (event) => {
                if (newInput.value.length !== 0) {
                    newInput.style.outline = 'none';
                }
                isTyping = false;
            });

            newInput.addEventListener('input', textChangedEvent);
            newInput.addEventListener('resize', resizeTextEvent);

            new ResizeObserver(resize).observe(newInput);

            currentCursor = 'pointer';

            shapeBtns.forEach((shapeButton) => {
                shapeButton.classList.remove('active-shape');
            });
            document
                .getElementById('pointer-btn')
                ?.classList.add('active-shape');
        }

        if (currentCursor === 'image') {
        }
    }
});

export function resize() {}

window.addEventListener('pointerup', (event) => {
    if (event.button === 1) {
        // canvasElement.style.cursor = 'default';
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

    switch (currentCursor) {
        case 'image': {
            return;
        }
        case 'text': {
            return;
        }
        case 'pointer': {
            return;
        }

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
                currentBorderColor,
                ctx.lineWidth,
                myId
            );

            rect.zoom = currentZoom;
            rect.draw(offsetXCustom, offsetYCustom);
            allObjects.push(rect);
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
            allObjects.push(ellipse);
            break;
        }
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

    switch (currentCursor) {
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
    let strokeStyleTemp = ctx.strokeStyle;
    let fillStyleTemp = ctx.fillStyle;
    let lineWidth = ctx.lineWidth;

    canvasElement.height = window.innerHeight;
    canvasElement.width = window.innerWidth;

    ctx.strokeStyle = strokeStyleTemp;
    ctx.fillStyle = fillStyleTemp;
    ctx.lineWidth = lineWidth;

    fullReDraw();
});

// ====================== SCROLL EVENT
window.addEventListener('wheel', (event: WheelEvent) => {
    // + отдалаяем, - прибавляем
    let screenCentreX: number = event.clientX;
    let screenCentreY: number = event.clientY;

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

document.addEventListener('keydown', (event) => {
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

    if (event.ctrlKey && event.shiftKey) return;

    if (isColorPickerOpened === true) return;
    if (isTyping === true) return;

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

// ================================== СОХРАНИТЬ

const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
saveBtn.addEventListener('click', downloadFile);

// ================================== ОЧИСТИТЬ

const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
clearBtn.addEventListener('click', () => {
    confirmWrapper.style.display = 'flex';
});

// ================================== СОХРАНИТЬ НА СЕРВЕРЕ

const saveServerBtn = document.getElementById(
    'save-server-btn'
) as HTMLButtonElement;
saveServerBtn.addEventListener('click', saveOnServer);

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
    currentCursor = 'pointer';

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

const textColorPickerButton = document.getElementById(
    'text-color-picker'
) as HTMLButtonElement;
const textColorListContainer = document.getElementById(
    'text-color-list'
) as HTMLDivElement;
const textColorsItemList = document.querySelectorAll('#text-color-item');
const textColorPickerInput = document.getElementById(
    'text-color-picker-input'
) as HTMLInputElement;

// ============================ ВЫБРАТЬ ЦВЕТ ТЕКСТА

textColorPickerButton.addEventListener('click', (event) => {
    if (isColorPickerOpened === true) {
        isColorPickerOpened = false;
    } else {
        isColorPickerOpened = true;
    }

    strokeColorListContainer.style.display = 'none';
    colorListContainer.style.display = 'none';

    event.stopPropagation();
    const visible = textColorListContainer.style.display === 'grid';
    if (visible) {
        textColorListContainer.style.display = 'none';
    } else {
        textColorListContainer.style.display = 'grid';
    }
});

for (let i = 0; i < textColorsItemList.length; i++) {
    const element = textColorsItemList[i];

    element.addEventListener('click', (e) => {
        const element = e.target as HTMLDivElement;

        if (element === null) return;

        const clickedColor = element.style.backgroundColor;

        textColorPickerButton.style.backgroundColor = clickedColor;
        currentTextColor = clickedColor;
        // changeColor(clickedColor, ctx, trailer, +inputOpacity.value);
        textColorListContainer.style.display = 'none';

        // trailer.style.backgroundColor = element.style.backgroundColor;
    });
}

textColorPickerInput.addEventListener('input', (event) => {
    const element = event.target as HTMLInputElement;
    if (element === null) return;
    const newColor = '#' + element.value;
    if (newColor.length > 1) {
        textColorPickerButton.style.backgroundColor = newColor;

        currentTextColor = hexToRgbA(newColor, inputOpacity.value);
        // trailer.style.backgroundColor = newColor;
    }
});

textColorPickerInput.addEventListener('focus', () => {
    isColorPickerOpened = true;
});

textColorPickerInput.addEventListener('blur', () => {
    isColorPickerOpened = false;
});

document.documentElement.addEventListener('click', (event) => {
    if (
        textColorListContainer.style.display === 'grid' &&
        event.target !== textColorListContainer
    ) {
        textColorListContainer.style.display = 'none';
    }
});

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
    isColorPickerOpened = true;
});

strokeColorPickerInput.addEventListener('blur', () => {
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
        optionButton.classList.add('active-option');

        widthBtns.forEach((op) => {
            if (op !== elem) {
                op.classList.remove('active-option');
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

// ======================================== FONT SIZE

const fontSizeBtns = document.querySelectorAll('.font-size-btn');

fontSizeBtns.forEach((fontSizeButton) => {
    fontSizeButton.addEventListener('click', (event) => {
        if (event.target === null) return;

        const elem = event.target as HTMLElement;
        currentFontSize = elem.dataset.fontSize as string;

        fontSizeButton.classList.add('active-option');

        fontSizeBtns.forEach((op) => {
            if (op !== elem) {
                op.classList.remove('active-option');
            }
        });
    });
});

// ======================================== LOCAL FUNCTIONS

export function deleteObj(obj: BaseObject) {
    bufferObj.push(obj);

    let a = JSON.stringify(obj);

    let messageToServer: string = 'delete:::' + a;
    let utf8Encode = new TextEncoder();
    let array = utf8Encode.encode(messageToServer);
    socket.send(array.length as unknown as string);
    socket.send(array);
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
            hideAllOptions();
            optionsWrapper.style.display = 'flex';

            optionsColorStroke.style.display = 'flex';
            optionsOpacityContainer.style.display = 'flex';
            optionsWidthContainer.style.display = 'flex';

            break;
        case 'rectangle':
            hideAllOptions();
            optionsWrapper.style.display = 'flex';
            optionsColorStroke.style.display = 'flex';
            optionsColorBorder.style.display = 'flex';
            optionsFillStyleContainer.style.display = 'flex';
            optionsOpacityContainer.style.display = 'flex';
            optionsWidthContainer.style.display = 'flex';

            break;
        case 'line':
            hideAllOptions();
            optionsWrapper.style.display = 'flex';
            optionsColorStroke.style.display = 'flex';
            optionsOpacityContainer.style.display = 'flex';
            optionsWidthContainer.style.display = 'flex';

            break;
        case 'ellipse':
            hideAllOptions();
            optionsWrapper.style.display = 'flex';
            optionsColorBorder.style.display = 'flex';
            optionsFillStyleContainer.style.display = 'flex';
            optionsWidthContainer.style.display = 'flex';
            optionsColorStroke.style.display = 'flex';

            break;

        case 'text':
            hideAllOptions();
            optionsWrapper.style.display = 'flex';
            optionsColorText.style.display = 'flex';
            optionsFontSizeContainer.style.display = 'flex';
            break;

        case 'image':
            hideAllOptions();
            optionsWrapper.style.display = 'none';
            break;

        default:
            break;
    }
}

function hideAllOptions() {
    optionsColorStroke.style.display = 'none';
    optionsColorBorder.style.display = 'none';
    optionsColorText.style.display = 'none';
    optionsFillStyleContainer.style.display = 'none';
    optionsFontSizeContainer.style.display = 'none';
    optionsWidthContainer.style.display = 'none';
    optionsOpacityContainer.style.display = 'none';
}

function changeCurrentTheme() {
    const theme = document.documentElement.className;

    if (theme.includes('darkTheme')) {
        themeText.innerHTML = 'Темная тема';
        document.documentElement.className = 'lightTheme';
        localStorage.setItem('theme', 'lightTheme');

        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }

    if (theme.includes('lightTheme')) {
        themeText.innerHTML = 'Светлая тема';
        document.documentElement.className = 'darkTheme';
        localStorage.setItem('theme', 'darkTheme');

        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

function downloadFile() {
    let data = canvasElement.toDataURL('imag/png');
    let a = document.createElement('a');
    a.href = data;
    a.download = 'sketch.png';
    a.click();
}

function saveOnServer() {
    let message: string = 'save';
    socket.send(message.length as unknown as string);
    socket.send(message);
    settingsContainer.style.display = 'none';
}

function shortCutShape(id: string) {
    const element = document.getElementById(id) as HTMLButtonElement;
    shapeBtns.forEach((op) => {
        if (op !== element) {
            op.classList.remove('active-shape');
        }
    });

    element.classList.add('active-shape');

    currentCursor = element.dataset.shapeOption as MyCursor;
}

export function resizeTextEvent(event: Event) {
    const element = event.target as HTMLTextAreaElement;
    const foundObj = allObjects.find(
        (item) => (item as TextObject).inputId === element.id
    ) as TextObject;

    foundObj.width = +element.style.width;
    foundObj.height = +element.style.height;

    deleteObj(foundObj);

    let messageToServer: string =
        'drawObj:::' + JSON.stringify(foundObj) + ':::';

    let utf8Encode = new TextEncoder();
    let array = utf8Encode.encode(messageToServer);

    socket.send(array.length as unknown as string);
    socket.send(array);
}

export function textChangedEvent(event: Event) {
    const element = event.target as HTMLTextAreaElement;

    if (element.value.length > 1000) {
        return;
    }

    const foundObj = allObjects.find(
        (item) => (item as TextObject).inputId === element.id
    ) as TextObject;

    foundObj.text = element.value;

    deleteObj(foundObj);

    let messageToServer: string =
        'drawObj:::' + JSON.stringify(foundObj) + ':::';

    let utf8Encode = new TextEncoder();
    let array = utf8Encode.encode(messageToServer);

    socket.send(array.length as unknown as string);
    socket.send(array);
}

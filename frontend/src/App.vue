<script setup lang="ts">
import rough from 'roughjs';
import { onMounted, ref, useTemplateRef } from 'vue';
import Confirm from './components/ConfirmContainer.vue';
import CursorContainer from './components/CursorContainer.vue';
import OptionsContainer from './components/OptionsContainer.vue';
import SettingsContainer from './components/SettingsContainer.vue';
import ZoomContainer from './components/ZoomContainer.vue';

import { WebSocketService } from './services/webSocketService';
import { useCursorStore } from './stores/cursor';
import { useOptionsStore } from './stores/options';
import { BaseObject, CurveObject, EllipseObject, LineObject, RectangleObject } from './types';

const socket = ref(new WebSocketService());
const cursorStore = useCursorStore();
const optionsStore = useOptionsStore();

const canvasElement = useTemplateRef<HTMLCanvasElement>('canvasElement');
const ctx = ref<CanvasRenderingContext2D>();
const roughCanvas = ref();

const allObjects = ref<BaseObject[]>([]);
const bufferObj = ref<BaseObject[]>([]);

const offsetXCustom = ref(0);
const offsetYCustom = ref(0);
const step = ref(1);
const counter = ref(0);
const currentLine = ref<number[][]>([]);

const prevX = ref(0);
const prevY = ref(0);

const isDraw = ref(false);
const isOnCanvas = ref(false);

const currentZoom = 1;
const cursorY = 0;
const cursorX = 0;
let isResize = false;
const isSpacePressed = false;
const isColorPickerOpened = false;
const isTyping = false;

let cursorXStart = 0;
let cursorYStart = 0;

const myId = '123';

onMounted(() => {
  resizeCanvas();
  roughCanvas.value = rough.canvas(canvasElement.value as HTMLCanvasElement);
  ctx.value = canvasElement.value?.getContext('2d') as CanvasRenderingContext2D;
  optionsStore.lineWidth = 12;

  createSocketConnection();
});

const getNewCurve = () => {
  const curve = new CurveObject(
    currentLine.value,
    optionsStore.colors.fillColor,
    optionsStore.lineWidth,
    ctx.value as CanvasRenderingContext2D,
    myId,
  );

  return curve;
};

const deleteObj = (obj: BaseObject) => {
  bufferObj.value = [...bufferObj.value, obj];

  const a = JSON.stringify(obj);

  const messageToServer: string = 'delete:::' + a;
  const utf8Encode = new TextEncoder();
  const array = utf8Encode.encode(messageToServer);
  // socket.send(array.length as unknown as string);
  // socket.send(array);
};

const resizeCanvas = () => {
  if (canvasElement.value) {
    canvasElement.value.width = window.innerWidth;
    canvasElement.value.height = window.innerHeight;
    ctx.value = canvasElement.value.getContext('2d') as CanvasRenderingContext2D;
    roughCanvas.value = rough.canvas(canvasElement.value);
  }
};

const reDraw = (
  objects: BaseObject[],
  offsetXCustom: number,
  offsetYCustom: number,
  screenWidth: number,
  screenHeight: number,
) => {
  // console.log(offsetXCustom + '  ' + offsetYCustom + '  ' + screenWidth + '   ' + screenHeight);

  for (let index = 0; index < objects.length; index++) {
    const element = objects[index];

    if (element.isOverlay(offsetXCustom, offsetYCustom, screenWidth, screenHeight)) {
      element.draw(offsetXCustom, offsetYCustom);
    } else {
    }
  }
};

const cleanCanvas = () => {
  ctx.value?.clearRect(
    0,
    0,
    document.documentElement.clientWidth,
    document.documentElement.clientHeight,
  );
};

const fullReDraw = () => {
  // console.log(allObjects.value);
  cleanCanvas();
  reDraw(
    allObjects.value,
    offsetXCustom.value,
    offsetYCustom.value,
    canvasElement.value?.clientWidth ?? 0,
    canvasElement.value?.clientHeight ?? 0,
  );
};

const onCanvasPointerDown = (event: PointerEvent) => {
  if (event.button === 0) {
    const element = event.target as HTMLElement;

    if (element.id !== 'canvas') {
      isOnCanvas.value = false;
      return;
    }

    if (element === null) return;

    isDraw.value = true;
    isOnCanvas.value = true;

    counter.value = 0;
    currentLine.value = [];

    cursorXStart = event.clientX;
    cursorYStart = event.clientY;

    // if (currentCursor === 'text') {
    //   // в #main-container

    //   const newInput = document.createElement('textarea');
    //   const newId = makeid(5);
    //   newInput.id = newId;
    //   newInput.classList.add('text-element');
    //   newInput.style.fontSize = currentFontSize;
    //   newInput.style.color = currentTextColor;
    //   // newInput.style.resize = 'none';
    //   newInput.style.border = 'none';
    //   newInput.style.outline = '2px dashed rgba(0, 0, 0, 0.5)';

    //   const textObj = new TextObject(
    //     'Roboto',
    //     ctx.fillStyle as string,
    //     myId,
    //     newInput,
    //     (event.clientY - offsetYCustom) / currentZoom,
    //     (event.clientX - offsetXCustom) / currentZoom,
    //     '',
    //     newInput.id,
    //     currentFontSize,
    //     currentTextColor,
    //     500,
    //     150,
    //   );
    //   textObj.zoom = currentZoom;
    //   textObj.draw(offsetXCustom, offsetYCustom);
    //   allObjects.push(textObj);

    //   const messageToServer: string = 'drawObj:::' + JSON.stringify(textObj) + ':::';

    //   socket.send(messageToServer.length as unknown as string);
    //   socket.send(messageToServer);

    //   mainContainer.prepend(newInput);
    //   // newInput.focus();
    //   // document.getElementById(newId)?.focus();

    //   // newInput.style.fontSize = textObj.

    //   newInput.addEventListener('focus', (event) => {
    //     newInput.style.outline = '2px solid black';
    //     isTyping = true;
    //   });

    //   newInput.addEventListener('blur', (event) => {
    //     if (newInput.value.length !== 0) {
    //       newInput.style.outline = 'none';
    //     }
    //     isTyping = false;
    //   });

    //   newInput.addEventListener('input', textChangedEvent);
    //   newInput.addEventListener('resize', resizeTextEvent);

    //   new ResizeObserver(resize).observe(newInput);

    //   currentCursor = 'pointer';

    //   shapeBtns.forEach((shapeButton) => {
    //     shapeButton.classList.remove('active-shape');
    //   });
    //   document.getElementById('pointer-btn')?.classList.add('active-shape');
    // }

    // if (currentCursor === 'image') {
    // }
  }
};

const onCanvasPointerUp = (event: PointerEvent) => {
  if (event.button === 1) {
    // canvasElement.style.cursor = 'default';
  }
  if (event.button === 2) return;
  if (isResize) {
    isResize = false;
    return;
  }
  isDraw.value = false;

  const element = event.target as HTMLElement;
  if (element.id !== 'canvas') return;

  if (isOnCanvas.value === false) return;

  switch (cursorStore.cursor) {
    // case 'image': {
    //   return;
    // }
    // case 'text': {
    //   return;
    // }
    case 'pointer': {
      return;
    }

    case 'pen': {
      const pointsToDraw: number[][] = [];
      for (let index = 0; index < currentLine.value.length; index++) {
        const element = currentLine.value[index];
        pointsToDraw.push([element[0] * currentZoom, element[1] * currentZoom]);
      }

      const curve = getNewCurve();

      // console.log('curve !!!!', curve);
      curve.zoom = currentZoom;
      allObjects.value = [...allObjects.value, curve];
      fullReDraw();
      break;
    }
    case 'line': {
      fullReDraw();

      const line = new LineObject(
        optionsStore.colors.fillColor,
        optionsStore.lineWidth,
        [
          (cursorXStart - offsetXCustom.value) / currentZoom,
          (cursorYStart - offsetYCustom.value) / currentZoom,
        ],
        [
          (event.clientX - offsetXCustom.value) / currentZoom,
          (event.clientY - offsetYCustom.value) / currentZoom,
        ],
        roughCanvas.value,
        myId,
      );

      line.zoom = currentZoom;
      allObjects.value = [...allObjects.value, line];
      fullReDraw();
      break;
    }
    case 'rectangle': {
      fullReDraw();

      const rect = new RectangleObject(
        optionsStore.colors.fillColor,
        optionsStore.lineWidth,
        [
          (cursorXStart - offsetXCustom.value) / currentZoom,
          (cursorYStart - offsetYCustom.value) / currentZoom,
        ],
        [
          event.shiftKey
            ? (event.clientX - offsetXCustom.value) / currentZoom
            : (event.clientX - offsetXCustom.value) / currentZoom,
          event.shiftKey
            ? (cursorYStart - offsetYCustom.value) / currentZoom +
              ((event.clientX - offsetXCustom.value) / currentZoom -
                (cursorXStart - offsetXCustom.value) / currentZoom)
            : (event.clientY - offsetYCustom.value) / currentZoom,
        ],
        optionsStore.fillStyle,
        roughCanvas.value,
        optionsStore.colors.borderColor,
        optionsStore.lineWidth,
        myId,
      );

      rect.zoom = currentZoom;
      rect.draw(offsetXCustom.value, offsetYCustom.value);
      allObjects.value.push(rect);
      break;
    }

    // case 'ellipse': {
    //   fullReDraw();

    //   const ellipse = new EllipseObject(
    //     optionsStore.fillStyle,
    //   optionsStore.lineWidth,
    //     [
    //       (cursorXStart - offsetXCustom.value) / currentZoom,
    //       (cursorYStart - offsetYCustom.value) / currentZoom,
    //     ],
    //     [
    //       event.shiftKey
    //         ? (event.clientX - offsetXCustom.value) / currentZoom
    //         : (event.clientX - offsetXCustom.value) / currentZoom,
    //       event.shiftKey
    //         ? (cursorYStart - offsetYCustom.value) / currentZoom +
    //           ((event.clientX - offsetXCustom.value) / currentZoom -
    //             (cursorXStart - offsetXCustom.value) / currentZoom)
    //         : (event.clientY - offsetYCustom.value) / currentZoom,
    //     ],
    //      optionsStore.colors.fillColor,
    //     roughCanvas.value,
    //      optionsStore.colors.borderColor,
    //     optionsStore.lineWidth,
    //     false,
    //     myId,
    //   );

    //   ellipse.zoom = currentZoom;
    //   ellipse.draw(offsetXCustom.value, offsetYCustom.value);
    //   allObjects.value.push(ellipse);
    //   break;
    // }
    default:
      break;
  }
};

const onCanvasPointerMove = (event: PointerEvent) => {
  const element = event.target as HTMLElement;

  // const trailerX = event.clientX - trailer.offsetWidth / 2;
  // const trailerY = event.clientY - trailer.offsetHeight / 2;

  if (element.id === 'canvas') {
    // animateCursor(trailerX, trailerY, trailer);
    // const memessageToServer: string =
    //   'cur:::' +
    //   myId +
    //   ':::' +
    //   +(event.clientX / currentZoom - offsetXCustom / currentZoom) +
    //   ':::' +
    //   +(event.clientY / currentZoom - offsetYCustom / currentZoom) +
    //   ':::';
    // socket.send(memessageToServer.length as unknown as string);
    // socket.send(memessageToServer);
  }

  if (isResize) {
    // offsetXCustom = event.clientX - cursorX;
    // offsetYCustom = event.clientY - cursorY;
    // fullReDraw();
    // return;
  }

  if (!isDraw.value) return;

  const cursorXCurrent = event.clientX;
  const cursorYCurrent = event.clientY;

  switch (cursorStore.cursor) {
    case 'pointer': {
      break;
    }

    case 'eraser': {
      const prevCount = allObjects.value.length;
      allObjects.value = allObjects.value.filter((item) => {
        if (item.typeName === 'curve') {
          if (
            (item as CurveObject).isCloseToPoints(
              event.clientX / currentZoom - offsetXCustom.value / currentZoom,
              event.clientY / currentZoom - offsetYCustom.value / currentZoom,
              10,
            )
          ) {
            deleteObj(item);

            return false;
          }
        } else if (item.typeName === 'rectangle') {
          if (
            (item as RectangleObject).isOverlay(
              -event.clientX + offsetXCustom.value,
              -event.clientY + offsetYCustom.value,
              1,
              1,
            )
          ) {
            deleteObj(item);
            return false;
          }
        } else if (item.typeName === 'line') {
          if (
            (item as LineObject).isCloseToPoints(
              event.clientX / currentZoom - offsetXCustom.value / currentZoom,
              event.clientY / currentZoom - offsetYCustom.value / currentZoom,
              25,
            )
          ) {
            deleteObj(item);
            return false;
          }
        } else if (item.typeName === 'ellipse') {
          if (
            (item as EllipseObject).closeToCentre(
              event.clientX / currentZoom - offsetXCustom.value / currentZoom,
              event.clientY / currentZoom - offsetYCustom.value / currentZoom,
            )
          ) {
            deleteObj(item);
            return false;
          }
        }

        return true;
      });

      if (prevCount !== allObjects.value.length) {
        fullReDraw();
      }
      break;
    }

    case 'pen': {
      if (prevX.value == null || prevY.value == null || !isDraw.value) {
        prevX.value = event.clientX;
        prevY.value = event.clientY;
        return;
      }

      const currentX = event.clientX;
      const currentY = event.clientY;

      counter.value++;
      if (counter.value % step.value === 0) {
        currentLine.value.push([
          (currentX - offsetXCustom.value) / currentZoom,
          (currentY - offsetYCustom.value) / currentZoom,
        ]);

        fullReDraw();

        const curve = getNewCurve();
        curve.zoom = currentZoom;
        curve.draw(offsetXCustom.value, offsetYCustom.value);
      }

      prevX.value = currentX;
      prevY.value = currentY;
      break;
    }

    case 'rectangle': {
      fullReDraw();

      if (event.shiftKey) {
      }

      const rect = new RectangleObject(
        optionsStore.colors.fillColor,
        optionsStore.lineWidth,
        [
          (cursorXStart - offsetXCustom.value) / currentZoom,
          (cursorYStart - offsetYCustom.value) / currentZoom,
        ],
        [
          event.shiftKey
            ? (cursorXCurrent - offsetXCustom.value) / currentZoom
            : (cursorXCurrent - offsetXCustom.value) / currentZoom,
          event.shiftKey
            ? (cursorYStart - offsetYCustom.value) / currentZoom +
              ((cursorXCurrent - offsetXCustom.value) / currentZoom -
                (cursorXStart - offsetXCustom.value) / currentZoom)
            : (cursorYCurrent - offsetYCustom.value) / currentZoom,
        ],
        optionsStore.fillStyle,
        roughCanvas.value,
        optionsStore.colors.borderColor,
        optionsStore.lineWidth,
        myId,
      );

      rect.zoom = currentZoom;
      rect.draw(offsetXCustom.value, offsetYCustom.value);
      break;
    }

    case 'line': {
      fullReDraw();

      // let line;

      // if (event.shiftKey) {
      //     // Calculate the slope of the line
      //     const slope =
      //         (cursorYCurrent - cursorYStart) /
      //         (cursorXCurrent - cursorXStart);

      //     if (Math.abs(slope) <= 1) {
      //         // Horizontal or 45-degree line
      //         if (Math.abs(Math.abs(slope) - 1) < 0.6) {
      //             // 45-degree line
      //             // мб нужно найти длину отрезка
      //             let d = Math.sqrt(Math.pow(cursorXStart - cursorXCurrent, 2) + Math.pow(cursorYStart - cursorYCurrent, 2));

      //             line = new LineObject(
      //                 ctx.fillStyle as string,
      //                 +ctx.lineWidth,
      //                 [
      //                     (cursorXStart - offsetXCustom) / currentZoom,
      //                     (cursorYStart - offsetYCustom) / currentZoom,
      //                 ],
      //                 [
      //                     ((cursorXStart + d * Math.cos(45)) - offsetXCustom) / currentZoom,
      //                     ((cursorYStart + d * Math.sin(45)) - offsetYCustom) / currentZoom,
      //                 ],
      //                 roughCanvas,
      //                 myId
      //             );
      //         } else {
      //             // Horizontal line
      //             line = new LineObject(
      //                 ctx.fillStyle as string,
      //                 +ctx.lineWidth,
      //                 [
      //                     (cursorXStart - offsetXCustom) / currentZoom,
      //                     (cursorYStart - offsetYCustom) / currentZoom,
      //                 ],
      //                 [
      //                     (cursorXCurrent - offsetXCustom) / currentZoom,
      //                     (cursorYStart - offsetYCustom) / currentZoom,
      //                 ],
      //                 roughCanvas,
      //                 myId
      //             );
      //         }
      //     } else {
      //         // Vertical line
      //         line = new LineObject(
      //             ctx.fillStyle as string,
      //             +ctx.lineWidth,
      //             [
      //                 (cursorXStart - offsetXCustom) / currentZoom,
      //                 (cursorYStart - offsetYCustom) / currentZoom,
      //             ],
      //             [
      //                 (cursorXStart - offsetXCustom) / currentZoom,
      //                 (cursorYCurrent - offsetYCustom) / currentZoom,
      //             ],
      //             roughCanvas,
      //             myId
      //         );
      //     }
      // } else {
      //     // Normal line (not drawn in a straight line)
      //     line = new LineObject(
      //         ctx.fillStyle as string,
      //         +ctx.lineWidth,
      //         [
      //             (cursorXStart - offsetXCustom) / currentZoom,
      //             (cursorYStart - offsetYCustom) / currentZoom,
      //         ],
      //         [
      //             (cursorXCurrent - offsetXCustom) / currentZoom,
      //             (cursorYCurrent - offsetYCustom) / currentZoom,
      //         ],
      //         roughCanvas,
      //         myId
      //     );
      // }

      let line;
      if (event.shiftKey) {
        console.log('shift');
        // Calculate the slope of the line
        const slope = (cursorYCurrent - cursorYStart) / (cursorXCurrent - cursorXStart);

        // Set the endpoints of the line so that it is drawn in a straight line
        // (horizontally, vertically, or at a 45-degree angle)
        if (Math.abs(slope) <= 1) {
          // Horizontal or 45-degree line
          line = new LineObject(
            optionsStore.colors.fillColor,
            optionsStore.lineWidth,
            [
              (cursorXStart - offsetXCustom.value) / currentZoom,
              (cursorYStart - offsetYCustom.value) / currentZoom,
            ],
            [
              (cursorXCurrent - offsetXCustom.value) / currentZoom,
              (cursorYStart - offsetYCustom.value) / currentZoom,
            ],
            roughCanvas.value,
            myId,
          );
        } else {
          // Vertical line
          line = new LineObject(
            optionsStore.colors.fillColor,
            optionsStore.lineWidth,
            [
              (cursorXStart - offsetXCustom.value) / currentZoom,
              (cursorYStart - offsetYCustom.value) / currentZoom,
            ],
            [
              (cursorXStart - offsetXCustom.value) / currentZoom,
              (cursorYCurrent - offsetYCustom.value) / currentZoom,
            ],
            roughCanvas.value,
            myId,
          );
        }
      } else {
        // Normal line (not drawn in a straight line)
        line = new LineObject(
          optionsStore.colors.fillColor,
          optionsStore.lineWidth,
          [
            (cursorXStart - offsetXCustom.value) / currentZoom,
            (cursorYStart - offsetYCustom.value) / currentZoom,
          ],
          [
            (cursorXCurrent - offsetXCustom.value) / currentZoom,
            (cursorYCurrent - offsetYCustom.value) / currentZoom,
          ],
          roughCanvas.value,
          myId,
        );
      }

      line.zoom = currentZoom;
      line.draw(offsetXCustom.value, offsetYCustom.value);

      break;
    }

    // case 'ellipse': {
    //   fullReDraw();

    //   const ellipse = new EllipseObject(
    //     optionsStore.fillStyle,
    //   optionsStore.lineWidth,
    //     [
    //       (cursorXStart - offsetXCustom.value) / currentZoom,
    //       (cursorYStart - offsetYCustom.value) / currentZoom,
    //     ],
    //     [
    //       event.shiftKey
    //         ? (event.clientX - offsetXCustom.value) / currentZoom
    //         : (event.clientX - offsetXCustom.value) / currentZoom,
    //       event.shiftKey
    //         ? (cursorYStart - offsetYCustom.value) / currentZoom +
    //           ((event.clientX - offsetXCustom.value) / currentZoom -
    //             (cursorXStart - offsetXCustom.value) / currentZoom)
    //         : (event.clientY - offsetYCustom.value) / currentZoom,
    //     ],
    //      optionsStore.colors.fillColor,
    //     roughCanvas.value,
    //      optionsStore.colors.borderColor,
    //     optionsStore.lineWidth,
    //     false,
    //     myId,
    //   );

    //   ellipse.zoom = currentZoom;
    //   ellipse.draw(offsetXCustom.value, offsetYCustom.value);

    //   break;
    // }

    default:
      break;
  }
};

const handleClose = (event: CustomEvent) => {
  console.log('Соединение закрыто', event.detail);
};

const handleMove = (event: CustomEvent) => {
  const data = event.detail as string[];
  // реализовать
  console.log('Получена команда move:', data);
};

const handleClear = (event: CustomEvent) => {
  console.log('Получена команда clear', event.detail);
  // Здесь можно выполнить очистку canvas, обновить состояние и т.п.
};

function createSocketConnection() {
  socket.value.addEventListener('move', handleMove as EventListener);
  socket.value.addEventListener('clear', handleClear as EventListener);
  socket.value.addEventListener('close', handleClose as EventListener);

  socket.value.send({ command: 'test', message: 'Hello, server' });
}
</script>

<template>
  <div id="me" class="trailer"></div>
  <Confirm />
  <CursorContainer />
  <OptionsContainer />
  <ZoomContainer />
  <SettingsContainer />
  <canvas
    id="canvas"
    ref="canvasElement"
    @pointerdown.stop="onCanvasPointerDown"
    @pointerup="onCanvasPointerUp"
    @pointermove="onCanvasPointerMove"
  ></canvas>
</template>

<style scoped></style>

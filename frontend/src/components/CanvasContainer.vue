<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import {
  BaseObject,
  CurveObject,
  LineObject,
  RectangleObject,
  EllipseObject,
} from '@/constructors';
import { testToast } from '@/services/toastify';
import { WebSocketService } from '@/services/webSocketService';
import { constantsForKeyboard, useCursorStore } from '@/stores/cursor';
import { useOptionsStore } from '@/stores/options';
import { useZoomStore } from '@/stores/zoom';
import type { CurveProps, EllipseProps, LineProps, RectangleProps } from '@/types';
import { getTypedDrawObject } from '@/utils';
import { useEventListener } from '@vueuse/core';
import rough from 'roughjs';

import { onMounted, ref, useTemplateRef, watch } from 'vue';

const cursorStore = useCursorStore();
const optionsStore = useOptionsStore();
const zoomStore = useZoomStore();

const socket = new WebSocketService();

const canvasElement = useTemplateRef<HTMLCanvasElement>('canvasElement');
const canvasContext = ref<CanvasRenderingContext2D>();
const roughCanvas = ref();

const allObjects = ref<BaseObject[]>([]);

const cursorY = ref(0);
const cursorX = ref(0);

const offsetXCustom = ref(0);
const offsetYCustom = ref(0);

const cursorXStart = ref(0);
const cursorYStart = ref(0);

const currentCoordinates = ref<number[][]>([]);

const isDrawing = ref(false);
const isOnCanvas = ref(false);
const isSpacePressed = ref(false);
const isMoving = ref(false);

const userId = '123';

const handleClose = (event: CustomEvent) => {
  console.log('Соединение закрыто', event.detail);
};

const handleMessage = (event: CustomEvent) => {
  testToast(event.detail[1]);
};

const handleMove = (event: CustomEvent) => {
  const data = event.detail as string[];
  console.log('Получена команда move:', data);
};

const handleClear = (event: CustomEvent) => {
  console.log('Получена команда clear', event.detail);
};

const handleCur = (event: CustomEvent) => {
  const userId = event.detail[1];
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
      +event.detail[2] * zoomStore.zoom + offsetXCustom.value
    }px, ${(+event.detail[3] * zoomStore.zoom, +offsetYCustom.value)}px)`,
  };

  t.animate(keyFrames, {
    fill: 'forwards',
  });
};

const handleDraw = (event: CustomEvent) => {
  const obj = getTypedDrawObject(
    event.detail[1],
    roughCanvas.value,
    canvasContext.value as CanvasRenderingContext2D,
  );

  if (!obj) {
    return;
  }

  allObjects.value = [...allObjects.value, obj];
  obj.draw(offsetXCustom.value, offsetYCustom.value, zoomStore.zoom);
};

const createSocketConnection = () => {
  useEventListener(socket, 'move', handleMove);
  useEventListener(socket, 'clear', handleClear);
  useEventListener(socket, 'close', handleClose);
  useEventListener(socket, 'message', handleMessage);
  useEventListener(socket, 'drawObj', handleDraw);
  useEventListener(socket, 'cur', handleCur);
};

const redrawWithOffset = () => {
  for (let index = 0; index < allObjects.value.length; index++) {
    const element = allObjects.value[index];

    if (
      element.isOverlay(
        offsetXCustom.value,
        offsetYCustom.value,
        canvasElement.value?.clientWidth ?? 0,
        canvasElement.value?.clientHeight ?? 0,
        zoomStore.zoom,
      )
    ) {
      element.draw(offsetXCustom.value, offsetYCustom.value, zoomStore.zoom ?? 1);
    }
  }
};

const clearCanvas = () => {
  canvasContext.value?.clearRect(
    0,
    0,
    document.documentElement.clientWidth,
    document.documentElement.clientHeight,
  );
};

const redrawWithClearing = () => {
  clearCanvas();
  redrawWithOffset();
};

const updateCanvasSize = () => {
  if (!canvasElement.value) return;

  canvasElement.value.width = window.innerWidth;
  canvasElement.value.height = window.innerHeight;
  redrawWithClearing();
};

const getNewCurveObject = () => {
  if (!canvasContext.value) return;

  const curveProps: CurveProps = {
    userId: userId,
    ctx: canvasContext.value,
    color: optionsStore.getterColorsWithOpacity.fillColor,
    pointsList: currentCoordinates.value,
    width: optionsStore.lineWidth,
    zoom: zoomStore.zoom,
  };

  const curve = new CurveObject(curveProps);

  return curve;
};

const getNewRectObject = (event: PointerEvent) => {
  const rectangleProps: RectangleProps = {
    color: optionsStore.getterColorsWithOpacity.fillColor,
    width: optionsStore.lineWidth,
    fillStyle: optionsStore.fillStyle,
    roughCanvas: roughCanvas.value,
    stroke: optionsStore.getterColorsWithOpacity.borderColor,
    strokeWidth: optionsStore.lineWidth,
    userId: userId,
    startPoint: [
      (cursorXStart.value - offsetXCustom.value) / zoomStore.zoom,
      (cursorYStart.value - offsetYCustom.value) / zoomStore.zoom,
    ],
    endPoint: [
      event.shiftKey
        ? (event.clientX - offsetXCustom.value) / zoomStore.zoom
        : (event.clientX - offsetXCustom.value) / zoomStore.zoom,
      event.shiftKey
        ? (cursorYStart.value - offsetYCustom.value) / zoomStore.zoom +
          ((event.clientX - offsetXCustom.value) / zoomStore.zoom -
            (cursorXStart.value - offsetXCustom.value) / zoomStore.zoom)
        : (event.clientY - offsetYCustom.value) / zoomStore.zoom,
    ],
  };

  return new RectangleObject(rectangleProps);
};

const eraseObject = (obj: BaseObject) => {
  // bufferObj.value = [...bufferObj.value, obj];
  // const a = JSON.stringify(obj);
  // const messageToServer: string = 'delete:::' + a;
  // const utf8Encode = new TextEncoder();
  // const array = utf8Encode.encode(messageToServer);
  // socket.send(array.length as unknown as string);
  // socket.send(array);
};

const onCanvasPointerDown = (event: PointerEvent) => {
  if (event.button === 1 || (isSpacePressed.value && event.button === 0)) {
    isMoving.value = true;
    cursorX.value = event.clientX - offsetXCustom.value;
    cursorY.value = event.clientY - offsetYCustom.value;

    // canvasElement.style.cursor = 'grabbing';
    return;
  }

  const targetElement = event.target as HTMLElement;

  if (targetElement === null || targetElement.id !== 'canvas') {
    isOnCanvas.value = false;

    return;
  }

  isDrawing.value = true;
  isOnCanvas.value = true;

  currentCoordinates.value = [];

  cursorXStart.value = event.clientX;
  cursorYStart.value = event.clientY;
};

const onCanvasPointerUp = (event: PointerEvent) => {
  const element = event.target as HTMLElement;

  if (event.button === 2 || element.id !== 'canvas' || isOnCanvas.value === false) return;

  if (isMoving.value) {
    isMoving.value = false;
    return;
  }

  isDrawing.value = false;

  let currentDrawing: BaseObject | undefined;

  switch (cursorStore.cursor) {
    case 'pen': {
      currentDrawing = getNewCurveObject();

      break;
    }

    case 'line': {
      const lineObjectProps: LineProps = {
        color: optionsStore.getterColorsWithOpacity.fillColor,
        width: optionsStore.lineWidth,
        roughCanvas: roughCanvas.value,
        userId: userId,
        startPoint: [
          (cursorXStart.value - offsetXCustom.value) / zoomStore.zoom,
          (cursorYStart.value - offsetYCustom.value) / zoomStore.zoom,
        ],
        endPoint: [
          (event.clientX - offsetXCustom.value) / zoomStore.zoom,
          (event.clientY - offsetYCustom.value) / zoomStore.zoom,
        ],
      };

      currentDrawing = new LineObject(lineObjectProps);

      break;
    }

    case 'rectangle': {
      currentDrawing = getNewRectObject(event);

      break;
    }

    case 'ellipse': {
      const ellipseProps: EllipseProps = {
        color: optionsStore.getterColorsWithOpacity.fillColor,
        width: optionsStore.lineWidth,
        startPoint: [
          (cursorXStart.value - offsetXCustom.value) / zoomStore.zoom,
          (cursorYStart.value - offsetYCustom.value) / zoomStore.zoom,
        ],
        endPoint: [
          event.shiftKey
            ? (event.clientX - offsetXCustom.value) / zoomStore.zoom
            : (event.clientX - offsetXCustom.value) / zoomStore.zoom,
          event.shiftKey
            ? (cursorYStart.value - offsetYCustom.value) / zoomStore.zoom +
              ((event.clientX - offsetXCustom.value) / zoomStore.zoom -
                (cursorXStart.value - offsetXCustom.value) / zoomStore.zoom)
            : (event.clientY - offsetYCustom.value) / zoomStore.zoom,
        ],
        fillStyle: optionsStore.fillStyle,
        roughCanvas: roughCanvas.value,
        stroke: optionsStore.getterColorsWithOpacity.borderColor,
        strokeWidth: optionsStore.lineWidth,
        isCircle: false,
        userId: userId,
      };

      currentDrawing = new EllipseObject(ellipseProps);
      break;
    }

    default:
      break;
  }

  if (!currentDrawing) {
    return;
  }

  allObjects.value = [...allObjects.value, currentDrawing];

  redrawWithClearing();
};

const onCanvasPointerMove = (event: PointerEvent) => {
  const element = event.target as HTMLElement;

  // const trailerX = event.clientX - trailer.offsetWidth / 2;
  // const trailerY = event.clientY - trailer.offsetHeight / 2;

  if (element.id === 'canvas') {
    //animateCursor(trailerX, trailerY, trailer);

    const messageToServer = [
      'cur',
      userId,
      event.clientX / zoomStore.zoom - offsetXCustom.value / zoomStore.zoom,
      event.clientY / zoomStore.zoom - offsetYCustom.value / zoomStore.zoom,
    ].map(String);

    socket.send(messageToServer.length);
    socket.send(messageToServer);
  }

  if (isMoving.value) {
    offsetXCustom.value = event.clientX - cursorX.value;
    offsetYCustom.value = event.clientY - cursorY.value;
    redrawWithClearing();

    return;
  }

  if (!isDrawing.value) return;

  const cursorXCurrent = event.clientX;
  const cursorYCurrent = event.clientY;

  switch (cursorStore.cursor) {
    case 'eraser': {
      const allObjectsCount = allObjects.value.length;

      allObjects.value = allObjects.value.filter((drawObject) => {
        if (drawObject.drawType === 'pen') {
          if (
            (drawObject as CurveObject).isCloseToPoints(
              cursorXCurrent / zoomStore.zoom - offsetXCustom.value / zoomStore.zoom,
              cursorYCurrent / zoomStore.zoom - offsetYCustom.value / zoomStore.zoom,
              10,
            )
          ) {
            eraseObject(drawObject);

            return false;
          }
        } else if (drawObject.drawType === 'rectangle') {
          if (
            (drawObject as RectangleObject).isOverlay(
              -cursorYCurrent + offsetXCustom.value,
              -event.clientY + offsetYCustom.value,
              1,
              1,
              zoomStore.zoom,
            )
          ) {
            eraseObject(drawObject);
            return false;
          }
        } else if (drawObject.drawType === 'line') {
          if (
            (drawObject as LineObject).isCloseToPoints(
              cursorYCurrent / zoomStore.zoom - offsetXCustom.value / zoomStore.zoom,
              cursorYCurrent / zoomStore.zoom - offsetYCustom.value / zoomStore.zoom,
              25,
            )
          ) {
            eraseObject(drawObject);
            return false;
          }
        } else if (drawObject.drawType === 'ellipse') {
          if (
            (drawObject as EllipseObject).closeToCentre(
              cursorYCurrent / zoomStore.zoom - offsetXCustom.value / zoomStore.zoom,
              cursorYCurrent / zoomStore.zoom - offsetYCustom.value / zoomStore.zoom,
            )
          ) {
            eraseObject(drawObject);
            return false;
          }
        }

        return true;
      });

      if (allObjectsCount !== allObjects.value.length) {
        redrawWithClearing();
      }
      break;
    }

    case 'pen': {
      const currentX = cursorXCurrent;
      const currentY = cursorYCurrent;

      // counter.value++;

      // if (counter.value) {
      currentCoordinates.value.push([
        (currentX - offsetXCustom.value) / zoomStore.zoom,
        (currentY - offsetYCustom.value) / zoomStore.zoom,
      ]);

      // без этого сначала рисуется не оч красиво, а когда отпускаешь становится норм, но думаю на производительность давит
      redrawWithClearing();

      const curve = getNewCurveObject();

      curve?.draw(offsetXCustom.value, offsetYCustom.value, zoomStore.zoom);
      // }

      break;
    }

    case 'rectangle': {
      if (event.shiftKey) {
      }

      const rect = getNewRectObject(event);

      redrawWithClearing();

      rect.draw(offsetXCustom.value, offsetYCustom.value, zoomStore.zoom);
      break;
    }

    case 'line': {
      const lineObjectProps: LineProps = {
        color: optionsStore.getterColorsWithOpacity.fillColor,
        width: optionsStore.lineWidth,
        roughCanvas: roughCanvas.value,
        userId: userId,
        startPoint: [
          (cursorXStart.value - offsetXCustom.value) / zoomStore.zoom,
          (cursorYStart.value - offsetYCustom.value) / zoomStore.zoom,
        ],
        endPoint: [
          (cursorXCurrent - offsetXCustom.value) / zoomStore.zoom,
          (cursorYCurrent - offsetYCustom.value) / zoomStore.zoom,
        ],
      };

      const line = new LineObject(lineObjectProps);

      redrawWithClearing();

      line.draw(offsetXCustom.value, offsetYCustom.value, zoomStore.zoom);

      break;
    }

    case 'ellipse': {
      const ellipseProps: EllipseProps = {
        color: optionsStore.getterColorsWithOpacity.fillColor,
        width: optionsStore.lineWidth,
        startPoint: [
          (cursorXStart.value - offsetXCustom.value) / zoomStore.zoom,
          (cursorYStart.value - offsetYCustom.value) / zoomStore.zoom,
        ],
        endPoint: [
          event.shiftKey
            ? (cursorXCurrent - offsetXCustom.value) / zoomStore.zoom
            : (cursorXCurrent - offsetXCustom.value) / zoomStore.zoom,
          event.shiftKey
            ? (cursorYStart.value - offsetYCustom.value) / zoomStore.zoom +
              ((cursorXCurrent - offsetXCustom.value) / zoomStore.zoom -
                (cursorXStart.value - offsetXCustom.value) / zoomStore.zoom)
            : (cursorYCurrent - offsetYCustom.value) / zoomStore.zoom,
        ],
        fillStyle: optionsStore.fillStyle,
        roughCanvas: roughCanvas.value,
        stroke: optionsStore.getterColorsWithOpacity.borderColor,
        strokeWidth: optionsStore.lineWidth,
        isCircle: false,
        userId: userId,
      };

      const ellipse = new EllipseObject(ellipseProps);

      redrawWithClearing();

      ellipse.draw(offsetXCustom.value, offsetYCustom.value, zoomStore.zoom);

      break;
    }

    default:
      break;
  }
};

const onKeyDown = (event: KeyboardEvent) => {
  const code = event.code;

  if (code === 'Space') {
    isSpacePressed.value = true;

    return;
  }

  if (code === 'Minus') {
    zoomStore.decreaseZoom();

    return;
  }

  if (code === 'Equal') {
    zoomStore.increaseZoom();

    return;
  }

  if (!code.startsWith('Digit')) {
    return;
  }

  const keyCodeArr = code.split('Digit');
  const keyboardNumber = keyCodeArr[1];

  const newCursor = constantsForKeyboard[keyboardNumber];

  cursorStore.setCursor(newCursor);
};

const onKeyUp = (event: KeyboardEvent) => {
  if (event.code === 'Space') {
    isSpacePressed.value = false;
  }
};

onMounted(() => {
  if (!canvasElement.value) {
    return;
  }

  if (!canvasContext.value) {
    canvasContext.value = canvasElement.value.getContext('2d') as CanvasRenderingContext2D;
  }

  if (!roughCanvas.value) {
    roughCanvas.value = rough.canvas(canvasElement.value);
  }

  canvasElement.value.width = window.innerWidth;
  canvasElement.value.height = window.innerHeight;

  createSocketConnection();

  useEventListener(window, 'resize', updateCanvasSize);
  useEventListener(window, 'keydown', onKeyDown);
  useEventListener(window, 'keyup', onKeyUp);
});

watch(zoomStore, () => {
  redrawWithClearing();
});
</script>

<template>
  <canvas
    id="canvas"
    ref="canvasElement"
    @pointerdown.stop="onCanvasPointerDown"
    @pointerup="onCanvasPointerUp"
    @pointermove="onCanvasPointerMove"
  ></canvas>
</template>

<style lang="css">
#canvas {
  overflow: hidden;
  background-color: var(--clr-canvas);
  width: 100%;
  height: 100vh;
}
</style>

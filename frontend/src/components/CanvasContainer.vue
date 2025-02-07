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
import { useCursorStore } from '@/stores/cursor';
import { useOptionsStore } from '@/stores/options';
import type { CurveProps, EllipseProps, LineProps, RectangleProps } from '@/types';
import { getTypedDrawObject } from '@/utils';
import rough from 'roughjs';

import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue';

const socket = ref(new WebSocketService());
const abortController = new AbortController();

const canvasElement = useTemplateRef<HTMLCanvasElement>('canvasElement');
const canvasContext = ref<CanvasRenderingContext2D>();
const roughCanvas = ref();

const allObjects = ref<BaseObject[]>([]);
const bufferObj = ref<BaseObject[]>([]);

const offsetXCustom = ref(0);
const offsetYCustom = ref(0);

const cursorStore = useCursorStore();
const optionsStore = useOptionsStore();

const step = ref(1);
const counter = ref(0);
const currentCoordinates = ref<number[][]>([]);

const prevX = ref(0);
const prevY = ref(0);

const isDrawing = ref(false);
const isOnCanvas = ref(false);
const isSpacePressed = ref(false);
const isMoving = ref(false);
const cursorY = ref(0);
const cursorX = ref(0);

const currentZoom = 1;

const isTyping = false;

const cursorXStart = ref(0);
const cursorYStart = ref(0);

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

const handleDraw = (event: CustomEvent) => {
  // хз что это но оно не работает
  // const obj = getTypedDrawObject(
  //   event.detail[1],
  //   roughCanvas.value,
  //   canvasContext.value as CanvasRenderingContext2D,
  // );
  // allObjects.value = [...allObjects.value, obj];
  // obj.draw(offsetXCustom.value, offsetYCustom.value);
};

const createSocketConnection = () => {
  socket.value.addEventListener('move', handleMove as EventListener);
  socket.value.addEventListener('clear', handleClear as EventListener);
  socket.value.addEventListener('close', handleClose as EventListener);
  socket.value.addEventListener('message', handleMessage as EventListener);
  socket.value.addEventListener('drawObj', handleDraw as EventListener);

  socket.value.send({ command: 'test', message: 'Hello, server' });
};

const redrawWithOffset = () => {
  console.log({ allObjects });
  for (let index = 0; index < allObjects.value.length; index++) {
    const element = allObjects.value[index];

    if (
      element.isOverlay(
        offsetXCustom.value,
        offsetYCustom.value,
        canvasElement.value?.clientWidth ?? 0,
        canvasElement.value?.clientHeight ?? 0,
      )
    ) {
      element.draw(offsetXCustom.value, offsetYCustom.value);
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
  };

  const curve = new CurveObject(curveProps);
  curve.zoom = currentZoom;

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
      (cursorXStart.value - offsetXCustom.value) / currentZoom,
      (cursorYStart.value - offsetYCustom.value) / currentZoom,
    ],
    endPoint: [
      event.shiftKey
        ? (event.clientX - offsetXCustom.value) / currentZoom
        : (event.clientX - offsetXCustom.value) / currentZoom,
      event.shiftKey
        ? (cursorYStart.value - offsetYCustom.value) / currentZoom +
          ((event.clientX - offsetXCustom.value) / currentZoom -
            (cursorXStart.value - offsetXCustom.value) / currentZoom)
        : (event.clientY - offsetYCustom.value) / currentZoom,
    ],
  };

  return new RectangleObject(rectangleProps);
};

const eraseObject = (obj: BaseObject) => {
  bufferObj.value = [...bufferObj.value, obj];

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

  counter.value = 0;
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
          (cursorXStart.value - offsetXCustom.value) / currentZoom,
          (cursorYStart.value - offsetYCustom.value) / currentZoom,
        ],
        endPoint: [
          (event.clientX - offsetXCustom.value) / currentZoom,
          (event.clientY - offsetYCustom.value) / currentZoom,
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
          (cursorXStart.value - offsetXCustom.value) / currentZoom,
          (cursorYStart.value - offsetYCustom.value) / currentZoom,
        ],
        endPoint: [
          event.shiftKey
            ? (event.clientX - offsetXCustom.value) / currentZoom
            : (event.clientX - offsetXCustom.value) / currentZoom,
          event.shiftKey
            ? (cursorYStart.value - offsetYCustom.value) / currentZoom +
              ((event.clientX - offsetXCustom.value) / currentZoom -
                (cursorXStart.value - offsetXCustom.value) / currentZoom)
            : (event.clientY - offsetYCustom.value) / currentZoom,
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
              cursorXCurrent / currentZoom - offsetXCustom.value / currentZoom,
              cursorYCurrent / currentZoom - offsetYCustom.value / currentZoom,
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
            )
          ) {
            eraseObject(drawObject);
            return false;
          }
        } else if (drawObject.drawType === 'line') {
          if (
            (drawObject as LineObject).isCloseToPoints(
              cursorYCurrent / currentZoom - offsetXCustom.value / currentZoom,
              cursorYCurrent / currentZoom - offsetYCustom.value / currentZoom,
              25,
            )
          ) {
            eraseObject(drawObject);
            return false;
          }
        } else if (drawObject.drawType === 'ellipse') {
          if (
            (drawObject as EllipseObject).closeToCentre(
              cursorYCurrent / currentZoom - offsetXCustom.value / currentZoom,
              cursorYCurrent / currentZoom - offsetYCustom.value / currentZoom,
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
      if (prevX.value == null || prevY.value == null || !isDrawing.value) {
        prevX.value = cursorXCurrent;
        prevY.value = cursorYCurrent;
        return;
      }

      const currentX = cursorXCurrent;
      const currentY = cursorYCurrent;

      counter.value++;

      if (counter.value % step.value === 0) {
        currentCoordinates.value.push([
          (currentX - offsetXCustom.value) / currentZoom,
          (currentY - offsetYCustom.value) / currentZoom,
        ]);

        // без этого сначала рисуется не оч красиво, а когда отпускаешь становится норм, но думаю на производительность давит
        // redrawWithClearing();

        const curve = getNewCurveObject();

        curve?.draw(offsetXCustom.value, offsetYCustom.value);
      }

      prevX.value = currentX;
      prevY.value = currentY;
      break;
    }

    case 'rectangle': {
      if (event.shiftKey) {
      }

      const rect = getNewRectObject(event);

      redrawWithClearing();

      rect.draw(offsetXCustom.value, offsetYCustom.value);
      break;
    }

    case 'line': {
      const lineObjectProps: LineProps = {
        color: optionsStore.getterColorsWithOpacity.fillColor,
        width: optionsStore.lineWidth,
        roughCanvas: roughCanvas.value,
        userId: userId,
        startPoint: [
          (cursorXStart.value - offsetXCustom.value) / currentZoom,
          (cursorYStart.value - offsetYCustom.value) / currentZoom,
        ],
        endPoint: [
          (cursorXCurrent - offsetXCustom.value) / currentZoom,
          (cursorYCurrent - offsetYCustom.value) / currentZoom,
        ],
      };

      const line = new LineObject(lineObjectProps);

      redrawWithClearing();

      line.draw(offsetXCustom.value, offsetYCustom.value);

      break;
    }

    case 'ellipse': {
      const ellipseProps: EllipseProps = {
        color: optionsStore.getterColorsWithOpacity.fillColor,
        width: optionsStore.lineWidth,
        startPoint: [
          (cursorXStart.value - offsetXCustom.value) / currentZoom,
          (cursorYStart.value - offsetYCustom.value) / currentZoom,
        ],
        endPoint: [
          event.shiftKey
            ? (cursorXCurrent - offsetXCustom.value) / currentZoom
            : (cursorXCurrent - offsetXCustom.value) / currentZoom,
          event.shiftKey
            ? (cursorYStart.value - offsetYCustom.value) / currentZoom +
              ((cursorXCurrent - offsetXCustom.value) / currentZoom -
                (cursorXStart.value - offsetXCustom.value) / currentZoom)
            : (cursorYCurrent - offsetYCustom.value) / currentZoom,
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

      ellipse.draw(offsetXCustom.value, offsetYCustom.value);

      break;
    }

    default:
      break;
  }
};

const onKeyDown = (event: KeyboardEvent) => {
  if (event.code === 'Space') {
    isSpacePressed.value = true;
  }
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

  window.addEventListener('resize', updateCanvasSize, { signal: abortController.signal });
  window.addEventListener('keydown', onKeyDown, { signal: abortController.signal });
  window.addEventListener('keyup', onKeyUp, { signal: abortController.signal });
});

onUnmounted(() => {
  abortController.abort();
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

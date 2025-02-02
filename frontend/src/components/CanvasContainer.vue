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
import rough from 'roughjs';

import { onMounted, ref, useTemplateRef } from 'vue';

const socket = ref(new WebSocketService());

const handleClose = (event: CustomEvent) => {
  console.log('Соединение закрыто', event.detail);
};

const handleMessage = (event: CustomEvent) => {
  testToast(event.detail[1]);
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

const canvasElement = useTemplateRef<HTMLCanvasElement>('canvasElement');
const ctx = ref<CanvasRenderingContext2D>();
const roughCanvas = ref();

const allObjects = ref<BaseObject[]>([]);

const offsetXCustom = ref(0);
const offsetYCustom = ref(0);

const cursorStore = useCursorStore();
const optionsStore = useOptionsStore();

const bufferObj = ref<BaseObject[]>([]);

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
const isTyping = false;

let cursorXStart = 0;
let cursorYStart = 0;

const myId = '123';

function createSocketConnection() {
  socket.value.addEventListener('move', handleMove as EventListener);
  socket.value.addEventListener('clear', handleClear as EventListener);
  socket.value.addEventListener('close', handleClose as EventListener);
  socket.value.addEventListener('message', handleMessage as EventListener);

  socket.value.send({ command: 'test', message: 'Hello, server' });
}

onMounted(() => {
  resizeCanvas();
  roughCanvas.value = rough.canvas(canvasElement.value as HTMLCanvasElement);
  ctx.value = canvasElement.value?.getContext('2d') as CanvasRenderingContext2D;

  createSocketConnection();
});

const resizeCanvas = () => {
  if (canvasElement.value) {
    canvasElement.value.width = window.innerWidth;
    canvasElement.value.height = window.innerHeight;
    ctx.value = canvasElement.value.getContext('2d') as CanvasRenderingContext2D;
    roughCanvas.value = rough.canvas(canvasElement.value);
  }
};

const reDraw = () => {
  // console.log(offsetXCustom + '  ' + offsetYCustom + '  ' + screenWidth + '   ' + screenHeight);

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
  reDraw();
};

const getNewCurve = () => {
  const curveProps: CurveProps = {
    userId: myId,
    ctx: ctx.value as CanvasRenderingContext2D,
    color: optionsStore.getterColorsWithOpacity.fillColor,
    pointsList: currentLine.value,
    width: optionsStore.lineWidth,
  };

  const curve = new CurveObject(curveProps);

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

const onCanvasPointerDown = (event: PointerEvent) => {
  if (event.button !== 0) {
    return;
  }

  const element = event.target as HTMLElement;

  if (element === null || element.id !== 'canvas') {
    isOnCanvas.value = false;

    return;
  }

  isDraw.value = true;
  isOnCanvas.value = true;

  counter.value = 0;
  currentLine.value = [];

  cursorXStart = event.clientX;
  cursorYStart = event.clientY;
};

const onCanvasPointerUp = (event: PointerEvent) => {
  const element = event.target as HTMLElement;

  if (event.button === 2 || element.id !== 'canvas' || isOnCanvas.value === false) return;

  if (isResize) {
    isResize = false;
    return;
  }

  isDraw.value = false;

  switch (cursorStore.cursor) {
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

      const lineObjectProps: LineProps = {
        color: optionsStore.getterColorsWithOpacity.fillColor,
        width: optionsStore.lineWidth,
        roughCanvas: roughCanvas.value,
        userId: myId,
        startPoint: [
          (cursorXStart - offsetXCustom.value) / currentZoom,
          (cursorYStart - offsetYCustom.value) / currentZoom,
        ],
        endPoint: [
          (event.clientX - offsetXCustom.value) / currentZoom,
          (event.clientY - offsetYCustom.value) / currentZoom,
        ],
      };

      const line = new LineObject(lineObjectProps);

      line.zoom = currentZoom;
      allObjects.value = [...allObjects.value, line];
      fullReDraw();
      break;
    }

    case 'rectangle': {
      fullReDraw();

      const rectangleProps: RectangleProps = {
        color: optionsStore.getterColorsWithOpacity.fillColor,
        width: optionsStore.lineWidth,
        fillStyle: optionsStore.fillStyle,
        roughCanvas: roughCanvas.value,
        stroke: optionsStore.getterColorsWithOpacity.borderColor,
        strokeWidth: optionsStore.lineWidth,
        userId: myId,
        startPoint: [
          (cursorXStart - offsetXCustom.value) / currentZoom,
          (cursorYStart - offsetYCustom.value) / currentZoom,
        ],
        endPoint: [
          event.shiftKey
            ? (event.clientX - offsetXCustom.value) / currentZoom
            : (event.clientX - offsetXCustom.value) / currentZoom,
          event.shiftKey
            ? (cursorYStart - offsetYCustom.value) / currentZoom +
              ((event.clientX - offsetXCustom.value) / currentZoom -
                (cursorXStart - offsetXCustom.value) / currentZoom)
            : (event.clientY - offsetYCustom.value) / currentZoom,
        ],
      };

      const rect = new RectangleObject(rectangleProps);

      rect.zoom = currentZoom;
      rect.draw(offsetXCustom.value, offsetYCustom.value);
      allObjects.value.push(rect);
      break;
    }

    case 'ellipse': {
      fullReDraw();

      const ellipseProps: EllipseProps = {
        color: optionsStore.getterColorsWithOpacity.fillColor,
        width: optionsStore.lineWidth,
        startPoint: [
          (cursorXStart - offsetXCustom.value) / currentZoom,
          (cursorYStart - offsetYCustom.value) / currentZoom,
        ],
        endPoint: [
          event.shiftKey
            ? (event.clientX - offsetXCustom.value) / currentZoom
            : (event.clientX - offsetXCustom.value) / currentZoom,
          event.shiftKey
            ? (cursorYStart - offsetYCustom.value) / currentZoom +
              ((event.clientX - offsetXCustom.value) / currentZoom -
                (cursorXStart - offsetXCustom.value) / currentZoom)
            : (event.clientY - offsetYCustom.value) / currentZoom,
        ],
        fillStyle: optionsStore.fillStyle,
        roughCanvas: roughCanvas.value,
        stroke: optionsStore.getterColorsWithOpacity.borderColor,
        strokeWidth: optionsStore.lineWidth,
        isCircle: false,
        userId: myId,
      };

      const ellipse = new EllipseObject(ellipseProps);

      ellipse.zoom = currentZoom;
      ellipse.draw(offsetXCustom.value, offsetYCustom.value);
      allObjects.value.push(ellipse);
      break;
    }

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

      const rectangleProps: RectangleProps = {
        color: optionsStore.getterColorsWithOpacity.fillColor,
        width: optionsStore.lineWidth,
        fillStyle: optionsStore.fillStyle,
        roughCanvas: roughCanvas.value,
        stroke: optionsStore.getterColorsWithOpacity.borderColor,
        strokeWidth: optionsStore.lineWidth,
        userId: myId,
        startPoint: [
          (cursorXStart - offsetXCustom.value) / currentZoom,
          (cursorYStart - offsetYCustom.value) / currentZoom,
        ],
        endPoint: [
          event.shiftKey
            ? (cursorXCurrent - offsetXCustom.value) / currentZoom
            : (cursorXCurrent - offsetXCustom.value) / currentZoom,
          event.shiftKey
            ? (cursorYStart - offsetYCustom.value) / currentZoom +
              ((cursorXCurrent - offsetXCustom.value) / currentZoom -
                (cursorXStart - offsetXCustom.value) / currentZoom)
            : (cursorYCurrent - offsetYCustom.value) / currentZoom,
        ],
      };

      const rect = new RectangleObject(rectangleProps);

      rect.zoom = currentZoom;
      rect.draw(offsetXCustom.value, offsetYCustom.value);
      break;
    }

    case 'line': {
      fullReDraw();

      let lineObjectProps: LineProps = {
        color: optionsStore.getterColorsWithOpacity.fillColor,
        width: optionsStore.lineWidth,
        roughCanvas: roughCanvas.value,
        userId: myId,
        startPoint: [
          (cursorXStart - offsetXCustom.value) / currentZoom,
          (cursorYStart - offsetYCustom.value) / currentZoom,
        ],
        endPoint: [
          (cursorXCurrent - offsetXCustom.value) / currentZoom,
          (cursorYStart - offsetYCustom.value) / currentZoom,
        ],
      };

      let line;
      if (event.shiftKey) {
        const slope = (cursorYCurrent - cursorYStart) / (cursorXCurrent - cursorXStart);

        if (Math.abs(slope) <= 1) {
          line = new LineObject(lineObjectProps);
        } else {
          lineObjectProps = {
            ...lineObjectProps,
            startPoint: [
              (cursorXStart - offsetXCustom.value) / currentZoom,
              (cursorYStart - offsetYCustom.value) / currentZoom,
            ],
            endPoint: [
              (cursorXStart - offsetXCustom.value) / currentZoom,
              (cursorYCurrent - offsetYCustom.value) / currentZoom,
            ],
          };
          line = new LineObject(lineObjectProps);
        }
      } else {
        lineObjectProps = {
          ...lineObjectProps,
          startPoint: [
            (cursorXStart - offsetXCustom.value) / currentZoom,
            (cursorYStart - offsetYCustom.value) / currentZoom,
          ],
          endPoint: [
            (cursorXCurrent - offsetXCustom.value) / currentZoom,
            (cursorYCurrent - offsetYCustom.value) / currentZoom,
          ],
        };

        line = new LineObject(lineObjectProps);
      }

      line.zoom = currentZoom;
      line.draw(offsetXCustom.value, offsetYCustom.value);

      break;
    }

    case 'ellipse': {
      fullReDraw();

      const ellipseProps: EllipseProps = {
        color: optionsStore.getterColorsWithOpacity.fillColor,
        width: optionsStore.lineWidth,
        startPoint: [
          (cursorXStart - offsetXCustom.value) / currentZoom,
          (cursorYStart - offsetYCustom.value) / currentZoom,
        ],
        endPoint: [
          event.shiftKey
            ? (event.clientX - offsetXCustom.value) / currentZoom
            : (event.clientX - offsetXCustom.value) / currentZoom,
          event.shiftKey
            ? (cursorYStart - offsetYCustom.value) / currentZoom +
              ((event.clientX - offsetXCustom.value) / currentZoom -
                (cursorXStart - offsetXCustom.value) / currentZoom)
            : (event.clientY - offsetYCustom.value) / currentZoom,
        ],
        fillStyle: optionsStore.fillStyle,
        roughCanvas: roughCanvas.value,
        stroke: optionsStore.getterColorsWithOpacity.borderColor,
        strokeWidth: optionsStore.lineWidth,
        isCircle: false,
        userId: myId,
      };

      const ellipse = new EllipseObject(ellipseProps);

      ellipse.zoom = currentZoom;
      ellipse.draw(offsetXCustom.value, offsetYCustom.value);

      break;
    }

    default:
      break;
  }
};
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

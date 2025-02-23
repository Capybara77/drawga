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
import { constantsForKeyboard, useCursorStore } from '@/stores/cursor/';
import { useOptionsStore } from '@/stores/options/';
import { useZoomStore } from '@/stores/zoom/';
import type { CurveProps, EllipseProps, LineProps, RectangleProps } from '@/types';
import { getTypedDrawObject } from '@/utils/getTypedDrawObject/getTypedDrawObject';
import { useEventListener, useMouse } from '@vueuse/core';
import rough from 'roughjs';

import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';

const { x: currentX, y: currentY } = useMouse();

const cursorStore = useCursorStore();
const optionsStore = useOptionsStore();
const zoomStore = useZoomStore();

const socket = new WebSocketService();

const canvasElement = useTemplateRef<HTMLCanvasElement>('canvasElement');
const canvasContext = ref<CanvasRenderingContext2D>();
const roughCanvas = ref();

const allObjects = ref<BaseObject[]>([]);
const tempCoordinates = ref<number[][]>([]);

const cursorObject = ref({
  x: 0,
  y: 0,
});

const cursorStartObject = ref({
  x: 0,
  y: 0,
});

const offset = ref({
  x: 0,
  y: 0,
});

const computedCurrentCoords = computed(() => ({
  x: currentX.value - offset.value.x,
  y: currentY.value - offset.value.y,
}));

const startPoint = computed(() => [
  (cursorStartObject.value.x - offset.value.x) / zoomStore.zoom,
  (cursorStartObject.value.y - offset.value.y) / zoomStore.zoom,
]);
const endPoint = computed(() => [
  computedCurrentCoords.value.x / zoomStore.zoom,
  computedCurrentCoords.value.y / zoomStore.zoom,
]);

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

  const x = +event.detail[2] * zoomStore.zoom + offset.value.x;
  const y = +event.detail[3] * zoomStore.zoom + offset.value.y;

  const keyFrames = {
    transform: `translate(${x}px, ${y}px)`,
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
  obj.draw(offset.value.x, offset.value.y, zoomStore.zoom);
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
        offset.value.x,
        offset.value.y,
        canvasElement.value?.clientWidth ?? 0,
        canvasElement.value?.clientHeight ?? 0,
        zoomStore.zoom,
      )
    ) {
      element.draw(offset.value.x, offset.value.y, zoomStore.zoom ?? 1);
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
    pointsList: tempCoordinates.value,
    width: optionsStore.lineWidth,
    zoom: zoomStore.zoom,
  };

  return new CurveObject(curveProps);
};

const getNewRectObject = () => {
  const rectangleProps: RectangleProps = {
    color: optionsStore.getterColorsWithOpacity.fillColor,
    width: optionsStore.lineWidth,
    fillStyle: optionsStore.fillStyle,
    roughCanvas: roughCanvas.value,
    stroke: optionsStore.getterColorsWithOpacity.borderColor,
    strokeWidth: optionsStore.lineWidth,
    userId: userId,
    startPoint: startPoint.value,
    endPoint: endPoint.value,
  };

  return new RectangleObject(rectangleProps);
};

const getNewLineObject = () => {
  const lineObjectProps: LineProps = {
    color: optionsStore.getterColorsWithOpacity.fillColor,
    width: optionsStore.lineWidth,
    roughCanvas: roughCanvas.value,
    userId: userId,
    startPoint: startPoint.value,
    endPoint: endPoint.value,
  };

  return new LineObject(lineObjectProps);
};

const getNewEllipseObject = () => {
  const ellipseProps: EllipseProps = {
    color: optionsStore.getterColorsWithOpacity.fillColor,
    width: optionsStore.lineWidth,
    startPoint: startPoint.value,
    endPoint: endPoint.value,
    fillStyle: optionsStore.fillStyle,
    roughCanvas: roughCanvas.value,
    stroke: optionsStore.getterColorsWithOpacity.borderColor,
    strokeWidth: optionsStore.lineWidth,
    isCircle: false,
    userId: userId,
  };

  return new EllipseObject(ellipseProps);
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
    cursorObject.value.x = computedCurrentCoords.value.x;
    cursorObject.value.y = computedCurrentCoords.value.y;

    return;
  }

  const targetElement = event.target as HTMLElement;

  if (targetElement === null || targetElement.id !== 'canvas') {
    isOnCanvas.value = false;

    return;
  }

  isDrawing.value = true;
  isOnCanvas.value = true;

  tempCoordinates.value = [];

  cursorStartObject.value.x = currentX.value;
  cursorStartObject.value.y = currentY.value;
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
    case 'curve': {
      currentDrawing = getNewCurveObject();

      break;
    }

    case 'line': {
      currentDrawing = getNewLineObject();

      break;
    }

    case 'rectangle': {
      currentDrawing = getNewRectObject();

      break;
    }

    case 'ellipse': {
      currentDrawing = getNewEllipseObject();
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

  const messageToServer = [
    'drawObj',
    JSON.stringify(allObjects.value[allObjects.value.length - 1]),
  ].map(String);

  socket.send(messageToServer);
};

const onCanvasPointerMove = (event: PointerEvent) => {
  const element = event.target as HTMLElement;

  if (element.id === 'canvas') {
    const messageToServer = [
      'cur',
      userId,
      currentX.value / zoomStore.zoom - offset.value.x / zoomStore.zoom,
      currentY.value / zoomStore.zoom - offset.value.y / zoomStore.zoom,
    ].map(String);

    socket.send(messageToServer);
  }

  if (isMoving.value) {
    offset.value.x = currentX.value - cursorObject.value.x;
    offset.value.y = currentY.value - cursorObject.value.y;
    redrawWithClearing();

    return;
  }

  if (!isDrawing.value) return;

  switch (cursorStore.cursor) {
    case 'eraser': {
      const allObjectsCount = allObjects.value.length;

      allObjects.value = allObjects.value.filter((drawObject) => {
        if (drawObject.drawType === 'curve') {
          if (
            drawObject.isCloseToPoints(
              currentX.value / zoomStore.zoom - offset.value.x / zoomStore.zoom,
              currentY.value / zoomStore.zoom - offset.value.y / zoomStore.zoom,
              10,
            )
          ) {
            eraseObject(drawObject);

            return false;
          }
        } else if (drawObject.drawType === 'rectangle') {
          if (
            drawObject.isOverlay(
              -currentY.value + offset.value.x,
              -currentY.value + offset.value.y,
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
            drawObject.isCloseToPoints(
              currentY.value / zoomStore.zoom - offset.value.x / zoomStore.zoom,
              currentY.value / zoomStore.zoom - offset.value.y / zoomStore.zoom,
              25,
            )
          ) {
            eraseObject(drawObject);
            return false;
          }
        } else if (drawObject.drawType === 'ellipse') {
          if (
            (drawObject as EllipseObject).closeToCentre(
              currentY.value / zoomStore.zoom - offset.value.x / zoomStore.zoom,
              currentY.value / zoomStore.zoom - offset.value.y / zoomStore.zoom,
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

    case 'curve': {
      tempCoordinates.value.push(endPoint.value);

      // без этого сначала рисуется не оч красиво, а когда отпускаешь становится норм, но думаю на производительность давит
      redrawWithClearing();

      const curve = getNewCurveObject();

      curve?.draw(offset.value.x, offset.value.y, zoomStore.zoom);

      break;
    }

    case 'rectangle': {
      const rect = getNewRectObject();

      redrawWithClearing();

      rect.draw(offset.value.x, offset.value.y, zoomStore.zoom);
      break;
    }

    case 'line': {
      const line = getNewLineObject();

      redrawWithClearing();

      line.draw(offset.value.x, offset.value.y, zoomStore.zoom);

      break;
    }

    case 'ellipse': {
      const ellipse = getNewEllipseObject();

      redrawWithClearing();

      ellipse.draw(offset.value.x, offset.value.y, zoomStore.zoom);

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

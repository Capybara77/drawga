<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import {
  BaseObject,
  CurveObject,
  LineObject,
  RectangleObject,
  EllipseObject,
} from "@/constructors";
import { testToast } from "@/services/toastify";
import { WebSocketService } from "@/services/webSocketService";
import { constantsForKeyboard, useCursorStore } from "@/stores/cursor/";
import { useOptionsStore } from "@/stores/options/";
import { useZoomStore } from "@/stores/zoom/";
import type { CurveProps, EllipseProps, LineProps, RectangleProps } from "@/types";
import { getTypedDrawObject } from "@/utils/getTypedDrawObject/getTypedDrawObject";
import { useEventListener } from "@vueuse/core";
import rough from "roughjs";

import { onMounted, ref, useTemplateRef, watch } from "vue";
import { useAllObjectsStore } from "@/stores/allObjects";
import { toServerMessages } from "@/utils/toServerMessages";
import { getHistoryHotkey, isTyping } from "@/utils/hotkeys";

const { socket } = defineProps<{
  socket: WebSocketService;
}>();

const cursorStore = useCursorStore();
const optionsStore = useOptionsStore();
const zoomStore = useZoomStore();
const allObjectsStore = useAllObjectsStore();

const canvasElement = useTemplateRef<HTMLCanvasElement>("canvasElement");
const canvasContext = ref<CanvasRenderingContext2D>();
const roughCanvas = ref();

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
// стёрли ли уже что-то за текущее движение ластиком — тогда склеиваем в одну запись undo
const isErasedInStroke = ref(false);

const userId = "123";

allObjectsStore.$onAction(({ name, after }) => {
  if (name === "undo" || name === "redo") {
    after((result) => {
      if (!result) {
        return;
      }
      const msgs = toServerMessages(result);
      msgs.forEach((msg) => socket.send(msg));
    });
  }
});

const handleClose = (event: CustomEvent) => {
  console.log("Соединение закрыто", event.detail);
};

const handleMessage = (event: CustomEvent) => {
  testToast(event.detail[1]);
};

const handleMove = (event: CustomEvent) => {
  const data = event.detail as string[];
  console.log("Получена команда move:", data);
};

const handleClear = (event: CustomEvent) => {
  console.log("Получена команда clear", event.detail);
};

const handleCur = (event: CustomEvent) => {
  const userId = event.detail[1];
  let t;

  t = document.getElementById(userId);

  if (t === null) {
    t = document.createElement("div");
    t.id = userId;
    t.className = "trailer";
    document.body.appendChild(t);
    return;
  }

  const x = +event.detail[2] * zoomStore.zoom + offsetXCustom.value;
  const y = +event.detail[3] * zoomStore.zoom + offsetYCustom.value;

  const keyFrames = {
    transform: `translate(${x}px, ${y}px)`,
  };

  t.animate(keyFrames, {
    fill: "forwards",
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

  allObjectsStore.receive(obj);
  obj.draw(offsetXCustom.value, offsetYCustom.value, zoomStore.zoom);
};

const handleDelete = (event: CustomEvent) => {
  const str = event.detail[1] as string;
  const { objId } = JSON.parse(str) as { objId: string };
  allObjectsStore.receiveRemove([objId]);
};

const createWindowListeners = () => {
  useEventListener(window, "resize", updateCanvasSize);
  useEventListener(window, "keydown", onKeyDown);
  useEventListener(window, "keyup", onKeyUp);
};

const createSocketConnection = () => {
  useEventListener(socket, "move", handleMove);
  useEventListener(socket, "clear", handleClear);
  useEventListener(socket, "close", handleClose);
  useEventListener(socket, "message", handleMessage);
  useEventListener(socket, "drawObj", handleDraw);
  useEventListener(socket, "cur", handleCur);
  useEventListener(socket, "delete", handleDelete);
};

const redrawWithOffset = () => {
  for (let index = 0; index < allObjectsStore.size; index++) {
    const element = allObjectsStore.objects[index];

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

const onCanvasPointerDown = (event: PointerEvent) => {
  if (event.button === 1 || (isSpacePressed.value && event.button === 0)) {
    isMoving.value = true;
    cursorX.value = event.clientX - offsetXCustom.value;
    cursorY.value = event.clientY - offsetYCustom.value;

    // canvasElement.style.cursor = 'grabbing';
    return;
  }

  const targetElement = event.target as HTMLElement;

  if (targetElement === null || targetElement.id !== "canvas") {
    isOnCanvas.value = false;

    return;
  }

  isDrawing.value = true;
  isOnCanvas.value = true;
  isErasedInStroke.value = false;

  currentCoordinates.value = [];

  cursorXStart.value = event.clientX;
  cursorYStart.value = event.clientY;
};

const onCanvasPointerUp = (event: PointerEvent) => {
  const element = event.target as HTMLElement;

  if (event.button === 2 || element.id !== "canvas" || isOnCanvas.value === false) return;

  if (isMoving.value) {
    isMoving.value = false;
    return;
  }

  isDrawing.value = false;

  let currentDrawing: BaseObject | undefined;

  switch (cursorStore.cursor) {
    case "curve": {
      currentDrawing = getNewCurveObject();

      break;
    }

    case "line": {
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

    case "rectangle": {
      currentDrawing = getNewRectObject(event);

      break;
    }

    case "ellipse": {
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

  // allObjects.value = [...allObjects.value, currentDrawing];
  allObjectsStore.add(currentDrawing);

  redrawWithClearing();

  const messageToServer = ["drawObj", JSON.stringify(allObjectsStore.peek)].map(String);

  socket.send(messageToServer);
};

// задел ли ластик объект (x, y — координаты курсора на экране)
const isHit = (drawObject: BaseObject, x: number, y: number): boolean => {
  const zoom = zoomStore.zoom;
  // координаты курсора на доске, без зума и сдвига
  const boardX = (x - offsetXCustom.value) / zoom;
  const boardY = (y - offsetYCustom.value) / zoom;

  switch (drawObject.drawType) {
    case "curve":
      return (drawObject as CurveObject).isCloseToPoints(boardX, boardY, 10);
    case "rectangle":
      return (drawObject as RectangleObject).isOverlay(
        offsetXCustom.value - x,
        offsetYCustom.value - y,
        1,
        1,
        zoom,
      );
    case "line":
      return (drawObject as LineObject).isCloseToPoints(boardX, boardY, 25);
    case "ellipse":
      return (drawObject as EllipseObject).closeToCentre(boardX, boardY);
    default:
      return false;
  }
};

const onCanvasPointerMove = (event: PointerEvent) => {
  const element = event.target as HTMLElement;

  // const trailerX = event.clientX - trailer.offsetWidth / 2;
  // const trailerY = event.clientY - trailer.offsetHeight / 2;

  if (element.id === "canvas") {
    //animateCursor(trailerX, trailerY, trailer);

    const messageToServer = [
      "cur",
      userId,
      event.clientX / zoomStore.zoom - offsetXCustom.value / zoomStore.zoom,
      event.clientY / zoomStore.zoom - offsetYCustom.value / zoomStore.zoom,
    ].map(String);

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
    case "eraser": {
      const toErase = allObjectsStore.objects.filter((drawObject) =>
        isHit(drawObject, cursorXCurrent, cursorYCurrent),
      );

      allObjectsStore.remove(toErase, isErasedInStroke.value);
      if (toErase.length > 0) {
        isErasedInStroke.value = true;
      }

      const result = toServerMessages({ type: "remove", objects: toErase });

      result.forEach((msg) => {
        socket.send(msg);
      });

      break;
    }

    case "curve": {
      const currentX = cursorXCurrent;
      const currentY = cursorYCurrent;

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

    case "rectangle": {
      if (event.shiftKey) {
      }

      const rect = getNewRectObject(event);

      redrawWithClearing();

      rect.draw(offsetXCustom.value, offsetYCustom.value, zoomStore.zoom);
      break;
    }

    case "line": {
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

    case "ellipse": {
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
  // event.preventDefault();

  if (isTyping(event)) {
    return;
  }

  const historyKey = getHistoryHotkey(event);

  if (historyKey) {
    event.preventDefault();
    allObjectsStore[historyKey]();

    return;
  }

  const code = event.code;

  switch (code) {
    case "Space": {
      isSpacePressed.value = true;

      return;
    }
    case "Minus": {
      zoomStore.decreaseZoom();

      return;
    }
    case "Equal": {
      zoomStore.increaseZoom();

      return;
    }

    default: {
      const keyboardNumber = event.key;
      const newCursor = constantsForKeyboard[keyboardNumber];

      if (newCursor) {
        cursorStore.setCursor(newCursor);
      }
    }
  }

  //   if (!code.startsWith("Digit")) {
  //     return;
  //   }
  //
  //   const keyCodeArr = code.split("Digit");
  //   const keyboardNumber = keyCodeArr[1];
  //
  //   const newCursor = constantsForKeyboard[keyboardNumber];
  //
  //   if (event.metaKey || event.altKey) {
  //     cursorStore.setCursor(newCursor);
  //   }
};

const onKeyUp = (event: KeyboardEvent) => {
  if (event.code === "Space") {
    isSpacePressed.value = false;
  }
};

onMounted(() => {
  if (!canvasElement.value) {
    return;
  }

  if (!canvasContext.value) {
    canvasContext.value = canvasElement.value.getContext("2d") as CanvasRenderingContext2D;
  }

  if (!roughCanvas.value) {
    roughCanvas.value = rough.canvas(canvasElement.value);
  }

  canvasElement.value.width = window.innerWidth;
  canvasElement.value.height = window.innerHeight;

  createSocketConnection();
  createWindowListeners();
});

watch(zoomStore, () => {
  redrawWithClearing();
});

// стор всегда подменяет массив objects, поэтому хватает слежки за ссылкой
watch(
  () => allObjectsStore.objects,
  () => {
    redrawWithClearing();
  },
);
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

<style scoped>
#canvas {
  overflow: hidden;
  background-color: var(--clr-canvas);
  width: 100%;
  height: 100vh;
}
</style>

<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import {
  BaseObject,
  CurveObject,
  LineObject,
  RectangleObject,
  EllipseObject,
  TextObject,
  ImageObject,
} from "@/constructors";
import { WebSocketService } from "@/services/webSocketService";
import { constantsForKeyboard, useCursorStore } from "@/stores/cursor/";
import { useOptionsStore } from "@/stores/options/";
import { useZoomStore } from "@/stores/zoom/";
import type {
  CurveProps,
  EllipseProps,
  ImageProps,
  LineProps,
  RectangleProps,
  TextProps,
} from "@/types";
import { getTypedDrawObject } from "@/utils/getTypedDrawObject/getTypedDrawObject";
import { useEventListener, useFileDialog, useIntervalFn, useThrottleFn } from "@vueuse/core";
import rough from "roughjs";

import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
import { useAllObjectsStore } from "@/stores/allObjects";
import { toServerMessages } from "@/utils/toServerMessages";
import { getHistoryHotkey, isTyping } from "@/utils/hotkeys";
import { fitCanvas, generateId } from "@/utils";
import { getMyName } from "@/utils/myName/myName";
import { screenRectToBoard } from "@/utils/screenRectToBoard/screenRectToBoard";
import { useParticipantsStore } from "@/stores/participants";
import CursorLayer from "./CursorLayer.vue";
import { useToast } from "@nuxt/ui/composables/useToast";
import TextEditor from "./TextEditor.vue";
import ImageEditor from "./ImageEditor.vue";
import { toBoard } from "@/utils/toBoard/toBoard";
import { cursorMessage, drawMessage, tempMessage } from "@/utils/socketMessages/socketMessages";
import { isPanStart, usePan } from "@/composables/usePan";
import { useSelection } from "@/composables/useSelection";
import { drawMarquee, drawObjectOutline, drawSelectionBox } from "@/utils/selection/selection";

const { socket } = defineProps<{
  socket: WebSocketService;
}>();

const cursorStore = useCursorStore();
const optionsStore = useOptionsStore();
const zoomStore = useZoomStore();
const allObjectsStore = useAllObjectsStore();
const participantsStore = useParticipantsStore();

const toast = useToast();

const { open, onChange: onImageChange } = useFileDialog({
  accept: "image/*",
  reset: true,
});

const canvasElement = useTemplateRef<HTMLCanvasElement>("canvasElement");
const canvasContext = ref<CanvasRenderingContext2D>();
const roughCanvas = ref();

const { endPan, isMoving, movePan, offsetXCustom, offsetYCustom, startPan } = usePan();
const selection = useSelection();
const hoverCursor = ref("default");

const cursorXStart = ref(0);
const cursorYStart = ref(0);

const currentCoordinates = ref<number[][]>([]);

const isDrawing = ref(false);
const isOnCanvas = ref(false);
const isSpacePressed = ref(false);
const canvasCursor = computed(() => {
  if (isMoving.value) return "grabbing";
  if (isSpacePressed.value || cursorStore.cursor === "hand") return "grab";

  return hoverCursor.value;
});
// стёрли ли уже что-то за текущее движение ластиком — тогда склеиваем в одну запись undo
const isErasedInStroke = ref(false);

const textDraft = ref<{ x: number; y: number; id: string } | null>(null);
const imageDraft = ref<{ x: number; y: number; src: string; width: number; height: number } | null>(
  null,
);
let isTextDrafting = false;

let strokeId = "";
const userId = generateId(6);
const userName = getMyName(localStorage);

const offsetBoard = (point: { x: number; y: number }) =>
  toBoard({ offsetX: offsetXCustom.value, offsetY: offsetYCustom.value }, zoomStore.zoom)(point);

onImageChange(async (payload) => {
  const file = payload?.item(0);

  if (!file) return;

  const bm = await createImageBitmap(file);

  const scale = Math.min(1, 1600 / Math.max(bm.width, bm.height));
  const previewScale = Math.min(1, 400 / Math.max(bm.width, bm.height));
  const tempCanvas = document.createElement("canvas");
  const scaledW = Math.round(bm.width * scale);
  const scaledH = Math.round(bm.height * scale);

  tempCanvas.width = scaledW;
  tempCanvas.height = scaledH;

  const tempCtx = tempCanvas.getContext("2d");

  if (!tempCtx) return;

  tempCtx.drawImage(bm, 0, 0, scaledW, scaledH);

  // превью — DOM поверх холста, поэтому всё в экранных пикселях; в координаты доски переводим при коммите
  imageDraft.value = {
    x: cursorXStart.value,
    y: cursorYStart.value,
    src: tempCanvas.toDataURL("image/webp", 0.8),
    width: scaledW * previewScale * zoomStore.zoom,
    height: scaledH * previewScale * zoomStore.zoom,
  };

  cursorStore.setCursor("pointer");
});

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

// сервер сейчас пришлёт доску заново целиком: без очистки всё задвоится
const handleReconnect = () => {
  selection.deselect();
  allObjectsStore.resetFromServer();
};

const handleMessage = (event: CustomEvent) => {
  toast.add({
    title: event.detail[1],
    actions: [],
  });
};

const handleMove = (event: CustomEvent) => {
  const data = event.detail as string[];

  toast.add({
    title: "Получена команда move: " + data,
    actions: [],
  });
};

const handleClear = () => {
  allObjectsStore.clear();

  toast.add({
    title: "Получена команда clear",
    actions: [],
  });
};

const handleCur = (event: CustomEvent) => {
  const [_action, id, x, y, name] = event.detail;

  participantsStore.moveCursor({ id, x: +x, y: +y, name });
};

useIntervalFn(() => {
  participantsStore.removeStale(Date.now(), 5000);
}, 1000);

const handleDraw = (event: CustomEvent) => {
  const obj = getTypedDrawObject(
    event.detail[1],
    roughCanvas.value,
    canvasContext.value as CanvasRenderingContext2D,
  );

  if (!obj) {
    return;
  }

  const action = event.detail[0] === "drawObj" ? "receive" : "receiveTemp";

  allObjectsStore[action](obj);

  // allObjectsStore.receive(obj);
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
  useEventListener(socket, "reconnect", handleReconnect);
  useEventListener(socket, "message", handleMessage);
  useEventListener(socket, "drawObj", handleDraw);
  useEventListener(socket, "cur", handleCur);
  useEventListener(socket, "delete", handleDelete);
  useEventListener(socket, "temp", handleDraw);
};

const redrawWithOffset = () => {
  // объект, который сейчас тянут (мы или кто-то другой), рисуется черновиком вместо оригинала
  const hiddenIds = new Set(allObjectsStore.previews.filter((p) => p.tempObj).map((p) => p.objId));

  selection.drafts.value.forEach((draft) => hiddenIds.add(draft.objId));

  for (let index = 0; index < allObjectsStore.size; index++) {
    const element = allObjectsStore.objects[index];

    if (hiddenIds.has(element.objId)) {
      continue;
    }

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

const redrawWithOffsetTemp = () => {
  for (let index = 0; index < allObjectsStore.previews.length; index++) {
    const element = allObjectsStore.previews[index];

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

const drawSelection = () => {
  const ctx = canvasContext.value;

  if (!ctx) return;

  const { box, drafts, marquee, selected } = selection;
  const offset = [offsetXCustom.value, offsetYCustom.value, zoomStore.zoom] as const;

  drafts.value.forEach((draft) => draft.draw(...offset));

  if (marquee.value) {
    drawMarquee(ctx, marquee.value, ...offset);
  }

  if (selected.value.length > 1) {
    const shown = drafts.value.length ? drafts.value : selected.value;

    shown.forEach((o) => drawObjectOutline(ctx, o.bounds(), ...offset));
  }

  if (box.value) {
    drawSelectionBox(ctx, box.value, ...offset);
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
  redrawWithOffsetTemp();
  drawSelection();
};

const updateCanvasSize = () => {
  if (!canvasElement.value || !canvasContext.value) return;

  fitCanvas(
    canvasElement.value,
    canvasContext.value,
    window.innerWidth,
    window.innerHeight,
    window.devicePixelRatio,
  );
  redrawWithClearing();
};

const getNewLineObject = (event: PointerEvent): LineObject | undefined => {
  const start = offsetBoard({ x: cursorXStart.value, y: cursorYStart.value });
  const end = offsetBoard({ x: event.clientX, y: event.clientY });

  const lineObjectProps: LineProps = {
    color: optionsStore.getterColorsWithOpacity.fillColor,
    width: optionsStore.lineWidth,
    roughCanvas: roughCanvas.value,
    userId: userId,
    startPoint: [start.boardX, start.boardY],
    endPoint: [end.boardX, end.boardY],
  };

  const lineObj = new LineObject(lineObjectProps);

  return lineObj;
};

const getNewEllipseObject = (event: PointerEvent) => {
  const start = offsetBoard({ x: cursorXStart.value, y: cursorYStart.value });
  const end = offsetBoard({ x: event.clientX, y: event.clientY });

  const ellipseProps: EllipseProps = {
    color: optionsStore.getterColorsWithOpacity.fillColor,
    width: optionsStore.lineWidth,
    startPoint: [start.boardX, start.boardY],
    endPoint: [end.boardX, end.boardY],
    fillStyle: optionsStore.fillStyle,
    roughCanvas: roughCanvas.value,
    stroke: optionsStore.getterColorsWithOpacity.borderColor,
    strokeWidth: optionsStore.lineWidth,
    isCircle: false,
    userId: userId,
  };

  const ellipseObj = new EllipseObject(ellipseProps);

  return ellipseObj;
};

const getNewImageObject = (
  src: string,
  width: number,
  height: number,
  x: number,
  y: number,
): ImageObject | undefined => {
  if (!canvasContext.value || !canvasElement.value) return;

  const imageProps: ImageProps = {
    color: optionsStore.colors.textColor,
    ctx: canvasContext.value,
    userId,
    x,
    y,
    width,
    height,
    src,
  };

  const imageObj = new ImageObject(imageProps);

  return imageObj;
};

const getNewTextObject = (text: string): TextObject | undefined => {
  if (!canvasContext.value || !textDraft.value || !text) return;

  const board = offsetBoard({ x: textDraft.value.x, y: textDraft.value.y });

  const textProps: TextProps = {
    fontSize: optionsStore.textSize,
    color: optionsStore.colors.textColor,
    ctx: canvasContext.value,
    text,
    userId,
    x: board.boardX,
    y: board.boardY,
    fontFamily: optionsStore.fontFamily,
    width: 0,
    objId: textDraft.value.id,
  };

  const textObj = new TextObject(textProps);

  return textObj;
};

const getNewCurveObject = (): CurveObject | undefined => {
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

const getNewRectObject = (event: PointerEvent): RectangleObject | undefined => {
  const start = offsetBoard({ x: cursorXStart.value, y: cursorYStart.value });
  const end = offsetBoard({ x: event.clientX, y: event.clientY });

  const rectangleProps: RectangleProps = {
    color: optionsStore.getterColorsWithOpacity.fillColor,
    width: optionsStore.lineWidth,
    fillStyle: optionsStore.fillStyle,
    roughCanvas: roughCanvas.value,
    stroke: optionsStore.getterColorsWithOpacity.borderColor,
    strokeWidth: optionsStore.lineWidth,
    userId: userId,
    startPoint: [start.boardX, start.boardY],
    endPoint: [end.boardX, end.boardY],
  };

  const rect = new RectangleObject(rectangleProps);

  return rect;
};

const onCanvasPointerDown = (event: PointerEvent) => {
  // захват: move/up идут в холст, даже если курсор ушёл на панель поверх него —
  // иначе отпускание над панелью не завершало штрих
  canvasElement.value?.setPointerCapture(event.pointerId);

  isTextDrafting = !!textDraft.value;

  if (isPanStart(event.button, isSpacePressed.value, cursorStore.cursor)) {
    startPan(event);

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
  strokeId = generateId(6);

  cursorXStart.value = event.clientX;
  cursorYStart.value = event.clientY;

  if (cursorStore.cursor === "pointer" && event.button === 0) {
    const { boardX, boardY } = offsetBoard({ x: event.clientX, y: event.clientY });

    selection.press(boardX, boardY, zoomStore.zoom, event.shiftKey);
  }
};

const onCanvasPointerUp = (event: PointerEvent) => {
  const element = event.target as HTMLElement;

  endPan();

  if (event.button === 2 || element.id !== "canvas" || isOnCanvas.value === false) return;

  isDrawing.value = false;

  let currentDrawing: BaseObject | undefined;

  switch (cursorStore.cursor) {
    case "pointer": {
      const action = selection.release();

      if (action) {
        toServerMessages(action).forEach((msg) => socket.send(msg));
      }

      break;
    }

    case "curve": {
      currentDrawing = getNewCurveObject();

      break;
    }

    case "line": {
      currentDrawing = getNewLineObject(event);

      break;
    }

    case "rectangle": {
      currentDrawing = getNewRectObject(event);

      break;
    }

    case "ellipse": {
      currentDrawing = getNewEllipseObject(event);
      break;
    }

    case "text": {
      if (isTextDrafting) break;

      const lineHeight = optionsStore.textSize * zoomStore.zoom * 1.25;

      textDraft.value = { x: event.clientX, y: event.clientY - lineHeight / 2, id: strokeId };

      break;
    }

    case "image": {
      open();

      break;
    }

    default:
      break;
  }

  if (!currentDrawing) {
    return;
  }

  currentDrawing.objId = strokeId;

  // allObjects.value = [...allObjects.value, currentDrawing];
  allObjectsStore.add(currentDrawing);

  redrawWithClearing();

  socket.send(drawMessage(allObjectsStore.peek));
};

// задел ли ластик объект (x, y — координаты курсора на экране)
const isHit = (drawObject: BaseObject, x: number, y: number): boolean => {
  const zoom = zoomStore.zoom;
  // координаты курсора на доске, без зума и сдвига
  const { boardX, boardY } = offsetBoard({ x, y });

  switch (drawObject.drawType) {
    case "curve": {
      return (drawObject as CurveObject).isCloseToPoints(boardX, boardY, 10);
    }
    case "rectangle": {
      return (drawObject as RectangleObject).isOverlay(
        offsetXCustom.value - x,
        offsetYCustom.value - y,
        1,
        1,
        zoomStore.zoom,
      );
    }
    case "line": {
      return (drawObject as LineObject).isCloseToPoints(boardX, boardY, 25);
    }
    case "ellipse": {
      return (drawObject as EllipseObject).closeToCentre(boardX, boardY);
    }
    case "text": {
      return (drawObject as TextObject).isOverlay(
        offsetXCustom.value - x,
        offsetYCustom.value - y,
        1,
        1,
        zoom,
      );
    }
    case "image": {
      return (drawObject as ImageObject).isOverlay(
        offsetXCustom.value - x,
        offsetYCustom.value - y,
        1,
        1,
        zoom,
      );
    }
    default:
      return false;
  }
};

const sendTemp = useThrottleFn((obj) => {
  socket.send(tempMessage(obj));
}, 50);

// троттлим всю пачку: через sendTemp на каждый объект долетел бы только первый
const sendDrafts = useThrottleFn((drafts: BaseObject[]) => {
  drafts
    // ponytail: картинку не шлём на лету, её src слишком тяжёлый; другие увидят её при отпускании
    .filter((draft) => draft.drawType !== "image")
    .forEach((draft) => socket.send(tempMessage(draft)));
}, 50);

const onCanvasPointerMove = (event: PointerEvent) => {
  const element = event.target as HTMLElement;

  // const trailerX = event.clientX - trailer.offsetWidth / 2;
  // const trailerY = event.clientY - trailer.offsetHeight / 2;

  if (element.id === "canvas") {
    socket.send(
      cursorMessage(
        userId,
        event.clientX / zoomStore.zoom - offsetXCustom.value / zoomStore.zoom,
        event.clientY / zoomStore.zoom - offsetYCustom.value / zoomStore.zoom,
        userName,
      ),
    );
  }

  if (isMoving.value) {
    movePan(event);
    redrawWithClearing();

    return;
  }

  if (!isDrawing.value) {
    if (cursorStore.cursor === "pointer") {
      const { boardX, boardY } = offsetBoard({ x: event.clientX, y: event.clientY });

      hoverCursor.value = selection.cursorAt(boardX, boardY, zoomStore.zoom);
    }

    return;
  }

  const cursorXCurrent = event.clientX;
  const cursorYCurrent = event.clientY;

  switch (cursorStore.cursor) {
    case "pointer": {
      const { boardX, boardY } = offsetBoard({ x: cursorXCurrent, y: cursorYCurrent });

      selection.drag(boardX, boardY);

      sendDrafts(selection.drafts.value);

      break;
    }

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

      const { boardX, boardY } = offsetBoard({ x: currentX, y: currentY });

      currentCoordinates.value.push([boardX, boardY]);

      // без этого сначала рисуется не оч красиво, а когда отпускаешь становится норм, но думаю на производительность давит
      redrawWithClearing();

      const curve = getNewCurveObject();

      if (curve) {
        curve.objId = strokeId;
        curve.draw(offsetXCustom.value, offsetYCustom.value, zoomStore.zoom);
        sendTemp(curve);
      }

      break;
    }

    case "rectangle": {
      if (event.shiftKey) {
      }

      redrawWithClearing();

      const rect = getNewRectObject(event);

      if (rect) {
        rect.objId = strokeId;
        rect.draw(offsetXCustom.value, offsetYCustom.value, zoomStore.zoom);
        sendTemp(rect);
      }
      break;
    }

    case "line": {
      const line = getNewLineObject(event);

      redrawWithClearing();

      if (line) {
        line.objId = strokeId;
        line.draw(offsetXCustom.value, offsetYCustom.value, zoomStore.zoom);
        sendTemp(line);
      }

      break;
    }

    case "ellipse": {
      const ellipse = getNewEllipseObject(event);

      redrawWithClearing();

      if (ellipse) {
        ellipse.objId = strokeId;
        ellipse.draw(offsetXCustom.value, offsetYCustom.value, zoomStore.zoom);
        sendTemp(ellipse);
      }

      break;
    }

    default:
      break;
  }
};

const onKeyDown = (event: KeyboardEvent) => {
  // event.preventDefault();

  // без связи доска закрыта плашкой, а клавиши до неё не доходят — отсекаем тут
  if (isTyping(event) || !socket.online) {
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
    case "Delete":
    case "Backspace": {
      const targets = selection.selected.value;

      allObjectsStore.remove(targets);
      toServerMessages({ type: "remove", objects: targets }).forEach((msg) => socket.send(msg));
      selection.deselect();

      return;
    }
    case "Escape": {
      selection.deselect();

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
};

const onKeyUp = (event: KeyboardEvent) => {
  if (event.code === "Space") {
    isSpacePressed.value = false;
  }
};

const handleCommitText = (text: string) => {
  const textObj = getNewTextObject(text);

  if (!textObj) return;

  allObjectsStore.add(textObj);
  redrawWithClearing();
  socket.send(drawMessage(allObjectsStore.peek));

  textDraft.value = null;
};

const handleCommitTextTemp = (text: string) => {
  const textObj = getNewTextObject(text);

  if (!textObj) return;

  sendTemp(textObj);
};

const handleImageCommit = async (props: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  if (!imageDraft.value) return;

  const { x, y, width, height } = screenRectToBoard(
    props,
    offsetXCustom.value,
    offsetYCustom.value,
    zoomStore.zoom,
  );

  const imageObject = getNewImageObject(imageDraft.value.src, width, height, x, y);

  if (!imageObject) return;
  await imageObject.image.decode();

  allObjectsStore.add(imageObject);

  socket.send(drawMessage(allObjectsStore.peek));

  imageDraft.value = null;
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

  updateCanvasSize();

  createSocketConnection();
  createWindowListeners();
});

watch(zoomStore, () => {
  redrawWithClearing();
});

watch([selection.selected, selection.drafts, selection.marquee], () => {
  redrawWithClearing();
});

watch(
  () => cursorStore.cursor,
  () => {
    selection.deselect();
    hoverCursor.value = "default";
  },
);

// стор всегда подменяет массив objects / previews, поэтому хватает слежки за ссылкой
watch([() => allObjectsStore.objects, () => allObjectsStore.previews], () => {
  redrawWithClearing();
});
</script>

<template>
  <canvas
    id="canvas"
    ref="canvasElement"
    :style="{ cursor: canvasCursor }"
    @pointerdown="onCanvasPointerDown"
    @pointerup="onCanvasPointerUp"
    @pointermove="onCanvasPointerMove"
  ></canvas>
  <CursorLayer :offsetX="offsetXCustom" :offsetY="offsetYCustom" />
  <TextEditor
    v-if="textDraft"
    v-bind="textDraft"
    :fontSize="optionsStore.textSize * zoomStore.zoom"
    :color="optionsStore.colors.textColor"
    :fontFamily="optionsStore.fontFamily"
    @commit="handleCommitText"
    @commitTemp="handleCommitTextTemp"
  />
  <ImageEditor v-if="imageDraft" v-bind="imageDraft" @commit="handleImageCommit" />
</template>

<style scoped>
#canvas {
  overflow: hidden;
  background-color: var(--clr-canvas);
  width: 100%;
  height: 100vh;
}
</style>

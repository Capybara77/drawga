<script setup lang="ts">
import {
  CurveObject,
  EllipseObject,
  LineObject,
  RectangleObject,
  TextObject,
} from "@/constructors";
import rough from "roughjs";
import { onMounted, useTemplateRef } from "vue";

const WIDTH = 720;
const HEIGHT = 300;

const canvas = useTemplateRef<HTMLCanvasElement>("canvas");

// цвета те же, что у инструментов доски по умолчанию
const FILL = "#d97757";
const STROKE = "#a1492f";
const TEXT = "e67700";

const drawCursor = (ctx: CanvasRenderingContext2D, x: number, y: number, name: string) => {
  ctx.fillStyle = "#4f8cff";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 4, y + 16);
  ctx.lineTo(x + 8, y + 10);
  ctx.lineTo(x + 15, y + 9);
  ctx.closePath();
  ctx.fill();

  ctx.font = '13px "DM Sans", sans-serif';
  ctx.textBaseline = "top";
  ctx.fillText(name, x + 14, y + 14);
};

// настоящие объекты доски на настоящем холсте, а не картинка: не устаревает при смене инструментов
const drawSketch = (element: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  const roughCanvas = rough.canvas(element);
  const base = { color: FILL, width: 3, userId: "" };
  const shape = { ...base, roughCanvas, stroke: STROKE, strokeWidth: 3 };

  new RectangleObject({
    ...shape,
    fillStyle: "hachure",
    startPoint: [50, 90],
    endPoint: [220, 190],
  }).draw(0, 0, 1);

  new LineObject({ ...base, roughCanvas, startPoint: [240, 140], endPoint: [340, 140] }).draw(
    0,
    0,
    1,
  );
  new LineObject({ ...base, roughCanvas, startPoint: [340, 140], endPoint: [322, 128] }).draw(
    0,
    0,
    1,
  );
  new LineObject({ ...base, roughCanvas, startPoint: [340, 140], endPoint: [322, 152] }).draw(
    0,
    0,
    1,
  );

  new EllipseObject({
    ...shape,
    fillStyle: "zigzag",
    isCircle: false,
    startPoint: [450, 140],
    endPoint: [540, 200],
  }).draw(0, 0, 1);

  new CurveObject({
    ...base,
    ctx,
    zoom: 1,
    width: 5,
    pointsList: Array.from({ length: 60 }, (_, i) => [
      560 + i * 2.2,
      70 + Math.sin(i / 5) * 18 + i * 0.6,
    ]),
  }).draw(0, 0, 1);

  const label = (text: string, x: number, y: number) =>
    new TextObject({
      ...base,
      color: TEXT,
      ctx,
      text,
      x,
      y,
      fontSize: 24,
      fontFamily: "Pangolin",
      objId: "",
    }).draw(0, 0, 1);

  label("идея", 105, 50);
  label("план", 425, 40);

  drawCursor(ctx, 190, 215, "Оля");
  drawCursor(ctx, 500, 245, "Гость");
};

onMounted(async () => {
  const element = canvas.value;
  const ctx = element?.getContext("2d");

  if (!element || !ctx) return;

  const dpr = window.devicePixelRatio;

  element.width = WIDTH * dpr;
  element.height = HEIGHT * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // иначе подпись нарисуется запасным шрифтом; текст нужен, чтобы подгрузился кириллический набор
  await document.fonts.load('24px "Pangolin"', "идея");
  drawSketch(element, ctx);
});
</script>

<template>
  <canvas ref="canvas" class="sketch" role="img" aria-label="Пример рисунка на доске"></canvas>
</template>

<style scoped>
.sketch {
  width: 100%;
  height: auto;
  aspect-ratio: 720 / 300;
  border: 2px solid var(--clr-border);
  border-radius: 5px;
}
</style>

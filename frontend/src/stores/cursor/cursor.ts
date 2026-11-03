import type { MyCursor } from "@/types";
import { defineStore } from "pinia";

type State = {
  cursor: MyCursor;
};

export const constantsForKeyboard: Record<string, MyCursor> = {
  1: "pointer",
  2: "eraser",
  3: "curve",
  4: "rectangle",
  5: "line",
  6: "ellipse",
  7: "text",
  8: "image",
  9: "hand",
};

export const useCursorStore = defineStore("cursor", {
  state: (): State => ({
    cursor: "pointer",
  }),
  actions: {
    setCursor(cursor: MyCursor) {
      this.cursor = cursor;
    },
  },
});

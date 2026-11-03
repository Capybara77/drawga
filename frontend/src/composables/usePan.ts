import { ref } from "vue";
import type { MyCursor } from "@/types";

export const isPanStart = (button: number, isSpacePressed: boolean, cursor: MyCursor) =>
  button === 1 || (button === 0 && (isSpacePressed || cursor === "hand"));

export const usePan = () => {
  // offsetXCustom, offsetYCustom, isMoving, cursorX, cursorY

  const offsetXCustom = ref(0);
  const offsetYCustom = ref(0);

  const isMoving = ref(false);

  const cursorX = ref(0);
  const cursorY = ref(0);

  const startPan = (event: PointerEvent) => {
    isMoving.value = true;
    cursorX.value = event.clientX - offsetXCustom.value;
    cursorY.value = event.clientY - offsetYCustom.value;
  };

  const movePan = (event: PointerEvent) => {
    offsetXCustom.value = event.clientX - cursorX.value;
    offsetYCustom.value = event.clientY - cursorY.value;
  };
  const endPan = () => {
    // сдвиг сбрасываем до проверок ниже: pointerdown сдвига не ставит isOnCanvas,
    // и после перезагрузки (isOnCanvas ещё false) сдвиг залипал
    if (isMoving.value) {
      isMoving.value = false;
      return;
    }
  };

  return {
    offsetXCustom,
    offsetYCustom,
    isMoving,
    startPan,
    movePan,
    endPan,
  };
};

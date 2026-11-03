export const toBoard = (
  { offsetX, offsetY }: { offsetX: number; offsetY: number },
  zoom: number,
) => {
  return ({ x, y }: { x: number; y: number }) => {
    return {
      boardX: (x - offsetX) / zoom,
      boardY: (y - offsetY) / zoom,
    };
  };
};

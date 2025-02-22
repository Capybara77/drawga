export const getMinMax = (min: number, max: number, value: number) => {
  let result = value;

  if (value < min) {
    result = min;
  }

  if (value > max) {
    result = max;
  }

  return result;
};

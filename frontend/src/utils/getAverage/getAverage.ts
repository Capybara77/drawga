export function average(a: number, b: number) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error('Хуйню передал, умник. Давай нормальные числа.');
  }

  return (a + b) / 2;
}

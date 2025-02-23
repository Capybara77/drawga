export function generateId(length: number) {
  let result = '';

  if (length < 1 || isNaN(length)) {
    throw new Error('Invalid length');
  }

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const minLength = 8;
  length = Math.max(length, minLength);

  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    const array = new Uint32Array(1); // Создаем массив для одного случайного числа
    crypto.getRandomValues(array); // Получаем криптографически случайное число
    result += characters.charAt(array[0] % charactersLength); // Используем его для выбора символа
  }
  return result;
}

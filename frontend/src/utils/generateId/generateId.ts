export function generateId(length: number) {
  let result = '';

  if (length < 1) {
    return result;
  }

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  const minLength = 8;
  length = Math.max(length, minLength);

  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

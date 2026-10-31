const key = "drawga-name";

export const getMyName = (storage: Storage): string => {
  const randId = Math.floor(Math.random() * 100);
  const name = `Guest #${randId}`;

  try {
    const item = storage.getItem(key);

    if (!item) {
      storage.setItem(key, name);

      return name;
    }

    return item;
  } catch (err) {
    console.error(err);

    return name;
  }
};

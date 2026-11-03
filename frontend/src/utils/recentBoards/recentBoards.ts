export type RecentBoard = { id: string; openedAt: number };

type BoardStorage = Pick<Storage, "getItem" | "setItem">;

const KEY = "recentBoards";
const MAX_BOARDS = 20;

// ponytail: список живёт в браузере; настоящий список по аккаунту — после переноса досок в SQLite
export const getRecentBoards = (storage: BoardStorage): RecentBoard[] => {
  try {
    const boards: unknown = JSON.parse(storage.getItem(KEY) ?? "[]");

    return Array.isArray(boards) ? boards : [];
  } catch {
    return [];
  }
};

export const rememberBoard = (storage: BoardStorage, id: string, now: number) => {
  const others = getRecentBoards(storage).filter((board) => board.id !== id);

  try {
    storage.setItem(KEY, JSON.stringify([{ id, openedAt: now }, ...others].slice(0, MAX_BOARDS)));
  } catch {
    // приватный режим или запрет хранилища: просто не запоминаем
  }
};

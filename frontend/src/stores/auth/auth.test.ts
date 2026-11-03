import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "./auth";

const ilya = { name: "Ilya", email: "a@b.c" };

const respond = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

describe("auth store", () => {
  const fetchMock = vi.fn<typeof fetch>();
  let store: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    setActivePinia(createPinia());
    store = useAuthStore();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loadMe спрашивает сервер один раз", async () => {
    fetchMock.mockImplementation(async () => respond(200, ilya));

    await store.loadMe();
    await store.loadMe();

    expect(store.user).toEqual(ilya);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/me");
  });

  it("loadMe: гость и упавший сервер — просто нет пользователя", async () => {
    fetchMock.mockResolvedValueOnce(respond(200, null));
    await store.loadMe();
    expect(store.user).toBeNull();

    setActivePinia(createPinia());
    const another = useAuthStore();
    fetchMock.mockRejectedValueOnce(new TypeError("network"));
    await another.loadMe();
    expect(another.user).toBeNull();
  });

  it("login при успехе запоминает пользователя и не возвращает ошибку", async () => {
    fetchMock.mockResolvedValueOnce(respond(200, ilya));

    expect(await store.login("a@b.c", "secret123")).toBeNull();
    expect(store.user).toEqual(ilya);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/login");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual({ email: "a@b.c", password: "secret123" });
  });

  it("login при отказе отдаёт ошибку сервера", async () => {
    fetchMock.mockResolvedValueOnce(respond(401, { message: "Неверный email или пароль" }));

    expect(await store.login("a@b.c", "wrong")).toEqual({ message: "Неверный email или пароль" });
    expect(store.user).toBeNull();
  });

  it("register отдаёт ошибку с полем", async () => {
    fetchMock.mockResolvedValueOnce(respond(409, { field: "email", message: "Email уже занят" }));

    expect(await store.register("Ilya", "a@b.c", "secret123")).toEqual({
      field: "email",
      message: "Email уже занят",
    });
  });

  it("register при успехе сразу входит", async () => {
    fetchMock.mockResolvedValueOnce(respond(200, ilya));

    expect(await store.register("Ilya", "a@b.c", "secret123")).toBeNull();
    expect(store.user).toEqual(ilya);
  });

  it("сервер недоступен — понятная ошибка, а не исключение", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("network"));

    expect(await store.login("a@b.c", "secret123")).toEqual({ message: "Сервер недоступен" });
  });

  it("не JSON в ответе (502 от прокси) — тоже понятная ошибка", async () => {
    fetchMock.mockResolvedValueOnce(new Response("<html>Bad Gateway</html>", { status: 502 }));

    expect(await store.login("a@b.c", "secret123")).toEqual({ message: "Сервер недоступен" });
  });

  it("logout забывает пользователя", async () => {
    fetchMock.mockResolvedValueOnce(respond(200, ilya));
    await store.login("a@b.c", "secret123");
    fetchMock.mockResolvedValueOnce(respond(204));

    await store.logout();

    expect(store.user).toBeNull();
    expect(fetchMock.mock.calls[1][0]).toBe("/api/logout");
  });
});

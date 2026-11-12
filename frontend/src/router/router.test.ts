import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { guard, reloadOnStaleChunk, routes } from "./index";

const stub = { template: "<div />" };

const makeRouter = () => {
  const router = createRouter({
    history: createMemoryHistory(),
    // страницы не грузим: для охраны важны только пути и meta
    routes: routes.map((route) =>
      "redirect" in route ? route : { path: route.path, meta: route.meta, component: stub },
    ),
  });

  router.beforeEach(guard);

  return router;
};

describe("router guard", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("null")),
    );
  });

  const signIn = () => {
    const auth = useAuthStore();

    auth.user = { name: "Ilya", email: "a@b.c" };
    auth.loaded = true;
  };

  const visit = async (path: string) => {
    const router = makeRouter();

    await router.push(path);

    return router.currentRoute.value.path;
  };

  it("гость видит лендос и формы", async () => {
    expect(await visit("/")).toBe("/");
    expect(await visit("/login")).toBe("/login");
    expect(await visit("/register")).toBe("/register");
  });

  it("гостя с главной уводит на вход", async () => {
    expect(await visit("/home")).toBe("/login");
  });

  it("вошедшего с лендоса и форм уводит на главную", async () => {
    signIn();

    expect(await visit("/")).toBe("/home");
    expect(await visit("/login")).toBe("/home");
    expect(await visit("/register")).toBe("/home");
    expect(await visit("/home")).toBe("/home");
  });

  it("доска открыта всем и не ждёт ответа /api/me", async () => {
    expect(await visit("/draw")).toBe("/draw");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("неизвестный адрес ведёт на лендос", async () => {
    expect(await visit("/nope")).toBe("/");
  });
});

// после деплоя у вкладки со старой сборкой нет файлов страниц: переход падает молча
describe("reloadOnStaleChunk", () => {
  const goHome = async (error: Error) => {
    const assign = vi.fn();
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", component: stub },
        { path: "/home", component: () => Promise.reject(error) },
      ],
    });

    router.onError((err, to, from) => reloadOnStaleChunk(err, to, from, assign));
    await router.push("/").catch(() => {});
    await router.push("/home").catch(() => {});

    return assign;
  };

  it.each([
    "Failed to fetch dynamically imported module: https://x/assets/HomeView-old.js",
    "Importing a module script failed.",
    "error loading dynamically imported module",
  ])("файл страницы не загрузился — открываем адрес заново: %s", async (message) => {
    expect(await goHome(new TypeError(message))).toHaveBeenCalledWith("/home");
  });

  it("первый переход после загрузки не перезагружает — иначе страница перезагружалась бы по кругу", async () => {
    const assign = vi.fn();
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/home",
          component: () => Promise.reject(new TypeError("Importing a module script failed.")),
        },
      ],
    });

    router.onError((err, to, from) => reloadOnStaleChunk(err, to, from, assign));
    await router.push("/home").catch(() => {});

    expect(assign).not.toHaveBeenCalled();
  });

  it("обычную ошибку не трогает", async () => {
    expect(await goHome(new Error("boom"))).not.toHaveBeenCalled();
  });
});

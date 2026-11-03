import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { guard, routes } from "./index";

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

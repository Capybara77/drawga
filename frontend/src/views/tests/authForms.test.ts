import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import LoginView from "../LoginView.vue";
import RegisterView from "../RegisterView.vue";

const stub = { template: "<div />" };
const fetchMock = vi.fn<typeof fetch>();

const mountForm = async (component: typeof LoginView | typeof RegisterView) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: stub },
      { path: "/home", component: stub },
      { path: "/login", component: stub },
      { path: "/register", component: stub },
    ],
  });

  await router.push("/login");

  const wrapper = mount(component, { global: { plugins: [createPinia(), router] } });

  return { wrapper, router };
};

const respond = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

describe("формы входа и регистрации", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("успешный вход ведёт на главную", async () => {
    fetchMock.mockResolvedValueOnce(respond(200, { name: "Ilya", email: "a@b.c" }));
    const { wrapper, router } = await mountForm(LoginView);

    await wrapper.find('input[type="email"]').setValue("a@b.c");
    await wrapper.find('input[type="password"]').setValue("secret123");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual({
      email: "a@b.c",
      password: "secret123",
    });
    expect(router.currentRoute.value.path).toBe("/home");
  });

  it("неверный пароль показывает ошибку и оставляет на форме", async () => {
    fetchMock.mockResolvedValueOnce(respond(401, { message: "Неверный email или пароль" }));
    const { wrapper, router } = await mountForm(LoginView);

    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Неверный email или пароль");
    expect(router.currentRoute.value.path).toBe("/login");
  });

  it("пока запрос идёт, кнопка выключена", async () => {
    let finish: (response: Response) => void = () => {};
    fetchMock.mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
    const { wrapper } = await mountForm(LoginView);

    await wrapper.find("form").trigger("submit");
    expect(wrapper.find("button").attributes("disabled")).toBeDefined();

    finish(respond(401, { message: "нет" }));
    await flushPromises();
    expect(wrapper.find("button").attributes("disabled")).toBeUndefined();
  });

  it("регистрация: ошибка про email показана именно под полем email", async () => {
    fetchMock.mockResolvedValueOnce(respond(409, { field: "email", message: "Email уже занят" }));
    const { wrapper } = await mountForm(RegisterView);

    await wrapper.find('input[autocomplete="name"]').setValue("Ilya");
    await wrapper.find('input[type="email"]').setValue("a@b.c");
    await wrapper.find('input[type="password"]').setValue("secret123");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    const emailField = wrapper.find('input[type="email"]').element.closest("label");

    expect(emailField?.textContent).toContain("Email уже занят");
    expect(wrapper.find('input[type="email"]').attributes("aria-invalid")).toBe("true");
  });

  it("успешная регистрация ведёт на главную", async () => {
    fetchMock.mockResolvedValueOnce(respond(200, { name: "Ilya", email: "a@b.c" }));
    const { wrapper, router } = await mountForm(RegisterView);

    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(router.currentRoute.value.path).toBe("/home");
  });
});

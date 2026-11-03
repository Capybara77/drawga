import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import type { WebSocketService } from "@/services/webSocketService";
import SettingsContainer from "../SettingsContainer.vue";

const { copy, toastAdd } = vi.hoisted(() => ({ copy: vi.fn(), toastAdd: vi.fn() }));

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useClipboard: () => ({ copy }),
}));
vi.mock("@nuxt/ui/composables/useToast", () => ({ useToast: () => ({ add: toastAdd }) }));
vi.mock("@nuxt/ui/components/DropdownMenu.vue", () => ({
  default: { name: "UDropdownMenu", props: ["items"], template: "<div />" },
}));
vi.mock("@nuxt/ui/components/Button.vue", () => ({ default: { template: "<div />" } }));
vi.mock("@nuxt/ui/components/Modal.vue", () => ({ default: { template: "<div />" } }));

type Item = { label: string; to?: string; onSelect?: () => Promise<void> | void };

const menuItem = (label: string) => {
  const wrapper = mount(SettingsContainer, {
    props: { socket: {} as WebSocketService },
    global: { plugins: [createPinia()] },
  });
  const items = wrapper.findComponent({ name: "UDropdownMenu" }).props("items") as Item[][];

  return items.flat().find((item) => item.label === label);
};

describe("SettingsContainer: доски", () => {
  beforeEach(() => {
    copy.mockClear();
    toastAdd.mockClear();
  });

  it("«Новая доска» ведёт на /draw/new", () => {
    expect(menuItem("Новая доска")?.to).toBe("/draw/new");
  });

  it("«Скопировать ссылку» копирует адрес текущей доски и говорит об этом", async () => {
    await menuItem("Скопировать ссылку")?.onSelect?.();

    expect(copy).toHaveBeenCalledWith(location.href);
    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ title: "Ссылка скопирована" }));
  });
});

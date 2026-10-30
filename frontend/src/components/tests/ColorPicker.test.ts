import { describe, it, expect } from "vite-plus/test";
import { mount } from "@vue/test-utils";
import ColorPicker from "../ColorPicker.vue";

describe("ColorPicker.vue", () => {
  it("по клику отдаёт цвет в формате стора — без #", async () => {
    const wrapper = mount(ColorPicker, { props: { isOpen: true, colorsList: ["c92a2a"] } });

    await wrapper.find(".color-item").trigger("click");

    expect(wrapper.emitted("colorClick")).toEqual([["c92a2a"]]);
  });
});

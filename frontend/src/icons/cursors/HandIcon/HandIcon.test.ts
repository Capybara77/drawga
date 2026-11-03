import { describe, it, expect } from "vite-plus/test";
import { mount } from "@vue/test-utils";
import HandIcon from "./HandIcon.vue";

describe("HandIcon.vue", () => {
  it("рендерит svg с классом иконки курсора", () => {
    const svg = mount(HandIcon).find("svg");

    expect(svg.exists()).toBe(true);
    expect(svg.attributes("viewBox")).toBe("0 0 24 24");
    expect(svg.classes()).toContain("cursor-icon");
  });
});

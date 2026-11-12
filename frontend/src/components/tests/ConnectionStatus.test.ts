import { describe, expect, it } from "vite-plus/test";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import type { WebSocketService } from "@/services/webSocketService";
import ConnectionStatus from "../ConnectionStatus.vue";

// у сервиса для плашки важны только online и событие status
const fakeSocket = (online: boolean) =>
  Object.assign(new EventTarget(), { online }) as unknown as WebSocketService;

const setOnline = async (socket: WebSocketService, online: boolean) => {
  socket.online = online;
  socket.dispatchEvent(new CustomEvent("status"));
  await nextTick();
};

describe("ConnectionStatus", () => {
  it("при живой связи ничего не показывает", () => {
    const wrapper = mount(ConnectionStatus, { props: { socket: fakeSocket(true) } });

    expect(wrapper.find('[role="status"]').exists()).toBe(false);
  });

  it("при обрыве закрывает доску плашкой, при возврате связи убирает", async () => {
    const socket = fakeSocket(true);
    const wrapper = mount(ConnectionStatus, { props: { socket } });

    await setOnline(socket, false);
    expect(wrapper.find('[role="status"]').text()).toContain("Нет связи");

    await setOnline(socket, true);
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
  });
});

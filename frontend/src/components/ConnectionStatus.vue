<script setup lang="ts">
import type { WebSocketService } from "@/services/webSocketService";
import { useEventListener } from "@vueuse/core";
import { ref } from "vue";

const { socket } = defineProps<{ socket: WebSocketService }>();

const online = ref(socket.online);

useEventListener(socket, "status", () => (online.value = socket.online));
</script>

<template>
  <!-- ponytail: без связи доску просто закрываем — правки офлайн потерялись бы при переподключении -->
  <div v-if="!online" class="offline" role="status">
    <p class="offline-text">Нет связи с сервером. Переподключаемся…</p>
  </div>
</template>

<style scoped>
.offline {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: color-mix(in srgb, var(--clr-canvas) 60%, transparent);
  /* при загрузке страницы сокет открывается за доли секунды — не мигаем */
  animation: appear 0.2s ease-out 0.5s both;
}

.offline-text {
  padding: 10px 16px;
  border: 2px solid var(--clr-border);
  border-radius: 5px;
  background-color: var(--clr-panel);
  color: var(--clr-text);
}

@keyframes appear {
  from {
    opacity: 0;
  }
}
</style>

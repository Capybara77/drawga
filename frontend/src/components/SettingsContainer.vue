<script setup lang="ts">
import type { WebSocketService } from "@/services/webSocketService";
import { useColorMode, useCycleList, type BasicColorSchema } from "@vueuse/core";
import { computed, ref, watchEffect } from "vue";
import Sun from "@primeicons/vue/sun";
import User from "@primeicons/vue/user";
import Wrench from "@primeicons/vue/wrench";
import Server from "@primeicons/vue/server";
import Moon from "@primeicons/vue/moon";
import Desktop from "@primeicons/vue/desktop";
import Save from "@primeicons/vue/save";
import DeleteLeft from "@primeicons/vue/delete-left";

const modes: BasicColorSchema[] = ["dark", "light", "auto"];

const { socket } = defineProps<{
  socket: WebSocketService;
}>();

const { store, system } = useColorMode({
  attribute: "class",
  initialValue: "auto",
});

const { state, next } = useCycleList(modes, { initialValue: store.value });

const isSettingsOpened = ref(false);

const myColorMode = computed(() => (store.value === "auto" ? system.value : store.value));

const toggleSettings = () => {
  isSettingsOpened.value = !isSettingsOpened.value;
};

const clearBoard = () => {
  socket.send(["clear"]);
  isSettingsOpened.value = false;
};

watchEffect(() => {
  store.value = state.value;
});
</script>

<template>
  <div class="settings-wrapper">
    <button class="settings-show-btn" id="settings-show-btn" @click="toggleSettings">
      <span>
        <Wrench />
      </span>
    </button>
    <section class="settings-container" v-if="isSettingsOpened">
      <button class="settings-item" onclick="location.replace(&quot;/login&quot;);" id="user-btn">
        <div class="settings-item-icon">
          <User />
        </div>
        <div class="settings-item-text">Профиль</div>
        <div class="settings-item-shortcut">Ctrl+U</div>
      </button>
      <button class="settings-item" id="save-btn">
        <div class="settings-item-icon">
          <Save />
        </div>
        <div class="settings-item-text">Сохранить файл</div>
        <div class="settings-item-shortcut">Ctrl+D</div>
      </button>
      <button class="settings-item" id="save-server-btn">
        <div class="settings-item-icon">
          <Server />
        </div>
        <div class="settings-item-text">Сохранить доску на сервере</div>
        <div class="settings-item-shortcut">Ctrl+Shift+O</div>
      </button>
      <button class="settings-item" id="clear-btn" @click="clearBoard">
        <div class="settings-item-icon">
          <DeleteLeft />
        </div>
        <div class="settings-item-text">Очистить полотно</div>
        <div class="settings-item-shortcut">Ctrl+Shift+Del</div>
      </button>
      <hr />
      <button class="settings-item" id="change-theme-btn" @click="next()">
        <div class="settings-item-icon">
          <Desktop v-if="store === 'auto'" />
          <Moon v-else-if="myColorMode === 'dark'" />
          <Sun v-else />
        </div>
        <div class="settings-item-text" id="theme-inner-text">
          {{ store === "dark" ? "Темная" : store === "auto" ? "Системная" : "Светлая" }} тема
        </div>
        <div class="settings-item-shortcut">Ctrl+Shift+T</div>
      </button>
    </section>
  </div>
</template>

<style scoped>
.settings-wrapper {
  position: absolute;
  right: 10px;
  top: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 1.125rem;
  text-align: start;
}

.settings-show-btn {
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
}

.settings-show-icon {
  width: 30px;
  height: 30px;
  stroke: var(--clr-icon);
}

.settings-container {
  border: 2px solid var(--clr-border);
  background-color: var(--clr-background-transparent);
  border-radius: 6px;
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
}

.settings-item {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 1rem;
  color: var(--clr-text);
  background-color: transparent;
  border: none;
  outline: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 5px 10px;
}

.settings-item:hover {
  background-color: var(--clr-hover);
}

.settings-item-icon {
  margin-right: 5px;
  width: 20px;
  height: 20px;
  color: var(--clr-icon);
}

.settings-item-icon svg {
  width: 18px;
  height: 18px;
}

.settings-show-btn svg {
  width: 26px;
  height: 26px;
  color: var(--clr-icon);
}

.settings-item-text {
  margin-right: 12px;
  color: var(--clr-text);
}

.settings-item-shortcut {
  margin-left: auto;
  color: var(--clr-shortcut);
}

.settings-theme-container {
  padding: 5px 10px;
}
</style>

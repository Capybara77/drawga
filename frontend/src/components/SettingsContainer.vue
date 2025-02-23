<script setup lang="ts">
import ClearIcon from '@/icons/settings/ClearIcon/ClearIcon.vue';
import MoonIcon from '@/icons/settings/MoonIcon/MoonIcon.vue';
import SaveIcon from '@/icons/settings/SaveIcon/SaveIcon.vue';
import ServerIcon from '@/icons/settings/ServerIcon/ServerIcon.vue';
import SettingsIcon from '@/icons/settings/SettingsIcon/SettingsIcon.vue';
import SunIcon from '@/icons/settings/SunIcon/SunIcon.vue';
import UserIcon from '@/icons/settings/UserIcon/UserIcon.vue';
import type { WebSocketService } from '@/services/webSocketService';
import { useColorMode, useCycleList } from '@vueuse/core';
import { computed, ref, watchEffect } from 'vue';

const { socket } = defineProps<{
  socket: WebSocketService;
}>();

const mode = useColorMode({
  attribute: 'class',
  initialValue: 'dark',
});

const { state, next } = useCycleList(['dark', 'light'] as const, { initialValue: mode });

watchEffect(() => (mode.value = state.value));

const isSettingsOpened = ref(false);

const isDarkTheme = computed(() => state.value === 'dark');

const toggleSettings = () => {
  isSettingsOpened.value = !isSettingsOpened.value;
};

const clearBoard = () => {
  socket.send(['clear:::'.length as unknown as string]);
  socket.send(['clear']);
};
</script>

<template>
  <div class="settings-wrapper">
    <button class="settings-show-btn" id="settings-show-btn" @click="toggleSettings">
      <span>
        <SettingsIcon />
      </span>
    </button>
    <section class="settings-container" v-if="isSettingsOpened">
      <button class="settings-item" onclick="location.replace('/login')" id="user-btn">
        <div class="settings-item-icon">
          <UserIcon />
        </div>
        <div class="settings-item-text">Профиль</div>
        <div class="settings-item-shortcut">Ctrl+U</div>
      </button>
      <button class="settings-item" id="save-btn">
        <div class="settings-item-icon">
          <SaveIcon />
        </div>
        <div class="settings-item-text">Сохранить файл</div>
        <div class="settings-item-shortcut">Ctrl+D</div>
      </button>
      <button class="settings-item" id="save-server-btn">
        <div class="settings-item-icon">
          <ServerIcon />
        </div>
        <div class="settings-item-text">Сохранить доску на сервере</div>
        <div class="settings-item-shortcut">Ctrl+Shift+O</div>
      </button>
      <button class="settings-item" id="clear-btn" @click="clearBoard">
        <div class="settings-item-icon">
          <ClearIcon />
        </div>
        <div class="settings-item-text">Очистить полотно</div>
        <div class="settings-item-shortcut">Ctrl+Shift+Del</div>
      </button>
      <hr />
      <button class="settings-item" id="change-theme-btn" @click="next()">
        <div class="settings-item-icon">
          <MoonIcon v-if="isDarkTheme" />
          <SunIcon v-else />
        </div>
        <div class="settings-item-text" id="theme-inner-text">
          {{ isDarkTheme ? 'Темная' : 'Светлая' }} тема
        </div>
        <div class="settings-item-shortcut">Ctrl+Shift+T</div>
      </button>
    </section>
  </div>
</template>

<style>
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

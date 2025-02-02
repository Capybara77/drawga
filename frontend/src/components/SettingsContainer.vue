<script setup lang="ts">
import ClearIcon from '@/icons/settings/ClearIcon.vue';
import MoonIcon from '@/icons/settings/MoonIcon.vue';
import SaveIcon from '@/icons/settings/SaveIcon.vue';
import ServerIcon from '@/icons/settings/ServerIcon.vue';
import SettingsIcon from '@/icons/settings/SettingsIcon.vue';
import SunIcon from '@/icons/settings/SunIcon.vue';
import UserIcon from '@/icons/settings/UserIcon.vue';
import { THEME_KEY, useThemeStore, type Theme } from '@/stores/theme';
import { onMounted, ref } from 'vue';

const isSettingsOpened = ref(false);

const themeStore = useThemeStore();

const toggleSettings = () => {
  isSettingsOpened.value = !isSettingsOpened.value;
};

onMounted(() => {
  const newTheme = (localStorage.getItem(THEME_KEY) ?? 'darkTheme') as Theme;

  document.documentElement.className = newTheme;
  themeStore.onMount(newTheme);
});
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
          <!-- <?xml version="1.0" encoding="utf-8"?> -->
          <UserIcon />
        </div>
        <div class="settings-item-text">Профиль</div>
        <div class="settings-item-shortcut">Ctrl+U</div>
      </button>
      <button class="settings-item" id="save-btn">
        <div class="settings-item-icon">
          <!-- <?xml version="1.0" encoding="utf-8"?> -->
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
      <button class="settings-item" id="clear-btn">
        <div class="settings-item-icon">
          <ClearIcon />
        </div>
        <div class="settings-item-text">Очистить полотно</div>
        <div class="settings-item-shortcut">Ctrl+Shift+Del</div>
      </button>
      <hr />
      <button class="settings-item" id="change-theme-btn" @click="themeStore.toggleTheme">
        <div class="settings-item-icon" id="moon-icon-container" v-if="themeStore.isLightTheme">
          <MoonIcon />
        </div>

        <div class="settings-item-icon" id="sun-icon-container" v-if="themeStore.isDarkTheme">
          <SunIcon />
        </div>

        <div class="settings-item-text" id="theme-inner-text">
          {{ themeStore.isLightTheme ? 'Темная' : 'Светлая' }} тема
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

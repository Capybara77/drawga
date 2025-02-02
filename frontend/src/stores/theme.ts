import { defineStore } from 'pinia';

export type Theme = 'lightTheme' | 'darkTheme';

export const THEME_KEY = 'THEME_KEY';

const defaultState: Record<string, Theme> = {
  theme: 'darkTheme',
};

export const useThemeStore = defineStore('theme', {
  state: () => defaultState,
  getters: {
    isLightTheme: (state) => state.theme === 'lightTheme',
    isDarkTheme: (state) => state.theme === 'darkTheme',
  },
  actions: {
    onMount(newTheme: Theme) {
      this.theme = newTheme;
    },
    toggleTheme() {
      const newTheme = this.theme === 'lightTheme' ? 'darkTheme' : 'lightTheme';
      this.theme = newTheme;
      localStorage.setItem(THEME_KEY, newTheme);
    },
  },
});

import { defineStore } from 'pinia';

export type Theme = 'lightTheme' | 'darkTheme';
export const THEME_KEY = 'THEME_KEY';

const defaultState = {
  theme: 'darkTheme',
};

export const useThemeStore = defineStore('theme', {
  state: () => ({ ...defaultState }), // Возвращаем копию объекта
  getters: {
    isLightTheme: (state) => state.theme === 'lightTheme',
    isDarkTheme: (state) => state.theme === 'darkTheme',
  },
  actions: {
    onMount() {
      const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
      if (savedTheme && ['lightTheme', 'darkTheme'].includes(savedTheme)) {
        this.theme = savedTheme;
      } else {
        this.theme = 'darkTheme'; // Устанавливаем тему по умолчанию
        localStorage.setItem(THEME_KEY, 'darkTheme');
      }
    },
    toggleTheme() {
      const newTheme = this.theme === 'lightTheme' ? 'darkTheme' : 'lightTheme';
      if (this.theme !== newTheme) {
        this.theme = newTheme;
        localStorage.setItem(THEME_KEY, newTheme);
        document.documentElement.className = newTheme;
      }
    },
  },
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useThemeStore, THEME_KEY } from '@/stores/theme'; // Путь к вашему стору

// Функция для создания нового экземпляра стора
function createTestStore() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return useThemeStore();
}

describe('Theme Store', () => {
  beforeEach(() => {
    // Мокаем localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Очищаем localStorage
    localStorage.clear();

    // Сбрасываем классы document.documentElement
    document.documentElement.className = '';
  });

  it('инициализируется с начальным состоянием темы', () => {
    const store = createTestStore();
    expect(store.theme).toBe('darkTheme'); // Проверяем начальное состояние
  });

  it('геттер isLightTheme возвращает true для светлой темы', () => {
    const store = createTestStore();
    store.toggleTheme();
    expect(store.isLightTheme).toBe(true);
  });

  it('геттер isDarkTheme возвращает true для темной темы', () => {
    const store = createTestStore();
    expect(store.isDarkTheme).toBe(true);
  });

  it('метод onMount обновляет тему', () => {
    const store = createTestStore();
    store.toggleTheme();
    expect(store.theme).toBe('lightTheme');
  });

  it('метод toggleTheme переключает тему и сохраняет её в localStorage', () => {
    const store = createTestStore();

    // Начальная тема - darkTheme
    expect(store.theme).toBe('darkTheme');

    // Переключаем тему
    store.toggleTheme();

    // Проверяем, что тема изменилась на lightTheme
    expect(store.theme).toBe('lightTheme');

    // Проверяем, что тема сохранена в localStorage
    expect(localStorage.getItem(THEME_KEY)).toBe('lightTheme');

    // Проверяем, что класс документа изменён
    expect(document.documentElement.className).toBe('lightTheme');

    // Переключаем тему обратно
    store.toggleTheme();

    // Проверяем, что тема изменилась на darkTheme
    expect(store.theme).toBe('darkTheme');

    // Проверяем, что тема сохранена в localStorage
    expect(localStorage.getItem(THEME_KEY)).toBe('darkTheme');

    // Проверяем, что класс документа изменён
    expect(document.documentElement.className).toBe('darkTheme');
  });
});

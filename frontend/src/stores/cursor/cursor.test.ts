import { setActivePinia, createPinia } from 'pinia';
import { describe, beforeEach, it, expect } from 'vitest';
import { constantsForKeyboard, useCursorStore } from './cursor';
import type { MyCursor } from '@/types';

describe('Cursor Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('инициализирует с правильным значением', () => {
    const store = useCursorStore();
    expect(store.cursor).toBe('pointer');
  });

  it('правильно обновляет состояние', () => {
    const store = useCursorStore();

    store.setCursor('eraser');

    expect(store.cursor).toBe('eraser');
  });

  it('обрабатывает все возможные типы курсоров', () => {
    const store = useCursorStore();

    for (const cursor of Object.values(constantsForKeyboard)) {
      store.setCursor(cursor as MyCursor);
      expect(store.cursor).toBe(cursor);
    }
  });
});

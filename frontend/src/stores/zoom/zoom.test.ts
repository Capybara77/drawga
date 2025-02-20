// tests/unit/zoomStore.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useZoomStore } from './zoom'; // Путь к вашему стору

describe('Zoom Store', () => {
  let store: ReturnType<typeof useZoomStore>;

  beforeEach(() => {
    // Создаём новый экземпляр Pinia
    setActivePinia(createPinia());
    store = useZoomStore();

    // Сбрасываем состояние zoom
    store.zoom = 1;
  });

  it('Math.round10 округляет числа корректно', () => {
    expect(Math.round10(1.05, -1)).toBe(1.1); // Округление до 1.1
    expect(Math.round10(1.15, -1)).toBe(1.2); // Округление до 1.2
    expect(Math.round10(1.55, -1)).toBe(1.6); // Округление до 1.6
  });

  it('инициализируется с начальным значением zoom', () => {
    expect(store.zoom).toBe(1);
  });

  it('геттер percentage возвращает корректное значение в процентах', () => {
    expect(store.percentage).toBe('100%');

    store.zoom = 0.5;
    expect(store.percentage).toBe('50%');

    store.zoom = 1.5;
    expect(store.percentage).toBe('150%');
  });

  it('метод increaseZoom увеличивает zoom с округлением до одного знака после запятой', () => {
    store.increaseZoom();
    expect(store.zoom).toBe(1.1);

    store.increaseZoom();
    expect(store.zoom).toBe(1.2);

    store.zoom = 1.24;
    store.increaseZoom();
    expect(store.zoom).toBe(1.3);
  });

  it('метод decreaseZoom уменьшает zoom с округлением до одного знака после запятой', () => {
    store.zoom = 1;

    store.decreaseZoom();
    expect(store.zoom).toBe(0.9);

    store.decreaseZoom();
    expect(store.zoom).toBe(0.8);

    store.zoom = 0.1;
    store.decreaseZoom();
    expect(store.zoom).toBe(0.1);
  });
});

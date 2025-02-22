import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useZoomStore } from './zoom'; // Путь к вашему стору

describe('Zoom Store', () => {
  let store: ReturnType<typeof useZoomStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useZoomStore();

    store.zoom = 1;
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

  it('не позволяет увеличить zoom больше максимального значения', () => {
    store.zoom = 4.9;
    store.increaseZoom();
    expect(store.zoom).toBe(5);
    store.increaseZoom();
    expect(store.zoom).toBe(5);
  });
});

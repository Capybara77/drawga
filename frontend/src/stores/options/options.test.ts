import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useOptionsStore } from './options';

describe('options store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('инициализируется с начальным состоянием', () => {
    const store = useOptionsStore();
    expect(store.colors).toEqual({
      fillColor: '5f3dc4',
      borderColor: 'a61e4d',
      textColor: '000000',
    });
    expect(store.lineWidth).toBe(12);
    expect(store.textSize).toBe('1rem');
    expect(store.fillStyle).toBe('hachure');
    expect(store.opacity).toBe(1);
  });

  it('геттер getterColors возвращает правильные цвета с префиксом #', () => {
    const store = useOptionsStore();
    expect(store.getterColors).toEqual({
      fillColor: '#5f3dc4',
      borderColor: '#a61e4d',
      textColor: '#000000',
    });
  });

  it('геттер getterColorsWithOpacity возвращает цвета с прозрачностью', () => {
    const store = useOptionsStore();
    expect(store.getterColorsWithOpacity).toEqual({
      fillColor: 'rgba(95, 61, 196, 1)',
      borderColor: 'rgba(166, 30, 77, 1)',
      textColor: 'rgba(0, 0, 0, 1)',
    });

    // Изменяем opacity и проверяем результат
    store.setOpacity(0.5);
    expect(store.getterColorsWithOpacity).toEqual({
      fillColor: 'rgba(95, 61, 196, 0.5)',
      borderColor: 'rgba(166, 30, 77, 0.5)',
      textColor: 'rgba(0, 0, 0, 0.5)',
    });
  });

  it('метод setFillColor обновляет цвет заливки', () => {
    const store = useOptionsStore();
    store.setFillColor('ff0000'); // Устанавливаем новый цвет
    expect(store.colors.fillColor).toBe('ff0000');
  });

  it('метод setBorderColor обновляет цвет границы', () => {
    const store = useOptionsStore();
    store.setBorderColor('00ff00'); // Устанавливаем новый цвет
    expect(store.colors.borderColor).toBe('00ff00');
  });

  it('метод setTextColor обновляет цвет текста', () => {
    const store = useOptionsStore();
    store.setTextColor('0000ff'); // Устанавливаем новый цвет
    expect(store.colors.textColor).toBe('0000ff');
  });

  it('метод setLineWidth обновляет толщину линии', () => {
    const store = useOptionsStore();
    store.setLineWidth(20); // Устанавливаем новую толщину
    expect(store.lineWidth).toBe(20);
  });

  it('метод setTextSize обновляет размер текста', () => {
    const store = useOptionsStore();
    store.setTextSize('1.5rem'); // Устанавливаем новый размер
    expect(store.textSize).toBe('1.5rem');
  });

  it('метод setFillStyle обновляет стиль заливки', () => {
    const store = useOptionsStore();
    store.setFillStyle('solid'); // Устанавливаем новый стиль
    expect(store.fillStyle).toBe('solid');
  });

  it('метод setOpacity обновляет прозрачность', () => {
    const store = useOptionsStore();
    store.setOpacity(0.75); // Устанавливаем новое значение прозрачности
    expect(store.opacity).toBe(0.75);
  });
});

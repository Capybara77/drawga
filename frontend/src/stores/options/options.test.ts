import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useOptionsStore } from './options';

describe('options store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('options store validation', () => {
    describe('цвета нахуй', () => {
      it('не принимает невалидные hex-коды цветов', () => {
        const store = useOptionsStore();

        store.setFillColor('ff');
        expect(store.colors.fillColor).toBe('5f3dc4');

        store.setBorderColor('a61e4dff');
        expect(store.colors.borderColor).toBe('a61e4d');

        store.setTextColor('xyztuw');
        expect(store.colors.textColor).toBe('000000');
      });
    });

    describe('толщина линии сука', () => {
      it('не принимает отрицательные значения', () => {
        const store = useOptionsStore();

        store.setLineWidth(-5);
        expect(store.lineWidth).toBe(5);

        store.setLineWidth(0);
        expect(store.lineWidth).toBe(5);
      });

      it('ограничивает максимальное значение', () => {
        const store = useOptionsStore();

        store.setLineWidth(1000);
        expect(store.lineWidth).toBe(20);
      });
    });

    describe('прозрачность епта', () => {
      it('не принимает значения вне диапазона 0-1', () => {
        const store = useOptionsStore();

        store.setOpacity(-0.5);
        expect(store.opacity).toBe(0.1);

        store.setOpacity(1.5);
        expect(store.opacity).toBe(1);
      });
    });

    describe('размер текста нахер', () => {
      it('не принимает невалидный формат', () => {
        const store = useOptionsStore();

        store.setTextSize('42px');
        expect(store.textSize).toBe('1rem');

        store.setTextSize('большой');
        expect(store.textSize).toBe('1rem');

        store.setTextSize('-2rem');
        expect(store.textSize).toBe('1rem');
      });
    });
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

    store.setOpacity(0.5);
    expect(store.getterColorsWithOpacity).toEqual({
      fillColor: 'rgba(95, 61, 196, 0.5)',
      borderColor: 'rgba(166, 30, 77, 0.5)',
      textColor: 'rgba(0, 0, 0, 0.5)',
    });
  });

  it('метод setFillColor обновляет цвет заливки', () => {
    const store = useOptionsStore();
    store.setFillColor('ff0000');
    expect(store.colors.fillColor).toBe('ff0000');
  });

  it('метод setBorderColor обновляет цвет границы', () => {
    const store = useOptionsStore();
    store.setBorderColor('00ff00');
    expect(store.colors.borderColor).toBe('00ff00');
  });

  it('метод setTextColor обновляет цвет текста', () => {
    const store = useOptionsStore();
    store.setTextColor('0000ff');
    expect(store.colors.textColor).toBe('0000ff');
  });

  it('метод setLineWidth обновляет толщину линии', () => {
    const store = useOptionsStore();
    store.setLineWidth(20);
    expect(store.lineWidth).toBe(20);
  });

  it('метод setTextSize обновляет размер текста', () => {
    const store = useOptionsStore();
    store.setTextSize('1.5rem');
    expect(store.textSize).toBe('1.5rem');
  });

  it('метод setFillStyle обновляет стиль заливки', () => {
    const store = useOptionsStore();
    store.setFillStyle('solid');
    expect(store.fillStyle).toBe('solid');
  });

  it('метод setOpacity обновляет прозрачность', () => {
    const store = useOptionsStore();
    store.setOpacity(0.75);
    expect(store.opacity).toBe(0.75);
  });
});

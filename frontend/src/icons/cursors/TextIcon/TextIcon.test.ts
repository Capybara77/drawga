import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TextIcon from './TextIcon.vue'; // Укажите правильный путь к компоненту

describe('TextIcon.vue', () => {
  it('должен рендерить SVG элемент', () => {
    const wrapper = mount(TextIcon);
    expect(wrapper.find('svg').exists()).toBe(true); // Проверяем, что SVG элемент существует
  });

  it('должен иметь правильный атрибут viewBox', () => {
    const wrapper = mount(TextIcon);
    const svg = wrapper.find('svg');
    expect(svg.attributes('viewBox')).toBe('0 0 24 24'); // Проверяем атрибут viewBox
  });

  it('должен содержать polyline элемент с правильными атрибутами points', () => {
    const wrapper = mount(TextIcon);
    const polyline = wrapper.find('polyline');
    expect(polyline.exists()).toBe(true); // Проверяем, что polyline существует
    expect(polyline.attributes('points')).toBe('4 7 4 4 20 4 20 7'); // Проверяем атрибут points
  });

  it('должен содержать line элементы с правильными атрибутами x1, y1, x2, y2', () => {
    const wrapper = mount(TextIcon);

    const lines = wrapper.findAll('line');
    expect(lines).toHaveLength(2); // Проверяем, что есть 2 line элемента

    // Проверяем атрибуты x1, y1, x2, y2 у каждого line элемента
    expect(lines.at(0)?.attributes('x1')).toBe('9');
    expect(lines.at(0)?.attributes('y1')).toBe('20');
    expect(lines.at(0)?.attributes('x2')).toBe('15');
    expect(lines.at(0)?.attributes('y2')).toBe('20');

    expect(lines.at(1)?.attributes('x1')).toBe('12');
    expect(lines.at(1)?.attributes('y1')).toBe('4');
    expect(lines.at(1)?.attributes('x2')).toBe('12');
    expect(lines.at(1)?.attributes('y2')).toBe('20');
  });

  it('должен иметь правильные классы', () => {
    const wrapper = mount(TextIcon);
    const svg = wrapper.find('svg');
    expect(svg.classes()).toContain('cursor-icon');
    expect(svg.classes()).toContain('feather');
    expect(svg.classes()).toContain('feather-type');
  });
});

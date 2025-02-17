import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PointerIcon from './PointerIcon.vue'; // Укажите правильный путь к компоненту

describe('PointerIcon.vue', () => {
  it('должен рендерить SVG элемент', () => {
    const wrapper = mount(PointerIcon);
    expect(wrapper.find('svg').exists()).toBe(true); // Проверяем, что SVG элемент существует
  });

  it('должен иметь правильный атрибут viewBox', () => {
    const wrapper = mount(PointerIcon);
    const svg = wrapper.find('svg');
    expect(svg.attributes('viewBox')).toBe('0 0 24 24'); // Проверяем атрибут viewBox
  });

  it('должен содержать path элементы с правильными атрибутами d', () => {
    const wrapper = mount(PointerIcon);

    const paths = wrapper.findAll('path');
    expect(paths).toHaveLength(2); // Проверяем, что есть 2 path элемента

    // Проверяем атрибут d у каждого path элемента
    expect(paths.at(0)?.attributes('d')).toBe('M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z');
    expect(paths.at(1)?.attributes('d')).toBe('M13 13l6 6');
  });

  it('должен иметь правильные классы', () => {
    const wrapper = mount(PointerIcon);
    const svg = wrapper.find('svg');
    expect(svg.classes()).toContain('cursor-icon');
    expect(svg.classes()).toContain('feather');
    expect(svg.classes()).toContain('feather-mouse-pointer');
  });
});

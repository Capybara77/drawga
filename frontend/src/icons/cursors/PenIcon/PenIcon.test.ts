import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PenIcon from './PenIcon.vue'; // Укажите правильный путь к компоненту

describe('PenIcon.vue', () => {
  it('должен рендерить SVG элемент', () => {
    const wrapper = mount(PenIcon);
    expect(wrapper.find('svg').exists()).toBe(true); // Проверяем, что SVG элемент существует
  });

  it('должен иметь правильный атрибут viewBox', () => {
    const wrapper = mount(PenIcon);
    const svg = wrapper.find('svg');
    expect(svg.attributes('viewBox')).toBe('0 0 24 24'); // Проверяем атрибут viewBox
  });

  it('должен содержать path элементы с правильными атрибутами d', () => {
    const wrapper = mount(PenIcon);

    const paths = wrapper.findAll('path');
    expect(paths).toHaveLength(3); // Проверяем, что есть 3 path элемента

    // Проверяем атрибут d у каждого path элемента
    expect(paths.at(0)?.attributes('d')).toBe('M12 19l7-7 3 3-7 7-3-3z');
    expect(paths.at(1)?.attributes('d')).toBe('M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z');
    expect(paths.at(2)?.attributes('d')).toBe('M2 2l7.586 7.586');
  });

  it('должен содержать circle элемент с правильными атрибутами', () => {
    const wrapper = mount(PenIcon);
    const circle = wrapper.find('circle');
    expect(circle.exists()).toBe(true); // Проверяем, что circle существует
    expect(circle.attributes('cx')).toBe('11'); // Проверяем атрибут cx
    expect(circle.attributes('cy')).toBe('11'); // Проверяем атрибут cy
    expect(circle.attributes('r')).toBe('2'); // Проверяем радиус r
  });

  it('должен иметь правильные классы', () => {
    const wrapper = mount(PenIcon);
    const svg = wrapper.find('svg');
    expect(svg.classes()).toContain('cursor-icon');
    expect(svg.classes()).toContain('feather');
    expect(svg.classes()).toContain('feather-pen-tool');
  });
});

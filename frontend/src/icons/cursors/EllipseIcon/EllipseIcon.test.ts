import { mount } from '@vue/test-utils';
import EllipseIcon from './EllipseIcon.vue';
import { describe, it, expect } from 'vitest';

describe('EllipseIcon.vue', () => {
  it('должен рендерить SVG элемент', () => {
    const wrapper = mount(EllipseIcon);
    expect(wrapper.find('svg').exists()).toBe(true); // Проверяем, что SVG присутствует
  });

  it('должен иметь правильный атрибут viewBox', () => {
    const wrapper = mount(EllipseIcon);
    const svg = wrapper.find('svg');
    expect(svg.attributes('viewBox')).toBe('0 0 24 24'); // Проверяем атрибут viewBox
  });

  it('должен иметь правильный атрибут stroke', () => {
    const wrapper = mount(EllipseIcon);
    const svg = wrapper.find('svg');
    expect(svg.attributes('stroke')).toBe('currentColor'); // Проверяем атрибут stroke
  });

  it('должен иметь класс cursor-icon', () => {
    const wrapper = mount(EllipseIcon);
    const svg = wrapper.find('svg');
    expect(svg.classes()).toContain('cursor-icon'); // Проверяем, что класс cursor-icon присутствует
  });

  it('должен содержать circle элемент с правильными атрибутами', () => {
    const wrapper = mount(EllipseIcon);
    const circle = wrapper.find('circle');
    expect(circle.exists()).toBe(true);
    expect(circle.attributes('cx')).toBe('12'); // Проверяем атрибут cx
    expect(circle.attributes('cy')).toBe('12'); // Проверяем атрибут cy
    expect(circle.attributes('r')).toBe('10'); // Проверяем радиус r
  });
});

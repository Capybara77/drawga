import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RectangleIcon from './RectangleIcon.vue'; // Укажите правильный путь к компоненту

describe('RectangleIcon.vue', () => {
  it('должен рендерить SVG элемент', () => {
    const wrapper = mount(RectangleIcon);
    expect(wrapper.find('svg').exists()).toBe(true); // Проверяем, что SVG элемент существует
  });

  it('должен иметь правильный атрибут viewBox', () => {
    const wrapper = mount(RectangleIcon);
    const svg = wrapper.find('svg');
    expect(svg.attributes('viewBox')).toBe('0 0 24 24'); // Проверяем атрибут viewBox
  });

  it('должен содержать rect элемент с правильными атрибутами', () => {
    const wrapper = mount(RectangleIcon);
    const rect = wrapper.find('rect');
    expect(rect.exists()).toBe(true); // Проверяем, что rect существует
    expect(rect.attributes('x')).toBe('3'); // Проверяем атрибут x
    expect(rect.attributes('y')).toBe('3'); // Проверяем атрибут y
    expect(rect.attributes('width')).toBe('18'); // Проверяем ширину
    expect(rect.attributes('height')).toBe('18'); // Проверяем высоту
    expect(rect.attributes('rx')).toBe('2'); // Проверяем радиус скругления по горизонтали
    expect(rect.attributes('ry')).toBe('2'); // Проверяем радиус скругления по вертикали
  });

  it('должен иметь правильные классы', () => {
    const wrapper = mount(RectangleIcon);
    const svg = wrapper.find('svg');
    expect(svg.classes()).toContain('cursor-icon');
    expect(svg.classes()).toContain('feather');
    expect(svg.classes()).toContain('feather-square');
  });
});

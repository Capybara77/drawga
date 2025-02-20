// userIcon.test.js
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import UserIcon from './UserIcon.vue'; // Путь к вашему компоненту

describe('UserIcon', () => {
  it('должен рендерить корневой SVG элемент', () => {
    const wrapper = mount(UserIcon);
    const svgElement = wrapper.find('svg');

    expect(svgElement.exists()).toBe(true);
  });

  it('должен иметь правильные атрибуты SVG', () => {
    const wrapper = mount(UserIcon);
    const svgElement = wrapper.find('svg');

    expect(svgElement.attributes('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(svgElement.attributes('width')).toBe('24');
    expect(svgElement.attributes('height')).toBe('24');
    expect(svgElement.attributes('viewBox')).toBe('0 0 24 24');
    expect(svgElement.attributes('fill')).toBe('none');
    expect(svgElement.attributes('stroke')).toBe('currentColor');
    expect(svgElement.attributes('stroke-width')).toBe('2');
    expect(svgElement.attributes('stroke-linecap')).toBe('round');
    expect(svgElement.attributes('stroke-linejoin')).toBe('round');
    expect(svgElement.classes()).toContain('cursor-icon');
    expect(svgElement.classes()).toContain('fill-icon');
    expect(svgElement.classes()).toContain('feather');
    expect(svgElement.classes()).toContain('feather-user');
  });

  it('должен содержать элемент path с правильным атрибутом d', () => {
    const wrapper = mount(UserIcon);
    const pathElement = wrapper.find('path');

    expect(pathElement.exists()).toBe(true);

    const expectedPathData = 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2';

    expect(pathElement.attributes('d')).toBe(expectedPathData);
  });

  it('должен содержать элемент circle с правильными атрибутами', () => {
    const wrapper = mount(UserIcon);
    const circleElement = wrapper.find('circle');

    expect(circleElement.exists()).toBe(true);
    expect(circleElement.attributes('cx')).toBe('12');
    expect(circleElement.attributes('cy')).toBe('7');
    expect(circleElement.attributes('r')).toBe('4');
  });
});

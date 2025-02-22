import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ImageIcon from './ImageIcon.vue';

describe('ImageIcon.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(ImageIcon);
  });

  it('должен рендерить SVG элемент', () => {
    expect(wrapper.find('svg').exists()).toBe(true);
  });

  it('должен иметь правильный атрибут viewBox', () => {
    const svg = wrapper.find('svg');
    expect(svg.attributes('viewBox')).toBe('0 0 24 24');
  });

  it('должен содержать rect элемент с правильными атрибутами', () => {
    const rect = wrapper.find('rect');
    expect(rect.exists()).toBe(true);
    expect(rect.attributes('x')).toBe('3');
    expect(rect.attributes('y')).toBe('3');
    expect(rect.attributes('width')).toBe('18');
    expect(rect.attributes('height')).toBe('18');
    expect(rect.attributes('rx')).toBe('2');
    expect(rect.attributes('ry')).toBe('2');
  });

  it('должен содержать circle элемент с правильными атрибутами', () => {
    const circle = wrapper.find('circle');
    expect(circle.exists()).toBe(true);
    expect(circle.attributes('cx')).toBe('8.5');
    expect(circle.attributes('cy')).toBe('8.5');
    expect(circle.attributes('r')).toBe('1.5');
  });

  it('должен содержать polyline элемент с правильными точками', () => {
    const polyline = wrapper.find('polyline');
    expect(polyline.exists()).toBe(true);
    expect(polyline.attributes('points')).toBe('21 15 16 10 5 21');
  });

  it('должен иметь правильные классы', () => {
    const svg = wrapper.find('svg');
    expect(svg.classes()).toContain('cursor-icon');
    expect(svg.classes()).toContain('feather');
    expect(svg.classes()).toContain('feather-image');
  });

  it('должен корректно обрабатывать отсутствующие атрибуты', () => {
    const svg = wrapper.find('svg');
    expect(svg.attributes('non-existent')).toBeUndefined();
  });
});

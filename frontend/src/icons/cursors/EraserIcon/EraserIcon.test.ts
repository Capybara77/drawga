import { mount } from '@vue/test-utils';
import EraserIcon from './EraserIcon.vue';
import { describe, it, expect } from 'vitest';

describe('EraserIcon.vue', () => {
  it('должен рендерить SVG элемент', () => {
    const wrapper = mount(EraserIcon);
    expect(wrapper.find('svg').exists()).toBe(true); // Проверяем, что SVG элемент существует
  });

  it('должен иметь правильный атрибут viewBox', () => {
    const wrapper = mount(EraserIcon);
    const svg = wrapper.find('svg');
    expect(svg.attributes('viewBox')).toBe('0 0 256 256'); // Проверяем атрибут viewBox
  });

  it('должен содержать rect элемент', () => {
    const wrapper = mount(EraserIcon);
    const rect = wrapper.find('rect');
    expect(rect.exists()).toBe(true); // Проверяем, что элемент rect существует
    expect(rect.attributes('width')).toBe('256'); // Проверяем атрибут width
    expect(rect.attributes('height')).toBe('256'); // Проверяем атрибут height
  });

  it('должен содержать path элемент с правильным атрибутом d', () => {
    const wrapper = mount(EraserIcon);
    const path = wrapper.find('path');
    expect(path.exists()).toBe(true); // Проверяем, что элемент path существует
    expect(path.attributes('d')).toBe(
      'M216,207.8H130.3l34.8-34.7h0l56.6-56.6a24.1,24.1,0,0,0,0-33.9L176.4,37.3a24,24,0,0,0-33.9,0L85.9,93.9h0L29.3,150.5a24,24,0,0,0,0,33.9l37.1,37.1a7.9,7.9,0,0,0,5.7,2.3H216a8,8,0,0,0,0-16ZM153.8,48.6a8.1,8.1,0,0,1,11.3,0l45.2,45.3a7.9,7.9,0,0,1,0,11.3l-50.9,50.9L102.9,99.5Z',
    ); // Проверяем атрибут d
  });

  it('должен иметь правильные классы', () => {
    const wrapper = mount(EraserIcon);
    const svg = wrapper.find('svg');
    expect(svg.classes()).toContain('cursor-icon'); // Проверяем класс cursor-icon
    expect(svg.classes()).toContain('fill-icon'); // Проверяем класс fill-icon
  });
});

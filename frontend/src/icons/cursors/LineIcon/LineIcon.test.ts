import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LineIcon from './LineIcon.vue'; // Укажите правильный путь к компоненту

describe('LineIcon.vue', () => {
  it('должен рендерить SVG элемент', () => {
    const wrapper = mount(LineIcon);
    expect(wrapper.find('svg').exists()).toBe(true); // Проверяем, что SVG элемент существует
  });

  it('должен иметь правильный атрибут viewBox', () => {
    const wrapper = mount(LineIcon);
    const svg = wrapper.find('svg');
    expect(svg.attributes('viewBox')).toBe('0 0 256 256'); // Проверяем атрибут viewBox
  });

  it('должен содержать rect элемент с правильными атрибутами', () => {
    const wrapper = mount(LineIcon);
    const rect = wrapper.find('rect');
    expect(rect.exists()).toBe(true);
    expect(rect.attributes('width')).toBe('256');
    expect(rect.attributes('height')).toBe('256');
    expect(rect.attributes('fill')).toBe('none');
  });

  it('должен содержать path элемент с правильным атрибутом d', () => {
    const wrapper = mount(LineIcon);
    const path = wrapper.find('path');
    expect(path.exists()).toBe(true);
    expect(path.attributes('d')).toBe(
      'M214.6,86.6A31.6,31.6,0,0,1,192,96a32.7,32.7,0,0,1-16.3-4.4L91.6,175.7a32,32,0,0,1-5,38.9,31.9,31.9,0,0,1-45.2,0,31.9,31.9,0,0,1,0-45.2h0a32,32,0,0,1,38.9-5l84.1-84.1a32,32,0,1,1,50.2,6.3Z',
    ); // Проверяем атрибут d
  });

  it('должен иметь правильные классы', () => {
    const wrapper = mount(LineIcon);
    const svg = wrapper.find('svg');
    expect(svg.classes()).toContain('cursor-icon');
    expect(svg.classes()).toContain('fill-icon');
  });
});

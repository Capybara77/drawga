import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ImageIcon from './ImageIcon.vue';

describe('ImageIcon.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(ImageIcon);
  });

  it('должен рендерить SVG элемент с правильным viewBox', () => {
    const svg = wrapper.find('svg');
    expect(svg.exists()).toBe(true);
    expect(svg.attributes('viewBox')).toBe('0 0 24 24');
  });

  it('должен содержать rect элемент с правильными атрибутами', () => {
    const rect = wrapper.find('rect');
    expect(rect.exists()).toBe(true);
    expect(rect.attributes()).toMatchObject({
      x: '3',
      y: '3',
      width: '18',
      height: '18',
      rx: '2',
      ry: '2',
    });
  });

  it('должен содержать circle элемент с правильными атрибутами', () => {
    const circle = wrapper.find('circle');
    expect(circle.exists()).toBe(true);
    expect(circle.attributes()).toMatchObject({
      cx: '8.5',
      cy: '8.5',
      r: '1.5',
    });
  });

  it('должен содержать polyline элемент с правильными точками', () => {
    const polyline = wrapper.find('polyline');
    expect(polyline.exists()).toBe(true);
    expect(polyline.attributes('points')).toBe('21 15 16 10 5 21');
  });

  it('должен иметь правильные классы', () => {
    const svg = wrapper.find('svg');

    expect(svg.classes()).toEqual(
      expect.arrayContaining(['cursor-icon', 'feather', 'feather-image']),
    );
  });

  it('должен корректно обрабатывать отсутствующие атрибуты', () => {
    const svg = wrapper.find('svg');
    expect(svg.attributes('non-existent')).toBeUndefined();
  });
});

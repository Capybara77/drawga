import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import TextIcon from './TextIcon.vue';

describe('TextIcon.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(TextIcon);
  });

  it('должен рендерить SVG элемент', () => {
    expect(wrapper.find('svg').exists()).toBe(true);
  });

  it('должен иметь правильный атрибут viewBox', () => {
    const svg = wrapper.find('svg');
    expect(svg.attributes('viewBox')).toBe('0 0 24 24');
  });

  it('должен содержать polyline элемент с правильными атрибутами points', () => {
    const polyline = wrapper.find('polyline');
    expect(polyline.exists()).toBe(true);
    expect(polyline.attributes('points')).toBe('4 7 4 4 20 4 20 7');
  });

  it('должен иметь правильные классы', () => {
    const svg = wrapper.find('svg');
    expect(svg.classes()).toContain('cursor-icon');
    expect(svg.classes()).toContain('feather');
    expect(svg.classes()).toContain('feather-type');
  });

  it.each([
    [0, { x1: '9', y1: '20', x2: '15', y2: '20' }],
    [1, { x1: '12', y1: '4', x2: '12', y2: '20' }],
  ])('должен проверить line элемент %i', (index, attrs) => {
    const lines = wrapper.findAll('line');
    expect(lines).toHaveLength(2);

    const line = lines.at(index);
    Object.entries(attrs).forEach(([attr, value]) => {
      expect(line?.attributes(attr)).toBe(value);
    });
  });
});

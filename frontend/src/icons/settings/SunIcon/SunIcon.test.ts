import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import SunIcon from './SunIcon.vue';

describe('SunIcon', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(SunIcon);
  });

  it('должен рендерить корневой SVG элемент', () => {
    const svgElement = wrapper.find('svg');

    expect(svgElement.exists()).toBe(true);
  });

  it('должен иметь правильные атрибуты SVG', () => {
    const svgElement = wrapper.find('svg');

    expect(svgElement.attributes('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(svgElement.attributes('viewBox')).toBe('0 0 24 24');
    expect(svgElement.attributes('fill')).toBe('none');
    expect(svgElement.attributes('stroke')).toBe('currentColor');
    expect(svgElement.attributes('stroke-width')).toBe('2');
    expect(svgElement.attributes('stroke-linecap')).toBe('round');
    expect(svgElement.attributes('stroke-linejoin')).toBe('round');
    expect(svgElement.classes()).toContain('cursor-icon');
    expect(svgElement.classes()).toContain('feather');
    expect(svgElement.classes()).toContain('feather-sun');
  });

  it('должен содержать элемент circle с правильными атрибутами', () => {
    const circleElement = wrapper.find('circle');

    expect(circleElement.exists()).toBe(true);
    expect(circleElement.attributes('cx')).toBe('12');
    expect(circleElement.attributes('cy')).toBe('12');
    expect(circleElement.attributes('r')).toBe('5');
  });

  it.each([
    [0, { x1: '12', y1: '1', x2: '12', y2: '3' }],
    [1, { x1: '12', y1: '21', x2: '12', y2: '23' }],
    [2, { x1: '4.22', y1: '4.22', x2: '5.64', y2: '5.64' }],
    [3, { x1: '18.36', y1: '18.36', x2: '19.78', y2: '19.78' }],
    [4, { x1: '1', y1: '12', x2: '3', y2: '12' }],
    [5, { x1: '21', y1: '12', x2: '23', y2: '12' }],
    [6, { x1: '4.22', y1: '19.78', x2: '5.64', y2: '18.36' }],
    [7, { x1: '18.36', y1: '5.64', x2: '19.78', y2: '4.22' }],
  ])('должен проверить line элемент %i', (index, attrs) => {
    const lines = wrapper.findAll('line');
    expect(lines).toHaveLength(8);

    const line = lines.at(index);
    Object.entries(attrs).forEach(([attr, value]) => {
      expect(line?.attributes(attr)).toBe(value);
    });
  });

  // it('должен содержать все необходимые элементы line', () => {
  //   const wrapper = mount(SunIcon);
  //   const lineElements = wrapper.findAll('line');

  //   expect(lineElements.length).toBe(8);

  //   const firstLine = lineElements[0];
  //   expect(firstLine.attributes('x1')).toBe('12');
  //   expect(firstLine.attributes('y1')).toBe('1');
  //   expect(firstLine.attributes('x2')).toBe('12');
  //   expect(firstLine.attributes('y2')).toBe('3');

  //   const secondLine = lineElements[1];
  //   expect(secondLine.attributes('x1')).toBe('12');
  //   expect(secondLine.attributes('y1')).toBe('21');
  //   expect(secondLine.attributes('x2')).toBe('12');
  //   expect(secondLine.attributes('y2')).toBe('23');

  //   const thirdLine = lineElements[2];
  //   expect(thirdLine.attributes('x1')).toBe('4.22');
  //   expect(thirdLine.attributes('y1')).toBe('4.22');
  //   expect(thirdLine.attributes('x2')).toBe('5.64');
  //   expect(thirdLine.attributes('y2')).toBe('5.64');

  //   // Можно добавить проверки для остальных линий аналогичным образом
  // });
});

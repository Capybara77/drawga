// sunIcon.test.js
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SunIcon from './SunIcon.vue'; // Путь к вашему компоненту

describe('SunIcon', () => {
  it('должен рендерить корневой SVG элемент', () => {
    const wrapper = mount(SunIcon);
    const svgElement = wrapper.find('svg');

    expect(svgElement.exists()).toBe(true);
  });

  it('должен иметь правильные атрибуты SVG', () => {
    const wrapper = mount(SunIcon);
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
    const wrapper = mount(SunIcon);
    const circleElement = wrapper.find('circle');

    expect(circleElement.exists()).toBe(true);
    expect(circleElement.attributes('cx')).toBe('12');
    expect(circleElement.attributes('cy')).toBe('12');
    expect(circleElement.attributes('r')).toBe('5');
  });

  it('должен содержать все необходимые элементы line', () => {
    const wrapper = mount(SunIcon);
    const lineElements = wrapper.findAll('line');

    expect(lineElements.length).toBe(8); // Всего 8 линий в компоненте

    // Проверка атрибутов первой линии
    const firstLine = lineElements[0];
    expect(firstLine.attributes('x1')).toBe('12');
    expect(firstLine.attributes('y1')).toBe('1');
    expect(firstLine.attributes('x2')).toBe('12');
    expect(firstLine.attributes('y2')).toBe('3');

    // Проверка атрибутов второй линии
    const secondLine = lineElements[1];
    expect(secondLine.attributes('x1')).toBe('12');
    expect(secondLine.attributes('y1')).toBe('21');
    expect(secondLine.attributes('x2')).toBe('12');
    expect(secondLine.attributes('y2')).toBe('23');

    // Проверка атрибутов третьей линии
    const thirdLine = lineElements[2];
    expect(thirdLine.attributes('x1')).toBe('4.22');
    expect(thirdLine.attributes('y1')).toBe('4.22');
    expect(thirdLine.attributes('x2')).toBe('5.64');
    expect(thirdLine.attributes('y2')).toBe('5.64');

    // Можно добавить проверки для остальных линий аналогичным образом
  });
});

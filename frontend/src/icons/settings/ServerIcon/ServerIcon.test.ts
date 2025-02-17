import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ServerIcon from './ServerIcon.vue'; // Укажите правильный путь к вашему компоненту

describe('ServerIcon.vue', () => {
  // Тест 1: Проверка рендеринга компонента
  it('рендерится корректно', () => {
    const wrapper = mount(ServerIcon);
    expect(wrapper.exists()).toBe(true); // Компонент должен существовать
  });

  // Тест 2: Проверка наличия SVG-элемента
  it('содержит SVG-элемент', () => {
    const wrapper = mount(ServerIcon);
    const svgElement = wrapper.find('svg');
    expect(svgElement.exists()).toBe(true); // SVG должен быть в DOM
  });

  // Тест 3: Проверка наличия <polyline>, <line> и <path> внутри SVG
  it('содержит <polyline>, <line> и <path> внутри SVG', () => {
    const wrapper = mount(ServerIcon);
    const polylineElements = wrapper.findAll('polyline');
    const lineElement = wrapper.find('line');
    const pathElement = wrapper.find('path');

    expect(polylineElements.length).toBe(2); // Должно быть два <polyline>
    expect(lineElement.exists()).toBe(true); // <line> должен быть в DOM
    expect(pathElement.exists()).toBe(true); // <path> должен быть в DOM
  });

  // Тест 4: Проверка классов и атрибутов SVG
  it('применяет правильные классы и атрибуты к SVG', () => {
    const wrapper = mount(ServerIcon);
    const svgElement = wrapper.find('svg');

    // Проверка классов
    expect(svgElement.classes()).toContain('cursor-icon');
    expect(svgElement.classes()).toContain('feather');
    expect(svgElement.classes()).toContain('feather-upload-cloud');

    // Проверка атрибутов
    expect(svgElement.attributes('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(svgElement.attributes('viewBox')).toBe('0 0 24 24');
    expect(svgElement.attributes('fill')).toBe('none');
    expect(svgElement.attributes('stroke')).toBe('currentColor');
    expect(svgElement.attributes('stroke-width')).toBe('2');
    expect(svgElement.attributes('stroke-linecap')).toBe('round');
    expect(svgElement.attributes('stroke-linejoin')).toBe('round');
  });

  // Тест 5: Проверка атрибутов <polyline>, <line> и <path>
  it('проверяет атрибуты <polyline>, <line> и <path>', () => {
    const wrapper = mount(ServerIcon);
    const polylineElements = wrapper.findAll('polyline');
    const lineElement = wrapper.find('line');
    const pathElement = wrapper.find('path');

    // Проверка атрибутов первого <polyline>
    expect(polylineElements[0].attributes('points')).toBe('16 16 12 12 8 16');

    // Проверка атрибутов <line>
    expect(lineElement.attributes('x1')).toBe('12');
    expect(lineElement.attributes('y1')).toBe('12');
    expect(lineElement.attributes('x2')).toBe('12');
    expect(lineElement.attributes('y2')).toBe('21');

    // Проверка атрибутов <path>
    expect(pathElement.attributes('d')).toBe('M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3');

    // Проверка атрибутов второго <polyline>
    expect(polylineElements[1].attributes('points')).toBe('16 16 12 12 8 16');
  });
});

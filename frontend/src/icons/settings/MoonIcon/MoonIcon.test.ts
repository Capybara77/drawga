import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MoonIcon from './MoonIcon.vue'; // Укажите правильный путь к вашему компоненту

describe('MoonIcon.vue', () => {
  // Тест 1: Проверка рендеринга компонента
  it('рендерится корректно', () => {
    const wrapper = mount(MoonIcon);
    expect(wrapper.exists()).toBe(true); // Компонент должен существовать
  });

  // Тест 2: Проверка наличия SVG-элемента
  it('содержит SVG-элемент', () => {
    const wrapper = mount(MoonIcon);
    const svgElement = wrapper.find('svg');
    expect(svgElement.exists()).toBe(true); // SVG должен быть в DOM
  });

  // Тест 3: Проверка наличия <path> внутри SVG
  it('содержит <path> внутри SVG', () => {
    const wrapper = mount(MoonIcon);
    const pathElement = wrapper.find('path');
    expect(pathElement.exists()).toBe(true); // <path> должен быть в DOM
  });

  // Тест 4: Проверка классов и атрибутов SVG
  it('применяет правильные классы и атрибуты к SVG', () => {
    const wrapper = mount(MoonIcon);
    const svgElement = wrapper.find('svg');

    // Проверка классов
    expect(svgElement.classes()).toContain('cursor-icon');
    expect(svgElement.classes()).toContain('feather');
    expect(svgElement.classes()).toContain('feather-moon');

    // Проверка атрибутов
    expect(svgElement.attributes('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(svgElement.attributes('viewBox')).toBe('0 0 24 24');
    expect(svgElement.attributes('fill')).toBe('none');
    expect(svgElement.attributes('stroke')).toBe('currentColor');
    expect(svgElement.attributes('stroke-width')).toBe('2');
    expect(svgElement.attributes('stroke-linecap')).toBe('round');
    expect(svgElement.attributes('stroke-linejoin')).toBe('round');
  });

  // Тест 5: Проверка атрибутов <path>
  it('проверяет атрибуты <path>', () => {
    const wrapper = mount(MoonIcon);
    const pathElement = wrapper.find('path');

    // Проверка атрибута d
    expect(pathElement.attributes('d')).toBe('M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
  });
});

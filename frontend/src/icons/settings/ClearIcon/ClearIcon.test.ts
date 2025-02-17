import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ClearIcon from './ClearIcon.vue'; // Укажите правильный путь к вашему компоненту

describe('ClearIcon.vue', () => {
  // Тест 1: Проверка рендеринга компонента
  it('рендерится корректно', () => {
    const wrapper = mount(ClearIcon);
    expect(wrapper.exists()).toBe(true); // Компонент должен существовать
  });

  // Тест 2: Проверка наличия SVG-элемента
  it('содержит SVG-элемент', () => {
    const wrapper = mount(ClearIcon);
    const svgElement = wrapper.find('svg');
    expect(svgElement.exists()).toBe(true); // SVG должен быть в DOM
  });

  // Тест 3: Проверка наличия <rect> и <path> внутри SVG
  it('содержит <rect> и <path> внутри SVG', () => {
    const wrapper = mount(ClearIcon);
    const rectElement = wrapper.find('rect');
    const pathElement = wrapper.find('path');

    expect(rectElement.exists()).toBe(true); // <rect> должен быть в DOM
    expect(pathElement.exists()).toBe(true); // <path> должен быть в DOM
  });

  // Тест 4: Проверка классов и атрибутов SVG
  it('применяет правильные классы и атрибуты к SVG', () => {
    const wrapper = mount(ClearIcon);
    const svgElement = wrapper.find('svg');

    // Проверка классов
    expect(svgElement.classes()).toContain('cursor-icon');
    expect(svgElement.classes()).toContain('fill-icon');

    // Проверка атрибутов
    expect(svgElement.attributes('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(svgElement.attributes('viewBox')).toBe('0 0 256 256');
  });

  // Тест 5: Проверка атрибутов <rect> и <path>
  it('проверяет атрибуты <rect> и <path>', () => {
    const wrapper = mount(ClearIcon);
    const rectElement = wrapper.find('rect');
    const pathElement = wrapper.find('path');

    // Проверка атрибутов <rect>
    expect(rectElement.attributes('width')).toBe('256');
    expect(rectElement.attributes('height')).toBe('256');
    expect(rectElement.attributes('fill')).toBe('none');

    // Проверка атрибутов <path>
    expect(pathElement.attributes('d')).toBe(
      'M224,56a8,8,0,0,1-8,8h-8V208a16,16,0,0,1-16,16H64a16,16,0,0,1-16-16V64H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,56ZM88,32h80a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16Z',
    );
  });
});

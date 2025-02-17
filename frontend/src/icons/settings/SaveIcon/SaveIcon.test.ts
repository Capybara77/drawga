import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SaveIcon from './SaveIcon.vue'; // Укажите правильный путь к вашему компоненту

describe('SaveIcon.vue', () => {
  // Тест 1: Проверка рендеринга компонента
  it('рендерится корректно', () => {
    const wrapper = mount(SaveIcon);
    expect(wrapper.exists()).toBe(true); // Компонент должен существовать
  });

  // Тест 2: Проверка наличия SVG-элемента
  it('содержит SVG-элемент', () => {
    const wrapper = mount(SaveIcon);
    const svgElement = wrapper.find('svg');
    expect(svgElement.exists()).toBe(true); // SVG должен быть в DOM
  });

  // Тест 3: Проверка наличия <path> внутри SVG
  it('содержит <path> внутри SVG', () => {
    const wrapper = mount(SaveIcon);
    const pathElement = wrapper.find('path');
    expect(pathElement.exists()).toBe(true); // <path> должен быть в DOM
  });

  // Тест 4: Проверка классов и атрибутов SVG
  it('применяет правильные классы и атрибуты к SVG', () => {
    const wrapper = mount(SaveIcon);
    const svgElement = wrapper.find('svg');

    // Проверка классов
    expect(svgElement.classes()).toContain('cursor-icon');
    expect(svgElement.classes()).toContain('fill-icon');

    // Проверка атрибутов
    expect(svgElement.attributes('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(svgElement.attributes('viewBox')).toBe('0 0 24 24');
  });

  // Тест 5: Проверка атрибутов <path>
  it('проверяет атрибуты <path>', () => {
    const wrapper = mount(SaveIcon);
    const pathElement = wrapper.find('path');

    // Проверка атрибута d
    expect(pathElement.attributes('d')).toBe(
      'M10 2L10 11L6 11L12 17L18 11L14 11L14 2L10 2 z M 2 20L2 22L22 22L22 20L2 20 z',
    );
  });
});

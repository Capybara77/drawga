import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import SaveIcon from './SaveIcon.vue';

describe('SaveIcon.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(SaveIcon);
  });

  it('рендерится корректно', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('содержит SVG-элемент', () => {
    const svgElement = wrapper.find('svg');
    expect(svgElement.exists()).toBe(true);
  });

  it('содержит <path> внутри SVG', () => {
    const pathElement = wrapper.find('path');
    expect(pathElement.exists()).toBe(true);
  });

  it('применяет правильные классы и атрибуты к SVG', () => {
    const svgElement = wrapper.find('svg');

    expect(svgElement.classes()).toContain('cursor-icon');
    expect(svgElement.classes()).toContain('fill-icon');

    expect(svgElement.attributes('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(svgElement.attributes('viewBox')).toBe('0 0 24 24');
  });

  it('проверяет атрибуты <path>', () => {
    const pathElement = wrapper.find('path');

    expect(pathElement.attributes('d')).toBe(
      'M10 2L10 11L6 11L12 17L18 11L14 11L14 2L10 2 z M 2 20L2 22L22 22L22 20L2 20 z',
    );
  });
});

// settingsIcon.test.js
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SettingsIcon from './SettingsIcon.vue'; // Путь к вашему компоненту

describe('SettingsIcon', () => {
  it('должен рендерить корневой SVG элемент', () => {
    const wrapper = mount(SettingsIcon);
    const svgElement = wrapper.find('svg');

    expect(svgElement.exists()).toBe(true);
  });

  it('должен иметь правильные атрибуты SVG', () => {
    const wrapper = mount(SettingsIcon);
    const svgElement = wrapper.find('svg');

    expect(svgElement.attributes('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(svgElement.attributes('viewBox')).toBe('0 0 24 24');
    expect(svgElement.attributes('fill')).toBe('none');
    expect(svgElement.attributes('stroke-width')).toBe('2');
    expect(svgElement.attributes('stroke-linecap')).toBe('round');
    expect(svgElement.attributes('stroke-linejoin')).toBe('round');
    expect(svgElement.classes()).toContain('settings-show-icon');
    expect(svgElement.classes()).toContain('feather');
    expect(svgElement.classes()).toContain('feather-settings');
  });

  it('должен содержать элемент circle', () => {
    const wrapper = mount(SettingsIcon);
    const circleElement = wrapper.find('circle');

    expect(circleElement.exists()).toBe(true);
    expect(circleElement.attributes('cx')).toBe('12');
    expect(circleElement.attributes('cy')).toBe('12');
    expect(circleElement.attributes('r')).toBe('3');
  });

  it('должен содержать элемент path с правильным атрибутом d', () => {
    const wrapper = mount(SettingsIcon);
    const pathElement = wrapper.find('path');

    expect(pathElement.exists()).toBe(true);

    const expectedPathData =
      'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z';

    expect(pathElement.attributes('d')).toBe(expectedPathData);
  });
});

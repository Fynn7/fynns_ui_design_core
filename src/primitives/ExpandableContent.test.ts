import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ExpandableContent } from './ExpandableContent';

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe('ExpandableContent composition', () => {
  it('requests a controlled change without overriding the owner', () => {
    const changed = vi.fn();
    act(() => root.render(createElement(ExpandableContent, {
      expanded: false, onExpandedChange: changed, children: 'Detail',
    })));
    act(() => host.querySelector('button')!.click());
    expect(changed).toHaveBeenCalledWith(true);
    expect(host.querySelector('[hidden]')).not.toBeNull();
  });

  it('returns focus when the owner collapses a focused extra field', () => {
    const render = (expanded: boolean) => act(() => root.render(createElement(ExpandableContent, {
      expanded, children: createElement('input', { defaultValue: 'Draft' }),
    })));
    render(true);
    const input = host.querySelector('input')!;
    input.focus();
    input.value = 'Retained';
    render(false);
    expect(document.activeElement).toBe(host.querySelector('button'));
    render(true);
    expect(host.querySelector('input')).toBe(input);
    expect(input.value).toBe('Retained');
  });

  it('renders empty remainder without a control or a spacer', () => {
    act(() => root.render(createElement(ExpandableContent, {
      preview: 'Summary', children: [],
    })));
    expect(host.textContent).toBe('Summary');
    expect(host.querySelector('button')).toBeNull();
    expect(host.querySelector('.fynns-expandable-content-body')).toBeNull();
  });

  it('renders all units when disclosure is explicitly unnecessary', () => {
    act(() => root.render(createElement(ExpandableContent, {
      preview: 'Summary', children: 'Detail', canExpand: false,
    })));
    expect(host.querySelector('[hidden]')).toBeNull();
    expect(host.querySelector('button')).toBeNull();
    expect(host.textContent).toBe('SummaryDetail');
  });
});

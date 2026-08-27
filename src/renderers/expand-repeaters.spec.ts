import { describe, expect, it } from 'vitest';
import { DocumentElement } from '../models/document-definition.js';
import { expandRepeaters } from './expand-repeaters.js';

describe('expandRepeaters visibility expressions', () => {
  it('evaluates wrapped visibility expressions on nested elements', () => {
    const elements: DocumentElement[] = [{
      type: 'stack',
      elements: [
        { type: 'text', text: 'Shown', visibleWhen: "{{first(sales-orders.orderNumber) !== ''}}" },
        { type: 'text', text: 'Hidden', visibleWhen: "{{first(sales-orders.orderNumber) === ''}}" },
      ],
    }];

    const expanded = expandRepeaters(elements, {
      'sales-orders': [{ orderNumber: 'SO-1001' }],
    });

    expect(expanded[0].type).toBe('stack');
    if (expanded[0].type !== 'stack') return;
    expect(expanded[0].elements).toHaveLength(1);
    expect(expanded[0].elements[0].name ?? expanded[0].elements[0].type).toBe('text');
  });
});

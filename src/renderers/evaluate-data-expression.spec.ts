import { describe, expect, it } from 'vitest';
import { evaluateDataExpression } from './evaluate-data-expression.js';

const root = {
  status: 'Approved',
  total: 125,
  fallback: null,
  customers: [{ name: 'Ada' }],
  datasource2: [{ price: 42 }],
  salesOrders: [{ total: 12.5 }, { total: '7.5' }, { total: null }, { total: 'invalid' }],
};
const context = { ...root, quantity: 3, $item: { quantity: 3 }, $index: 0, $number: 1 };

describe('evaluateDataExpression', () => {
  it('resolves fields and scoped data paths', () => {
    expect(evaluateDataExpression('status', context, root)).toBe('Approved');
    expect(evaluateDataExpression('$root.total', context, root)).toBe(125);
    expect(evaluateDataExpression('first(customers.name)', context, root)).toBe('Ada');
    expect(evaluateDataExpression('first(datasource2.price)', context, root)).toBe(42);
  });

  it('resolves datasource IDs containing hyphens', () => {
    const hyphenatedRoot = { 'sales-orders': [{ orderNumber: 'SO-10482' }] };
    expect(
      evaluateDataExpression('first(sales-orders.orderNumber)', hyphenatedRoot, hyphenatedRoot),
    ).toBe('SO-10482');
  });

  it('evaluates comparisons and boolean expressions', () => {
    expect(evaluateDataExpression("status === 'Approved' && quantity >= 2", context, root)).toBe(
      true,
    );
    expect(evaluateDataExpression("status === 'Rejected' || total > 100", context, root)).toBe(
      true,
    );
    expect(evaluateDataExpression('!missing', context, root)).toBe(true);
  });

  it('supports fallback and conditional values', () => {
    expect(evaluateDataExpression("fallback ?? 'Not supplied'", context, root)).toBe(
      'Not supplied',
    );
    expect(evaluateDataExpression("total > 100 ? 'High' : 'Low'", context, root)).toBe('High');
  });

  it('evaluates arithmetic with standard precedence', () => {
    expect(evaluateDataExpression('(total * 2) / 0.2', context, root)).toBe(1250);
    expect(evaluateDataExpression('quantity + 2 * 4', context, root)).toBe(11);
    expect(evaluateDataExpression('-quantity + 10', context, root)).toBe(7);
    expect(evaluateDataExpression('10 % 4', context, root)).toBe(2);
  });

  it('concatenates strings with the plus operator', () => {
    expect(evaluateDataExpression("'number ' + quantity + ' right?'", context, root)).toBe(
      'number 3 right?',
    );
  });

  it('sums numeric datasource fields', () => {
    expect(evaluateDataExpression('sum(salesOrders.total)', context, root)).toBe(20);
    expect(evaluateDataExpression('sum($root.salesOrders.total)', context, root)).toBe(20);
    expect(evaluateDataExpression('sum(customers.missing)', context, root)).toBe(0);
  });

  it('does not expose prototype properties or permit calls', () => {
    expect(evaluateDataExpression('customers.constructor', context, root)).toBeUndefined();
    expect(() => evaluateDataExpression('status.toString()', context, root)).toThrow();
  });
});

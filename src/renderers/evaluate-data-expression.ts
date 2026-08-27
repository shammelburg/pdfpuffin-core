export type DataRecord = Record<string, unknown>;

type Token =
  | { kind: 'value'; value: unknown }
  | { kind: 'path'; value: string }
  | { kind: 'symbol'; value: string }
  | { kind: 'end' };

const blockedKeys = new Set(['__proto__', 'prototype', 'constructor']);

export function valueAt(source: unknown, path: string): unknown {
  return path
    .split('.')
    .filter(Boolean)
    .reduce<unknown>((value, key) => {
      if (blockedKeys.has(key) || value === null || typeof value !== 'object') return undefined;
      return (value as DataRecord)[key];
    }, source);
}

export function bindingValue(path: string, context: DataRecord, root: unknown): unknown {
  if (path === '$root') return root;
  if (path.startsWith('$root.')) return valueAt(root, path.slice(6));
  const local = valueAt(context, path);
  return local === undefined ? valueAt(root, path) : local;
}

function firstBinding(path: string, root: unknown): unknown {
  const [sourceId, ...fieldPath] = path.split('.');
  const rows = valueAt(root, sourceId);
  return Array.isArray(rows) && fieldPath.length ? valueAt(rows[0], fieldPath.join('.')) : undefined;
}

function sumBinding(path: string, root: unknown): number {
  const normalized = path.startsWith('$root.') ? path.slice(6) : path;
  const [sourceId, ...fieldPath] = normalized.split('.');
  const rows = valueAt(root, sourceId);
  if (!Array.isArray(rows) || !fieldPath.length) return 0;
  return rows.reduce((sum, row) => {
    const value = valueAt(row, fieldPath.join('.'));
    const number = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(number) ? sum + number : sum;
  }, 0);
}

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  const symbols = [
    '===',
    '!==',
    '>=',
    '<=',
    '&&',
    '||',
    '??',
    '==',
    '!=',
    '>',
    '<',
    '!',
    '+',
    '-',
    '*',
    '/',
    '%',
    '?',
    ':',
    '(',
    ')',
  ];
  while (index < expression.length) {
    const char = expression[index];
    if (/\s/.test(char)) {
      index++;
      continue;
    }
    if (char === '"' || char === "'") {
      const quote = char;
      let value = '';
      index++;
      while (index < expression.length && expression[index] !== quote) {
        if (expression[index] === '\\') {
          index++;
          const escaped = expression[index++];
          value += ({ n: '\n', r: '\r', t: '\t' } as Record<string, string>)[escaped] ?? escaped;
        } else value += expression[index++];
      }
      if (expression[index] !== quote) throw new Error('Unterminated string');
      index++;
      tokens.push({ kind: 'value', value });
      continue;
    }
    const number = expression.slice(index).match(/^(?:\d+\.?\d*|\.\d+)/)?.[0];
    if (number) {
      tokens.push({ kind: 'value', value: Number(number) });
      index += number.length;
      continue;
    }
    const identifier = expression.slice(index).match(/^[A-Za-z_$][A-Za-z0-9_$.-]*/)?.[0];
    if (identifier) {
      const literal: Record<string, unknown> = { true: true, false: false, null: null, undefined };
      tokens.push(
        Object.prototype.hasOwnProperty.call(literal, identifier)
          ? { kind: 'value', value: literal[identifier] }
          : { kind: 'path', value: identifier },
      );
      index += identifier.length;
      continue;
    }
    const symbol = symbols.find((candidate) => expression.startsWith(candidate, index));
    if (!symbol) throw new Error(`Unexpected character "${char}"`);
    tokens.push({ kind: 'symbol', value: symbol });
    index += symbol.length;
  }
  return [...tokens, { kind: 'end' }];
}

function looselyEqual(left: unknown, right: unknown): boolean {
  if ((left === null || left === undefined) && (right === null || right === undefined)) return true;
  if (typeof left === typeof right) return left === right;
  if (
    ['string', 'number', 'boolean'].includes(typeof left) &&
    ['string', 'number', 'boolean'].includes(typeof right)
  )
    return String(left) === String(right);
  return false;
}

export function evaluateDataExpression(
  expression: string,
  context: DataRecord,
  root: unknown,
): unknown {
  const tokens = tokenize(expression.trim());
  let cursor = 0;
  const current = () => tokens[cursor];
  const symbolValue = (): string | undefined => {
    const token = current();
    return token.kind === 'symbol' ? token.value : undefined;
  };
  const take = (symbol: string) => (symbolValue() === symbol ? (cursor++, true) : false);

  const primary = (): unknown => {
    if (take('(')) {
      const value = conditional();
      if (!take(')')) throw new Error('Expected ")"');
      return value;
    }
    const token = tokens[cursor++];
    if (token.kind === 'value') return token.value;
    if (token.kind === 'path') {
      if ((token.value === 'sum' || token.value === 'first') && take('(')) {
        const functionName = token.value;
        const argument = tokens[cursor++];
        if (argument.kind !== 'path') throw new Error(`${functionName}() expects a datasource field path`);
        if (!take(')')) throw new Error(`Expected ")" after ${functionName}()`);
        return functionName === 'sum'
          ? sumBinding(argument.value, root)
          : firstBinding(argument.value, root);
      }
      return bindingValue(token.value, context, root);
    }
    throw new Error('Expected a value or data field');
  };
  const unary = (): unknown => {
    if (take('!')) return !unary();
    if (take('-')) return -Number(unary());
    return primary();
  };
  const multiplicative = (): unknown => {
    let left = unary();
    while (symbolValue() && ['*', '/', '%'].includes(symbolValue()!)) {
      const operator = symbolValue()!;
      cursor++;
      const right = unary();
      const a = Number(left);
      const b = Number(right);
      left = operator === '*' ? a * b : operator === '/' ? a / b : a % b;
    }
    return left;
  };
  const additive = (): unknown => {
    let left = multiplicative();
    while (symbolValue() && ['+', '-'].includes(symbolValue()!)) {
      const operator = symbolValue()!;
      cursor++;
      const right = multiplicative();
      left = operator === '+'
        ? typeof left === 'string' || typeof right === 'string'
          ? String(left ?? '') + String(right ?? '')
          : Number(left) + Number(right)
        : Number(left) - Number(right);
    }
    return left;
  };
  const comparison = (): unknown => {
    let left = additive();
    while (symbolValue() && ['>', '<', '>=', '<='].includes(symbolValue()!)) {
      const operator = symbolValue()!;
      cursor++;
      const right = additive();
      const a = typeof left === 'number' && typeof right === 'number' ? left : String(left ?? '');
      const b = typeof left === 'number' && typeof right === 'number' ? right : String(right ?? '');
      left =
        operator === '>' ? a > b : operator === '<' ? a < b : operator === '>=' ? a >= b : a <= b;
    }
    return left;
  };
  const equality = (): unknown => {
    let left = comparison();
    while (symbolValue() && ['===', '!==', '==', '!='].includes(symbolValue()!)) {
      const operator = symbolValue()!;
      cursor++;
      const right = comparison();
      const equal = operator.length === 3 ? left === right : looselyEqual(left, right);
      left = operator.startsWith('!') ? !equal : equal;
    }
    return left;
  };
  const and = (): unknown => {
    let left = equality();
    while (take('&&')) {
      const right = equality();
      left = left ? right : left;
    }
    return left;
  };
  const or = (): unknown => {
    let left = and();
    while (take('||')) {
      const right = and();
      left = left ? left : right;
    }
    return left;
  };
  const nullish = (): unknown => {
    let left = or();
    while (take('??')) {
      const right = or();
      left = left ?? right;
    }
    return left;
  };
  const conditional = (): unknown => {
    const condition = nullish();
    if (!take('?')) return condition;
    const yes = conditional();
    if (!take(':')) throw new Error('Expected ":"');
    const no = conditional();
    return condition ? yes : no;
  };

  if (current().kind === 'end') return undefined;
  const result = conditional();
  if (current().kind !== 'end') throw new Error(`Unexpected token "${symbolValue() ?? 'value'}"`);
  return result;
}

import { DocumentElement } from '../models/document-definition.js';
import { TableRow } from '../models/table-element.js';
import { bindingValue, DataRecord, evaluateDataExpression } from './evaluate-data-expression.js';
import { formatDataValue, ValueFormat } from '../models/value-format.js';

function expressionBody(value: string): string {
  const match = value.trim().match(/^{{\s*([^{}]+?)\s*}}$/);
  if (!match) throw new Error('Expressions must be wrapped in "{{" and "}}".');
  return match[1];
}

function evaluateExpression(expression: string, context: DataRecord, root: unknown): unknown {
  try {
    return evaluateDataExpression(expression, context, root);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid data expression "${expression}": ${detail}`);
  }
}

function expressionValue(expression: string, context: DataRecord, root: unknown): unknown {
  return evaluateExpression(expressionBody(expression), context, root);
}

function resolveString(value: string, context: DataRecord, root: unknown, format?: ValueFormat): string {
  return value.replace(/{{\s*([^{}]+?)\s*}}/g, (match, expression: string) => {
    if (expression === 'pageNumber' || expression === 'pageCount') return match;
    const resolved = evaluateExpression(expression, context, root);
    return formatDataValue(resolved, format);
  });
}

function resolveValues(value: unknown, context: DataRecord, root: unknown): unknown {
  if (typeof value === 'string') return resolveString(value, context, root);
  if (Array.isArray(value)) return value.map((item) => resolveValues(item, context, root));
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(Object.entries(record).map(([key, item]) => [
      key,
      key === 'visibleWhen'
        ? item
        : key === 'text' && typeof item === 'string'
        ? resolveString(item, context, root, record['valueFormat'] as ValueFormat | undefined)
        : resolveValues(item, context, root),
    ]));
  }
  return value;
}

function rowIsVisible(row: TableRow, context: DataRecord, root: unknown): boolean {
  return !row.visibleWhen || Boolean(expressionValue(row.visibleWhen, context, root));
}

function expandElement(element: DocumentElement, context: DataRecord, root: unknown): DocumentElement | null {
  if (element.visibleWhen && !Boolean(expressionValue(element.visibleWhen, context, root))) return null;
  if (element.type === 'repeater') {
    const source = bindingValue(resolveString(element.dataSource, context, root), context, root);
    const items = Array.isArray(source) ? source : [];
    return {
      type: 'stack',
      name: element.name,
      backgroundColor: element.backgroundColor,
      borderWidth: element.borderWidth,
      borderStyle: element.borderStyle,
      borderColor: element.borderColor,
      borderTop: element.borderTop,
      borderRight: element.borderRight,
      borderBottom: element.borderBottom,
      borderLeft: element.borderLeft,
      gap: element.gap ?? 0,
      marginTop: element.marginTop ?? 0,
      marginRight: element.marginRight ?? 0,
      marginBottom: element.marginBottom ?? 0,
      marginLeft: element.marginLeft ?? 0,
      elements: items.map((item, index) => {
        const itemRecord = item && typeof item === 'object' ? item as DataRecord : { value: item };
        const itemContext: DataRecord = { ...context, ...itemRecord, $item: item, $index: index, $number: index + 1 };
        return { type: 'stack', name: `${element.name ?? 'Repeater'} item ${index + 1}`, gap: 0, elements: element.elements.map((child) => expandElement(child, itemContext, root)).filter((child): child is DocumentElement => child !== null) };
      }),
    };
  }
  if (element.type === 'table' && element.dataSource && element.detailRow) {
    const sourcePath = resolveString(element.dataSource, context, root);
    const source = bindingValue(sourcePath, context, root);
    const items = Array.isArray(source) ? source : [];
    const table = resolveValues(structuredClone(element), context, root) as typeof element;
    delete table.visibleWhen;
    table.rows = [
      ...element.rows.filter((row) => !Array.isArray(row) && row.position === 'before' && rowIsVisible(row, context, root)).map((row) => {
        const resolved = resolveValues(structuredClone(row), context, root) as TableRow;
        delete resolved.visibleWhen;
        return resolved;
      }),
      ...items.flatMap((item, index): TableRow[] => {
        const itemRecord = item && typeof item === 'object' ? item as DataRecord : { value: item };
        const itemContext: DataRecord = { ...context, ...itemRecord, $item: item, $index: index, $number: index + 1 };
        if (!rowIsVisible(element.detailRow!, itemContext, root)) return [];
        const detail = resolveValues(structuredClone(element.detailRow!), itemContext, root) as TableRow;
        delete detail.visibleWhen;
        return [{ ...detail, detail: true }];
      }),
      ...element.rows.filter((row) => Array.isArray(row) || (row.position !== 'before' && rowIsVisible(row, context, root))).map((row) => {
        const resolved = resolveValues(structuredClone(row), context, root) as typeof row;
        if (!Array.isArray(resolved)) delete resolved.visibleWhen;
        return resolved;
      }),
    ];
    return table;
  }
  const clone = resolveValues(structuredClone(element), context, root) as DocumentElement;
  delete clone.visibleWhen;
  if (clone.type === 'stack' || clone.type === 'inline' || clone.type === 'region') clone.elements = clone.elements.map((child) => expandElement(child, context, root)).filter((child): child is DocumentElement => child !== null) as typeof clone.elements;
  if (clone.type === 'columns') clone.columns.forEach((column) => column.elements = column.elements.map((child) => expandElement(child, context, root)).filter((child): child is DocumentElement => child !== null));
  return clone;
}

export function expandRepeaters(elements: DocumentElement[], data: unknown): DocumentElement[] {
  const root = data ?? {};
  const context = root && typeof root === 'object' && !Array.isArray(root) ? root as DataRecord : { value: root };
  return elements.map((element) => expandElement(element, context, root)).filter((element): element is DocumentElement => element !== null);
}

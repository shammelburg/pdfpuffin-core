export interface ValueFormat {
  type: 'text' | 'number' | 'currency' | 'date';
  decimalPlaces?: number;
  currency?: string;
  currencyDisplay?: 'symbol' | 'code';
  dateFormat?: string;
}

export function formatDataValue(value: unknown, format?: ValueFormat): string {
  if (value === null || value === undefined) return '';
  if (!format || format.type === 'text')
    return typeof value === 'object' ? JSON.stringify(value) : String(value);

  try {
    if (format.type === 'date') {
      const date = value instanceof Date ? value : new Date(value as string | number);
      if (Number.isNaN(date.getTime())) return String(value);
      const pattern = format.dateFormat || 'dd/MM/yyyy';
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const shortMonths = months.map((month) => month.slice(0, 3));
      const values: Record<string, string> = {
        yyyy: String(date.getFullYear()), yy: String(date.getFullYear()).slice(-2),
        MMMM: months[date.getMonth()], MMM: shortMonths[date.getMonth()],
        MM: String(date.getMonth() + 1).padStart(2, '0'), M: String(date.getMonth() + 1),
        dd: String(date.getDate()).padStart(2, '0'), d: String(date.getDate()),
        HH: String(date.getHours()).padStart(2, '0'), mm: String(date.getMinutes()).padStart(2, '0'),
        ss: String(date.getSeconds()).padStart(2, '0'),
      };
      return pattern.replace(/yyyy|MMMM|MMM|yy|MM|dd|HH|mm|ss|M|d/g, (token) => values[token]);
    }

    const number = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(number)) return String(value);
    const decimals = Math.max(0, Math.min(20, format.decimalPlaces ?? 2));
    return new Intl.NumberFormat(undefined, {
      style: format.type === 'currency' ? 'currency' : 'decimal',
      currency: format.type === 'currency' ? format.currency || 'GBP' : undefined,
      currencyDisplay: format.type === 'currency'
        ? format.currencyDisplay === 'code' ? 'code' : 'narrowSymbol'
        : undefined,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);
  } catch {
    return String(value);
  }
}

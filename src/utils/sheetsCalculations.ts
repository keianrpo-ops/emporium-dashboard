// src/utils/sheetsCalculations.ts

export function sumColumn(rows: any[], field: string) {
  return rows.reduce((acc, row) => {
    const value = Number(row[field] || 0);
    return acc + (isNaN(value) ? 0 : value);
  }, 0);
}

export function sumByCondition(rows: any[], field: string, condition: (r: any) => boolean) {
  return rows.reduce((acc, row) => {
    if (!condition(row)) return acc;
    const value = Number(row[field] || 0);
    return acc + (isNaN(value) ? 0 : value);
  }, 0);
}

export function formatCurrency(value: number) {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

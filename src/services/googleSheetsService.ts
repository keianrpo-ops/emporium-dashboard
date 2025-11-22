// src/services/googleSheetsService.ts

const API_URL = import.meta.env.VITE_API_URL;

export type SheetName =
  | 'Ventas'
  | 'Productos'
  | 'Campañas_Ads'
  | 'Tarjetas'
  | 'Movimientos_Tarjeta'
  | 'Costos_Fijos'
  | 'Dashboard_Base'
  | 'Diccionario_Datos'
  | 'Dashboard';

if (!API_URL) {
  console.warn(
    'VITE_API_URL no está definida. Revisa las variables de entorno en Vercel.'
  );
}

/**
 * Lee una hoja del Google Sheets y devuelve un arreglo de objetos.
 * Cada objeto tiene como claves los encabezados de la fila 1.
 */
export async function fetchSheet<T = any>(
  sheetName: SheetName
): Promise<T[]> {
  if (!API_URL) return [];

  const url = `${API_URL}?sheet=${encodeURIComponent(sheetName)}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error('Error al leer la hoja', sheetName, res.status, res.statusText);
    return [];
  }

  const data = (await res.json()) as T[];
  return data;
}

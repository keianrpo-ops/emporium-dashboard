// src/services/googleSheetsService.ts
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.warn('VITE_API_URL no está definida. Revisa las variables en Vercel.');
}

export async function fetchSheet<T = any>(sheetName: string): Promise<T[]> {
  if (!API_URL) return [];

  const res = await fetch(`${API_URL}?sheet=${encodeURIComponent(sheetName)}`);
  if (!res.ok) {
    console.error('Error al leer hoja', sheetName, res.status);
    return [];
  }

  const data = (await res.json()) as T[];
  return data;
}

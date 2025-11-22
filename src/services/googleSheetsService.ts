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
    'VITE_API_URL no está definida. Revisa las variables de entorno (.env.local en dev y Vercel en producción).'
  );
}

// =====================================================
// 🔹 Leer una hoja completa (DEVUELVE SIEMPRE UN ARRAY)
// =====================================================
export async function fetchSheet(sheet: SheetName) {
  try {
    const res = await fetch(`${API_URL}/sheets?sheet=${sheet}`);

    if (!res.ok) {
      console.error('❌ Error HTTP leyendo hoja', sheet, await res.text());
      return [];
    }

    const data = await res.json();

    // 🔥 Tu backend SIEMPRE devuelve { rows: [...] }
    if (data && Array.isArray(data.rows)) {
      return data.rows;
    }

    console.error('⚠️ Respuesta inesperada del backend:', data);
    return [];
  } catch (err) {
    console.error('❌ Error de red leyendo hoja', sheet, err);
    return [];
  }
}

// =====================================================
// 🔹 Agregar una fila a una hoja
// =====================================================
export async function addToSheet(sheet: SheetName, row: Record<string, any>) {
  const res = await fetch(`${API_URL}/sheets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheet, row }),
  });

  if (!res.ok) {
    throw new Error(
      `Error al agregar fila en ${sheet}: ${await res.text()}`
    );
  }

  return res.json();
}

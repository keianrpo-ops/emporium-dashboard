// src/pages/TestSheets.tsx
import { useEffect, useState } from 'react';
import { fetchSheet } from '../services/googleSheetsService';
import type { SheetName } from '../services/googleSheetsService';

const SHEETS: SheetName[] = [
  'Ventas',
  'Productos',
  'Campañas_Ads',
  'Tarjetas',
  'Movimientos_Tarjeta',
  'Costos_Fijos',
  'Dashboard_Base',
  'Diccionario_Datos',
  'Dashboard',
];

export default function TestSheets() {
  const [selectedSheet, setSelectedSheet] = useState<SheetName>('Ventas');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSheet(selectedSheet);
  }, [selectedSheet]);

  async function loadSheet(sheet: SheetName) {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSheet(sheet);
      setRows(data || []);
    } catch (e: any) {
      console.error(e);
      setError('Error leyendo la hoja. Revisa consola y configuración.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div style={{ padding: '24px 32px', color: '#e5e7eb' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Test Sheets – Conexión Google Sheets</h1>
      <p style={{ marginBottom: 24, opacity: 0.8 }}>
        Aquí puedes verificar que la API está leyendo correctamente cada hoja del archivo
        <strong> Fennix_Emporium_Dashboard_FullDashboard</strong>.
      </p>

      {/* Selector de hoja */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <label htmlFor="sheet" style={{ fontWeight: 500 }}>
          Hoja:
        </label>
        <select
          id="sheet"
          value={selectedSheet}
          onChange={(e) => setSelectedSheet(e.target.value as SheetName)}
          style={{
            backgroundColor: '#020617',
            color: '#e5e7eb',
            borderRadius: 8,
            border: '1px solid #334155',
            padding: '6px 10px',
            minWidth: 200,
          }}
        >
          {SHEETS.map((sheet) => (
            <option key={sheet} value={sheet}>
              {sheet}
            </option>
          ))}
        </select>

        <span style={{ fontSize: 13, opacity: 0.7 }}>
          Filas cargadas: <strong>{rows.length}</strong>
        </span>
      </div>

      {/* Estado de carga / error */}
      {loading && <div style={{ marginTop: 16 }}>Cargando datos de <b>{selectedSheet}</b>...</div>}
      {error && (
        <div
          style={{
            marginTop: 16,
            marginBottom: 16,
            padding: '10px 12px',
            borderRadius: 8,
            backgroundColor: '#451a1a',
            border: '1px solid #fecaca',
            color: '#fee2e2',
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* Tabla de datos */}
      {!loading && !error && (
        <>
          {rows.length === 0 ? (
            <div style={{ marginTop: 16, opacity: 0.8 }}>
              No se encontraron filas en la hoja <b>{selectedSheet}</b>.  
              Verifica que tenga datos (al menos una fila debajo de los encabezados).
            </div>
          ) : (
            <div
              style={{
                borderRadius: 12,
                border: '1px solid #1f2937',
                overflow: 'hidden',
                backgroundColor: '#020617',
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid #1f2937',
                  fontSize: 14,
                  opacity: 0.8,
                }}
              >
                Mostrando primeras {Math.min(rows.length, 50)} filas de <b>{selectedSheet}</b>.
              </div>

              <div style={{ maxHeight: 460, overflow: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 13,
                  }}
                >
                  <thead style={{ backgroundColor: '#020617' }}>
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col}
                          style={{
                            position: 'sticky',
                            top: 0,
                            padding: '8px 10px',
                            borderBottom: '1px solid #1f2937',
                            textAlign: 'left',
                            backgroundColor: '#020617',
                            zIndex: 1,
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 50).map((row, idx) => (
                      <tr
                        key={idx}
                        style={{
                          backgroundColor: idx % 2 === 0 ? '#020617' : '#020617',
                        }}
                      >
                        {columns.map((col) => (
                          <td
                            key={col}
                            style={{
                              padding: '6px 10px',
                              borderBottom: '1px solid #111827',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                            }}
                          >
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <p style={{ marginTop: 12, fontSize: 12, opacity: 0.6 }}>
            Tip: si esta página muestra datos correctamente, la conexión entre Vercel → API →
            Google Sheets está funcionando. Luego podremos usar estas mismas lecturas para
            alimentar el Dashboard general.
          </p>
        </>
      )}
    </div>
  );
}

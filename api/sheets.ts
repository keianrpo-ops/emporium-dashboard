// api/sheets.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL as string;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!GOOGLE_SCRIPT_URL) {
    return res.status(500).json({ error: 'GOOGLE_SCRIPT_URL is not defined' });
  }

  // 🔹 LEER FILAS: GET /api/sheets?sheet=Ventas
  if (req.method === 'GET') {
    const { sheet } = req.query;

    if (!sheet || typeof sheet !== 'string') {
      return res.status(400).json({ error: 'Missing sheet parameter' });
    }

    try {
      const url = `${GOOGLE_SCRIPT_URL}?sheet=${encodeURIComponent(sheet)}&action=getSheet`;
      const resp = await fetch(url);

      if (!resp.ok) {
        const text = await resp.text();
        return res.status(500).json({ error: 'Apps Script GET error', details: text });
      }

      const data = await resp.json(); // el script debe devolver JSON
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: 'Server error', message: err.message });
    }
  }

  // 🔹 AGREGAR FILA: POST /api/sheets
  if (req.method === 'POST') {
    const { sheet, row } = req.body || {};

    if (!sheet || !row) {
      return res.status(400).json({ error: 'Missing sheet or row in body' });
    }

    try {
      const resp = await fetch(`${GOOGLE_SCRIPT_URL}?action=appendRow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheet, row }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        return res.status(500).json({ error: 'Apps Script POST error', details: text });
      }

      const data = await resp.json();
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: 'Server error', message: err.message });
    }
  }

  // Métodos no permitidos
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}

// src/components/TopAdsTable.tsx
import React from 'react';
import { TopAdRow } from '../types';

interface Props {
  title: string;
  rows: TopAdRow[];
}

const formatCurrency = (value: number) =>
  '$ ' + value.toLocaleString('es-CO', { maximumFractionDigits: 0 });

const TopAdsTable: React.FC<Props> = ({ title, rows }) => {
  return (
    <div className="card card--table">
      <div className="card-title">{title}</div>
      <table className="table">
        <thead>
          <tr>
            <th>ID anuncio</th>
            <th>Nombre anuncio</th>
            <th>Ventas</th>
            <th>Ingresos</th>
            <th>ROAS real</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.idAnuncio}>
              <td className="mono">{row.idAnuncio}</td>
              <td>{row.nombreAnuncio}</td>
              <td>{row.ventas}</td>
              <td>{formatCurrency(row.ingresos)}</td>
              <td>{row.roasReal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopAdsTable;

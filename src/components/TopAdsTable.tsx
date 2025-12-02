import React from 'react';
import type { TopAdRow } from '../types';
import './TopAdsTable.css';

interface Props {
  title: string;
  rows: TopAdRow[];
}

const formatCurrency = (value: number) =>
  '$ ' + value.toLocaleString('es-CO', { maximumFractionDigits: 0 });

const getRoasClass = (roas: number) => {
  if (roas >= 4) return 'roas-high';
  if (roas >= 2) return 'roas-med';
  return 'roas-low';
};

const TopAdsTable: React.FC<Props> = ({ title, rows }) => {
  // Ordenar por ventas descendente para asegurar el Top 10
  const sortedRows = [...rows].sort((a, b) => b.ventas - a.ventas).slice(0, 10);

  return (
    <div className="card-table-container">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="table-responsive">
        <table className="modern-table">
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
            {sortedRows.map((row) => (
              <tr key={row.idAnuncio}>
                <td className="col-id">{row.idAnuncio}</td>
                <td className="col-name">{row.nombreAnuncio}</td>
                <td className="col-sales">{row.ventas}</td>
                <td className="col-revenue">{formatCurrency(row.ingresos)}</td>
                <td>
                  <span className={`roas-badge ${getRoasClass(row.roasReal)}`}>
                    {row.roasReal.toFixed(2)}x
                  </span>
                </td>
              </tr>
            ))}
            {sortedRows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  No hay datos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopAdsTable;
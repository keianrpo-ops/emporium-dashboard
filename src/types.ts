// src/types.ts

// ========= KPIs DEL DASHBOARD =========
export interface Kpi {
  id: string;
  label: string;
  value: number;
  currency?: boolean;
  percentage?: boolean;
}

// ========= TOP 10 ANUNCIOS =========
export interface TopAdRow {
  idAnuncio: string;
  nombreAnuncio: string;
  ventas: number;
  ingresos: number;
  roasReal: number;
}

// ========= FILAS DE LA HOJA "Ventas" =========
// Mapea las columnas de la hoja Ventas de Google Sheets
// (usa estos nombres en todo el FE para mantener orden)
export interface VentaRow {
  fecha: string;                 // Columna A (ISO string desde la API)
  idVenta: string;               // Columna B - ID_Venta (v0001, v0002…)
  idPedidoShopify: string;       // Columna C - ID_Pedido_Shopify
  canalVenta: string;            // Columna D - Canal_Venta
  plataformaAds: string;         // Columna E - Plataforma_Ads
  idAnuncio: string;             // Columna F - ID_Anuncio
  idConjuntoAnuncios: string;    // Columna G - ID_Conjunto_Anuncios
  idCampañaAds: string;          // Columna H - ID_Campaña_Ads
  nombreAnuncio: string;         // Columna I - Nombre_Anuncio
  nombreCampaña: string;         // Columna J - Nombre_Campaña
  idProducto: string;            // Columna K - ID_Producto
  producto: string;              // Columna L - Producto (descripción)
  cantidad: number;              // Columna M - Cantidad
  precioUnitario: number;        // Columna N - Precio_Unitario
  descuento: number;             // Columna O - Descuento
  valorVenta: number;            // Columna P - Valor_Venta
  costoProveedor: number;        // Columna Q - Costo_Proveedor
  costoEnvio: number;            // Columna R - Costo_Envio
  costoCPA: number;              // Columna S - Costo_CPA
  costoDeVenta: number;          // Columna T - Costo_de_Venta
  costoProducto: number;         // Columna U - Costo_Producto
  utilidad: number;              // Columna V - Utilidad
  metodoPago: string;            // Columna W - Metodo_Pago
  pais: string;                  // Columna X - País
  ciudad: string;                // Columna Y - Ciudad
  nombreCliente: string;         // Columna Z - Nombre_Cliente
  emailCliente: string;          // Columna AA - Email_Cliente
  telefonoCliente: string;       // Columna AB - Telefono
  direccionEnvio: string;        // Columna AC - Direccion_Envio
}

// ========= FILTROS DEL DASHBOARD =========
// Filtros que se aplican a la lista de ventas y a los KPIs
export interface DashboardFilters {
  fechaDesde?: Date | null;
  fechaHasta?: Date | null;
  idVenta?: string | null;
  canalVenta?: string | null;
  plataformaAds?: string | null;
  idAnuncio?: string | null;
  idProducto?: string | null;
  ciudad?: string | null;
  nombreCliente?: string | null;
  metodoPago?: string | null;
}

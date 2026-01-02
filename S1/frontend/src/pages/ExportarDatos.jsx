import { useState } from 'react';
import { productService } from '../../services/inventoryService';
import './ExportarDatos.css';

function ExportarDatos() {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [filtros, setFiltros] = useState({
    tipo: 'productos',
    categoria: '',
    stockMinimo: '',
    stockMaximo: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const exportarCSV = async () => {
    setCargando(true);
    setMensaje(null);

    try {
      let url = '';
      let params = {};

      if (filtros.tipo === 'productos') {
        url = '/productos/exportar_csv/';
        if (filtros.categoria) params.categoria = filtros.categoria;
        if (filtros.stockMinimo) params.stock_min = filtros.stockMinimo;
        if (filtros.stockMaximo) params.stock_max = filtros.stockMaximo;
      } else if (filtros.tipo === 'movimientos') {
        url = '/movimientos/exportar_csv/';
        if (filtros.fechaDesde) params.fecha_desde = filtros.fechaDesde;
        if (filtros.fechaHasta) params.fecha_hasta = filtros.fechaHasta;
      } else if (filtros.tipo === 'reporte') {
        url = '/productos/exportar_reporte/';
        if (filtros.categoria) params.categoria = filtros.categoria;
      }

      const response = await productService.exportarCSV(url, params);
      
      // Crear link de descarga
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const urlBlob = window.URL.createObjectURL(blob);
      
      const nombreArchivo = `${filtros.tipo}_${new Date().toISOString().split('T')[0]}.csv`;
      link.href = urlBlob;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);

      setMensaje({ tipo: 'success', texto: `Archivo ${nombreArchivo} descargado correctamente` });
    } catch (error) {
      console.error('Error al exportar:', error);
      setMensaje({
        tipo: 'error',
        texto: error.mensajeUsuario || 'No se pudo exportar el archivo'
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="exportar-datos-page">
      <header className="page-header">
        <h1>Exportar Datos</h1>
        <p>Descarga información del inventario en formato CSV</p>
      </header>

      <div className="exportar-form">
        <div className="form-grid">
          <label>
            <span>Tipo de exportación *</span>
            <select name="tipo" value={filtros.tipo} onChange={manejarCambio}>
              <option value="productos">Productos</option>
              <option value="movimientos">Movimientos</option>
              <option value="reporte">Reporte Completo</option>
            </select>
          </label>

          {filtros.tipo === 'productos' && (
            <>
              <label>
                <span>Categoría</span>
                <input
                  name="categoria"
                  value={filtros.categoria}
                  onChange={manejarCambio}
                  placeholder="Ej. Toner, Impresora..."
                />
              </label>

              <label>
                <span>Stock mínimo</span>
                <input
                  type="number"
                  name="stockMinimo"
                  value={filtros.stockMinimo}
                  onChange={manejarCambio}
                  min="0"
                />
              </label>

              <label>
                <span>Stock máximo</span>
                <input
                  type="number"
                  name="stockMaximo"
                  value={filtros.stockMaximo}
                  onChange={manejarCambio}
                  min="0"
                />
              </label>
            </>
          )}

          {filtros.tipo === 'movimientos' && (
            <>
              <label>
                <span>Fecha desde</span>
                <input
                  type="date"
                  name="fechaDesde"
                  value={filtros.fechaDesde}
                  onChange={manejarCambio}
                />
              </label>

              <label>
                <span>Fecha hasta</span>
                <input
                  type="date"
                  name="fechaHasta"
                  value={filtros.fechaHasta}
                  onChange={manejarCambio}
                />
              </label>
            </>
          )}

          {filtros.tipo === 'reporte' && (
            <label>
              <span>Categoría</span>
              <input
                name="categoria"
                value={filtros.categoria}
                onChange={manejarCambio}
                placeholder="Filtrar por categoría (opcional)"
              />
            </label>
          )}
        </div>

        {mensaje && (
          <div className={`mensaje ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        <button
          className="btn-exportar"
          onClick={exportarCSV}
          disabled={cargando}
        >
          {cargando ? 'Exportando...' : '📥 Descargar CSV'}
        </button>

        <div className="info-exportacion">
          <h3>Información sobre los formatos</h3>
          <ul>
            <li><strong>Productos:</strong> Lista completa de productos con stock, precios y categorías</li>
            <li><strong>Movimientos:</strong> Historial de entradas y salidas de inventario</li>
            <li><strong>Reporte Completo:</strong> Análisis detallado con valor de inventario y estado de alertas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ExportarDatos;

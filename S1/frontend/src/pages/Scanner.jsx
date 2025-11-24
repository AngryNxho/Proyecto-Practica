import { useState, useRef } from 'react';
import { productService } from '../services/inventoryService';
import './Scanner.css';

function Scanner() {
  const [code, setCode] = useState('');
  const [producto, setProducto] = useState(null);
  const [msg, setMsg] = useState(null);
  const inputRef = useRef();

  const buscar = async (valor) => {
    setMsg(null);
    setProducto(null);
    try {
      const res = await productService.buscar({ codigo_barras: valor });
      const data = res.data.results || res.data;
      if (Array.isArray(data) && data.length) {
        setProducto(data[0]);
      } else if (data && Object.keys(data).length) {
        setProducto(data);
      } else {
        setMsg('Producto no encontrado');
      }
    } catch (err) {
      setMsg('Error buscando producto');
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!code) return;
    buscar(code.trim());
  };

  const registrarEntrada = async () => {
    if (!producto) return;
    try {
      await productService.registrarEntrada(producto.id, { cantidad: 1, descripcion: 'Entrada por scanner' });
      setMsg('Entrada registrada');
      buscar(producto.codigo_barras || producto.codigo || producto.id);
    } catch (err) {
      setMsg('Error registrando entrada');
    }
  };

  const registrarSalida = async () => {
    if (!producto) return;
    try {
      await productService.registrarSalida(producto.id, { cantidad: 1, descripcion: 'Salida por scanner' });
      setMsg('Salida registrada');
      buscar(producto.codigo_barras || producto.codigo || producto.id);
    } catch (err) {
      setMsg('Error registrando salida');
    }
  };

  return (
    <div className="page scanner-page">
      <header className="page-header">
        <h1>Lector de códigos de barra</h1>
        <p>Enfoca el cursor en el campo y escanea con el lector (o escribe y presiona Enter).</p>
      </header>

      <form onSubmit={onSubmit} className="scanner-form">
        <input
          id="barcode-input"
          ref={inputRef}
          autoFocus
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Escanea o escribe el código"
        />
        <button type="submit">Buscar</button>
      </form>

      {msg && <p className="msg">{msg}</p>}

      {producto && (
        <div className="producto">
          <h2>{producto.nombre}</h2>
          <p><strong>Marca:</strong> {producto.marca} <strong>Modelo:</strong> {producto.modelo}</p>
          <p><strong>Stock:</strong> {producto.stock} u.</p>
          <p><strong>Precio:</strong> {producto.precio}</p>
          <p><strong>Código:</strong> {producto.codigo_barras || '—'}</p>

          <div className="actions">
            <button className="btn" onClick={registrarEntrada}>Registrar entrada +1</button>
            <button className="btn btn-danger" onClick={registrarSalida}>Registrar salida -1</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Scanner;

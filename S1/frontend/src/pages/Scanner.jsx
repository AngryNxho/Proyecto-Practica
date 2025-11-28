import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { productService } from '../services/inventoryService';
import './Scanner.css';

function Scanner() {
  const [code, setCode] = useState('');
  const [producto, setProducto] = useState(null);
  const [msg, setMsg] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const inputRef = useRef();
  const scannerRef = useRef(null);

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

  const iniciarCamara = async () => {
    try {
      setCamaraActiva(true); // Mostrar el div primero
      setScanning(true);
      
      // Esperar un momento para que el DOM se actualice
      setTimeout(async () => {
        try {
          const html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;

          await html5QrCode.start(
            { facingMode: "environment" }, // Cámara trasera
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            (decodedText) => {
              setCode(decodedText);
              buscar(decodedText);
              detenerCamara();
            },
            (errorMessage) => {
              // Errores de escaneo (normales mientras no detecta nada)
            }
          );
          setScanning(false);
        } catch (err) {
          setMsg('Error al iniciar cámara: ' + err);
          setCamaraActiva(false);
          setScanning(false);
        }
      }, 100);
    } catch (err) {
      setMsg('Error: ' + err);
      setScanning(false);
      setCamaraActiva(false);
    }
  };

  const detenerCamara = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error deteniendo cámara:', err);
      }
    }
    setCamaraActiva(false);
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        detenerCamara();
      }
    };
  }, []);

  return (
    <div className="page scanner-page">
      <header className="page-header">
        <h1>Lector de códigos de barra</h1>
        <p>Escanea con tu cámara o escribe el código manualmente</p>
      </header>

      <div className="scanner-controls">
        {!camaraActiva ? (
          <button className="btn btn-primary btn-lg" onClick={iniciarCamara} disabled={scanning}>
            Activar Cámara
          </button>
        ) : (
          <button className="btn btn-danger btn-lg" onClick={detenerCamara}>
            Detener Cámara
          </button>
        )}
      </div>

      {camaraActiva && (
        <div className="camera-container">
          <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
        </div>
      )}

      <div className="separator">
        <span>o escribe manualmente</span>
      </div>

      <form onSubmit={onSubmit} className="scanner-form">
        <input
          id="barcode-input"
          ref={inputRef}
          autoFocus={!camaraActiva}
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Escanea o escribe el código"
          disabled={camaraActiva}
        />
        <button type="submit" disabled={camaraActiva}>Buscar</button>
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

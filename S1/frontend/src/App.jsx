import { Routes, Route, Navigate } from 'react-router-dom';
import BarraNavegacion from './components/layout/BarraNavegacion';
import Tablero from './pages/Tablero';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Movimientos from './pages/Movimientos';
import Alertas from './pages/Alertas';
import Scanner from './pages/Scanner';
import GeneradorCodigoBarras from './pages/GeneradorCodigoBarras';
import DevTools from './pages/DevTools';
import LogViewer from './pages/LogViewer';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <BarraNavegacion />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Tablero />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/movimientos" element={<Movimientos />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/generador" element={<GeneradorCodigoBarras />} />
          <Route path="/dev" element={<DevTools />} />
          <Route path="/logs" element={<LogViewer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

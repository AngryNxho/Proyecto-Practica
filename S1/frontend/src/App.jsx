import ProductoList from './components/ProductoList';
import './App.css';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Sistema de Inventario</h1>
      </header>
      <main>
        <ProductoList />
      </main>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import './GraficoBarras.css';

function GraficoBarras({ datos, titulo, altura = 250, colorPrimario = '#3b82f6', colorSecundario = '#8b5cf6' }) {
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimado(true), 100);
  }, [datos]);

  if (!datos || datos.length === 0) {
    return (
      <div className="grafico-vacio">
        <p>No hay datos para mostrar</p>
      </div>
    );
  }

  const valorMaximo = Math.max(...datos.map(d => d.valor));
  const anchoTotal = 100;
  const anchoBarra = Math.min(80 / datos.length, 12);
  const separacion = (anchoTotal - (anchoBarra * datos.length)) / (datos.length + 1);

  return (
    <div className="grafico-container">
      {titulo && <h3 className="grafico-titulo">{titulo}</h3>}
      <svg 
        viewBox={`0 0 ${anchoTotal} ${altura}`} 
        className="grafico-svg"
        preserveAspectRatio="none"
      >
        {/* Líneas de referencia */}
        <g className="grid-lines">
          {[0, 0.25, 0.5, 0.75, 1].map((factor, i) => (
            <line
              key={i}
              x1="0"
              y1={altura - (altura * 0.9 * factor)}
              x2={anchoTotal}
              y2={altura - (altura * 0.9 * factor)}
              stroke="#e5e7eb"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}
        </g>

        {/* Barras */}
        <g className="barras">
          {datos.map((dato, index) => {
            const x = separacion + (index * (anchoBarra + separacion));
            const alturaRelativa = (dato.valor / valorMaximo) * (altura * 0.8);
            const y = altura - alturaRelativa;
            const color = dato.color || (index % 2 === 0 ? colorPrimario : colorSecundario);

            return (
              <g key={index} className="barra-grupo">
                <rect
                  x={x}
                  y={animado ? y : altura}
                  width={anchoBarra}
                  height={animado ? alturaRelativa : 0}
                  fill={color}
                  rx="1"
                  className="barra"
                  style={{ transition: 'all 0.6s ease', transitionDelay: `${index * 0.1}s` }}
                />
                <text
                  x={x + anchoBarra / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="3"
                  fill="#374151"
                  fontWeight="600"
                  opacity={animado ? 1 : 0}
                  style={{ transition: 'opacity 0.3s ease', transitionDelay: `${index * 0.1 + 0.3}s` }}
                >
                  {dato.valor}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Leyendas */}
      <div className="grafico-leyendas">
        {datos.map((dato, index) => (
          <div key={index} className="leyenda-item">
            <div 
              className="leyenda-color" 
              style={{ 
                background: dato.color || (index % 2 === 0 ? colorPrimario : colorSecundario) 
              }}
            />
            <span className="leyenda-texto">{dato.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GraficoBarras;

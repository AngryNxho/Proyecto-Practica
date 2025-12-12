import { useState, useEffect } from 'react';
import './GraficoLinea.css';

function GraficoLinea({ datos, titulo, altura = 250, color = '#3b82f6', mostrarPuntos = true }) {
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

  const valorMaximo = Math.max(...datos.map(d => d.valor), 1);
  const valorMinimo = Math.min(...datos.map(d => d.valor), 0);
  const rango = valorMaximo - valorMinimo || 1;
  const anchoTotal = 100;
  const margenY = altura * 0.1;
  const alturaGrafico = altura - (margenY * 2);
  
  const puntos = datos.map((dato, index) => {
    const x = (index / (datos.length - 1 || 1)) * anchoTotal;
    const valorNormalizado = (dato.valor - valorMinimo) / rango;
    const y = altura - margenY - (valorNormalizado * alturaGrafico);
    return { x, y, valor: dato.valor, label: dato.label };
  });

  const linea = puntos.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  const area = puntos.length > 0 
    ? `M ${puntos[0].x} ${altura - margenY} ` +
      puntos.map(p => `L ${p.x} ${p.y}`).join(' ') +
      ` L ${puntos[puntos.length - 1].x} ${altura - margenY} Z`
    : '';

  return (
    <div className="grafico-linea-container">
      {titulo && <h3 className="grafico-titulo">{titulo}</h3>}
      <svg 
        viewBox={`0 0 ${anchoTotal} ${altura}`} 
        className="grafico-linea-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
          
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15"/>
          </filter>
        </defs>

        {/* Grid lines */}
        <g className="grid">
          {[0, 0.25, 0.5, 0.75, 1].map((factor, i) => (
            <line
              key={i}
              x1="0"
              y1={margenY + (alturaGrafico * factor)}
              x2={anchoTotal}
              y2={margenY + (alturaGrafico * factor)}
              stroke="#e5e7eb"
              strokeWidth="0.3"
              strokeDasharray="1,2"
            />
          ))}
        </g>

        {/* Área bajo la línea */}
        <path
          d={area}
          fill={`url(#gradient-${color})`}
          opacity={animado ? 1 : 0}
          style={{ transition: 'opacity 0.8s ease' }}
        />

        {/* Línea principal */}
        <path
          d={linea}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#shadow)"
          strokeDasharray={animado ? 'none' : `${anchoTotal * 2}`}
          strokeDashoffset={animado ? 0 : anchoTotal * 2}
          style={{ 
            transition: 'stroke-dashoffset 1.2s ease, stroke-dasharray 1.2s ease',
          }}
        />

        {/* Puntos */}
        {mostrarPuntos && puntos.map((punto, index) => (
          <g key={index}>
            <circle
              cx={punto.x}
              cy={punto.y}
              r="1.5"
              fill="white"
              stroke={color}
              strokeWidth="1.5"
              opacity={animado ? 1 : 0}
              filter="url(#shadow)"
              className="punto"
              style={{ 
                transition: 'opacity 0.3s ease',
                transitionDelay: `${0.8 + index * 0.1}s`
              }}
            />
            <circle
              cx={punto.x}
              cy={punto.y}
              r="0.8"
              fill={color}
              opacity={animado ? 1 : 0}
              style={{ 
                transition: 'opacity 0.3s ease',
                transitionDelay: `${0.8 + index * 0.1}s`
              }}
            />
          </g>
        ))}

        {/* Valores */}
        {puntos.map((punto, index) => (
          <text
            key={`label-${index}`}
            x={punto.x}
            y={punto.y - 5}
            textAnchor="middle"
            fontSize="3"
            fill="#374151"
            fontWeight="600"
            opacity={animado ? 1 : 0}
            style={{ 
              transition: 'opacity 0.3s ease',
              transitionDelay: `${1 + index * 0.1}s`
            }}
          >
            {punto.valor}
          </text>
        ))}
      </svg>

      {/* Leyendas eje X */}
      <div className="eje-x-labels">
        {puntos.map((punto, index) => (
          <div 
            key={index} 
            className="eje-x-label"
            style={{ left: `${punto.x}%` }}
          >
            {punto.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GraficoLinea;

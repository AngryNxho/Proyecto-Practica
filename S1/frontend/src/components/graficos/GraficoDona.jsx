import { useState, useEffect } from 'react';
import './GraficoDona.css';

function GraficoDona({ datos, titulo, tamano = 200, grosor = 35 }) {
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

  const total = datos.reduce((sum, d) => sum + d.valor, 0);
  const centro = tamano / 2;
  const radio = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;

  let acumulado = 0;
  const segmentos = datos.map((dato, index) => {
    const porcentaje = (dato.valor / total) * 100;
    const offset = circunferencia - (circunferencia * acumulado / 100);
    const dasharray = `${(circunferencia * porcentaje) / 100} ${circunferencia}`;
    acumulado += porcentaje;

    return {
      ...dato,
      porcentaje: porcentaje.toFixed(1),
      offset,
      dasharray,
      color: dato.color || `hsl(${(index * 360) / datos.length}, 70%, 60%)`
    };
  });

  return (
    <div className="grafico-dona-container">
      {titulo && <h3 className="grafico-titulo">{titulo}</h3>}
      
      <div className="dona-wrapper">
        <svg 
          viewBox={`0 0 ${tamano} ${tamano}`}
          className="grafico-dona-svg"
        >
          <defs>
            <filter id="dona-shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
            </filter>
          </defs>

          {/* Círculo de fondo */}
          <circle
            cx={centro}
            cy={centro}
            r={radio}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={grosor}
          />

          {/* Segmentos */}
          {segmentos.map((segmento, index) => (
            <circle
              key={index}
              cx={centro}
              cy={centro}
              r={radio}
              fill="none"
              stroke={segmento.color}
              strokeWidth={grosor}
              strokeDasharray={animado ? segmento.dasharray : `0 ${circunferencia}`}
              strokeDashoffset={-segmento.offset}
              strokeLinecap="round"
              filter="url(#dona-shadow)"
              className="dona-segmento"
              style={{ 
                transition: 'stroke-dasharray 1s ease',
                transitionDelay: `${index * 0.15}s`,
                transform: 'rotate(-90deg)',
                transformOrigin: 'center'
              }}
            />
          ))}

          {/* Texto central */}
          <text
            x={centro}
            y={centro - 5}
            textAnchor="middle"
            fontSize="24"
            fontWeight="700"
            fill="#1f2937"
            opacity={animado ? 1 : 0}
            style={{ transition: 'opacity 0.5s ease', transitionDelay: '0.8s' }}
          >
            {total}
          </text>
          <text
            x={centro}
            y={centro + 15}
            textAnchor="middle"
            fontSize="12"
            fill="#6b7280"
            opacity={animado ? 1 : 0}
            style={{ transition: 'opacity 0.5s ease', transitionDelay: '0.8s' }}
          >
            Total
          </text>
        </svg>

        {/* Leyendas */}
        <div className="dona-leyendas">
          {segmentos.map((segmento, index) => (
            <div 
              key={index} 
              className="dona-leyenda-item"
              style={{
                opacity: animado ? 1 : 0,
                transform: animado ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 0.4s ease',
                transitionDelay: `${0.5 + index * 0.1}s`
              }}
            >
              <div className="leyenda-header">
                <div 
                  className="leyenda-color"
                  style={{ background: segmento.color }}
                />
                <span className="leyenda-label">{segmento.label}</span>
              </div>
              <div className="leyenda-valores">
                <span className="leyenda-valor">{segmento.valor}</span>
                <span className="leyenda-porcentaje">{segmento.porcentaje}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GraficoDona;

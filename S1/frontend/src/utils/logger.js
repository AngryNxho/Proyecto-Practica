// Sistema de logs interno para debugging
class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100; // Mantener solo los últimos 100 logs
    this.enabled = import.meta.env.VITE_ENABLE_LOGS === 'true' || import.meta.env.DEV;
    this.environment = import.meta.env.VITE_APP_ENV || 'development';
  }

  log(level, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      url: window.location.pathname,
      environment: this.environment
    };

    this.logs.push(logEntry);
    
    // Mantener solo los últimos N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Guardar en localStorage para persistencia
    this.saveToStorage();

    // Log en consola según el nivel (solo si está habilitado)
    if (this.enabled) {
      const style = this.getStyle(level);
      console.log(
        `%c[${level.toUpperCase()}]%c ${message}`,
        style,
        'color: inherit',
        data || ''
      );
    }
  }

  getStyle(level) {
    const styles = {
      info: 'color: #3b82f6; font-weight: bold',
      success: 'color: #10b981; font-weight: bold',
      warning: 'color: #f59e0b; font-weight: bold',
      error: 'color: #ef4444; font-weight: bold',
      debug: 'color: #8b5cf6; font-weight: bold'
    };
    return styles[level] || styles.info;
  }

  info(message, data) {
    this.log('info', message, data);
  }

  success(message, data) {
    this.log('success', message, data);
  }

  warning(message, data) {
    this.log('warning', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }

  debug(message, data) {
    this.log('debug', message, data);
  }

  // Obtener todos los logs
  getLogs(level = null) {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return this.logs;
  }

  // Limpiar logs
  clear() {
    this.logs = [];
    localStorage.removeItem('app_logs');
    console.clear();
  }

  // Exportar logs como JSON
  export() {
    const data = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Guardar en localStorage
  saveToStorage() {
    try {
      localStorage.setItem('app_logs', JSON.stringify(this.logs));
    } catch (e) {
      // Si localStorage está lleno, eliminar logs antiguos
      this.logs = this.logs.slice(-50);
      try {
        localStorage.setItem('app_logs', JSON.stringify(this.logs));
      } catch (e) {
        console.error('No se pueden guardar logs:', e);
      }
    }
  }

  // Cargar desde localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('app_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error al cargar logs:', e);
      this.logs = [];
    }
  }

  // Habilitar/deshabilitar logs en consola
  toggle(enabled) {
    this.enabled = enabled;
  }

  // Obtener resumen de logs
  getSummary() {
    const summary = {
      total: this.logs.length,
      byLevel: {},
      recent: this.logs.slice(-10)
    };

    this.logs.forEach(log => {
      summary.byLevel[log.level] = (summary.byLevel[log.level] || 0) + 1;
    });

    return summary;
  }
}

// Crear instancia global
const logger = new Logger();
logger.loadFromStorage();

// Exponer globalmente para debugging
if (typeof window !== 'undefined') {
  window.logger = logger;
}

export default logger;

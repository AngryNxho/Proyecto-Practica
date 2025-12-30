import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0', // Permite acceso desde la red local
      port: 5173,
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production', // Source maps solo en dev/staging
      minify: mode === 'production' ? 'terser' : 'esbuild',
      terserOptions: mode === 'production' ? {
        compress: {
          drop_console: true, // Eliminar console.log en producción
          drop_debugger: true,
        },
      } : {},
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }
              if (id.includes('axios')) {
                return 'axios-vendor';
              }
              return 'vendor';
            }
          },
          // Optimización de nombres de archivos
          chunkFileNames: mode === 'production' 
            ? 'assets/js/[name]-[hash].js'
            : 'assets/js/[name].js',
          entryFileNames: mode === 'production'
            ? 'assets/js/[name]-[hash].js' 
            : 'assets/js/[name].js',
          assetFileNames: mode === 'production'
            ? 'assets/[ext]/[name]-[hash].[ext]'
            : 'assets/[ext]/[name].[ext]',
        }
      },
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'axios']
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    }
  }
})

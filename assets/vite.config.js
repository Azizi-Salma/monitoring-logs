// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  build: {
    outDir: '../public/build',
    assetsDir: 'assets',
    emptyOutDir: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true, // Important
    },
  },
  resolve: {
    alias: {
      // Supprimez ou corrigez les alias problématiques si nécessaire
      // L'alias pour date-fns dans votre version précédente semblait incorrect.
      // Utilisez celui-ci si vous avez des soucis spécifiques :
      // 'date-fns/_lib/format/longFormatters': 'date-fns/esm/_lib/format/longFormatters/index.js',
    },
  },
  // Solution principale : Optimiser la dépendance pour les modules problématiques
  optimizeDeps: {
    include: [
      // MUI Material Components & Modules
      '@mui/material',
      '@mui/material/styles',
      '@mui/material/utils',
      '@mui/material/useMediaQuery',
      // Ajoutez ici TOUS les composants MUI spécifiquement importés ou transitivement requis
      // Comme vus dans vos erreurs :
      '@mui/material/Paper',
      '@mui/material/Typography',
      '@mui/material/Fade',
      '@mui/material/ListItem',
      '@mui/material/Chip',
      '@mui/material/IconButton',
      '@mui/material/Grow',
      '@mui/material/List',
      '@mui/material/FormControl',
      '@mui/material/Button',
      '@mui/material/InputLabel',
      // MUI System
      '@mui/system',
      '@mui/system/RtlProvider',
      '@mui/system/createStyled',
      // MUI X Date Pickers
      '@mui/x-date-pickers',
      // Ajoutez ici les sous-modules spécifiques de date-pickers si nécessaire
      // Par exemple :
      // '@mui/x-date-pickers/DatePicker',
      // '@mui/x-date-pickers/LocalizationProvider',
    ],
    // exclude: ['@mui/material', '@mui/x-date-pickers'] // À essayer si include ne fonctionne pas
  },
});
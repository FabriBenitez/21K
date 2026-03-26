import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const coloresApp = {
  azulPrincipal: '#1459D9',
  azulSecundario: '#4D8CFF',
  verdeExito: '#1E9E6A',
  naranjaEnergia: '#EF8D32',
  tinta: '#1F2A37',
  neutroFondo: '#F4F7FB',
  neutroSuperficie: '#FFFFFF',
  neutroBorde: '#D9E2EE',
} as const;

export const espaciadoApp = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radiosApp = {
  sm: 8,
  md: 14,
  lg: 20,
} as const;

export const temaApp: MD3Theme = {
  ...MD3LightTheme,
  roundness: radiosApp.md,
  colors: {
    ...MD3LightTheme.colors,
    primary: coloresApp.azulPrincipal,
    secondary: coloresApp.azulSecundario,
    tertiary: coloresApp.naranjaEnergia,
    error: '#BA1A1A',
    background: coloresApp.neutroFondo,
    surface: coloresApp.neutroSuperficie,
    surfaceVariant: '#E9EFF7',
    outline: coloresApp.neutroBorde,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onBackground: coloresApp.tinta,
    onSurface: coloresApp.tinta,
  },
};



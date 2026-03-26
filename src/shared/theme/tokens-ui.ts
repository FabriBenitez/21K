export const coloresBase = {
  fondoOscuro: '#050608',
  fondoOscuroSecundario: '#11131A',
  fondoClaro: '#F4F6FA',
  tarjetaOscura: '#171922',
  tarjetaOscuraSuave: '#202330',
  tarjetaClara: '#FFFFFF',
  bordeOscuro: '#2E3342',
  bordeClaro: '#DCE1EA',
  textoPrincipalOscuro: '#F4F7FF',
  textoSecundarioOscuro: '#A3A9BB',
  textoPrincipalClaro: '#111828',
  textoSecundarioClaro: '#6F778B',
  acentoNeon: '#D8FF3E',
  acentoNeonSuave: '#C2F02B',
} as const;

export const espaciadoBase = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radiosBase = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const sombrasNeon = {
  glowFuerte: {
    shadowColor: '#D8FF3E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 14,
  },
  glowSuave: {
    shadowColor: '#D8FF3E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
} as const;

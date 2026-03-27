export const rutasApp = {
  auth: {
    login: '/(auth)/login',
    registro: '/(auth)/registro',
    recuperarClave: '/(auth)/recuperar-clave',
    callback: '/auth/callback',
    resetPassword: '/reset-password',
  },
  tabs: {
    raiz: '/(tabs)',
    inicio: '/(tabs)/index',
    agregar: '/(tabs)/agregar',
    calendario: '/(tabs)/calendario',
    estadisticas: '/(tabs)/estadisticas',
    perfil: '/(tabs)/perfil',
  },
  flows: {
    sesionGym: '/sesion-gym',
    registroRunning: '/registro-running',
    progresoRunning: '/progreso-running',
  },
} as const;

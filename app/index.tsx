import { Redirect } from 'expo-router';

import { rutasApp } from '@/src/shared/navigation/rutas-app';
import { useEstadoApp } from '@/src/shared/state/contexto-app';
import { PantallaCargandoApp } from '@/src/shared/ui/pantalla-cargando-app';

export default function RutaInicial() {
  const { estadoSesion } = useEstadoApp();

  if (estadoSesion === 'cargando') {
    return <PantallaCargandoApp mensaje="Cargando sesion..." />;
  }

  return <Redirect href={estadoSesion === 'autenticado' ? rutasApp.tabs.raiz : rutasApp.auth.login} />;
}

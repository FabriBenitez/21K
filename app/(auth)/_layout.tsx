import { Redirect, Stack } from 'expo-router';

import { rutasApp } from '@/src/shared/navigation/rutas-app';
import { useEstadoApp } from '@/src/shared/state/contexto-app';
import { PantallaCargandoApp } from '@/src/shared/ui/pantalla-cargando-app';

export default function LayoutAutenticacion() {
  const { estadoSesion } = useEstadoApp();

  if (estadoSesion === 'cargando') {
    return <PantallaCargandoApp mensaje="Verificando sesion..." />;
  }

  if (estadoSesion === 'autenticado') {
    return <Redirect href={rutasApp.tabs.raiz} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

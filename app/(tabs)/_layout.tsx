import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { rutasApp } from '@/src/shared/navigation/rutas-app';
import { useEstadoApp } from '@/src/shared/state/contexto-app';
import { BarraTabsNeon } from '@/src/shared/ui/barra-tabs-neon';
import { PantallaCargandoApp } from '@/src/shared/ui/pantalla-cargando-app';

export default function TabLayout() {
  const { estadoSesion } = useEstadoApp();

  if (estadoSesion === 'cargando') {
    return <PantallaCargandoApp mensaje="Cargando entrenamiento..." />;
  }

  if (estadoSesion !== 'autenticado') {
    return <Redirect href={rutasApp.auth.login} />;
  }

  return (
    <Tabs
      tabBar={(props) => <BarraTabsNeon {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          paddingBottom: Platform.OS === 'ios' ? 80 : 74,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'INICIO',
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          title: 'PLAN',
        }}
      />
      <Tabs.Screen
        name="agregar"
        options={{
          title: '',
        }}
      />
      <Tabs.Screen
        name="estadisticas"
        options={{
          title: 'ESTAD.',
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'PERFIL',
        }}
      />
      <Tabs.Screen
        name="entrenamientos"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}


import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { BarraTabsNeon } from '@/src/shared/ui/barra-tabs-neon';

export default function TabLayout() {
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


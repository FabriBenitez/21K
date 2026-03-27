import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { PantallaErrorGlobal } from '@/src/shared/errors/pantalla-error-global';
import { ProveedorApp } from '@/src/shared/providers/proveedor-app';

export default function RootLayout() {
  return (
    <ProveedorApp>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="sesion-gym" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen
          name="registro-running"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="progreso-running"
          options={{ headerShown: false, presentation: 'card' }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ProveedorApp>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <PantallaErrorGlobal descripcion={error.message} onReintentar={retry} />;
}



import { type PropsWithChildren } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { temaApp } from '@/src/shared/theme/tema-app';

export function ProveedorApp({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={temaApp}>{children}</PaperProvider>
    </SafeAreaProvider>
  );
}




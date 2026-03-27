import { type PropsWithChildren } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LimiteErrorGlobal } from '@/src/shared/errors/limite-error-global';
import { ProveedorEstadoApp } from '@/src/shared/state/contexto-app';
import { temaApp } from '@/src/shared/theme/tema-app';

export function ProveedorApp({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <LimiteErrorGlobal>
        <PaperProvider theme={temaApp}>
          <ProveedorEstadoApp>{children}</ProveedorEstadoApp>
        </PaperProvider>
      </LimiteErrorGlobal>
    </SafeAreaProvider>
  );
}




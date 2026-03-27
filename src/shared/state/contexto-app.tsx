import type { AuthError, Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { clienteSupabase } from '@/src/shared/integrations/supabase/cliente-supabase';

export type EstadoSesion = 'cargando' | 'invitado' | 'autenticado';

interface UsuarioSesion {
  id: string;
  email: string | null;
  nombreMostrado: string;
}

interface EstadoApp {
  estadoSesion: EstadoSesion;
  usuario: UsuarioSesion | null;
}

interface ResultadoAuth {
  ok: boolean;
  mensaje?: string;
  requiereConfirmacion?: boolean;
}

interface ValorContextoApp extends EstadoApp {
  iniciarSesion: (correoElectronico: string, clave: string) => Promise<ResultadoAuth>;
  registrarCuenta: (
    nombreMostrado: string,
    correoElectronico: string,
    clave: string
  ) => Promise<ResultadoAuth>;
  enviarRecuperacionClave: (correoElectronico: string) => Promise<ResultadoAuth>;
  actualizarClave: (nuevaClave: string) => Promise<ResultadoAuth>;
  cerrarSesion: () => Promise<ResultadoAuth>;
}

const ContextoApp = createContext<ValorContextoApp | undefined>(undefined);

function obtenerNombreMostrado(usuario: User) {
  const nombreDesdeMetadata = usuario.user_metadata?.nombre_mostrado;
  if (typeof nombreDesdeMetadata === 'string' && nombreDesdeMetadata.trim().length > 0) {
    return nombreDesdeMetadata.trim();
  }

  if (usuario.email) {
    const parteInicial = usuario.email.split('@')[0] ?? '';
    if (parteInicial.trim().length > 0) {
      return parteInicial.trim();
    }
  }

  return 'Corredor 21K';
}

function construirUsuarioSesion(usuario: User): UsuarioSesion {
  return {
    id: usuario.id,
    email: usuario.email ?? null,
    nombreMostrado: obtenerNombreMostrado(usuario),
  };
}

function parsearParametrosEnlace(contenido: string) {
  const parametros: Record<string, string> = {};

  contenido
    .split('&')
    .map((segmento) => segmento.trim())
    .filter((segmento) => segmento.length > 0)
    .forEach((segmento) => {
      const [clave, valor] = segmento.split('=');
      if (!clave || valor === undefined) {
        return;
      }

      parametros[decodeURIComponent(clave)] = decodeURIComponent(valor);
    });

  return parametros;
}

function extraerCredencialesSesionDesdeUrl(url: string) {
  const indicePrimerInterrogante = url.indexOf('?');
  const indicePrimerNumeral = url.indexOf('#');

  const query =
    indicePrimerInterrogante >= 0
      ? url.slice(indicePrimerInterrogante + 1, indicePrimerNumeral >= 0 ? indicePrimerNumeral : undefined)
      : '';
  const hash = indicePrimerNumeral >= 0 ? url.slice(indicePrimerNumeral + 1) : '';

  const parametros = {
    ...parsearParametrosEnlace(query),
    ...parsearParametrosEnlace(hash),
  };

  const accessToken = parametros.access_token;
  const refreshToken = parametros.refresh_token;

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

function normalizarMensajeError(error: AuthError | null) {
  if (!error) {
    return 'Ocurrio un error inesperado.';
  }

  const codigo = error.code ?? '';

  if (codigo === 'invalid_credentials') {
    return 'Credenciales invalidas. Revisa correo y contrasena.';
  }

  if (codigo === 'email_not_confirmed') {
    return 'Debes confirmar tu correo antes de iniciar sesion.';
  }

  if (codigo === 'user_already_exists') {
    return 'Ya existe una cuenta con ese correo.';
  }

  if (codigo === 'over_email_send_rate_limit') {
    return 'Ya enviamos demasiados correos. Intentalo de nuevo en unos minutos.';
  }

  if (codigo === 'same_password') {
    return 'La nueva contrasena debe ser distinta a la anterior.';
  }

  if (codigo === 'weak_password') {
    return 'La contrasena es demasiado debil.';
  }

  if (codigo === 'session_not_found') {
    return 'No se encontro una sesion valida para esta accion.';
  }

  return error.message || 'Ocurrio un error inesperado.';
}

export function ProveedorEstadoApp({ children }: PropsWithChildren) {
  const [estadoSesion, setEstadoSesion] = useState<EstadoSesion>('cargando');
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  const sincronizarSesion = useCallback((sesion: Session | null) => {
    if (!sesion?.user) {
      setUsuario(null);
      setEstadoSesion('invitado');
      return;
    }

    setUsuario(construirUsuarioSesion(sesion.user));
    setEstadoSesion('autenticado');
  }, []);

  const procesarDeepLink = useCallback(
    async (url: string) => {
      const credenciales = extraerCredencialesSesionDesdeUrl(url);
      if (!credenciales) {
        return;
      }

      const { data, error } = await clienteSupabase.auth.setSession({
        access_token: credenciales.accessToken,
        refresh_token: credenciales.refreshToken,
      });

      if (error) {
        console.error('No se pudo recuperar sesion desde deep link', error);
        return;
      }

      sincronizarSesion(data.session);
    },
    [sincronizarSesion]
  );

  useEffect(() => {
    let activo = true;

    const inicializarSesion = async () => {
      const { data, error } = await clienteSupabase.auth.getSession();

      if (!activo) {
        return;
      }

      if (error) {
        console.error('No se pudo cargar la sesion inicial', error);
        setEstadoSesion('invitado');
        return;
      }

      sincronizarSesion(data.session);
    };

    inicializarSesion();

    const { data: subscripcionAuth } = clienteSupabase.auth.onAuthStateChange((_evento, sesion) => {
      if (!activo) {
        return;
      }

      sincronizarSesion(sesion);
    });

    const subscripcionUrl = Linking.addEventListener('url', ({ url }) => {
      void procesarDeepLink(url);
    });

    Linking.getInitialURL()
      .then((urlInicial) => {
        if (urlInicial) {
          void procesarDeepLink(urlInicial);
        }
      })
      .catch((error) => {
        console.error('No se pudo leer URL inicial', error);
      });

    return () => {
      activo = false;
      subscripcionAuth.subscription.unsubscribe();
      subscripcionUrl.remove();
    };
  }, [procesarDeepLink, sincronizarSesion]);

  const iniciarSesion = useCallback(
    async (correoElectronico: string, clave: string): Promise<ResultadoAuth> => {
      const { data, error } = await clienteSupabase.auth.signInWithPassword({
        email: correoElectronico.trim(),
        password: clave,
      });

      if (error) {
        return { ok: false, mensaje: normalizarMensajeError(error) };
      }

      sincronizarSesion(data.session);
      return { ok: true };
    },
    [sincronizarSesion]
  );

  const registrarCuenta = useCallback(
    async (
      nombreMostrado: string,
      correoElectronico: string,
      clave: string
    ): Promise<ResultadoAuth> => {
      const enlaceConfirmacion = Linking.createURL('auth/callback');

      const { data, error } = await clienteSupabase.auth.signUp({
        email: correoElectronico.trim(),
        password: clave,
        options: {
          data: {
            nombre_mostrado: nombreMostrado.trim(),
          },
          emailRedirectTo: enlaceConfirmacion,
        },
      });

      if (error) {
        return { ok: false, mensaje: normalizarMensajeError(error) };
      }

      if (data.session) {
        sincronizarSesion(data.session);
        return { ok: true, mensaje: 'Cuenta creada y sesion iniciada.', requiereConfirmacion: false };
      }

      return {
        ok: true,
        mensaje: 'Cuenta creada. Revisa tu correo para confirmar la direccion antes de iniciar sesion.',
        requiereConfirmacion: true,
      };
    },
    [sincronizarSesion]
  );

  const enviarRecuperacionClave = useCallback(
    async (correoElectronico: string): Promise<ResultadoAuth> => {
      const enlaceRecuperacion = Linking.createURL('reset-password');

      const { error } = await clienteSupabase.auth.resetPasswordForEmail(correoElectronico.trim(), {
        redirectTo: enlaceRecuperacion,
      });

      if (error) {
        return { ok: false, mensaje: normalizarMensajeError(error) };
      }

      return {
        ok: true,
        mensaje: 'Te enviamos un correo con instrucciones para recuperar tu cuenta.',
      };
    },
    []
  );

  const actualizarClave = useCallback(async (nuevaClave: string): Promise<ResultadoAuth> => {
    const { error } = await clienteSupabase.auth.updateUser({
      password: nuevaClave,
    });

    if (error) {
      return { ok: false, mensaje: normalizarMensajeError(error) };
    }

    const { error: errorLogout } = await clienteSupabase.auth.signOut();
    if (errorLogout) {
      return { ok: false, mensaje: normalizarMensajeError(errorLogout) };
    }

    sincronizarSesion(null);
    return { ok: true, mensaje: 'Contrasena actualizada. Inicia sesion nuevamente.' };
  }, [sincronizarSesion]);

  const cerrarSesion = useCallback(async (): Promise<ResultadoAuth> => {
    const { error } = await clienteSupabase.auth.signOut();

    if (error) {
      return { ok: false, mensaje: normalizarMensajeError(error) };
    }

    sincronizarSesion(null);
    return { ok: true };
  }, [sincronizarSesion]);

  const valorContexto = useMemo<ValorContextoApp>(
    () => ({
      estadoSesion,
      usuario,
      iniciarSesion,
      registrarCuenta,
      enviarRecuperacionClave,
      actualizarClave,
      cerrarSesion,
    }),
    [
      actualizarClave,
      cerrarSesion,
      enviarRecuperacionClave,
      estadoSesion,
      iniciarSesion,
      registrarCuenta,
      usuario,
    ]
  );

  return <ContextoApp.Provider value={valorContexto}>{children}</ContextoApp.Provider>;
}

export function useEstadoApp() {
  const contexto = useContext(ContextoApp);

  if (!contexto) {
    throw new Error('useEstadoApp debe utilizarse dentro de ProveedorEstadoApp.');
  }

  return contexto;
}

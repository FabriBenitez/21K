import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { variablesEntorno } from '@/src/shared/config/variables-entorno';

type AdaptadorStorageSupabase = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const storageNoop: AdaptadorStorageSupabase = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

const memoriaStorageInterna = new Map<string, string>();

const storageMemoria: AdaptadorStorageSupabase = {
  getItem: async (key) => memoriaStorageInterna.get(key) ?? null,
  setItem: async (key, value) => {
    memoriaStorageInterna.set(key, value);
  },
  removeItem: async (key) => {
    memoriaStorageInterna.delete(key);
  },
};

const storageWeb: AdaptadorStorageSupabase = {
  getItem: async (key) => {
    if (typeof globalThis.localStorage === 'undefined') {
      return null;
    }

    return globalThis.localStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (typeof globalThis.localStorage === 'undefined') {
      return;
    }

    globalThis.localStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (typeof globalThis.localStorage === 'undefined') {
      return;
    }

    globalThis.localStorage.removeItem(key);
  },
};

let falloStorageNativoReportado = false;

function reportarFalloStorageNativo(error: unknown) {
  if (falloStorageNativoReportado) {
    return;
  }

  falloStorageNativoReportado = true;
  const detalle = error instanceof Error ? error.message : String(error);
  console.warn(`AsyncStorage nativo no disponible. Se usara storage en memoria. Detalle: ${detalle}`);
}

function crearStorageNativoSeguro(): AdaptadorStorageSupabase {
  return {
    getItem: async (key) => {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        reportarFalloStorageNativo(error);
        return storageMemoria.getItem(key);
      }
    },
    setItem: async (key, value) => {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        reportarFalloStorageNativo(error);
        await storageMemoria.setItem(key, value);
      }
    },
    removeItem: async (key) => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        reportarFalloStorageNativo(error);
        await storageMemoria.removeItem(key);
      }
    },
  };
}

function resolverStorageAuth(): AdaptadorStorageSupabase {
  if (Platform.OS === 'web') {
    if (typeof globalThis.window === 'undefined') {
      return storageNoop;
    }

    return storageWeb;
  }

  return crearStorageNativoSeguro();
}

export const clienteSupabase = createClient(
  variablesEntorno.supabaseUrl,
  variablesEntorno.supabaseAnonKey,
  {
    auth: {
      storage: resolverStorageAuth(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

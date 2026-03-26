import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { coloresBase, espaciadoBase, radiosBase } from '@/src/shared/theme/tokens-ui';

interface PropiedadesCampoFormulario {
  etiqueta: string;
  placeholder: string;
  valor: string;
  onChangeText: (valor: string) => void;
  icono: LucideIcon;
  esClave?: boolean;
  textoDerechaEtiqueta?: string;
  onPressTextoDerechaEtiqueta?: () => void;
  teclado?: 'default' | 'email-address' | 'numeric';
}

export function CampoFormulario({
  etiqueta,
  placeholder,
  valor,
  onChangeText,
  icono: Icono,
  esClave = false,
  textoDerechaEtiqueta,
  onPressTextoDerechaEtiqueta,
  teclado = 'default',
}: PropiedadesCampoFormulario) {
  const [esVisibleClave, setEsVisibleClave] = useState(false);

  return (
    <View style={estilos.bloque}>
      <View style={estilos.filaEtiqueta}>
        <Text style={estilos.etiqueta}>{etiqueta}</Text>
        {textoDerechaEtiqueta ? (
          <Pressable onPress={onPressTextoDerechaEtiqueta}>
            <Text style={estilos.etiquetaAcento}>{textoDerechaEtiqueta}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={estilos.campo}>
        <Icono color={coloresBase.textoSecundarioOscuro} size={22} strokeWidth={2.1} />
        <TextInput
          value={valor}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#5A6072"
          style={estilos.input}
          keyboardType={teclado}
          autoCapitalize="none"
          secureTextEntry={esClave && !esVisibleClave}
        />
        {esClave ? (
          <Pressable onPress={() => setEsVisibleClave((valorActual) => !valorActual)}>
            {esVisibleClave ? (
              <Eye color={coloresBase.textoSecundarioOscuro} size={22} strokeWidth={2.1} />
            ) : (
              <EyeOff color={coloresBase.textoSecundarioOscuro} size={22} strokeWidth={2.1} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  bloque: {
    gap: espaciadoBase.sm,
  },
  filaEtiqueta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etiqueta: {
    fontSize: 15,
    color: '#E9ECF6',
    letterSpacing: 0.4,
    fontWeight: '600',
  },
  etiquetaAcento: {
    fontSize: 15,
    color: coloresBase.acentoNeon,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  campo: {
    minHeight: 64,
    borderRadius: radiosBase.lg,
    backgroundColor: coloresBase.tarjetaOscuraSuave,
    borderWidth: 1,
    borderColor: '#2A2F3C',
    paddingHorizontal: espaciadoBase.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciadoBase.sm,
  },
  input: {
    flex: 1,
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 18,
    fontWeight: '500',
  },
});

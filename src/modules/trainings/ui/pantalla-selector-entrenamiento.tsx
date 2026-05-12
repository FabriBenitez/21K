import { router } from 'expo-router';
import { Dumbbell, Plus, PersonStanding, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { coloresBase, espaciadoBase, radiosBase, sombrasNeon } from '@/src/shared/theme/tokens-ui';

export function PantallaSelectorEntrenamiento() {
  return (
    <ContenedorPantalla modo="oscuro" desplazable estiloContenido={estilos.contenido}>
      <Pressable style={estilos.botonCerrar} onPress={() => router.back()}>
        <X color={coloresBase.textoPrincipalOscuro} size={28} strokeWidth={2.4} />
      </Pressable>

      <View>
        <Text style={estilos.titulo}>
          Registrar <Text style={estilos.tituloAcento}>entrenamiento</Text>
        </Text>
        <Text style={estilos.subtitulo}>Preparandote para tu primer 21K</Text>
        <Pressable style={estilos.botonHistorial} onPress={() => router.push('/(tabs)/entrenamientos')}>
          <Text style={estilos.textoBotonHistorial}>Ver historial</Text>
        </Pressable>
      </View>

      <Pressable style={estilos.tarjetaGrande} onPress={() => router.push('/sesion-gym')}>
        <View style={estilos.circuloIcono}>
          <Dumbbell color={coloresBase.acentoNeon} size={38} strokeWidth={2.4} />
        </View>
        <Text style={estilos.tituloTarjeta}>RUTINA GYM</Text>
        <Text style={estilos.subtituloTarjeta}>Programa semana, dia y ejercicios</Text>
      </Pressable>

      <View style={estilos.separadorCentral}>
        <View style={estilos.lineaSeparador} />
        <View style={estilos.botonMas}>
          <Plus color={coloresBase.fondoOscuro} size={34} strokeWidth={2.4} />
        </View>
        <View style={estilos.lineaSeparador} />
      </View>

      <Pressable style={estilos.tarjetaGrande} onPress={() => router.push('/registro-running')}>
        <View style={[estilos.chipPlan, sombrasNeon.glowSuave]}>
          <Text style={estilos.textoChipPlan}>PLAN</Text>
        </View>
        <View style={estilos.circuloIcono}>
          <PersonStanding color={coloresBase.acentoNeon} size={38} strokeWidth={2.4} />
        </View>
        <Text style={[estilos.tituloTarjeta, estilos.tituloAcentoTarjeta]}>CARRERA</Text>
        <Text style={estilos.subtituloTarjeta}>Plan semanal, pasadas, km cortos y fondo</Text>
      </Pressable>
    </ContenedorPantalla>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    paddingBottom: 140,
    minHeight: '100%',
  },
  botonCerrar: {
    width: 56,
    height: 56,
    borderRadius: radiosBase.pill,
    backgroundColor: '#171A22',
    borderWidth: 1,
    borderColor: '#2B3040',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  titulo: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 56 / 2,
    fontWeight: '800',
  },
  tituloAcento: {
    color: coloresBase.acentoNeon,
  },
  subtitulo: {
    marginTop: espaciadoBase.xs,
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 34 / 2,
  },
  botonHistorial: {
    alignSelf: 'flex-start',
    marginTop: espaciadoBase.sm,
    borderRadius: radiosBase.pill,
    borderWidth: 1,
    borderColor: '#2E3344',
    backgroundColor: '#1A1E29',
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: 9,
  },
  textoBotonHistorial: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 14,
    fontWeight: '700',
  },
  tarjetaGrande: {
    borderRadius: 34,
    borderWidth: 1.6,
    borderColor: 'rgba(216,255,62,0.4)',
    backgroundColor: 'rgba(216,255,62,0.08)',
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciadoBase.sm,
    padding: espaciadoBase.xl,
  },
  circuloIcono: {
    width: 120,
    height: 120,
    borderRadius: radiosBase.pill,
    backgroundColor: 'rgba(216,255,62,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(216,255,62,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloTarjeta: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 68 / 2,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tituloAcentoTarjeta: {
    color: coloresBase.acentoNeon,
  },
  subtituloTarjeta: {
    color: '#A3AD72',
    fontSize: 17,
  },
  separadorCentral: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciadoBase.md,
  },
  lineaSeparador: {
    flex: 1,
    height: 1,
    backgroundColor: '#252A39',
  },
  botonMas: {
    width: 74,
    height: 74,
    borderRadius: radiosBase.pill,
    backgroundColor: coloresBase.acentoNeon,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombrasNeon.glowFuerte,
  },
  chipPlan: {
    position: 'absolute',
    top: espaciadoBase.lg,
    right: espaciadoBase.lg,
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: 7,
    borderRadius: radiosBase.pill,
    backgroundColor: coloresBase.acentoNeon,
  },
  textoChipPlan: {
    color: '#10141D',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});

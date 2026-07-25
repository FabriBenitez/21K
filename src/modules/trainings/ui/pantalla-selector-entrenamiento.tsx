import { router } from 'expo-router';
import { Camera, ChevronRight, Dumbbell, PersonStanding, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { coloresBase, espaciadoBase, radiosBase, sombrasNeon } from '@/src/shared/theme/tokens-ui';

export function PantallaSelectorEntrenamiento() {
  return (
    <ContenedorPantalla modo="oscuro" desplazable estiloContenido={estilos.contenido}>
      <Pressable style={estilos.botonCerrar} onPress={() => router.back()}>
        <X color={coloresBase.textoPrincipalOscuro} size={28} strokeWidth={2.4} />
      </Pressable>

      <View style={estilos.encabezado}>
        <Text style={estilos.titulo}>
          Registrar <Text style={estilos.tituloAcento}>actividad</Text>
        </Text>
        <Text style={estilos.subtitulo}>¿Qué vamos a sumar hoy a tu proceso 21K?</Text>
      </View>

      <View style={estilos.listaOpciones}>
        <Pressable style={estilos.tarjetaOpcion} onPress={() => router.push('/registro-running')}>
          <View style={estilos.circuloIconoRunning}>
            <PersonStanding color={coloresBase.acentoNeon} size={28} strokeWidth={2.4} />
          </View>
          <View style={estilos.infoOpcion}>
            <View style={estilos.filaTitulo}>
              <Text style={estilos.tituloOpcion}>CARRERA</Text>
              <View style={[estilos.chipPlan, sombrasNeon.glowSuave]}>
                <Text style={estilos.textoChipPlan}>PLAN 21K</Text>
              </View>
            </View>
            <Text style={estilos.subtituloOpcion}>Registra tu fondo, pasadas o trote suave</Text>
          </View>
          <ChevronRight color="#4B5267" size={24} />
        </Pressable>

        <Pressable style={estilos.tarjetaOpcion} onPress={() => router.push('/sesion-gym')}>
          <View style={estilos.circuloIconoGym}>
            <Dumbbell color={coloresBase.acentoNeon} size={28} strokeWidth={2.4} />
          </View>
          <View style={estilos.infoOpcion}>
            <Text style={estilos.tituloOpcion}>RUTINA GYM</Text>
            <Text style={estilos.subtituloOpcion}>Fuerza y acondicionamiento muscular</Text>
          </View>
          <ChevronRight color="#4B5267" size={24} />
        </Pressable>

        <View style={estilos.separadorSeccion}>
          <View style={estilos.lineaSeparador} />
          <Text style={estilos.textoSeparador}>NUTRICIÓN</Text>
          <View style={estilos.lineaSeparador} />
        </View>

        <Pressable style={[estilos.tarjetaOpcion, estilos.tarjetaComida]} onPress={() => router.push('/registro-comida')}>
          <View style={estilos.circuloIconoCamara}>
            <Camera color={coloresBase.fondoOscuro} size={28} strokeWidth={2.4} />
          </View>
          <View style={estilos.infoOpcion}>
            <Text style={[estilos.tituloOpcion, estilos.tituloComida]}>REGISTRAR COMIDA</Text>
            <Text style={estilos.subtituloComida}>Calcula las calorías con IA 🤖</Text>
          </View>
          <ChevronRight color="rgba(216,255,62,0.5)" size={24} />
        </Pressable>
      </View>
      
      <View style={estilos.filaBotonesAccion}>
        <Pressable style={estilos.botonSecundario} onPress={() => { router.back(); router.push('/(tabs)/entrenamientos'); }}>
          <Text style={estilos.textoBotonSecundario}>Ver mi historial</Text>
        </Pressable>
        <Pressable style={estilos.botonSecundario} onPress={() => { router.back(); router.push('/plan-semanal'); }}>
          <Text style={estilos.textoBotonSecundario}>Ver plan completo</Text>
        </Pressable>
      </View>
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
    marginBottom: espaciadoBase.lg,
  },
  encabezado: {
    marginBottom: espaciadoBase.xl,
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
  listaOpciones: {
    gap: espaciadoBase.md,
  },
  tarjetaOpcion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1E29',
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: '#2D3448',
    padding: espaciadoBase.lg,
    gap: espaciadoBase.md,
  },
  circuloIconoRunning: {
    width: 56,
    height: 56,
    borderRadius: radiosBase.pill,
    backgroundColor: 'rgba(216,255,62,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(216,255,62,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloIconoGym: {
    width: 56,
    height: 56,
    borderRadius: radiosBase.pill,
    backgroundColor: '#1E2330',
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoOpcion: {
    flex: 1,
    gap: 2,
  },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tituloOpcion: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtituloOpcion: {
    color: '#8F98AF',
    fontSize: 14,
  },
  chipPlan: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radiosBase.sm,
    backgroundColor: coloresBase.acentoNeon,
  },
  textoChipPlan: {
    color: '#10141D',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  separadorSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciadoBase.md,
    marginVertical: espaciadoBase.sm,
  },
  lineaSeparador: {
    flex: 1,
    height: 1,
    backgroundColor: '#252A39',
  },
  textoSeparador: {
    color: '#4B5267',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  tarjetaComida: {
    backgroundColor: 'rgba(216,255,62,0.1)',
    borderColor: 'rgba(216,255,62,0.4)',
    ...sombrasNeon.glowSuave,
  },
  circuloIconoCamara: {
    width: 56,
    height: 56,
    borderRadius: radiosBase.pill,
    backgroundColor: coloresBase.acentoNeon,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombrasNeon.glowFuerte,
  },
  tituloComida: {
    color: coloresBase.textoPrincipalOscuro,
  },
  subtituloComida: {
    color: '#A3AD72',
  },
  filaBotonesAccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: espaciadoBase.xl * 1.5,
    gap: espaciadoBase.md,
  },
  botonSecundario: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radiosBase.pill,
    backgroundColor: '#171A22',
    borderWidth: 1,
    borderColor: '#2D3448',
    paddingVertical: 14,
  },
  textoBotonSecundario: {
    color: '#8F98AF',
    fontSize: 14,
    fontWeight: '700',
  },
});

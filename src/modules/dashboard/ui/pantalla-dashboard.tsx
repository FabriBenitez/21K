import { router } from 'expo-router';
import { Check, Clock3, Gauge, Heart, MoveRight, PersonStanding, Zap } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AnilloProgreso } from '@/src/shared/ui/anillo-progreso';
import { BotonPrincipal } from '@/src/shared/ui/boton-principal';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { coloresBase, espaciadoBase, radiosBase, sombrasNeon } from '@/src/shared/theme/tokens-ui';

const diasConsistencia = [
  { id: 'LUN', completo: true },
  { id: 'MAR', completo: true },
  { id: 'MIE', completo: false },
  { id: 'JUE', completo: true },
  { id: 'VIE', completo: true },
  { id: 'SAB', completo: false },
  { id: 'DOM', completo: false },
];

export function PantallaDashboard() {
  return (
    <ContenedorPantalla modo="oscuro" desplazable estiloContenido={estilos.contenido}>
      <View style={estilos.encabezado}>
        <View>
          <Text style={estilos.saludoSecundario}>Bienvenido de nuevo,</Text>
          <Text style={estilos.saludoPrincipal}>Hola corredor</Text>
        </View>
        <View style={estilos.avatar}>
          <Text style={estilos.avatarTexto}>R</Text>
        </View>
      </View>

      <View style={estilos.tarjetaConsistencia}>
        <View style={estilos.filaTituloConsistencia}>
          <Text style={estilos.tituloTarjeta}>CONSISTENCIA SEMANAL</Text>
          <Text style={estilos.valorConsistencia}>5/7 DIAS</Text>
        </View>
        <View style={estilos.filaDias}>
          {diasConsistencia.map((dia) => (
            <View key={dia.id} style={estilos.itemDia}>
              <Text style={estilos.etiquetaDia}>{dia.id}</Text>
              <View style={[estilos.circuloDia, dia.completo ? estilos.circuloDiaActivo : null]}>
                {dia.completo ? <Check color="#0D0F14" size={16} strokeWidth={2.8} /> : null}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={estilos.tarjetaSemana}>
        <View style={estilos.infoSemana}>
          <Text style={estilos.tituloSemana}>Esta semana</Text>
          <Text style={estilos.subtituloSemana}>Fase de preparacion 21K</Text>
          <Text style={estilos.valorSemana}>32.4 km</Text>
          <Text style={estilos.detalleSemana}>4 sesiones completadas</Text>
        </View>
        <View style={estilos.anilloSemana}>
          <AnilloProgreso progreso={0.75} tamano={114} textoCentro="75%" />
        </View>
      </View>

      <View style={estilos.filaEncabezadoSeccion}>
        <Text style={estilos.tituloSeccion}>Ultimo entrenamiento</Text>
        <Pressable onPress={() => router.push('/progreso-running')}>
          <Text style={estilos.enlaceAcento}>Ver historial</Text>
        </Pressable>
      </View>

      <Pressable
        style={estilos.tarjetaUltimoEntrenamiento}
        onPress={() => router.push('/progreso-running')}>
        <View style={estilos.iconoUltimoEntrenamiento}>
          <PersonStanding color={coloresBase.acentoNeon} size={30} strokeWidth={2.2} />
        </View>
        <View style={estilos.infoUltimoEntrenamiento}>
          <Text style={estilos.tituloUltimoEntrenamiento}>Rodaje de recuperacion 10 km</Text>
          <View style={estilos.datosUltimoEntrenamiento}>
            <View style={estilos.datoConIcono}>
              <Clock3 color={coloresBase.textoSecundarioOscuro} size={16} />
              <Text style={estilos.textoDato}>54m 20s</Text>
            </View>
            <View style={estilos.datoConIcono}>
              <Gauge color={coloresBase.textoSecundarioOscuro} size={16} />
              <Text style={estilos.textoDato}>{`5'26" /km`}</Text>
            </View>
          </View>
        </View>
        <MoveRight color={coloresBase.textoSecundarioOscuro} size={24} />
      </Pressable>

      <View style={estilos.grillaMetricas}>
        <View style={estilos.tarjetaMetrica}>
          <View style={estilos.iconoMetricaAzul}>
            <Heart color="#59A5FF" size={22} fill="#59A5FF" />
          </View>
          <Text style={estilos.valorMetrica}>152</Text>
          <Text style={estilos.etiquetaMetrica}>FRECUENCIA PROMEDIO</Text>
        </View>

        <View style={estilos.tarjetaMetrica}>
          <View style={estilos.iconoMetricaNaranja}>
            <Zap color="#FF8A33" size={22} fill="#FF8A33" />
          </View>
          <Text style={estilos.valorMetrica}>2,440</Text>
          <Text style={estilos.etiquetaMetrica}>CALORIAS QUEMADAS</Text>
        </View>
      </View>

      <View style={estilos.seccionMetaDiaria}>
        <Text style={estilos.tituloSeccion}>Objetivo de hoy</Text>
        <View style={estilos.tarjetaMetaDiaria}>
          <View style={estilos.chipMeta}>
            <Text style={estilos.chipMetaTexto}>RESISTENCIA</Text>
          </View>
          <Text style={estilos.tituloMeta}>Entrenamiento de intervalos</Text>
          <Text style={estilos.subtituloMeta}>
            Trabaja cadencia y potencia explosiva en una sesion de 45 minutos.
          </Text>
          <BotonPrincipal
            titulo="Comenzar"
            onPress={() => router.push('/registro-running')}
            estilo={estilos.botonMeta}
          />
        </View>
      </View>
    </ContenedorPantalla>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    paddingBottom: 140,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saludoSecundario: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 15,
  },
  saludoPrincipal: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: radiosBase.pill,
    backgroundColor: '#2A3042',
    borderWidth: 2,
    borderColor: coloresBase.acentoNeon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 14,
    fontWeight: '700',
  },
  tarjetaConsistencia: {
    backgroundColor: '#171922',
    borderRadius: radiosBase.lg,
    padding: espaciadoBase.lg,
    borderWidth: 1,
    borderColor: '#262A38',
    gap: espaciadoBase.md,
  },
  filaTituloConsistencia: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tituloTarjeta: {
    color: '#AAB1C3',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  valorConsistencia: {
    color: coloresBase.acentoNeon,
    fontSize: 16,
    fontWeight: '800',
  },
  filaDias: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemDia: {
    alignItems: 'center',
    gap: espaciadoBase.xs,
  },
  etiquetaDia: {
    color: '#8B92A8',
    fontSize: 13,
    fontWeight: '700',
  },
  circuloDia: {
    width: 38,
    height: 38,
    borderRadius: radiosBase.pill,
    borderWidth: 1,
    borderColor: '#2A2F3D',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151925',
  },
  circuloDiaActivo: {
    backgroundColor: coloresBase.acentoNeon,
    borderColor: coloresBase.acentoNeon,
  },
  tarjetaSemana: {
    backgroundColor: coloresBase.acentoNeon,
    borderRadius: 28,
    padding: espaciadoBase.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...sombrasNeon.glowSuave,
  },
  infoSemana: {
    gap: 4,
  },
  tituloSemana: {
    color: '#0A0C12',
    fontWeight: '800',
    fontSize: 28,
  },
  subtituloSemana: {
    color: '#263000',
    fontSize: 16,
    marginBottom: 6,
  },
  valorSemana: {
    color: '#050608',
    fontWeight: '800',
    fontSize: 37,
  },
  detalleSemana: {
    color: '#263000',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  anilloSemana: {
    backgroundColor: '#C6F22C',
    borderRadius: radiosBase.pill,
    padding: 4,
  },
  filaEncabezadoSeccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tituloSeccion: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 22,
    fontWeight: '800',
  },
  enlaceAcento: {
    color: coloresBase.acentoNeon,
    fontSize: 16,
    fontWeight: '700',
  },
  tarjetaUltimoEntrenamiento: {
    backgroundColor: '#171922',
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: '#252A38',
    padding: espaciadoBase.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciadoBase.md,
  },
  iconoUltimoEntrenamiento: {
    width: 62,
    height: 62,
    borderRadius: radiosBase.md,
    backgroundColor: '#252A39',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoUltimoEntrenamiento: {
    flex: 1,
    gap: 4,
  },
  tituloUltimoEntrenamiento: {
    color: coloresBase.textoPrincipalOscuro,
    fontWeight: '700',
    fontSize: 20,
  },
  datosUltimoEntrenamiento: {
    flexDirection: 'row',
    gap: espaciadoBase.md,
  },
  datoConIcono: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  textoDato: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 15,
  },
  grillaMetricas: {
    flexDirection: 'row',
    gap: espaciadoBase.md,
  },
  tarjetaMetrica: {
    flex: 1,
    backgroundColor: '#171922',
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: '#252A38',
    padding: espaciadoBase.lg,
    gap: espaciadoBase.sm,
  },
  iconoMetricaAzul: {
    width: 42,
    height: 42,
    borderRadius: radiosBase.sm,
    backgroundColor: 'rgba(90,164,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoMetricaNaranja: {
    width: 42,
    height: 42,
    borderRadius: radiosBase.sm,
    backgroundColor: 'rgba(255,138,51,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valorMetrica: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 24,
    fontWeight: '800',
  },
  etiquetaMetrica: {
    color: '#A3A9BB',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  seccionMetaDiaria: {
    gap: espaciadoBase.md,
  },
  tarjetaMetaDiaria: {
    backgroundColor: '#151820',
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: '#272B39',
    padding: espaciadoBase.xl,
    gap: espaciadoBase.md,
  },
  chipMeta: {
    alignSelf: 'flex-start',
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: 6,
    borderRadius: radiosBase.pill,
    backgroundColor: coloresBase.acentoNeon,
  },
  chipMetaTexto: {
    color: '#0F1117',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.6,
  },
  tituloMeta: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 26,
    fontWeight: '800',
  },
  subtituloMeta: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 17,
    lineHeight: 28,
  },
  botonMeta: {
    marginTop: espaciadoBase.xs,
  },
});

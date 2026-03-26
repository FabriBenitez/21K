import { Bell } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AnilloProgreso } from '@/src/shared/ui/anillo-progreso';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { coloresBase, espaciadoBase, radiosBase } from '@/src/shared/theme/tokens-ui';

export function PantallaPerfil() {
  return (
    <ContenedorPantalla modo="claro" desplazable estiloContenido={estilos.contenido}>
      <View style={estilos.encabezado}>
        <View style={estilos.filaUsuario}>
          <View style={estilos.avatar}>
            <Text style={estilos.avatarTexto}>LV</Text>
          </View>
          <View>
            <Text style={estilos.saludo}>Bienvenido de nuevo,</Text>
            <Text style={estilos.nombre}>Lester V.</Text>
          </View>
        </View>

        <Pressable style={estilos.botonNotificacion}>
          <Bell color={coloresBase.acentoNeonSuave} size={24} strokeWidth={2.2} />
        </Pressable>
      </View>

      <View style={estilos.tarjetaMetaPrincipal}>
        <Text style={estilos.textoRuta}>CAMINO A LA MEDIA MARATON</Text>
        <Text style={estilos.tituloMetaPrincipal}>21 DIAS PARA{"\n"}META 21K</Text>

        <View style={estilos.filaProgresoMeta}>
          <View style={estilos.anilloClaro}>
            <AnilloProgreso progreso={0.75} tamano={130} textoCentro="75%" />
            <Text style={estilos.textoReady}>LISTO</Text>
          </View>

          <View style={estilos.metricasMeta}>
            <View style={estilos.itemMetricaMeta}>
              <Text style={estilos.etiquetaMetricaMeta}>Distancia total</Text>
              <Text style={estilos.valorMetricaMeta}>142.5 km</Text>
            </View>
            <View style={estilos.itemMetricaMeta}>
              <Text style={estilos.etiquetaMetricaMeta}>Objetivo de sesiones</Text>
              <Text style={estilos.valorMetricaMeta}>12/16</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={estilos.grillaTarjetas}>
        <View style={estilos.tarjetaDato}>
          <Text style={estilos.etiquetaDato}>Ritmo promedio actual</Text>
          <Text style={estilos.valorDato}>5&apos;42 /km</Text>
        </View>

        <View style={estilos.tarjetaDato}>
          <Text style={estilos.etiquetaDato}>Mejor marca personal</Text>
          <Text style={estilos.valorDato}>48:12 /10k</Text>
        </View>
      </View>

      <View style={estilos.tarjetaHito}>
        <View style={estilos.filaHito}>
          <Text style={estilos.tituloHito}>Hito alcanzado</Text>
          <View style={estilos.chipHoy}>
            <Text style={estilos.textoChipHoy}>HOY</Text>
          </View>
        </View>
        <Text style={estilos.textoHito}>
          Completaste tu primer fondo de 15 km. Ya estas en la etapa final de preparacion para
          tu 21K.
        </Text>
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
  filaUsuario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciadoBase.md,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: radiosBase.pill,
    backgroundColor: '#121826',
    borderWidth: 3,
    borderColor: coloresBase.acentoNeon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    color: '#EAF0FF',
    fontWeight: '800',
    fontSize: 28 / 2,
  },
  saludo: {
    color: coloresBase.textoSecundarioClaro,
    fontSize: 34 / 2,
  },
  nombre: {
    color: coloresBase.textoPrincipalClaro,
    fontSize: 56 / 2,
    fontWeight: '800',
  },
  botonNotificacion: {
    width: 56,
    height: 56,
    borderRadius: radiosBase.pill,
    backgroundColor: '#E8EDF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarjetaMetaPrincipal: {
    borderRadius: 30,
    backgroundColor: '#F7F8F3',
    borderWidth: 1,
    borderColor: '#E8EBDD',
    padding: espaciadoBase.xl,
    gap: espaciadoBase.md,
  },
  textoRuta: {
    color: '#D0F02E',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2,
  },
  tituloMetaPrincipal: {
    color: '#0F1526',
    fontSize: 78 / 2,
    fontWeight: '900',
    lineHeight: 46,
  },
  filaProgresoMeta: {
    flexDirection: 'row',
    gap: espaciadoBase.md,
  },
  anilloClaro: {
    width: 148,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoReady: {
    marginTop: -18,
    color: '#5B6377',
    fontSize: 20 / 2,
    fontWeight: '700',
    letterSpacing: 1,
  },
  metricasMeta: {
    flex: 1,
    gap: espaciadoBase.sm,
    justifyContent: 'center',
  },
  itemMetricaMeta: {
    backgroundColor: '#EFF2F8',
    borderRadius: radiosBase.md,
    padding: espaciadoBase.md,
    gap: 2,
  },
  etiquetaMetricaMeta: {
    color: '#7D859A',
    fontSize: 32 / 2,
  },
  valorMetricaMeta: {
    color: '#13192B',
    fontSize: 44 / 2,
    fontWeight: '800',
  },
  grillaTarjetas: {
    flexDirection: 'row',
    gap: espaciadoBase.md,
  },
  tarjetaDato: {
    flex: 1,
    minHeight: 150,
    borderRadius: radiosBase.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E7F0',
    padding: espaciadoBase.lg,
    justifyContent: 'space-between',
  },
  etiquetaDato: {
    color: '#7E879D',
    fontSize: 34 / 2,
  },
  valorDato: {
    color: '#121827',
    fontSize: 58 / 2,
    fontWeight: '900',
  },
  tarjetaHito: {
    borderRadius: 30,
    backgroundColor: coloresBase.acentoNeon,
    padding: espaciadoBase.xl,
    gap: espaciadoBase.md,
  },
  filaHito: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tituloHito: {
    color: '#101421',
    fontSize: 62 / 2,
    fontWeight: '900',
  },
  chipHoy: {
    borderRadius: radiosBase.pill,
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: 7,
    backgroundColor: '#C5EB37',
  },
  textoChipHoy: {
    color: '#101421',
    fontSize: 15,
    fontWeight: '800',
  },
  textoHito: {
    color: '#1C2432',
    fontSize: 37 / 2,
    lineHeight: 30,
  },
});

import { router } from 'expo-router';
import { ArrowLeft, CalendarDays, ChevronDown, Clock3, Moon, PersonStanding } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BotonPrincipal } from '@/src/shared/ui/boton-principal';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { coloresBase, espaciadoBase, radiosBase } from '@/src/shared/theme/tokens-ui';

export function PantallaRegistroRunningManual() {
  const [distancia, setDistancia] = useState('0.00');
  const tipoCorrida = 'Rodaje suave';

  return (
    <ContenedorPantalla modo="oscuro" desplazable estiloContenido={estilos.contenido}>
      <View style={estilos.encabezadoSuperior}>
        <Pressable style={estilos.botonCircular} onPress={() => router.back()}>
          <ArrowLeft color={coloresBase.textoPrincipalOscuro} size={26} strokeWidth={2.4} />
        </Pressable>
        <Text style={estilos.tituloPantalla}>Registrar corrida manual</Text>
        <Pressable style={estilos.botonCircular}>
          <Moon color={coloresBase.acentoNeon} size={22} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View style={estilos.alertaMeta}>
        <PersonStanding color={coloresBase.acentoNeon} size={22} strokeWidth={2.4} />
        <View style={estilos.alertaTexto}>
          <Text style={estilos.alertaTitulo}>Camino al 21K</Text>
          <Text style={estilos.alertaMensaje}>
            Cada kilometro registrado te acerca mas a tu objetivo de media maraton.
          </Text>
        </View>
      </View>

      <View style={estilos.bloqueCampo}>
        <Text style={estilos.etiqueta}>DISTANCIA (KM)</Text>
        <View style={estilos.campoGrande}>
          <TextInput
            value={distancia}
            onChangeText={setDistancia}
            style={estilos.inputGrande}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="#5F667A"
          />
          <Text style={estilos.sufijoCampo}>km</Text>
        </View>
      </View>

      <View style={estilos.bloqueCampo}>
        <Text style={estilos.etiqueta}>DURACION</Text>
        <View style={estilos.filaDuracion}>
          <CajaDuracion valor="00" unidad="HORAS" />
          <CajaDuracion valor="00" unidad="MIN" />
          <CajaDuracion valor="00" unidad="SEG" />
        </View>
      </View>

      <View style={estilos.bloqueCampo}>
        <Text style={estilos.etiqueta}>TIPO DE CORRIDA</Text>
        <Pressable style={estilos.selectorTipo}>
          <Text style={estilos.textoSelector}>{tipoCorrida}</Text>
          <ChevronDown color="#9BA4BC" size={20} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View style={estilos.filaFechaHora}>
        <View style={estilos.itemFechaHora}>
          <Text style={estilos.etiqueta}>FECHA</Text>
          <View style={estilos.cajaFechaHora}>
            <CalendarDays color={coloresBase.acentoNeon} size={20} />
            <Text style={estilos.textoFechaHora}>Hoy</Text>
          </View>
        </View>
        <View style={estilos.itemFechaHora}>
          <Text style={estilos.etiqueta}>HORA INICIO</Text>
          <View style={estilos.cajaFechaHora}>
            <Clock3 color={coloresBase.acentoNeon} size={20} />
            <Text style={estilos.textoFechaHora}>08:30 AM</Text>
          </View>
        </View>
      </View>

      <BotonPrincipal titulo="Guardar entrenamiento" />
    </ContenedorPantalla>
  );
}

interface PropiedadesCajaDuracion {
  valor: string;
  unidad: string;
}

function CajaDuracion({ valor, unidad }: PropiedadesCajaDuracion) {
  return (
    <View style={estilos.cajaDuracion}>
      <Text style={estilos.valorDuracion}>{valor}</Text>
      <Text style={estilos.unidadDuracion}>{unidad}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    paddingBottom: 140,
  },
  encabezadoSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botonCircular: {
    width: 52,
    height: 52,
    borderRadius: radiosBase.pill,
    backgroundColor: '#171A22',
    borderWidth: 1,
    borderColor: '#2B3040',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloPantalla: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 24,
    fontWeight: '800',
  },
  alertaMeta: {
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: 'rgba(216,255,62,0.45)',
    backgroundColor: 'rgba(216,255,62,0.12)',
    padding: espaciadoBase.md,
    flexDirection: 'row',
    gap: espaciadoBase.sm,
  },
  alertaTexto: {
    flex: 1,
    gap: 4,
  },
  alertaTitulo: {
    color: coloresBase.acentoNeon,
    fontSize: 20,
    fontWeight: '700',
  },
  alertaMensaje: {
    color: '#A7B17C',
    fontSize: 16,
    lineHeight: 24,
  },
  bloqueCampo: {
    gap: espaciadoBase.sm,
  },
  etiqueta: {
    color: '#8F98AF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  campoGrande: {
    minHeight: 78,
    borderRadius: radiosBase.lg,
    backgroundColor: '#232633',
    borderWidth: 1,
    borderColor: '#2E3343',
    paddingHorizontal: espaciadoBase.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputGrande: {
    flex: 1,
    color: '#D9E0F0',
    fontSize: 42 / 2,
    fontWeight: '700',
  },
  sufijoCampo: {
    color: '#96A0B8',
    fontSize: 38 / 2,
    fontWeight: '600',
  },
  filaDuracion: {
    flexDirection: 'row',
    gap: espaciadoBase.sm,
  },
  cajaDuracion: {
    flex: 1,
    minHeight: 90,
    borderRadius: radiosBase.md,
    backgroundColor: '#232633',
    borderWidth: 1,
    borderColor: '#2E3343',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  valorDuracion: {
    color: '#DCE3F3',
    fontSize: 42 / 2,
    fontWeight: '800',
  },
  unidadDuracion: {
    color: '#8E97AF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  selectorTipo: {
    minHeight: 66,
    borderRadius: radiosBase.lg,
    backgroundColor: '#232633',
    borderWidth: 1,
    borderColor: '#2E3343',
    paddingHorizontal: espaciadoBase.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textoSelector: {
    color: '#E5EAF8',
    fontSize: 20,
    fontWeight: '600',
  },
  filaFechaHora: {
    flexDirection: 'row',
    gap: espaciadoBase.sm,
  },
  itemFechaHora: {
    flex: 1,
    gap: espaciadoBase.sm,
  },
  cajaFechaHora: {
    minHeight: 64,
    borderRadius: radiosBase.md,
    backgroundColor: '#232633',
    borderWidth: 1,
    borderColor: '#2E3343',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciadoBase.xs,
  },
  textoFechaHora: {
    color: '#E5EAF8',
    fontSize: 18,
    fontWeight: '600',
  },
});

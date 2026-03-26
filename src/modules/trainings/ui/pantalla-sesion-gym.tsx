import { router } from 'expo-router';
import { ArrowLeft, Check, ChevronDown, CirclePlus, Info, Timer } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BotonPrincipal } from '@/src/shared/ui/boton-principal';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { coloresBase, espaciadoBase, radiosBase, sombrasNeon } from '@/src/shared/theme/tokens-ui';

export function PantallaSesionGym() {
  return (
    <ContenedorPantalla modo="oscuro" desplazable estiloContenido={estilos.contenido}>
      <View style={estilos.encabezadoSuperior}>
        <Pressable style={estilos.botonCircular} onPress={() => router.back()}>
          <ArrowLeft color={coloresBase.textoPrincipalOscuro} size={26} strokeWidth={2.4} />
        </Pressable>
        <View style={estilos.encabezadoCentro}>
          <Text style={estilos.tituloPantalla}>Fuerza de piernas A</Text>
          <Text style={estilos.subtituloPantalla}>PREP 21K - SESION 14</Text>
        </View>
        <Pressable style={[estilos.botonCircular, estilos.botonAcento]}>
          <Check color={coloresBase.fondoOscuro} size={26} strokeWidth={2.8} />
        </Pressable>
      </View>

      <View style={estilos.tarjetaEjercicioPrincipal}>
        <View style={estilos.filaEjercicioTitulo}>
          <View style={estilos.bloqueTituloEjercicio}>
            <Text style={estilos.tituloEjercicio}>Sentadilla con barra</Text>
            <Text style={estilos.subtituloEjercicio}>Objetivo: gluteos y cuadriceps</Text>
          </View>
          <Info color={coloresBase.textoSecundarioOscuro} size={24} />
        </View>

        <View style={estilos.filaColumnas}>
          <Text style={estilos.columna}>SERIE</Text>
          <Text style={estilos.columna}>PESO (KG)</Text>
          <Text style={estilos.columna}>REPS</Text>
          <Text style={estilos.columna}>HECHO</Text>
        </View>

        <FilaSet numeroSerie="1" peso="60" repeticiones="12" completado />
        <FilaSet numeroSerie="2" peso="60" repeticiones="12" editable />
        <FilaSet numeroSerie="3" peso="-" repeticiones="-" />

        <Pressable style={estilos.botonAgregarSet}>
          <CirclePlus color={coloresBase.textoSecundarioOscuro} size={24} />
          <Text style={estilos.textoAgregarSet}>Agregar serie</Text>
        </Pressable>
      </View>

      <TarjetaEjercicioSecundario nombre="Zancadas caminando" detalle="3 series - 15 repeticiones" />
      <TarjetaEjercicioSecundario nombre="Saltos al cajon" detalle="4 series - 8 repeticiones" />

      <View style={estilos.filaBotonesFinales}>
        <Pressable style={estilos.botonDescanso}>
          <Timer color={coloresBase.textoPrincipalOscuro} size={24} />
          <Text style={estilos.textoDescanso}>Descanso</Text>
        </Pressable>
        <BotonPrincipal titulo="Finalizar sesion" estilo={estilos.botonFinalizar} />
      </View>
    </ContenedorPantalla>
  );
}

interface PropiedadesFilaSet {
  numeroSerie: string;
  peso: string;
  repeticiones: string;
  completado?: boolean;
  editable?: boolean;
}

function FilaSet({ numeroSerie, peso, repeticiones, completado = false, editable = false }: PropiedadesFilaSet) {
  return (
    <View style={estilos.filaSet}>
      <View style={estilos.celdaSet}>
        <Text style={estilos.valorCelda}>{numeroSerie}</Text>
      </View>
      <View style={[estilos.celdaSet, editable ? estilos.celdaEditable : null]}>
        <Text style={estilos.valorCelda}>{peso}</Text>
      </View>
      <View style={[estilos.celdaSet, editable ? estilos.celdaEditable : null]}>
        <Text style={estilos.valorCelda}>{repeticiones}</Text>
      </View>
      <View style={[estilos.celdaSet, completado ? estilos.celdaCompletada : null]}>
        <Check
          color={completado ? coloresBase.fondoOscuro : coloresBase.textoSecundarioOscuro}
          size={24}
          strokeWidth={2.8}
        />
      </View>
    </View>
  );
}

interface PropiedadesTarjetaEjercicioSecundario {
  nombre: string;
  detalle: string;
}

function TarjetaEjercicioSecundario({ nombre, detalle }: PropiedadesTarjetaEjercicioSecundario) {
  return (
    <View style={estilos.tarjetaEjercicioSecundario}>
      <View style={estilos.infoEjercicioSecundario}>
        <Text style={estilos.tituloEjercicioSecundario}>{nombre}</Text>
        <Text style={estilos.detalleEjercicioSecundario}>{detalle}</Text>
      </View>
      <ChevronDown color={coloresBase.textoSecundarioOscuro} size={22} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    paddingBottom: 150,
  },
  encabezadoSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botonCircular: {
    width: 56,
    height: 56,
    borderRadius: radiosBase.pill,
    backgroundColor: '#171A22',
    borderWidth: 1,
    borderColor: '#2B3040',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonAcento: {
    backgroundColor: coloresBase.acentoNeon,
    borderColor: coloresBase.acentoNeon,
    ...sombrasNeon.glowSuave,
  },
  encabezadoCentro: {
    alignItems: 'center',
    gap: 2,
  },
  tituloPantalla: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 24,
    fontWeight: '800',
  },
  subtituloPantalla: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
  tarjetaEjercicioPrincipal: {
    borderRadius: 28,
    backgroundColor: '#171922',
    borderWidth: 1,
    borderColor: '#262B39',
    padding: espaciadoBase.lg,
    gap: espaciadoBase.md,
  },
  filaEjercicioTitulo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bloqueTituloEjercicio: {
    gap: 4,
  },
  tituloEjercicio: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 41 / 2,
    fontWeight: '800',
  },
  subtituloEjercicio: {
    color: '#C3EA2F',
    fontSize: 35 / 2,
    fontWeight: '600',
  },
  filaColumnas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  columna: {
    color: '#8C93AA',
    fontSize: 14,
    fontWeight: '700',
    width: '23%',
    textAlign: 'center',
    letterSpacing: 1.3,
  },
  filaSet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  celdaSet: {
    width: '23%',
    minHeight: 64,
    borderRadius: radiosBase.md,
    backgroundColor: '#242833',
    borderWidth: 1,
    borderColor: '#2B3140',
    alignItems: 'center',
    justifyContent: 'center',
  },
  celdaEditable: {
    borderColor: '#A8CB2A',
    borderWidth: 2,
  },
  celdaCompletada: {
    backgroundColor: coloresBase.acentoNeon,
    borderColor: coloresBase.acentoNeon,
    ...sombrasNeon.glowSuave,
  },
  valorCelda: {
    color: '#DCE2F2',
    fontSize: 36 / 2,
    fontWeight: '700',
  },
  botonAgregarSet: {
    minHeight: 68,
    borderRadius: radiosBase.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#364058',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: espaciadoBase.sm,
  },
  textoAgregarSet: {
    color: '#99A6C2',
    fontSize: 38 / 2,
    fontWeight: '700',
  },
  tarjetaEjercicioSecundario: {
    borderRadius: 24,
    backgroundColor: '#171922',
    borderWidth: 1,
    borderColor: '#252A38',
    padding: espaciadoBase.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoEjercicioSecundario: {
    gap: 4,
  },
  tituloEjercicioSecundario: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 46 / 2,
    fontWeight: '800',
  },
  detalleEjercicioSecundario: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 37 / 2,
  },
  filaBotonesFinales: {
    flexDirection: 'row',
    gap: espaciadoBase.md,
    marginTop: espaciadoBase.sm,
  },
  botonDescanso: {
    flex: 1,
    minHeight: 66,
    borderRadius: radiosBase.lg,
    backgroundColor: '#262A36',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: espaciadoBase.sm,
  },
  textoDescanso: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 20,
    fontWeight: '700',
  },
  botonFinalizar: {
    flex: 1.35,
  },
});

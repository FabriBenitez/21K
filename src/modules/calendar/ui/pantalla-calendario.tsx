import { ChevronLeft, ChevronRight, Dumbbell, PersonStanding } from 'lucide-react-native';
import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { coloresBase, espaciadoBase, radiosBase } from '@/src/shared/theme/tokens-ui';

type MarcadoDia = {
  selected?: boolean;
  selectedColor?: string;
  marked?: boolean;
  dotColor?: string;
};

type DiasMarcados = Record<string, MarcadoDia>;

const diasConEntrenamiento = [
  '2026-03-03',
  '2026-03-05',
  '2026-03-08',
  '2026-03-10',
  '2026-03-12',
  '2026-03-14',
  '2026-03-16',
  '2026-03-18',
  '2026-03-21',
];

export function PantallaCalendario() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState('2026-03-12');

  const diasMarcados = useMemo<DiasMarcados>(() => {
    const marcadoBase: DiasMarcados = {};

    diasConEntrenamiento.forEach((fecha) => {
      marcadoBase[fecha] = {
        marked: true,
        dotColor: coloresBase.acentoNeon,
      };
    });

    marcadoBase[fechaSeleccionada] = {
      ...(marcadoBase[fechaSeleccionada] ?? {}),
      selected: true,
      selectedColor: coloresBase.acentoNeon,
    };

    return marcadoBase;
  }, [fechaSeleccionada]);

  return (
    <ContenedorPantalla modo="claro" desplazable estiloContenido={estilos.contenido}>
      <View style={estilos.encabezadoPrincipal}>
        <Pressable style={estilos.botonCircular}>
          <ChevronLeft color={coloresBase.textoPrincipalClaro} size={28} strokeWidth={2.4} />
        </Pressable>
        <Text style={estilos.tituloPantalla}>Plan de entrenamiento</Text>
        <Pressable style={estilos.botonCircular}>
          <Text style={estilos.puntos}>...</Text>
        </Pressable>
      </View>

      <View style={estilos.filaMes}>
        <Text style={estilos.tituloMes}>Marzo 2026</Text>
        <View style={estilos.filaNavegacionMes}>
          <ChevronLeft color={coloresBase.textoPrincipalClaro} size={28} strokeWidth={2.3} />
          <ChevronRight color={coloresBase.textoPrincipalClaro} size={28} strokeWidth={2.3} />
        </View>
      </View>

      <View style={estilos.tarjetaCalendario}>
        <Calendar
          current={fechaSeleccionada}
          markingType="dot"
          markedDates={diasMarcados}
          onDayPress={(dia: DateData) => setFechaSeleccionada(dia.dateString)}
          firstDay={1}
          hideExtraDays={false}
          theme={{
            calendarBackground: 'transparent',
            textSectionTitleColor: '#7D859A',
            monthTextColor: coloresBase.textoPrincipalClaro,
            dayTextColor: coloresBase.textoPrincipalClaro,
            textDisabledColor: '#C9CFDC',
            selectedDayBackgroundColor: coloresBase.acentoNeon,
            selectedDayTextColor: '#111827',
            todayTextColor: coloresBase.textoPrincipalClaro,
            arrowColor: coloresBase.textoPrincipalClaro,
            dotColor: coloresBase.acentoNeon,
          }}
        />
      </View>

      <View style={estilos.filaAgendaEncabezado}>
        <Text style={estilos.tituloAgenda}>Agenda de hoy</Text>
        <Text style={estilos.fechaAgenda}>12 mar, 2026</Text>
      </View>

      <TarjetaAgenda
        icono={<PersonStanding color={coloresBase.fondoOscuro} size={28} />}
        titulo="Fondo largo"
        subtitulo="12.5 km - 06:15 min/km"
        activo
      />

      <TarjetaAgenda
        icono={<Dumbbell color="#9DA6BC" size={28} />}
        titulo="Gimnasio - Tren superior"
        subtitulo="45 min - Foco en fuerza"
      />

      <View style={estilos.tarjetaMetaSemanal}>
        <View style={estilos.filaMetaSemanalSuperior}>
          <View>
            <Text style={estilos.textoMetaSemanal}>OBJETIVO SEMANAL</Text>
            <Text style={estilos.tituloMetaSemanal}>Camino al 21K</Text>
          </View>
          <View style={estilos.chipSemana}>
            <Text style={estilos.textoChipSemana}>Semana 6 de 12</Text>
          </View>
        </View>
        <View style={estilos.barraMetaFondo}>
          <View style={estilos.barraMetaProgreso} />
        </View>
        <View style={estilos.filaMetaSemanalInferior}>
          <Text style={estilos.valorMetaSemanal}>24 / 45 KM COMPLETADOS</Text>
          <Text style={estilos.valorMetaSemanal}>65%</Text>
        </View>
      </View>
    </ContenedorPantalla>
  );
}

interface PropiedadesTarjetaAgenda {
  icono: ReactNode;
  titulo: string;
  subtitulo: string;
  activo?: boolean;
}

function TarjetaAgenda({ icono, titulo, subtitulo, activo = false }: PropiedadesTarjetaAgenda) {
  return (
    <Pressable style={estilos.tarjetaAgenda}>
      <View style={[estilos.iconoAgenda, activo ? estilos.iconoAgendaActivo : null]}>{icono}</View>
      <View style={estilos.infoAgenda}>
        <Text style={estilos.tituloItemAgenda}>{titulo}</Text>
        <Text style={[estilos.subtituloItemAgenda, activo ? estilos.subtituloItemAgendaActivo : null]}>
          {subtitulo}
        </Text>
      </View>
      <ChevronRight color="#8D96AA" size={24} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    paddingBottom: 130,
  },
  encabezadoPrincipal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botonCircular: {
    width: 56,
    height: 56,
    borderRadius: radiosBase.pill,
    backgroundColor: '#E9ECF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  puntos: {
    fontSize: 22,
    color: coloresBase.textoPrincipalClaro,
    marginTop: -6,
    letterSpacing: 2,
  },
  tituloPantalla: {
    fontSize: 46 / 2,
    fontWeight: '800',
    color: coloresBase.textoPrincipalClaro,
  },
  filaMes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: espaciadoBase.sm,
  },
  tituloMes: {
    color: coloresBase.textoPrincipalClaro,
    fontSize: 72 / 2,
    fontWeight: '800',
  },
  filaNavegacionMes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciadoBase.sm,
  },
  tarjetaCalendario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E0E5EE',
    paddingVertical: espaciadoBase.sm,
    paddingHorizontal: espaciadoBase.xs,
  },
  filaAgendaEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tituloAgenda: {
    color: coloresBase.textoPrincipalClaro,
    fontSize: 64 / 2,
    fontWeight: '800',
  },
  fechaAgenda: {
    color: coloresBase.textoSecundarioClaro,
    fontSize: 20,
  },
  tarjetaAgenda: {
    backgroundColor: '#ECEFF5',
    borderRadius: radiosBase.lg,
    padding: espaciadoBase.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciadoBase.md,
  },
  iconoAgenda: {
    width: 72,
    height: 72,
    borderRadius: radiosBase.md,
    backgroundColor: '#DFE5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoAgendaActivo: {
    backgroundColor: coloresBase.acentoNeon,
  },
  infoAgenda: {
    flex: 1,
    gap: 4,
  },
  tituloItemAgenda: {
    color: coloresBase.textoPrincipalClaro,
    fontSize: 48 / 2,
    fontWeight: '800',
  },
  subtituloItemAgenda: {
    color: '#79839A',
    fontSize: 32 / 2,
    fontWeight: '500',
  },
  subtituloItemAgendaActivo: {
    color: '#A4C108',
    fontWeight: '700',
  },
  tarjetaMetaSemanal: {
    backgroundColor: coloresBase.acentoNeon,
    borderRadius: 34,
    padding: espaciadoBase.lg,
    gap: espaciadoBase.md,
  },
  filaMetaSemanalSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textoMetaSemanal: {
    color: '#2F3A00',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
  },
  tituloMetaSemanal: {
    color: '#0E121C',
    fontSize: 68 / 2,
    fontWeight: '900',
  },
  chipSemana: {
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: 8,
    borderRadius: radiosBase.pill,
    backgroundColor: '#C8EE38',
  },
  textoChipSemana: {
    color: '#171B28',
    fontWeight: '700',
    fontSize: 14,
  },
  barraMetaFondo: {
    height: 14,
    borderRadius: radiosBase.pill,
    backgroundColor: '#BDE62A',
    overflow: 'hidden',
  },
  barraMetaProgreso: {
    width: '65%',
    height: '100%',
    backgroundColor: '#0E111A',
  },
  filaMetaSemanalInferior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valorMetaSemanal: {
    color: '#0F121C',
    fontSize: 30 / 2,
    fontWeight: '800',
  },
});

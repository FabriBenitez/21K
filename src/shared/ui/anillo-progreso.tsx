import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';

import { coloresBase } from '@/src/shared/theme/tokens-ui';

interface PropiedadesAnilloProgreso {
  progreso: number;
  tamano?: number;
  textoCentro?: string;
}

export function AnilloProgreso({ progreso, tamano = 110, textoCentro }: PropiedadesAnilloProgreso) {
  const progresoNormalizado = Math.max(0, Math.min(1, progreso));
  const grosor = 11;
  const radio = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const desplazamiento = circunferencia * (1 - progresoNormalizado);

  return (
    <View style={[estilos.contenedor, { width: tamano, height: tamano }]}>
      <Svg width={tamano} height={tamano}>
        <Circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={radio}
          stroke="#2B3040"
          strokeWidth={grosor}
          fill="transparent"
        />
        <Circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={radio}
          stroke={coloresBase.acentoNeon}
          strokeWidth={grosor}
          fill="transparent"
          strokeDasharray={`${circunferencia} ${circunferencia}`}
          strokeDashoffset={desplazamiento}
          strokeLinecap="round"
          rotation={-90}
          origin={`${tamano / 2}, ${tamano / 2}`}
        />
      </Svg>
      {textoCentro ? <Text style={estilos.textoCentro}>{textoCentro}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoCentro: {
    position: 'absolute',
    color: '#111',
    fontSize: 16,
    fontWeight: '700',
  },
});

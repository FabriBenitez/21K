import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Camera, Check, Utensils, X, Loader2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View, TextInput } from 'react-native';

import { addFoodLog } from '@/src/modules/nutrition/data/food.api';
import { estimarCalorias, type CalorieEstimation } from '@/src/modules/nutrition/services/gemini.api';
import { coloresBase, espaciadoBase, radiosBase, sombrasNeon } from '@/src/shared/theme/tokens-ui';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';

export default function RutaRegistroComida() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resultado, setResultado] = useState<CalorieEstimation | null>(null);

  // Estados editables por si la IA se equivoca
  const [descripcionManual, setDescripcionManual] = useState('');
  const [caloriasManual, setCaloriasManual] = useState('');
  const [carbohidratosManual, setCarbohidratosManual] = useState('');
  const [proteinasManual, setProteinasManual] = useState('');

  const tomarFoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para tomar fotos de tu comida.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const uri = result.assets[0].uri;
      const base64 = result.assets[0].base64;
      
      // Determine mimetype (usually jpeg for camera)
      let mimeType = 'image/jpeg';
      if (uri.endsWith('.png')) mimeType = 'image/png';
      
      setImageUri(uri);
      setResultado(null);
      analizarImagen(base64, mimeType);
    }
  };

  const analizarImagen = async (base64: string, mimeType: string) => {
    setIsAnalyzing(true);
    try {
      const res = await estimarCalorias(base64, mimeType);
      setResultado(res);
      setDescripcionManual(res.comida);
      setCaloriasManual(res.calorias.toString());
      setCarbohidratosManual(res.carbohidratos.toString());
      setProteinasManual(res.proteinas.toString());
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo analizar la imagen.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const guardarComida = async () => {
    const descLimpia = descripcionManual.trim();
    const calLimpia = caloriasManual.trim();
    const carbsLimpia = carbohidratosManual.trim();
    const protLimpia = proteinasManual.trim();

    if (!descLimpia || !calLimpia) {
      Alert.alert('Datos incompletos', 'Asegúrate de ingresar un nombre y calorías válidas.');
      return;
    }

    const caloriasParseadas = parseInt(calLimpia, 10);
    const carbsParseados = parseInt(carbsLimpia, 10) || 0;
    const protParseadas = parseInt(protLimpia, 10) || 0;

    if (isNaN(caloriasParseadas) || caloriasParseadas <= 0) {
      Alert.alert('Formato inválido', 'Las calorías deben ser un número entero mayor a 0 (ej: 500).');
      return;
    }

    setIsSaving(true);
    try {
      await addFoodLog(descLimpia, caloriasParseadas, carbsParseados, protParseadas);
      Alert.alert('¡Guardado!', 'Tu comida ha sido registrada.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error al guardar', error.message || 'Hubo un problema guardando tu registro.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ContenedorPantalla modo="oscuro" desplazable estiloContenido={estilos.contenido}>
      <Pressable style={estilos.botonCerrar} onPress={() => router.back()}>
        <X color={coloresBase.textoPrincipalOscuro} size={28} strokeWidth={2.4} />
      </Pressable>

      <View style={estilos.encabezado}>
        <Text style={estilos.titulo}>
          Registrar <Text style={estilos.tituloAcento}>comida</Text>
        </Text>
        <Text style={estilos.subtitulo}>Toma una foto y calcularemos las calorías con IA</Text>
      </View>

      {!imageUri ? (
        <Pressable style={estilos.tarjetaCamara} onPress={tomarFoto}>
          <View style={estilos.circuloIconoCamara}>
            <Camera color={coloresBase.fondoOscuro} size={48} strokeWidth={2.4} />
          </View>
          <Text style={estilos.textoTomarFoto}>ABRIR CÁMARA</Text>
        </Pressable>
      ) : (
        <View style={estilos.contenedorImagen}>
          <Image source={{ uri: imageUri }} style={estilos.imagenPreview} />
          <Pressable style={estilos.botonReintentar} onPress={tomarFoto}>
            <Text style={estilos.textoReintentar}>Tomar otra foto</Text>
          </Pressable>
        </View>
      )}

      {isAnalyzing && (
        <View style={estilos.contenedorAnalizando}>
          <Loader2 color={coloresBase.acentoNeon} size={40} />
          <Text style={estilos.textoAnalizando}>Analizando con Gemini AI...</Text>
        </View>
      )}

      {resultado && !isAnalyzing && (
        <View style={estilos.tarjetaResultado}>
          <View style={estilos.encabezadoResultado}>
            <Utensils color={coloresBase.acentoNeon} size={24} />
            <Text style={estilos.tituloResultado}>Resultado IA</Text>
          </View>
          
          <Text style={estilos.labelInput}>Comida detectada</Text>
          <TextInput
            style={estilos.input}
            value={descripcionManual}
            onChangeText={setDescripcionManual}
            placeholderTextColor={coloresBase.textoSecundarioOscuro}
          />
          
          <Text style={estilos.labelInput}>Calorías (kcal)</Text>
          <TextInput
            style={estilos.input}
            value={caloriasManual}
            onChangeText={setCaloriasManual}
            keyboardType="numeric"
            placeholderTextColor={coloresBase.textoSecundarioOscuro}
          />

          <View style={estilos.filaMacros}>
            <View style={estilos.columnaMacro}>
              <Text style={estilos.labelInput}>Carbohidratos (g)</Text>
              <TextInput
                style={estilos.input}
                value={carbohidratosManual}
                onChangeText={setCarbohidratosManual}
                keyboardType="numeric"
                placeholderTextColor={coloresBase.textoSecundarioOscuro}
              />
            </View>
            <View style={estilos.columnaMacro}>
              <Text style={estilos.labelInput}>Proteínas (g)</Text>
              <TextInput
                style={estilos.input}
                value={proteinasManual}
                onChangeText={setProteinasManual}
                keyboardType="numeric"
                placeholderTextColor={coloresBase.textoSecundarioOscuro}
              />
            </View>
          </View>

          <Pressable 
            style={[estilos.botonGuardar, isSaving && estilos.botonGuardarDeshabilitado]} 
            onPress={guardarComida}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 color={coloresBase.fondoOscuro} size={24} />
            ) : (
              <Check color={coloresBase.fondoOscuro} size={28} strokeWidth={3} />
            )}
            <Text style={estilos.textoBotonGuardar}>
              {isSaving ? 'GUARDANDO...' : 'GUARDAR EN MI DIARIO'}
            </Text>
          </Pressable>
        </View>
      )}
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
  encabezado: {
    marginTop: espaciadoBase.lg,
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
  tarjetaCamara: {
    borderRadius: 34,
    borderWidth: 1.6,
    borderColor: 'rgba(216,255,62,0.6)',
    backgroundColor: 'rgba(216,255,62,0.15)',
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciadoBase.lg,
    padding: espaciadoBase.xl,
    ...sombrasNeon.glowSuave,
  },
  circuloIconoCamara: {
    width: 100,
    height: 100,
    borderRadius: radiosBase.pill,
    backgroundColor: coloresBase.acentoNeon,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombrasNeon.glowFuerte,
  },
  textoTomarFoto: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  contenedorImagen: {
    alignItems: 'center',
    gap: espaciadoBase.md,
  },
  imagenPreview: {
    width: '100%',
    height: 300,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#2B3040',
  },
  botonReintentar: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radiosBase.pill,
    backgroundColor: '#1E2330',
    borderWidth: 1,
    borderColor: '#2D3448',
  },
  textoReintentar: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 16,
    fontWeight: '600',
  },
  contenedorAnalizando: {
    marginTop: espaciadoBase.xl,
    alignItems: 'center',
    gap: espaciadoBase.md,
  },
  textoAnalizando: {
    color: coloresBase.acentoNeon,
    fontSize: 18,
    fontWeight: '700',
  },
  tarjetaResultado: {
    marginTop: espaciadoBase.xl,
    backgroundColor: '#171922',
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: 'rgba(216,255,62,0.3)',
    padding: espaciadoBase.lg,
    gap: espaciadoBase.sm,
  },
  encabezadoResultado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: espaciadoBase.md,
  },
  tituloResultado: {
    color: coloresBase.acentoNeon,
    fontSize: 22,
    fontWeight: '800',
  },
  labelInput: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#1E2330',
    borderWidth: 1,
    borderColor: '#2D3448',
    borderRadius: radiosBase.md,
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 18,
    fontWeight: '700',
    padding: 16,
  },
  botonGuardar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: coloresBase.acentoNeon,
    borderRadius: radiosBase.pill,
    paddingVertical: 16,
    marginTop: espaciadoBase.lg,
    gap: 12,
    ...sombrasNeon.glowSuave,
  },
  filaMacros: {
    flexDirection: 'row',
    gap: espaciadoBase.md,
    marginTop: espaciadoBase.sm,
  },
  columnaMacro: {
    flex: 1,
  },
  botonGuardarDeshabilitado: {
    opacity: 0.7,
  },
  textoBotonGuardar: {
    color: coloresBase.fondoOscuro,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

import {
  type EntradaEjercicioGym,
  type EntradaRutinaGymSemanal,
  type EntradaRutinaRunningSemanal,
  type EntradaSesionGym,
  type EntradaSesionRunning,
  type EntrenamientoGimnasio,
  type EntrenamientoRunning,
  type PlantillaGym,
  type RutinaGymSemanal,
  type RutinaRunningSemanal,
  type TipoRunning,
} from '@/src/modules/trainings/domain/tipos-entrenamiento';
import { clienteSupabase } from '@/src/shared/integrations/supabase/cliente-supabase';
import { obtenerUsuarioAutenticadoId } from '@/src/shared/integrations/supabase/usuario-auth';
import { esDiaSemana, type DiaSemana } from '@/src/shared/utils/dias-semana';
import { obtenerFechaIsoActual } from '@/src/shared/utils/fechas';

interface FilaSesionRunning {
  id: string;
  fecha_sesion: string;
  distancia_km: number;
  duracion_segundos: number;
  tipo: TipoRunning;
  ritmo_promedio_seg_km: number;
  notas: string | null;
  created_at: string;
}

interface FilaSesionGym {
  id: string;
  fecha_sesion: string;
  notas: string | null;
  sesion_duplicada_desde: string | null;
  created_at: string;
}

interface FilaEjercicioGym {
  id: string;
  sesion_id: string;
  nombre_ejercicio: string;
  series: number;
  repeticiones: number;
  peso_kg: number;
  orden: number;
  notas: string | null;
}

interface FilaSesionGymConEjercicios extends FilaSesionGym {
  ejercicios_gym: FilaEjercicioGym[] | null;
}

interface FilaPlantillaGym {
  id: string;
  nombre_plantilla: string;
  descripcion: string | null;
}

interface FilaPlantillaGymConEjercicios extends FilaPlantillaGym {
  plantilla_ejercicios_gym: FilaPlantillaEjercicioGym[] | null;
}

interface FilaPlantillaEjercicioGym {
  id: string;
  plantilla_id: string;
  nombre_ejercicio: string;
  series: number;
  repeticiones: number;
  peso_kg: number;
  orden: number;
  notas: string | null;
}

interface FilaRutinaGymSemanal {
  id: string;
  dia_semana: number;
  notas: string | null;
  created_at: string;
}

interface FilaRutinaGymSemanalEjercicio {
  id: string;
  rutina_id: string;
  nombre_ejercicio: string;
  series: number;
  repeticiones: number;
  peso_kg: number;
  orden: number;
  notas: string | null;
}

interface FilaRutinaGymSemanalConEjercicios extends FilaRutinaGymSemanal {
  rutina_gym_semanal_ejercicios: FilaRutinaGymSemanalEjercicio[] | null;
}

interface FilaRutinaRunningSemanal {
  id: string;
  dia_semana: number;
  tipo: TipoRunning;
  detalle: string | null;
  distancia_objetivo_km: number | null;
  created_at: string;
}

export interface RegistroRunning extends EntradaSesionRunning {
  id: string;
  ritmoPromedioSegKm: number;
  createdAt: string;
}

export interface RegistroGym extends Omit<EntradaSesionGym, 'id'> {
  id: string;
  createdAt: string;
}

export type RegistroEntrenamiento =
  | {
      id: string;
      tipo: 'running';
      fechaSesion: string;
      createdAt: string;
      descripcion: string;
      registroRunning: RegistroRunning;
    }
  | {
      id: string;
      tipo: 'gimnasio';
      fechaSesion: string;
      createdAt: string;
      descripcion: string;
      registroGym: RegistroGym;
    };

function crearErrorOperacion(mensaje: string, detalle?: string) {
  return new Error(detalle ? `${mensaje}: ${detalle}` : mensaje);
}

function normalizarNotas(notas?: string | null) {
  const valor = notas?.trim();
  return valor && valor.length > 0 ? valor : null;
}

function validarFechaSesion(fechaSesion: string) {
  const esValida = /^\d{4}-\d{2}-\d{2}$/.test(fechaSesion);
  if (!esValida) {
    throw crearErrorOperacion('Fecha invalida', 'Se espera formato YYYY-MM-DD.');
  }
}

function validarDiaSemana(diaSemana: number): asserts diaSemana is DiaSemana {
  if (!esDiaSemana(diaSemana)) {
    throw crearErrorOperacion('Dia invalido', 'Se espera un valor entre 1 y 7.');
  }
}

function sanitizarEjercicios(ejercicios: EntradaEjercicioGym[]) {
  const ejerciciosValidos = ejercicios
    .map((ejercicio) => ({
      nombre: ejercicio.nombre.trim(),
      series: Number(ejercicio.series),
      repeticiones: Number(ejercicio.repeticiones),
      pesoKg: Number(ejercicio.pesoKg),
      notas: normalizarNotas(ejercicio.notas) ?? undefined,
    }))
    .filter((ejercicio) => ejercicio.nombre.length > 0 && ejercicio.series > 0 && ejercicio.repeticiones > 0);

  if (ejerciciosValidos.length === 0) {
    throw crearErrorOperacion('Debes agregar al menos un ejercicio valido.');
  }

  return ejerciciosValidos;
}

function mapearRunning(fila: FilaSesionRunning): RegistroRunning {
  return {
    id: fila.id,
    fechaSesion: fila.fecha_sesion,
    distanciaKm: Number(fila.distancia_km),
    duracionSegundos: fila.duracion_segundos,
    tipo: fila.tipo,
    ritmoPromedioSegKm: fila.ritmo_promedio_seg_km,
    notas: fila.notas ?? undefined,
    createdAt: fila.created_at,
  };
}

function mapearEjercicioGym(fila: FilaEjercicioGym): EntradaEjercicioGym {
  return {
    nombre: fila.nombre_ejercicio,
    series: fila.series,
    repeticiones: fila.repeticiones,
    pesoKg: Number(fila.peso_kg),
    notas: fila.notas ?? undefined,
  };
}

function mapearGym(fila: FilaSesionGymConEjercicios): RegistroGym {
  const ejerciciosOrdenados = [...(fila.ejercicios_gym ?? [])].sort((a, b) => a.orden - b.orden);

  return {
    id: fila.id,
    fechaSesion: fila.fecha_sesion,
    notas: fila.notas ?? undefined,
    sesionDuplicadaDesde: fila.sesion_duplicada_desde ?? undefined,
    ejercicios: ejerciciosOrdenados.map(mapearEjercicioGym),
    createdAt: fila.created_at,
  };
}

function mapearRutinaGymSemanal(fila: FilaRutinaGymSemanalConEjercicios): RutinaGymSemanal {
  validarDiaSemana(fila.dia_semana);

  const ejerciciosOrdenados = [...(fila.rutina_gym_semanal_ejercicios ?? [])].sort((a, b) => a.orden - b.orden);

  return {
    id: fila.id,
    diaSemana: fila.dia_semana,
    notas: fila.notas ?? undefined,
    ejercicios: ejerciciosOrdenados.map((ejercicio) => ({
      nombre: ejercicio.nombre_ejercicio,
      series: ejercicio.series,
      repeticiones: ejercicio.repeticiones,
      pesoKg: Number(ejercicio.peso_kg),
      notas: ejercicio.notas ?? undefined,
    })),
    createdAt: fila.created_at,
  };
}

function mapearRutinaRunningSemanal(fila: FilaRutinaRunningSemanal): RutinaRunningSemanal {
  validarDiaSemana(fila.dia_semana);

  return {
    id: fila.id,
    diaSemana: fila.dia_semana,
    tipo: fila.tipo,
    detalle: fila.detalle ?? undefined,
    distanciaObjetivoKm:
      typeof fila.distancia_objetivo_km === 'number' ? Number(fila.distancia_objetivo_km) : undefined,
    createdAt: fila.created_at,
  };
}

function describirRunning(registro: RegistroRunning) {
  const minutos = Math.floor(registro.duracionSegundos / 60);
  const segundos = registro.duracionSegundos % 60;
  return `${registro.distanciaKm.toFixed(2)} km en ${minutos}:${segundos.toString().padStart(2, '0')}`;
}

function describirGym(registro: RegistroGym) {
  const totalEjercicios = registro.ejercicios.length;
  const volumenTotal = registro.ejercicios.reduce(
    (acumulado, ejercicio) => acumulado + ejercicio.series * ejercicio.repeticiones * ejercicio.pesoKg,
    0
  );
  return `${totalEjercicios} ejercicios - volumen ${Math.round(volumenTotal)} kg`;
}

function construirQueryRunningBase() {
  return clienteSupabase
    .from('sesiones_running')
    .select('id, fecha_sesion, distancia_km, duracion_segundos, tipo, ritmo_promedio_seg_km, notas, created_at')
    .order('fecha_sesion', { ascending: false })
    .order('created_at', { ascending: false });
}

function construirQueryGymBase() {
  return clienteSupabase
    .from('sesiones_gym')
    .select(
      'id, fecha_sesion, notas, sesion_duplicada_desde, created_at, ejercicios_gym(id, sesion_id, nombre_ejercicio, series, repeticiones, peso_kg, orden, notas)'
    )
    .order('fecha_sesion', { ascending: false })
    .order('created_at', { ascending: false });
}

function construirQueryRutinasGymSemanalesBase() {
  return clienteSupabase
    .from('rutinas_gym_semanales')
    .select(
      'id, dia_semana, notas, created_at, rutina_gym_semanal_ejercicios(id, rutina_id, nombre_ejercicio, series, repeticiones, peso_kg, orden, notas)'
    )
    .order('dia_semana', { ascending: true });
}

function construirQueryRutinasRunningSemanalesBase() {
  return clienteSupabase
    .from('rutinas_running_semanales')
    .select('id, dia_semana, tipo, detalle, distancia_objetivo_km, created_at')
    .order('dia_semana', { ascending: true });
}

export async function listarRegistrosRunning(limit = 50): Promise<RegistroRunning[]> {
  const { data, error } = await construirQueryRunningBase().limit(limit);

  if (error) {
    throw crearErrorOperacion('No pudimos listar sesiones de running', error.message);
  }

  return ((data ?? []) as FilaSesionRunning[]).map(mapearRunning);
}

export async function obtenerRegistroRunning(id: string): Promise<RegistroRunning | null> {
  const { data, error } = await clienteSupabase
    .from('sesiones_running')
    .select('id, fecha_sesion, distancia_km, duracion_segundos, tipo, ritmo_promedio_seg_km, notas, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw crearErrorOperacion('No pudimos obtener la sesion de running', error.message);
  }

  return data ? mapearRunning(data as FilaSesionRunning) : null;
}

export async function guardarRegistroRunning(entrada: EntradaSesionRunning): Promise<RegistroRunning> {
  validarFechaSesion(entrada.fechaSesion);

  if (entrada.distanciaKm <= 0) {
    throw crearErrorOperacion('La distancia debe ser mayor a cero.');
  }

  if (entrada.duracionSegundos <= 0) {
    throw crearErrorOperacion('La duracion debe ser mayor a cero.');
  }

  const payload = {
    fecha_sesion: entrada.fechaSesion,
    distancia_km: entrada.distanciaKm,
    duracion_segundos: Math.round(entrada.duracionSegundos),
    tipo: entrada.tipo,
    notas: normalizarNotas(entrada.notas),
  };

  if (entrada.id) {
    const { data, error } = await clienteSupabase
      .from('sesiones_running')
      .update(payload)
      .eq('id', entrada.id)
      .select('id, fecha_sesion, distancia_km, duracion_segundos, tipo, ritmo_promedio_seg_km, notas, created_at')
      .single();

    if (error) {
      throw crearErrorOperacion('No pudimos actualizar la sesion de running', error.message);
    }

    return mapearRunning(data as FilaSesionRunning);
  }

  const userId = await obtenerUsuarioAutenticadoId();

  const { data, error } = await clienteSupabase
    .from('sesiones_running')
    .insert({
      ...payload,
      user_id: userId,
    })
    .select('id, fecha_sesion, distancia_km, duracion_segundos, tipo, ritmo_promedio_seg_km, notas, created_at')
    .single();

  if (error) {
    throw crearErrorOperacion('No pudimos guardar la sesion de running', error.message);
  }

  return mapearRunning(data as FilaSesionRunning);
}

export async function eliminarRegistroRunning(id: string): Promise<void> {
  const { error } = await clienteSupabase.from('sesiones_running').delete().eq('id', id);

  if (error) {
    throw crearErrorOperacion('No pudimos eliminar la sesion de running', error.message);
  }
}

export async function listarRegistrosGym(limit = 50): Promise<RegistroGym[]> {
  const { data, error } = await construirQueryGymBase().limit(limit);

  if (error) {
    throw crearErrorOperacion('No pudimos listar sesiones de gimnasio', error.message);
  }

  return ((data ?? []) as FilaSesionGymConEjercicios[]).map(mapearGym);
}

export async function obtenerRegistroGym(id: string): Promise<RegistroGym | null> {
  const { data, error } = await clienteSupabase
    .from('sesiones_gym')
    .select(
      'id, fecha_sesion, notas, sesion_duplicada_desde, created_at, ejercicios_gym(id, sesion_id, nombre_ejercicio, series, repeticiones, peso_kg, orden, notas)'
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw crearErrorOperacion('No pudimos obtener la sesion de gimnasio', error.message);
  }

  return data ? mapearGym(data as FilaSesionGymConEjercicios) : null;
}

export async function guardarRegistroGym(entrada: EntradaSesionGym): Promise<RegistroGym> {
  validarFechaSesion(entrada.fechaSesion);
  const ejercicios = sanitizarEjercicios(entrada.ejercicios);

  const payloadSesion = {
    fecha_sesion: entrada.fechaSesion,
    notas: normalizarNotas(entrada.notas),
    sesion_duplicada_desde: entrada.sesionDuplicadaDesde ?? null,
  };

  let sesionId = entrada.id;

  if (entrada.id) {
    const { error } = await clienteSupabase.from('sesiones_gym').update(payloadSesion).eq('id', entrada.id);

    if (error) {
      throw crearErrorOperacion('No pudimos actualizar la sesion de gimnasio', error.message);
    }

    const { error: errorBorradoEjercicios } = await clienteSupabase
      .from('ejercicios_gym')
      .delete()
      .eq('sesion_id', entrada.id);

    if (errorBorradoEjercicios) {
      throw crearErrorOperacion('No pudimos actualizar los ejercicios de la sesion', errorBorradoEjercicios.message);
    }
  } else {
    const userId = await obtenerUsuarioAutenticadoId();

    const { data, error } = await clienteSupabase
      .from('sesiones_gym')
      .insert({
        ...payloadSesion,
        user_id: userId,
      })
      .select('id')
      .single();

    if (error) {
      throw crearErrorOperacion('No pudimos crear la sesion de gimnasio', error.message);
    }

    sesionId = (data as { id: string }).id;
  }

  if (!sesionId) {
    throw crearErrorOperacion('No se pudo resolver el identificador de la sesion.');
  }

  const payloadEjercicios = ejercicios.map((ejercicio, indice) => ({
    sesion_id: sesionId,
    nombre_ejercicio: ejercicio.nombre,
    series: ejercicio.series,
    repeticiones: ejercicio.repeticiones,
    peso_kg: ejercicio.pesoKg,
    orden: indice + 1,
    notas: ejercicio.notas ?? null,
  }));

  const { error: errorInsertEjercicios } = await clienteSupabase.from('ejercicios_gym').insert(payloadEjercicios);

  if (errorInsertEjercicios) {
    throw crearErrorOperacion('No pudimos guardar los ejercicios de la sesion', errorInsertEjercicios.message);
  }

  const sesion = await obtenerRegistroGym(sesionId);
  if (!sesion) {
    throw crearErrorOperacion('No pudimos obtener la sesion guardada.');
  }

  return sesion;
}

export async function eliminarRegistroGym(id: string): Promise<void> {
  const { error } = await clienteSupabase.from('sesiones_gym').delete().eq('id', id);

  if (error) {
    throw crearErrorOperacion('No pudimos eliminar la sesion de gimnasio', error.message);
  }
}

export async function listarRegistrosRunningPorRango(
  fechaDesde: string,
  fechaHasta: string
): Promise<RegistroRunning[]> {
  const { data, error } = await construirQueryRunningBase()
    .gte('fecha_sesion', fechaDesde)
    .lte('fecha_sesion', fechaHasta)
    .limit(500);

  if (error) {
    throw crearErrorOperacion('No pudimos listar sesiones de running por rango', error.message);
  }

  return ((data ?? []) as FilaSesionRunning[]).map(mapearRunning);
}

export async function listarRegistrosGymPorRango(
  fechaDesde: string,
  fechaHasta: string
): Promise<RegistroGym[]> {
  const { data, error } = await construirQueryGymBase()
    .gte('fecha_sesion', fechaDesde)
    .lte('fecha_sesion', fechaHasta)
    .limit(500);

  if (error) {
    throw crearErrorOperacion('No pudimos listar sesiones de gimnasio por rango', error.message);
  }

  return ((data ?? []) as FilaSesionGymConEjercicios[]).map(mapearGym);
}

export async function duplicarRegistroGym(id: string, fechaDestino = obtenerFechaIsoActual()): Promise<RegistroGym> {
  const sesionOriginal = await obtenerRegistroGym(id);

  if (!sesionOriginal) {
    throw crearErrorOperacion('No encontramos la sesion que intentas duplicar.');
  }

  return guardarRegistroGym({
    fechaSesion: fechaDestino,
    notas: sesionOriginal.notas,
    sesionDuplicadaDesde: sesionOriginal.id,
    ejercicios: sesionOriginal.ejercicios,
  });
}

export async function listarPlantillasGym(): Promise<PlantillaGym[]> {
  const { data, error } = await clienteSupabase
    .from('plantillas_gym')
    .select(
      'id, nombre_plantilla, descripcion, plantilla_ejercicios_gym(id, plantilla_id, nombre_ejercicio, series, repeticiones, peso_kg, orden, notas)'
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw crearErrorOperacion('No pudimos listar las plantillas', error.message);
  }

  return ((data ?? []) as FilaPlantillaGymConEjercicios[]).map((filaPlantilla) => {
    const ejerciciosOrdenados = [...(filaPlantilla.plantilla_ejercicios_gym ?? [])].sort(
      (a, b) => a.orden - b.orden
    );

    return {
      id: filaPlantilla.id,
      nombre: filaPlantilla.nombre_plantilla,
      descripcion: filaPlantilla.descripcion ?? undefined,
      ejercicios: ejerciciosOrdenados.map((ejercicio) => ({
        nombre: ejercicio.nombre_ejercicio,
        series: ejercicio.series,
        repeticiones: ejercicio.repeticiones,
        pesoKg: Number(ejercicio.peso_kg),
        notas: ejercicio.notas ?? undefined,
      })),
    };
  });
}

export async function crearPlantillaGym(
  nombrePlantilla: string,
  ejercicios: EntradaEjercicioGym[],
  descripcion?: string
): Promise<PlantillaGym> {
  const nombreLimpio = nombrePlantilla.trim();
  if (nombreLimpio.length < 3) {
    throw crearErrorOperacion('El nombre de la plantilla debe tener al menos 3 caracteres.');
  }

  const ejerciciosValidos = sanitizarEjercicios(ejercicios);
  const userId = await obtenerUsuarioAutenticadoId();

  const { data, error } = await clienteSupabase
    .from('plantillas_gym')
    .insert({
      user_id: userId,
      nombre_plantilla: nombreLimpio,
      descripcion: normalizarNotas(descripcion),
    })
    .select('id, nombre_plantilla, descripcion')
    .single();

  if (error) {
    throw crearErrorOperacion('No pudimos crear la plantilla', error.message);
  }

  const plantilla = data as FilaPlantillaGym;

  const { error: errorEjercicios } = await clienteSupabase.from('plantilla_ejercicios_gym').insert(
    ejerciciosValidos.map((ejercicio, indice) => ({
      plantilla_id: plantilla.id,
      nombre_ejercicio: ejercicio.nombre,
      series: ejercicio.series,
      repeticiones: ejercicio.repeticiones,
      peso_kg: ejercicio.pesoKg,
      orden: indice + 1,
      notas: ejercicio.notas ?? null,
    }))
  );

  if (errorEjercicios) {
    throw crearErrorOperacion('No pudimos guardar los ejercicios de la plantilla', errorEjercicios.message);
  }

  return {
    id: plantilla.id,
    nombre: plantilla.nombre_plantilla,
    descripcion: plantilla.descripcion ?? undefined,
    ejercicios: ejerciciosValidos,
  };
}

export async function listarRutinasGymSemanales(): Promise<RutinaGymSemanal[]> {
  const { data, error } = await construirQueryRutinasGymSemanalesBase();

  if (error) {
    throw crearErrorOperacion('No pudimos listar las rutinas semanales de gym', error.message);
  }

  return ((data ?? []) as FilaRutinaGymSemanalConEjercicios[]).map(mapearRutinaGymSemanal);
}

export async function obtenerRutinaGymSemanalPorDia(diaSemana: DiaSemana): Promise<RutinaGymSemanal | null> {
  validarDiaSemana(diaSemana);

  const { data, error } = await clienteSupabase
    .from('rutinas_gym_semanales')
    .select(
      'id, dia_semana, notas, created_at, rutina_gym_semanal_ejercicios(id, rutina_id, nombre_ejercicio, series, repeticiones, peso_kg, orden, notas)'
    )
    .eq('dia_semana', diaSemana)
    .maybeSingle();

  if (error) {
    throw crearErrorOperacion('No pudimos obtener la rutina semanal de gym', error.message);
  }

  return data ? mapearRutinaGymSemanal(data as FilaRutinaGymSemanalConEjercicios) : null;
}

export async function guardarRutinaGymSemanal(entrada: EntradaRutinaGymSemanal): Promise<RutinaGymSemanal> {
  validarDiaSemana(entrada.diaSemana);
  const ejercicios = sanitizarEjercicios(entrada.ejercicios);

  const payloadRutina = {
    dia_semana: entrada.diaSemana,
    notas: normalizarNotas(entrada.notas),
  };

  let rutinaId = entrada.id;

  if (!rutinaId) {
    const rutinaExistente = await obtenerRutinaGymSemanalPorDia(entrada.diaSemana);
    rutinaId = rutinaExistente?.id;
  }

  if (rutinaId) {
    const { error } = await clienteSupabase.from('rutinas_gym_semanales').update(payloadRutina).eq('id', rutinaId);

    if (error) {
      throw crearErrorOperacion('No pudimos actualizar la rutina semanal de gym', error.message);
    }

    const { error: errorBorradoEjercicios } = await clienteSupabase
      .from('rutina_gym_semanal_ejercicios')
      .delete()
      .eq('rutina_id', rutinaId);

    if (errorBorradoEjercicios) {
      throw crearErrorOperacion('No pudimos actualizar los ejercicios de la rutina semanal', errorBorradoEjercicios.message);
    }
  } else {
    const userId = await obtenerUsuarioAutenticadoId();

    const { data, error } = await clienteSupabase
      .from('rutinas_gym_semanales')
      .insert({
        ...payloadRutina,
        user_id: userId,
      })
      .select('id')
      .single();

    if (error) {
      throw crearErrorOperacion('No pudimos crear la rutina semanal de gym', error.message);
    }

    rutinaId = (data as { id: string }).id;
  }

  if (!rutinaId) {
    throw crearErrorOperacion('No se pudo resolver el identificador de la rutina semanal.');
  }

  const payloadEjercicios = ejercicios.map((ejercicio, indice) => ({
    rutina_id: rutinaId,
    nombre_ejercicio: ejercicio.nombre,
    series: ejercicio.series,
    repeticiones: ejercicio.repeticiones,
    peso_kg: ejercicio.pesoKg,
    orden: indice + 1,
    notas: ejercicio.notas ?? null,
  }));

  const { error: errorInsertEjercicios } = await clienteSupabase
    .from('rutina_gym_semanal_ejercicios')
    .insert(payloadEjercicios);

  if (errorInsertEjercicios) {
    throw crearErrorOperacion('No pudimos guardar los ejercicios de la rutina semanal', errorInsertEjercicios.message);
  }

  const rutina = await obtenerRutinaGymSemanalPorDia(entrada.diaSemana);
  if (!rutina) {
    throw crearErrorOperacion('No pudimos obtener la rutina semanal guardada.');
  }

  return rutina;
}

export async function eliminarRutinaGymSemanal(id: string): Promise<void> {
  const { error } = await clienteSupabase.from('rutinas_gym_semanales').delete().eq('id', id);

  if (error) {
    throw crearErrorOperacion('No pudimos eliminar la rutina semanal de gym', error.message);
  }
}

export async function listarRutinasRunningSemanales(): Promise<RutinaRunningSemanal[]> {
  const { data, error } = await construirQueryRutinasRunningSemanalesBase();

  if (error) {
    throw crearErrorOperacion('No pudimos listar las rutinas semanales de running', error.message);
  }

  return ((data ?? []) as FilaRutinaRunningSemanal[]).map(mapearRutinaRunningSemanal);
}

export async function obtenerRutinaRunningSemanalPorDia(diaSemana: DiaSemana): Promise<RutinaRunningSemanal | null> {
  validarDiaSemana(diaSemana);

  const { data, error } = await clienteSupabase
    .from('rutinas_running_semanales')
    .select('id, dia_semana, tipo, detalle, distancia_objetivo_km, created_at')
    .eq('dia_semana', diaSemana)
    .maybeSingle();

  if (error) {
    throw crearErrorOperacion('No pudimos obtener la rutina semanal de running', error.message);
  }

  return data ? mapearRutinaRunningSemanal(data as FilaRutinaRunningSemanal) : null;
}

export async function guardarRutinaRunningSemanal(
  entrada: EntradaRutinaRunningSemanal
): Promise<RutinaRunningSemanal> {
  validarDiaSemana(entrada.diaSemana);

  if (typeof entrada.distanciaObjetivoKm === 'number' && entrada.distanciaObjetivoKm <= 0) {
    throw crearErrorOperacion('La distancia objetivo debe ser mayor a cero.');
  }

  const payloadRutina = {
    dia_semana: entrada.diaSemana,
    tipo: entrada.tipo,
    detalle: normalizarNotas(entrada.detalle),
    distancia_objetivo_km: entrada.distanciaObjetivoKm ?? null,
  };

  let rutinaId = entrada.id;

  if (!rutinaId) {
    const rutinaExistente = await obtenerRutinaRunningSemanalPorDia(entrada.diaSemana);
    rutinaId = rutinaExistente?.id;
  }

  if (rutinaId) {
    const { error } = await clienteSupabase
      .from('rutinas_running_semanales')
      .update(payloadRutina)
      .eq('id', rutinaId);

    if (error) {
      throw crearErrorOperacion('No pudimos actualizar la rutina semanal de running', error.message);
    }
  } else {
    const userId = await obtenerUsuarioAutenticadoId();

    const { data, error } = await clienteSupabase
      .from('rutinas_running_semanales')
      .insert({
        ...payloadRutina,
        user_id: userId,
      })
      .select('id')
      .single();

    if (error) {
      throw crearErrorOperacion('No pudimos crear la rutina semanal de running', error.message);
    }

    rutinaId = (data as { id: string }).id;
  }

  const rutina = await obtenerRutinaRunningSemanalPorDia(entrada.diaSemana);
  if (!rutina) {
    throw crearErrorOperacion('No pudimos obtener la rutina semanal guardada.');
  }

  return rutina;
}

export async function eliminarRutinaRunningSemanal(id: string): Promise<void> {
  const { error } = await clienteSupabase.from('rutinas_running_semanales').delete().eq('id', id);

  if (error) {
    throw crearErrorOperacion('No pudimos eliminar la rutina semanal de running', error.message);
  }
}

export function runningComoEntrenamiento(registro: RegistroRunning): EntrenamientoRunning {
  return {
    id: registro.id,
    tipo: 'running',
    modalidad: registro.tipo,
    fecha: registro.fechaSesion,
    distanciaKm: registro.distanciaKm,
    duracionMin: Math.round(registro.duracionSegundos / 60),
    notas: registro.notas,
  };
}

export function gymComoEntrenamiento(registro: RegistroGym): EntrenamientoGimnasio {
  return {
    id: registro.id,
    tipo: 'gimnasio',
    fecha: registro.fechaSesion,
    ejercicios: registro.ejercicios,
    notas: registro.notas,
  };
}

export async function listarEntrenamientosDominioPorRango(
  fechaDesde: string,
  fechaHasta: string
): Promise<(EntrenamientoRunning | EntrenamientoGimnasio)[]> {
  const [running, gym] = await Promise.all([
    listarRegistrosRunningPorRango(fechaDesde, fechaHasta),
    listarRegistrosGymPorRango(fechaDesde, fechaHasta),
  ]);

  return [...running.map(runningComoEntrenamiento), ...gym.map(gymComoEntrenamiento)];
}

export async function listarHistorialEntrenamientos(limit = 100): Promise<RegistroEntrenamiento[]> {
  const [running, gym] = await Promise.all([listarRegistrosRunning(limit), listarRegistrosGym(limit)]);

  const historialRunning: RegistroEntrenamiento[] = running.map((registro) => ({
    id: registro.id,
    tipo: 'running',
    fechaSesion: registro.fechaSesion,
    createdAt: registro.createdAt,
    descripcion: describirRunning(registro),
    registroRunning: registro,
  }));

  const historialGym: RegistroEntrenamiento[] = gym.map((registro) => ({
    id: registro.id,
    tipo: 'gimnasio',
    fechaSesion: registro.fechaSesion,
    createdAt: registro.createdAt,
    descripcion: describirGym(registro),
    registroGym: registro,
  }));

  return [...historialRunning, ...historialGym].sort((a, b) => {
    if (a.fechaSesion !== b.fechaSesion) {
      return b.fechaSesion.localeCompare(a.fechaSesion);
    }

    return b.createdAt.localeCompare(a.createdAt);
  });
}

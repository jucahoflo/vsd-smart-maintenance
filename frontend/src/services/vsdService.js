import { supabase } from './supabaseClient';

export const crearVSD = async (datos) => {
  // Obtener la cantidad total de VSDs actuales en la base de datos
  const { count, error } = await supabase
    .from('vsd')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;

  // Generar el código basado en el conteo actual + 1
  const siguienteNumero = (count || 0) + 1;
  const nuevoCodigo = `V${siguienteNumero.toString().padStart(3, '0')}`;

  const { data, error: insertError } = await supabase
    .from('vsd')
    .insert({ codigo_vsd: nuevoCodigo, ...datos })
    .select()
    .single();

  if (insertError) throw insertError;
  return data;
};

export const actualizarVSD = async (datos) => {
  const { id, codigo_vsd, ...datosSinCodigo } = datos;
  if (!id) throw new Error("Error: ID no encontrado.");
  const { error } = await supabase.from('vsd').update(datosSinCodigo).eq('id', id);
  if (error) throw error;
  return true;
};

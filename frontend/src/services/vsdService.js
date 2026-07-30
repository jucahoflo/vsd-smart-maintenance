import { supabase } from './supabaseClient';

export const crearVSD = async (datos) => {
  const { count, error } = await supabase
    .from('vsd')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;

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
  // 🚨 NO GENERAMOS NINGÚN CÓDIGO AQUÍ. SOLO ACTUALIZAMOS.
  const { id, ...datosSinCodigo } = datos;
  if (!id) throw new Error("ID no encontrado.");
  const { error } = await supabase.from('vsd').update(datosSinCodigo).eq('id', id);
  if (error) throw error;
  return true;
};

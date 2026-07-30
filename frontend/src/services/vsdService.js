import { supabase } from './supabaseClient';

export const crearVSD = async (datos) => {
  const { data: ultimo } = await supabase.from('vsd').select('codigo_vsd').order('created_at', { ascending: false }).limit(1).maybeSingle();
  let nuevo = "V001";
  if (ultimo?.codigo_vsd) {
    const num = parseInt(ultimo.codigo_vsd.replace('V', '')) + 1;
    nuevo = `V${num.toString().padStart(3, '0')}`;
  }
  const { data, error } = await supabase.from('vsd').insert({ codigo_vsd: nuevo, ...datos }).select().single();
  if (error) throw error;
  return data;
};

export const actualizarVSD = async (datos) => {
  const { id, codigo_vsd, ...datosSinCodigo } = datos;
  if (!id) throw new Error("Error Crítico: No se encontró el ID.");
  const { error } = await supabase.from('vsd').update(datosSinCodigo).eq('id', id);
  if (error) throw error;
  return true;
};

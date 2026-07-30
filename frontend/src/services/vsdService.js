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
  const { codigo_vsd, ...datosSinCodigo } = datos;
  
  // Si el codigo_vsd es undefined o viene vacío, NO actualizar (Seguridad extra)
  if (!codigo_vsd) {
    console.error("Intento de actualizar sin codigo_vsd. Operación cancelada.");
    return false;
  }

  const { error } = await supabase.from('vsd').update(datosSinCodigo).eq('codigo_vsd', codigo_vsd);
  if (error) throw error;
  return true;
};

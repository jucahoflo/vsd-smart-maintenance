import { supabase } from './supabaseClient';

export const crearVSD = async (datosFormulario) => {
  const { data: ultimoVSD } = await supabase.from('vsd').select('codigo_vsd').order('created_at', { ascending: false }).limit(1).maybeSingle();
  let nuevoCodigo = "V001";
  if (ultimoVSD?.codigo_vsd) {
    const num = parseInt(ultimoVSD.codigo_vsd.replace('V', '')) + 1;
    nuevoCodigo = `V${num.toString().padStart(3, '0')}`;
  }
  const { data, error } = await supabase.from('vsd').insert({ codigo_vsd: nuevoCodigo, ...datosFormulario }).select().single();
  if (error) throw error;
  return data;
};

export const actualizarVSD = async (datosFormulario) => {
  const { codigo_vsd, ...datosActualizables } = datosFormulario;
  if (!codigo_vsd) throw new Error("El código VSD es obligatorio para actualizar");
  const { error } = await supabase.from('vsd').update(datosActualizables).eq('codigo_vsd', codigo_vsd);
  if (error) throw error;
  return true;
};

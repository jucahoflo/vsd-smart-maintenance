import { supabase } from './supabaseClient';

export const crearVSD = async (datos) => {
  let intentos = 0;
  let nuevoCodigo = '';
  let insertado = false;
  let data = null;

  while (!insertado && intentos < 50) {
    intentos++;
    // Intentar desde V001 en adelante hasta encontrar uno libre
    const codigoBase = `V${intentos.toString().padStart(3, '0')}`;
    
    // Verificar si el código ya existe en la tabla
    const { data: existe, error: checkError } = await supabase
      .from('vsd')
      .select('id')
      .eq('codigo_vsd', codigoBase)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!existe) {
      nuevoCodigo = codigoBase;
      const { data: insertedData, error: insertError } = await supabase
        .from('vsd')
        .insert({ codigo_vsd: nuevoCodigo, ...datos })
        .select()
        .single();
      
      if (!insertError) {
        data = insertedData;
        insertado = true;
      }
    }
  }

  if (!insertado) throw new Error("No se pudo asignar un código VSD único.");
  return data;
};

export const actualizarVSD = async (datos) => {
  const { id, codigo_vsd, ...datosSinCodigo } = datos;
  if (!id) throw new Error("Error: ID no encontrado.");
  const { error } = await supabase.from('vsd').update(datosSinCodigo).eq('id', id);
  if (error) throw error;
  return true;
};

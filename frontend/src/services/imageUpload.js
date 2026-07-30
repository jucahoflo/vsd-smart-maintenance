import { supabase, STORAGE_BUCKET } from '../config/supabase';
import { upload } from '../api/endpoints';
import api from '../api/client';

export const uploadImage = async (file, vfdId, index = 1) => {
  try {
    if (!file) return null;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Formato no soportado. Usa JPG, PNG, WEBP o GIF.');
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('La imagen no puede superar los 5MB.');
    }

    // Generar nombre único
    const fileExt = file.name.split('.').pop();
    const fileName = `${vfdId}/image_${index}_${Date.now()}.${fileExt}`;

    console.log('📤 Subiendo imagen a:', fileName);
    console.log('📤 Bucket:', STORAGE_BUCKET);

    // Subir a Supabase Storage usando el token del usuario
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (error) {
      console.error('❌ Error de Storage:', error);
      throw error;
    }

    console.log('✅ Imagen subida:', data);

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;
    console.log('🔗 URL pública:', imageUrl);

    // Guardar URL en la base de datos
    await api.post('/upload/image', {
      vfd_id: vfdId,
      image_url: imageUrl,
      image_index: index
    });

    return imageUrl;

  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (vfdId, imageIndex) => {
  try {
    await api.delete('/upload/image', {
      data: { vfd_id: vfdId, image_index: imageIndex }
    });
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const deleteAllImages = async (vfdId) => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(vfdId);

    if (error) throw error;

    if (data && data.length > 0) {
      const paths = data.map(file => `${vfdId}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(paths);

      if (deleteError) throw deleteError;
    }

    await api.delete('/upload/image', { data: { vfd_id: vfdId, image_index: 1 } });
    await api.delete('/upload/image', { data: { vfd_id: vfdId, image_index: 2 } });

    return true;
  } catch (error) {
    console.error('Error deleting images:', error);
    throw error;
  }
};

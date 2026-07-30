import { supabase, STORAGE_BUCKET } from '../config/supabase';

export const uploadImage = async (file, vfdId, index = 1) => {
  try {
    if (!file) return null;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Formato no soportado. Usa JPG, PNG, WEBP o GIF.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('La imagen no puede superar los 5MB.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${vfdId}/image_${index}_${Date.now()}.${fileExt}`;

    console.log('📤 Subiendo imagen a:', fileName);

    // Subir a Supabase Storage
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

    // ✅ Guardar la URL en el campo image_url del VFD (en el formulario)
    return imageUrl;

  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (vfdId, imageIndex) => {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(vfdId);

    if (listError) throw listError;

    if (files && files.length > 0) {
      const toDelete = files
        .filter(f => f.name.includes(`image_${imageIndex}_`))
        .map(f => `${vfdId}/${f.name}`);

      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove(toDelete);
        if (deleteError) throw deleteError;
      }
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const deleteAllImages = async (vfdId) => {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(vfdId);

    if (listError) throw listError;

    if (files && files.length > 0) {
      const toDelete = files.map(f => `${vfdId}/${f.name}`);
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(toDelete);
      if (deleteError) throw deleteError;
    }

    return true;
  } catch (error) {
    console.error('Error deleting images:', error);
    throw error;
  }
};

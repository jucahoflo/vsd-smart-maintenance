const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ===========================
// SUBIR IMAGEN
// ===========================
router.post('/image', async (req, res) => {
  try {
    const { vfd_id, image_url, image_index } = req.body;

    if (!vfd_id || !image_url) {
      return res.status(400).json({
        success: false,
        error: 'VFD ID y URL de imagen son requeridos'
      });
    }

    // Actualizar el campo correspondiente en la base de datos
    const field = image_index === 1 ? 'image_url1' : 'image_url2';
    
    const { data, error } = await supabaseAdmin
      .from('vfds')
      .update({ [field]: image_url, updated_at: new Date().toISOString() })
      .eq('id', vfd_id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: '✅ Imagen guardada en la base de datos',
      data
    });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ===========================
// ELIMINAR IMAGEN
// ===========================
router.delete('/image', async (req, res) => {
  try {
    const { vfd_id, image_index } = req.body;

    if (!vfd_id) {
      return res.status(400).json({
        success: false,
        error: 'VFD ID es requerido'
      });
    }

    const field = image_index === 1 ? 'image_url1' : 'image_url2';
    
    const { data, error } = await supabaseAdmin
      .from('vfds')
      .update({ [field]: null, updated_at: new Date().toISOString() })
      .eq('id', vfd_id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: '✅ Imagen eliminada de la base de datos',
      data
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ===========================
// OBTENER URL DE IMAGEN
// ===========================
router.get('/image/:vfd_id', async (req, res) => {
  try {
    const { vfd_id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('vfds')
      .select('image_url1, image_url2')
      .eq('id', vfd_id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: {
        image_url1: data?.image_url1 || null,
        image_url2: data?.image_url2 || null
      }
    });
  } catch (error) {
    console.error('Error getting images:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;

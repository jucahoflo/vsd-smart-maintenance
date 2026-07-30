const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { authMiddleware, authorize } = require('../middleware/auth');

router.use(authMiddleware);

// GET - Todos los items
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST - Crear item
router.post('/', authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('inventory')
      .insert([{ ...req.body, user_id: req.user.id }])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT - Actualizar item
router.put('/:id', authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('inventory')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE - Eliminar item
router.delete('/:id', authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('inventory')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ success: true, message: 'Item eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

const { supabaseAdmin } = require('../config/supabase');

class VFDController {
  // ===========================
  // GET - Todos los VFDs
  // ===========================
  async getAll(req, res) {
    try {
      const { data, error } = await supabaseAdmin
        .from('vfds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        count: data.length,
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // GET - VFD por ID
  // ===========================
  async getById(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('vfds')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'VFD no encontrado'
        });
      }

      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // POST - Crear VFD
  // ===========================
  async create(req, res) {
    try {
      const vfdData = {
        ...req.body,
        user_id: req.user.id
      };

      // Verificar si ya existe equipment_id
      const { data: existing } = await supabaseAdmin
        .from('vfds')
        .select('equipment_id')
        .eq('equipment_id', vfdData.equipment_id)
        .single();

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Equipment ID ya existe'
        });
      }

      const { data, error } = await supabaseAdmin
        .from('vfds')
        .insert([vfdData])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        message: '✅ VFD creado exitosamente',
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // PUT - Actualizar VFD
  // ===========================
  async update(req, res) {
    try {
      const { id } = req.params;

      // Verificar si existe
      const { data: existing, error: findError } = await supabaseAdmin
        .from('vfds')
        .select('id')
        .eq('id', id)
        .single();

      if (findError || !existing) {
        return res.status(404).json({
          success: false,
          error: 'VFD no encontrado'
        });
      }

      const { data, error } = await supabaseAdmin
        .from('vfds')
        .update({
          ...req.body,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        message: '✅ VFD actualizado exitosamente',
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // DELETE - Eliminar VFD
  // ===========================
  async delete(req, res) {
    try {
      const { id } = req.params;

      const { data: existing } = await supabaseAdmin
        .from('vfds')
        .select('id')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'VFD no encontrado'
        });
      }

      const { error } = await supabaseAdmin
        .from('vfds')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: '✅ VFD eliminado exitosamente'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // GET - Telemetría del VFD
  // ===========================
  async getTelemetry(req, res) {
    try {
      const { id } = req.params;
      const { limit = 100 } = req.query;

      const { data, error } = await supabaseAdmin
        .from('telemetry')
        .select('*')
        .eq('vfd_id', id)
        .order('timestamp', { ascending: false })
        .limit(parseInt(limit));

      if (error) throw error;

      res.json({
        success: true,
        count: data.length,
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // GET - Mantenimiento del VFD
  // ===========================
  async getMaintenance(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('maintenance_records')
        .select('*')
        .eq('vfd_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        count: data.length,
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // GET - Alertas del VFD
  // ===========================
  async getAlerts(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('alerts')
        .select('*')
        .eq('vfd_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        count: data.length,
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new VFDController();

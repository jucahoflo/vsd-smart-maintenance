const { supabaseAdmin } = require('../config/supabase');

class MaintenanceController {
  // ===========================
  // GET - Todos los mantenimientos
  // ===========================
  async getAll(req, res) {
    try {
      const { data, error } = await supabaseAdmin
        .from('maintenance_records')
        .select('*, vfds(equipment_id, manufacturer, model)')
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
  // GET - Mantenimiento por ID
  // ===========================
  async getById(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('maintenance_records')
        .select('*, vfds(equipment_id, manufacturer, model)')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Registro de mantenimiento no encontrado'
        });
      }

      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // GET - Mantenimiento por VFD
  // ===========================
  async getByVFD(req, res) {
    try {
      const { vfdId } = req.params;

      const { data, error } = await supabaseAdmin
        .from('maintenance_records')
        .select('*')
        .eq('vfd_id', vfdId)
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
  // POST - Crear mantenimiento
  // ===========================
  async create(req, res) {
    try {
      const { 
        vfd_id, 
        type, 
        priority, 
        scheduled_date, 
        description, 
        technician,
        cost,
        parts_used,
        observations
      } = req.body;

      if (!vfd_id || !type) {
        return res.status(400).json({
          success: false,
          error: 'VFD ID y tipo son requeridos'
        });
      }

      const record = {
        vfd_id,
        type,
        priority: priority || 'medium',
        status: 'pending',
        scheduled_date: scheduled_date || new Date().toISOString().split('T')[0],
        description: description || '',
        technician: technician || 'Técnico',
        cost: cost || 0,
        parts_used: parts_used || [],
        observations: observations || '',
        user_id: req.user.id
      };

      const { data, error } = await supabaseAdmin
        .from('maintenance_records')
        .insert([record])
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado del VFD a "maintenance"
      await supabaseAdmin
        .from('vfds')
        .update({ 
          status: 'maintenance',
          updated_at: new Date().toISOString()
        })
        .eq('id', vfd_id);

      res.status(201).json({
        success: true,
        message: '✅ Mantenimiento programado correctamente',
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // PUT - Actualizar mantenimiento
  // ===========================
  async update(req, res) {
    try {
      const { id } = req.params;
      const { vfd_id, type, priority, scheduled_date, description, technician, cost, parts_used, observations } = req.body;

      const { data, error } = await supabaseAdmin
        .from('maintenance_records')
        .update({
          vfd_id,
          type,
          priority,
          scheduled_date,
          description,
          technician,
          cost,
          parts_used,
          observations,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        message: '✅ Mantenimiento actualizado',
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // PUT - Completar mantenimiento
  // ===========================
  async complete(req, res) {
    try {
      const { id } = req.params;
      const { observations, hours_used, parts_used, cost } = req.body;

      // Obtener el mantenimiento para saber el vfd_id
      const { data: maintenance, error: findError } = await supabaseAdmin
        .from('maintenance_records')
        .select('vfd_id')
        .eq('id', id)
        .single();

      if (findError || !maintenance) {
        return res.status(404).json({
          success: false,
          error: 'Mantenimiento no encontrado'
        });
      }

      const { data, error } = await supabaseAdmin
        .from('maintenance_records')
        .update({
          status: 'completed',
          completed_date: new Date().toISOString().split('T')[0],
          observations: observations || '',
          hours_used: hours_used || 0,
          parts_used: parts_used || [],
          cost: cost || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado del VFD a "online"
      await supabaseAdmin
        .from('vfds')
        .update({ 
          status: 'online',
          last_maintenance: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', maintenance.vfd_id);

      res.json({
        success: true,
        message: '✅ Mantenimiento completado',
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // DELETE - Eliminar mantenimiento
  // ===========================
  async delete(req, res) {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('maintenance_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: '✅ Mantenimiento eliminado'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // GET - Estadísticas de mantenimiento
  // ===========================
  async getStats(req, res) {
    try {
      const { data, error } = await supabaseAdmin
        .from('maintenance_records')
        .select('*');

      if (error) throw error;

      const total = data.length;
      const completed = data.filter(m => m.status === 'completed').length;
      const pending = data.filter(m => m.status === 'pending').length;
      const inProgress = data.filter(m => m.status === 'in_progress').length;

      // Agrupar por tipo
      const byType = data.reduce((acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1;
        return acc;
      }, {});

      // Agrupar por prioridad
      const byPriority = data.reduce((acc, m) => {
        acc[m.priority] = (acc[m.priority] || 0) + 1;
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          total,
          completed,
          pending,
          inProgress,
          byType,
          byPriority,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new MaintenanceController();

const { supabaseAdmin } = require('../config/supabase');

class AlertsController {
  // ===========================
  // GET - Todas las alertas
  // ===========================
  async getAll(req, res) {
    try {
      const { data, error } = await supabaseAdmin
        .from('alerts')
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
  // GET - Alertas activas
  // ===========================
  async getActive(req, res) {
    try {
      const { data, error } = await supabaseAdmin
        .from('alerts')
        .select('*, vfds(equipment_id, manufacturer, model)')
        .eq('status', 'active')
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
  // GET - Alertas por VFD
  // ===========================
  async getByVFD(req, res) {
    try {
      const { vfdId } = req.params;

      const { data, error } = await supabaseAdmin
        .from('alerts')
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
  // POST - Crear alerta
  // ===========================
  async create(req, res) {
    try {
      const { vfd_id, type, severity, message, parameter, current_value, threshold_value } = req.body;

      if (!vfd_id || !type || !message) {
        return res.status(400).json({
          success: false,
          error: 'VFD ID, tipo y mensaje son requeridos'
        });
      }

      const alert = {
        vfd_id,
        type,
        severity: severity || 'warning',
        message,
        parameter: parameter || null,
        current_value: current_value || null,
        threshold_value: threshold_value || null,
        status: 'active',
        user_id: req.user.id
      };

      const { data, error } = await supabaseAdmin
        .from('alerts')
        .insert([alert])
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado del VFD si es crítica
      if (severity === 'critical') {
        await supabaseAdmin
          .from('vfds')
          .update({ status: 'alarm' })
          .eq('id', vfd_id);
      }

      res.status(201).json({
        success: true,
        message: '✅ Alerta creada',
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // PUT - Reconocer alerta
  // ===========================
  async acknowledge(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('alerts')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        message: '✅ Alerta reconocida',
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // PUT - Resolver alerta
  // ===========================
  async resolve(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Verificar si hay más alertas activas para este VFD
      const { data: activeAlerts } = await supabaseAdmin
        .from('alerts')
        .select('id')
        .eq('vfd_id', data.vfd_id)
        .eq('status', 'active');

      if (!activeAlerts || activeAlerts.length === 0) {
        await supabaseAdmin
          .from('vfds')
          .update({ status: 'online' })
          .eq('id', data.vfd_id);
      }

      res.json({
        success: true,
        message: '✅ Alerta resuelta',
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new AlertsController();

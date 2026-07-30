const { supabaseAdmin } = require('../config/supabase');

class TelemetryController {
  // ===========================
  // GET - Telemetría por VFD
  // ===========================
  async getByVFD(req, res) {
    try {
      const { vfdId } = req.params;
      const { limit = 100 } = req.query;

      const { data, error } = await supabaseAdmin
        .from('telemetry')
        .select('*')
        .eq('vfd_id', vfdId)
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
  // GET - Última telemetría
  // ===========================
  async getLatest(req, res) {
    try {
      const { vfdId } = req.params;

      const { data, error } = await supabaseAdmin
        .from('telemetry')
        .select('*')
        .eq('vfd_id', vfdId)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error) throw error;

      res.json({
        success: true,
        data: data[0] || null
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // POST - Guardar telemetría
  // ===========================
  async create(req, res) {
    try {
      const { vfd_id, frequency, voltage, current, power, speed, temperature, torque, energy_consumed } = req.body;

      if (!vfd_id) {
        return res.status(400).json({
          success: false,
          error: 'VFD ID es requerido'
        });
      }

      const telemetry = {
        vfd_id,
        frequency: frequency || 0,
        voltage: voltage || 0,
        current: current || 0,
        power: power || 0,
        speed: speed || 0,
        temperature: temperature || 0,
        torque: torque || 0,
        energy_consumed: energy_consumed || 0,
        timestamp: new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin
        .from('telemetry')
        .insert([telemetry])
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado del VFD
      const updates = {
        current_frequency: frequency,
        current_voltage: voltage,
        current_current: current,
        current_power: power,
        current_speed: speed,
        current_temperature: temperature,
        current_torque: torque,
        status: 'online',
        updated_at: new Date().toISOString()
      };

      // Calcular health score
      let healthScore = 100;
      if (temperature > 60) healthScore -= 20;
      else if (temperature > 50) healthScore -= 10;
      if (current > 100) healthScore -= 20;
      else if (current > 85) healthScore -= 10;

      updates.health_score = Math.max(0, Math.min(100, healthScore));

      if (healthScore < 60) updates.risk_level = 'high';
      else if (healthScore < 80) updates.risk_level = 'medium';
      else updates.risk_level = 'low';

      await supabaseAdmin
        .from('vfds')
        .update(updates)
        .eq('id', vfd_id);

      res.status(201).json({
        success: true,
        message: '✅ Telemetría guardada',
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new TelemetryController();

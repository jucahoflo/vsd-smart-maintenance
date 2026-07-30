const { supabaseAdmin } = require('../config/supabase');

class SupabaseService {
  // ===========================
  // VFDs - CRUD
  // ===========================

  async getAllVFDs() {
    const { data, error } = await supabaseAdmin
      .from('vfds')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getVFDById(id) {
    const { data, error } = await supabaseAdmin
      .from('vfds')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getVFDByEquipmentId(equipmentId) {
    const { data, error } = await supabaseAdmin
      .from('vfds')
      .select('*')
      .eq('equipment_id', equipmentId)
      .single();

    if (error) throw error;
    return data;
  }

  async createVFD(vfdData) {
    const { data, error } = await supabaseAdmin
      .from('vfds')
      .insert([vfdData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateVFD(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('vfds')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteVFD(id) {
    const { error } = await supabaseAdmin
      .from('vfds')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  // ===========================
  // MAINTENANCE RECORDS
  // ===========================

  async getMaintenanceByVFD(vfdId) {
    const { data, error } = await supabaseAdmin
      .from('maintenance_records')
      .select('*')
      .eq('vfd_id', vfdId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createMaintenanceRecord(record) {
    const { data, error } = await supabaseAdmin
      .from('maintenance_records')
      .insert([record])
      .select()
      .single();

    if (error) throw error;

    // Actualizar fecha de mantenimiento en VFD
    await this.updateVFDMaintenanceDate(record.vfd_id, record.scheduled_date);

    return data;
  }

  async updateVFDMaintenanceDate(vfdId, nextDate) {
    const { error } = await supabaseAdmin
      .from('vfds')
      .update({ 
        last_maintenance: new Date().toISOString().split('T')[0],
        next_maintenance: nextDate
      })
      .eq('id', vfdId);

    if (error) throw error;
  }

  // ===========================
  // ALERTS
  // ===========================

  async getActiveAlerts() {
    const { data, error } = await supabaseAdmin
      .from('alerts')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getAlertsByVFD(vfdId) {
    const { data, error } = await supabaseAdmin
      .from('alerts')
      .select('*')
      .eq('vfd_id', vfdId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createAlert(alertData) {
    const { data, error } = await supabaseAdmin
      .from('alerts')
      .insert([alertData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async acknowledgeAlert(id) {
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
    return data;
  }

  // ===========================
  // TELEMETRY
  // ===========================

  async getTelemetryByVFD(vfdId, limit = 100) {
    const { data, error } = await supabaseAdmin
      .from('telemetry')
      .select('*')
      .eq('vfd_id', vfdId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async saveTelemetry(telemetryData) {
    const { data, error } = await supabaseAdmin
      .from('telemetry')
      .insert([telemetryData])
      .select()
      .single();

    if (error) throw error;

    // Actualizar estado actual del VFD
    await this.updateVFDStatus(telemetryData.vfd_id, telemetryData);

    return data;
  }

  async updateVFDStatus(vfdId, telemetry) {
    const updates = {
      current_frequency: telemetry.frequency,
      current_voltage: telemetry.voltage,
      current_current: telemetry.current,
      current_power: telemetry.power,
      current_speed: telemetry.speed,
      current_temperature: telemetry.temperature,
      current_torque: telemetry.torque,
      status: 'online',
      updated_at: new Date().toISOString()
    };

    // Calcular health score
    let healthScore = 100;
    if (telemetry.temperature > 60) healthScore -= 20;
    else if (telemetry.temperature > 50) healthScore -= 10;
    
    if (telemetry.current > 100) healthScore -= 20;
    else if (telemetry.current > 85) healthScore -= 10;

    updates.health_score = Math.max(0, Math.min(100, healthScore));

    // Calcular risk level
    if (healthScore < 60) updates.risk_level = 'high';
    else if (healthScore < 80) updates.risk_level = 'medium';
    else updates.risk_level = 'low';

    const { error } = await supabaseAdmin
      .from('vfds')
      .update(updates)
      .eq('id', vfdId);

    if (error) throw error;
  }
}

module.exports = new SupabaseService();

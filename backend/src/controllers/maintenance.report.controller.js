const { supabaseAdmin } = require('../config/supabase');

class MaintenanceReportController {
  // ===========================
  // GET - Todos los reportes
  // ===========================
  async getAll(req, res) {
    try {
      const { data, error } = await supabaseAdmin
        .from('maintenance_reports')
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
  // GET - Reporte por ID
  // ===========================
  async getById(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('maintenance_reports')
        .select('*, vfds(equipment_id, manufacturer, model)')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Obtener fotos asociadas
      const { data: photos } = await supabaseAdmin
        .from('maintenance_photos')
        .select('*')
        .eq('report_id', id)
        .order('created_at');

      res.json({
        success: true,
        data: { ...data, photos: photos || [] }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // GET - Reportes por VFD
  // ===========================
  async getByVFD(req, res) {
    try {
      const { vfdId } = req.params;

      const { data, error } = await supabaseAdmin
        .from('maintenance_reports')
        .select('*')
        .eq('vfd_id', vfdId)
        .order('report_date', { ascending: false });

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
  // POST - Crear reporte
  // ===========================
  async create(req, res) {
    try {
      const {
        vfd_id,
        report_date,
        report_time,
        company,
        location,
        base,
        area,
        process,
        well,
        service_ticket,
        maintenance_type,
        vsd_brand,
        vsd_model,
        vsd_serial,
        vsd_kva,
        vsd_amps,
        sut_brand,
        sut_model,
        sut_serial,
        sut_kva,
        sut_amps,
        checklist,
        static_tests,
        activities,
        parts_changed,
        conclusions,
        recommendations,
        technician_name,
        supervisor_name,
        status
      } = req.body;

      // Generar número de reporte
      const reportNumber = `RPT-${Date.now().toString().slice(-6)}`;

      const report = {
        report_number: reportNumber,
        vfd_id,
        report_date: report_date || new Date().toISOString().split('T')[0],
        report_time: report_time || new Date().toTimeString().slice(0,5),
        company: company || '',
        location: location || '',
        base: base || '',
        area: area || '',
        process: process || '',
        well: well || '',
        service_ticket: service_ticket || '',
        maintenance_type: maintenance_type || 'Preventivo',
        vsd_brand: vsd_brand || '',
        vsd_model: vsd_model || '',
        vsd_serial: vsd_serial || '',
        vsd_kva: vsd_kva || 0,
        vsd_amps: vsd_amps || 0,
        sut_brand: sut_brand || '',
        sut_model: sut_model || '',
        sut_serial: sut_serial || '',
        sut_kva: sut_kva || 0,
        sut_amps: sut_amps || 0,
        checklist: checklist || [],
        static_tests: static_tests || [],
        activities: activities || '',
        parts_changed: parts_changed || [],
        conclusions: conclusions || '',
        recommendations: recommendations || '',
        technician_name: technician_name || '',
        supervisor_name: supervisor_name || '',
        status: status || 'draft',
        user_id: req.user.id
      };

      const { data, error } = await supabaseAdmin
        .from('maintenance_reports')
        .insert([report])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        message: '✅ Reporte de mantenimiento creado',
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // PUT - Actualizar reporte
  // ===========================
  async update(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('maintenance_reports')
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
        message: '✅ Reporte actualizado',
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // DELETE - Eliminar reporte
  // ===========================
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Eliminar fotos asociadas
      await supabaseAdmin
        .from('maintenance_photos')
        .delete()
        .eq('report_id', id);

      const { error } = await supabaseAdmin
        .from('maintenance_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: '✅ Reporte eliminado'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // POST - Agregar foto al reporte
  // ===========================
  async addPhoto(req, res) {
    try {
      const { report_id, image_url, description, type } = req.body;

      const { data, error } = await supabaseAdmin
        .from('maintenance_photos')
        .insert([{ report_id, image_url, description, type }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        message: '✅ Foto agregada',
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // DELETE - Eliminar foto
  // ===========================
  async deletePhoto(req, res) {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('maintenance_photos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: '✅ Foto eliminada'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new MaintenanceReportController();

const { supabaseAdmin } = require('../config/supabase');

class VFDController {
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
      console.error('Error en getAll:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('vfds')
        .select('*')
        .or(`id.eq.${id},equipment_id_simple.eq.${id}`)
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
      console.error('Error en getById:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async create(req, res) {
    try {
      const año = new Date().getFullYear();
      
      // Obtener el último código para este año
      const { data: lastVFD, error: lastError } = await supabaseAdmin
        .from('vfds')
        .select('codigo')
        .like('codigo', `VSD-${año}-%`)
        .order('codigo', { ascending: false })
        .limit(1);

      let consecutivo = 1;
      if (lastVFD && lastVFD.length > 0 && lastVFD[0].codigo) {
        const parts = lastVFD[0].codigo.split('-');
        if (parts.length === 3) {
          const lastNum = parseInt(parts[2]);
          if (!isNaN(lastNum)) {
            consecutivo = lastNum + 1;
          }
        }
      }

      const codigo = `VSD-${año}-${String(consecutivo).padStart(3, '0')}`;

      const vfdData = {
        ...req.body,
        codigo,
        user_id: req.user?.id || null
      };

      // ✅ EL equipment_id_simple se genera automáticamente por el trigger
      // ✅ equipment_id se genera automáticamente por el trigger

      if (vfdData.serial_number === '') delete vfdData.serial_number;
      if (vfdData.power_rating === '') delete vfdData.power_rating;
      if (vfdData.voltage_rating === '') delete vfdData.voltage_rating;
      if (vfdData.kva === '') delete vfdData.kva;

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
      console.error('Error en create:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;

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
      console.error('Error en update:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

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
      console.error('Error en delete:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // ✅ BUSCAR VFD POR CÓDIGO SIMPLE (V001, V002...)
  // ===========================
  async buscarPorCodigoSimple(req, res) {
    try {
      const { codigo } = req.params;

      const { data, error } = await supabaseAdmin
        .from('vfds')
        .select('*')
        .eq('equipment_id_simple', codigo.toUpperCase())
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          error: `No se encontró VFD con código ${codigo}`
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en buscarPorCodigoSimple:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // ✅ BUSCAR VFD POR CÓDIGO (VSD-2024-001)
  // ===========================
  async buscarPorCodigo(req, res) {
    try {
      const { codigo } = req.params;

      const { data, error } = await supabaseAdmin
        .from('vfds')
        .select('*')
        .eq('codigo', codigo)
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          error: `No se encontró VFD con código ${codigo}`
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error en buscarPorCodigo:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // ✅ REPORTE COMPLETO POR CÓDIGO SIMPLE
  // ===========================
  async getReporteCompleto(req, res) {
    try {
      const { codigo } = req.params;

      const { data: vfd, error } = await supabaseAdmin
        .from('vfds')
        .select('*')
        .eq('equipment_id_simple', codigo.toUpperCase())
        .single();

      if (error || !vfd) {
        return res.status(404).json({
          success: false,
          error: `No se encontró VFD con código ${codigo}`
        });
      }

      const { data: mantenimientos } = await supabaseAdmin
        .from('maintenance_records')
        .select('*')
        .eq('vfd_id', vfd.id)
        .order('created_at', { ascending: false });

      const { data: inventario } = await supabaseAdmin
        .from('inventory')
        .select('*')
        .eq('vfd_id', vfd.id);

      const { data: alertas } = await supabaseAdmin
        .from('alerts')
        .select('*')
        .eq('vfd_id', vfd.id)
        .order('created_at', { ascending: false });

      res.json({
        success: true,
        data: {
          vfd,
          mantenimientos: mantenimientos || [],
          inventario: inventario || [],
          alertas: alertas || [],
          total_mantenimientos: mantenimientos?.length || 0
        }
      });
    } catch (error) {
      console.error('Error en getReporteCompleto:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

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
      console.error('Error en getTelemetry:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

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
      console.error('Error en getMaintenance:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

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
      console.error('Error en getAlerts:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new VFDController();

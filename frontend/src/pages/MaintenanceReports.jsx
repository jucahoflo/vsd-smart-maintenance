// ... (todo el código igual, solo cambiamos el handleSave)

const handleSave = async () => {
  try {
    // ✅ VERIFICAR QUE VFD_ID EXISTA
    if (!formData.vfd_id) {
      showSnackbar('❌ Primero busca y selecciona un VFD válido', 'error');
      return;
    }

    // ✅ VERIFICAR QUE VFD_CODIGO EXISTA
    if (!formData.vfd_codigo) {
      showSnackbar('❌ El código del VFD es requerido', 'error');
      return;
    }

    const dataToSend = {
      vfd_id: formData.vfd_id,
      vfd_codigo: formData.vfd_codigo,
      report_date: formData.report_date,
      report_time: formData.report_time,
      company: formData.company || null,
      location: formData.location || null,
      base: formData.base || null,
      area: formData.area || null,
      process: formData.process || null,
      well: formData.well || null,
      service_ticket: formData.service_ticket || null,
      maintenance_type: formData.maintenance_type || 'Preventivo',
      vsd_brand: formData.vsd_brand || null,
      vsd_model: formData.vsd_model || null,
      vsd_serial: formData.vsd_serial || null,
      vsd_kva: formData.vsd_kva ? parseFloat(formData.vsd_kva) : null,
      vsd_amps: formData.vsd_amps ? parseFloat(formData.vsd_amps) : null,
      sut_brand: formData.sut_brand || null,
      sut_model: formData.sut_model || null,
      sut_serial: formData.sut_serial || null,
      sut_kva: formData.sut_kva ? parseFloat(formData.sut_kva) : null,
      sut_amps: formData.sut_amps ? parseFloat(formData.sut_amps) : null,
      checklist: formData.checklist || [],
      activities: formData.activities || null,
      parts_changed: formData.parts_changed || [],
      conclusions: formData.conclusions || null,
      recommendations: formData.recommendations || null,
      technician_name: formData.technician_name || null,
      supervisor_name: formData.supervisor_name || null,
      status: formData.status || 'draft',
      fecha_registro: formData.fecha_registro || new Date().toISOString().split('T')[0]
    };

    // ✅ ELIMINAR CAMPOS VACÍOS
    Object.keys(dataToSend).forEach(key => {
      if (dataToSend[key] === '' || dataToSend[key] === null || dataToSend[key] === undefined) {
        delete dataToSend[key];
      }
    });

    console.log('📤 Datos a guardar:', dataToSend);

    if (editing) {
      const { error } = await supabase
        .from('maintenance_reports')
        .update(dataToSend)
        .eq('id', editing.id);
      if (error) throw error;
      showSnackbar('✅ Reporte actualizado');
    } else {
      const { error } = await supabase
        .from('maintenance_reports')
        .insert([dataToSend]);
      if (error) throw error;
      showSnackbar('✅ Reporte creado');
    }
    handleClose();
    loadData();
  } catch (error) {
    console.error('❌ Error al guardar:', error);
    showSnackbar(error.message || 'Error al guardar', 'error');
  }
};

// ... (resto del código)

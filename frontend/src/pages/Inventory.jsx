// ... (resto del código)

const buscarVFDporCodigo = async (codigo) => {
  // ✅ Validar formato VXXX (V + 3 dígitos)
  const codigoValido = /^V\d{3}$/.test(codigo.toUpperCase());
  
  if (!codigoValido) {
    setVfdEncontrado(null);
    return;
  }

  setSearching(true);
  try {
    const { data, error } = await supabase
      .from('vfds')
      .select('*')
      .eq('equipment_id_simple', codigo.toUpperCase())
      .single();

    if (error) {
      setVfdEncontrado(null);
      setFormData(prev => ({ ...prev, vfd_id: '', vfd_codigo: '' }));
      showSnackbar(`❌ No se encontró VFD con código ${codigo}`, 'warning');
    } else if (data) {
      setVfdEncontrado(data);
      setFormData(prev => ({ 
        ...prev, 
        vfd_id: data.id,
        vfd_codigo: data.equipment_id_simple 
      }));
      showSnackbar(`✅ VFD encontrado: ${data.equipment_id_simple} - ${data.manufacturer || 'Sin fabricante'}`, 'success');
    }
  } catch (error) {
    console.error('Error buscando VFD:', error);
    setVfdEncontrado(null);
    setFormData(prev => ({ ...prev, vfd_id: '', vfd_codigo: '' }));
    showSnackbar(`❌ No se encontró VFD con código ${codigo}`, 'warning');
  } finally {
    setSearching(false);
  }
};

// ... (resto del código)

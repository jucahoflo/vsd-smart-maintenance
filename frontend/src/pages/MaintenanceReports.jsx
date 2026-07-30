// ... (todo el código igual, solo cambiamos el onChange)

// ✅ AGREGAR UN TIMEOUT PARA ESPERAR QUE TERMINE DE ESCRIBIR
let searchTimeout = null;

// ... (dentro del componente)

// ✅ NUEVA FUNCIÓN CON DEBOUNCE
const handleCodigoChange = (e) => {
  const value = e.target.value.toUpperCase();
  setFormData({...formData, vfd_codigo: value});
  
  // Limpiar timeout anterior
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  // Solo buscar si tiene al menos 3 caracteres
  if (value.length >= 3) {
    // Esperar 500ms después de que deje de escribir
    searchTimeout = setTimeout(() => {
      buscarVFDporCodigo(value);
    }, 500);
  } else {
    setVfdEncontrado(null);
  }
};

// ... (en el TextField)
<TextField
  fullWidth
  label="🔑 Código del VFD (ej: V001)"
  value={formData.vfd_codigo}
  onChange={handleCodigoChange}  // ✅ USAR LA NUEVA FUNCIÓN
  placeholder="Ingresa el código del VFD (ej: V001)"
  helperText={vfdEncontrado ? `✅ ${vfdEncontrado.equipment_id_simple} - ${vfdEncontrado.manufacturer || 'Sin fabricante'}` : 'Escribe V001, V002, etc.'}
  disabled={searching}
/>

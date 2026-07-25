export const maintenanceSchema = {
  _id: null,
  vsdId: '',
  tipo: '',
  titulo: '',
  descripcion: '',
  fechaProgramada: null,
  fechaEjecucion: null,
  prioridad: '',
  estado: '',
  tecnico: '',
  costo: 0,
  duracion: 0,
  observaciones: '',
  
  // ============ NUEVOS CAMPOS PARA REPORTE PROFESIONAL ============
  
  // 1. Información General
  compania: '',
  cliente: '',
  locacion: '',
  pozo: '',
  area: '',
  proceso: '',
  serviceTicket: '',
  
  // 2. Objetivo General
  objetivoGeneral: '',
  
  // 3. Equipos de Superficie
  equipos: {
    vsd: { marca: '', modelo: '', serie: '', kva: '', amps: '' },
    sut: { marca: '', modelo: '', serie: '', kva: '', amps: '' }
  },
  
  // 4. Lista de Chequeo
  listaChequeo: [
    // { actividad: '', hecho: false, observacion: '', categoria: '' }
  ],
  
  // 5. Actividades Realizadas (texto amplio)
  actividadesRealizadas: '',
  
  // 6. Pruebas Estáticas
  pruebasEstaticas: {
    conversor: [
      // { medicion: '', esperado: '', actual: '' }
    ],
    inversor: [
      // { medicion: '', esperado: '', actual: '' }
    ]
  },
  
  // 7. Evidencia Fotográfica
  evidencias: [], // URLs de imágenes base64
  
  // 8. Accesorios Cambiados
  accesoriosCambiados: [
    // { cantidad: 0, codigoSap: '', detalle: '', reserva: '' }  // CAMBIO: "reserva" en lugar de "total"
  ],
  
  // 9. Conclusiones y Recomendaciones
  conclusiones: '',
  recomendaciones: '',
  
  // 10. Firma del Técnico
  firmaTecnico: {
    nombre: '',
    cargo: '',
    telefono: '',
    correo: '',
    fecha: null
  },
  
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
};
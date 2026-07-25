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
  
  compania: '',
  cliente: '',
  locacion: '',
  pozo: '',
  area: '',
  proceso: '',
  serviceTicket: '',
  objetivoGeneral: '',
  
  equipos: {
    vsd: { marca: '', modelo: '', serie: '', kva: '', amps: '' },
    sut: { marca: '', modelo: '', serie: '', kva: '', amps: '' }
  },
  
  listaChequeo: [],
  actividadesRealizadas: '',
  
  pruebasEstaticas: {
    conversor: [],
    inversor: []
  },
  
  evidencias: [],
  accesoriosCambiados: [],
  conclusiones: '',
  recomendaciones: '',
  
  firmaTecnico: {
    nombre: '',
    cargo: '',
    telefono: '',
    correo: '',
    fecha: null,
    firmaDigital: null  // NUEVO: firma digital
  },

  registroFotografico: {
    antes: [],
    despues: []
  },
  
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
};
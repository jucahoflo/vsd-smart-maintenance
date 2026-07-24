export const partSchema = {
  _id: null,
  vsdId: '',
  nombre: '',
  codigo: '',
  descripcion: '',
  categoria: '',
  cantidad: 0,
  ubicacion: '',
  proveedor: '',
  precio: 0,
  imagen: null, // <-- AGREGADO: URL o base64 de la imagen
  notas: '',
  fechaRegistro: new Date(),
  ultimaActualizacion: new Date()
};
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ===========================
// REPORTE DE VFDs
// ===========================
export const generateVFDReport = (vfds) => {
  const doc = new jsPDF('landscape');
  
  // Título
  doc.setFontSize(18);
  doc.text('📊 Reporte de VFDs', 14, 20);
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Total: ${vfds.length} variadores`, 14, 36);

  // Tabla
  const headers = [['ID', 'Fabricante', 'Modelo', 'Potencia', 'Voltaje', 'KVA', 'Estado', 'Health']];
  const rows = vfds.map(v => [
    v.equipment_id,
    v.manufacturer,
    v.model,
    `${v.power_rating || 0} kW`,
    `${v.voltage_rating || 0} V`,
    v.kva || '--',
    v.status,
    `${v.health_score || 0}%`
  ]);

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 45,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [108, 99, 255] }
  });

  // Guardar
  doc.save('reporte_vfds.pdf');
};

// ===========================
// REPORTE DE MANTENIMIENTO
// ===========================
export const generateMaintenanceReport = (records, vfds) => {
  const doc = new jsPDF('landscape');
  
  doc.setFontSize(18);
  doc.text('🔧 Reporte de Mantenimiento', 14, 20);
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Total: ${records.length} mantenimientos`, 14, 36);

  const headers = [['VFD', 'Tipo', 'Prioridad', 'Estado', 'Fecha', 'Técnico', 'Costo']];
  const rows = records.map(r => {
    const vfd = vfds.find(v => v.id === r.vfd_id);
    return [
      vfd?.equipment_id || r.vfd_id,
      r.type,
      r.priority,
      r.status,
      r.scheduled_date ? new Date(r.scheduled_date).toLocaleDateString() : '--',
      r.technician || '--',
      r.cost ? `$${r.cost}` : '--'
    ];
  });

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 45,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [255, 107, 107] }
  });

  doc.save('reporte_mantenimiento.pdf');
};

// ===========================
// REPORTE DE INVENTARIO
// ===========================
export const generateInventoryReport = (items) => {
  const doc = new jsPDF('landscape');
  
  doc.setFontSize(18);
  doc.text('📦 Reporte de Inventario', 14, 20);
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Total: ${items.length} items`, 14, 36);

  const headers = [['Part Number', 'Nombre', 'Categoría', 'Cantidad', 'Mínimo', 'Proveedor', 'Precio']];
  const rows = items.map(item => [
    item.part_number,
    item.name,
    item.category || '--',
    item.quantity,
    item.min_quantity,
    item.supplier || '--',
    item.price ? `$${item.price}` : '--'
  ]);

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 45,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 184, 148] }
  });

  doc.save('reporte_inventario.pdf');
};

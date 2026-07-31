import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateMaintenancePDF = async (vsdData, maintenanceData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // COLORES CORPORATIVOS EXACTOS
  const primaryColor = [0, 51, 102];     // Azul oscuro INEMEC
  const secondaryColor = [200, 30, 30];  // Rojo INEMEC

  // --- CABECERA ---
  let yPos = 10;

  // LOGO
  try {
    doc.addImage('/images/logo-inemec.png', 'PNG', 15, yPos, 30, 15);
  } catch (error) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('INEMEC', 15, yPos + 10);
  }

  // TÍTULO PRINCIPAL
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('REPORTE FINAL DE MANTENIMIENTO', pageWidth / 2, yPos + 5, { align: 'center' });

  // LÍNEA SEPARADORA (Roja)
  doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(15, yPos + 10, pageWidth - 15, yPos + 10);

  yPos = 35;

  // --- 1. INFORMACIÓN GENERAL ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('1. INFORMACIÓN GENERAL', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const generalInfo = [
    ['Compañía:', 'INEMEC S.A.S'],
    ['Tipo Mantenimiento:', maintenanceData.tipo || 'Preventivo'],
    ['Cliente:', 'CEDCO'],
    ['Fecha Ejecución:', new Date(maintenanceData.created_at).toLocaleDateString()],
    ['Locación:', vsdData.site || 'N/A'],
    ['Técnico:', maintenanceData.tecnico || 'JUAN CARLOS HOLGUIN'],
    ['Pozo:', vsdData.plant || 'N/A'],
    ['Service Ticket:', 'N/A']
  ];

  doc.autoTable({
    startY: yPos,
    body: generalInfo,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold' }, 1: { cellWidth: 130 } },
    margin: { left: 15, right: 15 },
    tableWidth: 'auto',
    styles: { fontSize: 10 }
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // --- 2. OBJETIVO GENERAL ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('2. OBJETIVO GENERAL', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const objetivoText = doc.splitTextToSize(
    "AUMENTAR LA CONFIABILIDAD Y VIDA ÚTIL DE LOS EQUIPOS A TRAVÉS DE LA DETECCIÓN TEMPRANA DE ANOMALÍAS Y LA EJECUCIÓN DE ACCIONES CORRECTIVAS Y PREVENTIVAS.",
    pageWidth - 30
  );
  doc.text(objetivoText, 15, yPos);
  yPos += (objetivoText.length * 5) + 5;

  // --- 3. EQUIPOS DE SUPERFICIE ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('3. EQUIPOS DE SUPERFICIE', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const equiposData = [
    ['Equipo', 'Marca', 'Modelo', 'S/N', 'KVA', 'AMPS'],
    ['VSD', vsdData.manufacturer || 'N/A', vsdData.model || 'N/A', vsdData.serial_number || 'N/A', vsdData.kva || 'N/A', 'N/A'],
    ['SUT', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A']
  ];

  doc.autoTable({
    startY: yPos,
    head: [equiposData[0]],
    body: equiposData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: 15, right: 15 },
    tableWidth: 'auto',
    styles: { fontSize: 10 }
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // --- 4. LISTA DE CHEQUEO ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('4. LISTA DE CHEQUEO', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const checklistItems = maintenanceData.checklist?.shelter_skid || [];
  const cbmItems = maintenanceData.checklist?.cbm_vsd || [];
  const allItems = [...checklistItems, ...cbmItems];

  if (allItems.length > 0) {
    const tableData = allItems.map(item => [
      item.label,
      item.done ? 'X' : '',
      item.anomaly || '',
      item.observations || ''
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Actividad', 'Hecho (X)', 'Anomalías', 'Observaciones']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontSize: 9 },
      columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 20, halign: 'center' }, 2: { cellWidth: 40 }, 3: { cellWidth: 40 } },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 9 }
    });
    yPos = doc.lastAutoTable.finalY + 10;
  } else {
    doc.text('No hay checklist registrado para este mantenimiento.', 15, yPos);
    yPos += 7;
  }

  // --- 5. PRUEBAS ESTÁTICAS ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('5. PRUEBAS ESTÁTICAS', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  if (maintenanceData.checklist?.static_tests) {
    const staticTests = maintenanceData.checklist.static_tests;
    
    // Conversor
    const testData = staticTests.converter_1?.map(row => [
      row.meter_plus + ' / ' + row.meter_minus, 
      row.expected, 
      row.actual
    ]) || [];

    doc.autoTable({
      startY: yPos,
      head: [['Medición', 'Esperado', 'Actual']],
      body: testData,
      theme: 'striped',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 40 }, 2: { cellWidth: 40 } },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 10 }
    });
    yPos = doc.lastAutoTable.finalY + 10;
  }

  // --- 6. ACCESORIOS CAMBIADOS ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('6. ACCESORIOS CAMBIADOS', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const materials = maintenanceData.checklist?.materials || [];
  if (materials.length > 0) {
    const materialsData = materials.map(item => [
      item.quantity || 0,
      item.sap_code || '-',
      item.detail || '-',
      item.reserve || '-'
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Cant.', 'Código SAP', 'Detalle', 'Reserva']],
      body: materialsData,
      theme: 'striped',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontSize: 9 },
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 30 }, 2: { cellWidth: 80 }, 3: { cellWidth: 30 } },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 9 }
    });
    yPos = doc.lastAutoTable.finalY + 10;
  } else {
    doc.text('No se registraron accesorios cambiados.', 15, yPos);
    yPos += 7;
  }

  // --- 7. FIRMA DEL TÉCNICO ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('7. FIRMA DEL TÉCNICO', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  doc.text(`Nombre: ${maintenanceData.tecnico || 'JUAN CARLOS HOLGUIN'}`, 15, yPos);
  yPos += 5;
  doc.text('Cargo: Variable Speed Drive Specialist', 15, yPos);
  yPos += 5;
  doc.text('Teléfono: N/A', 15, yPos);
  yPos += 5;
  doc.text('Correo: N/A', 15, yPos);
  yPos += 15;
  
  // Línea de firma
  doc.setDrawColor(0, 0, 0);
  doc.line(15, yPos, 60, yPos);
  yPos += 5;
  doc.text('Firma del Técnico', 15, yPos);

  // Guardar el PDF
  doc.save(`Reporte_${vsdData.codigo_vsd}_${Date.now()}.pdf`);
};

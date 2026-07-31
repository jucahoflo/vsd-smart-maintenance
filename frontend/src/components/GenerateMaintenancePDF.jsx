import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateMaintenancePDF = async (vsdData, maintenanceData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // COLORES DEL DISEÑO OBJETIVO
  const darkGray = [51, 51, 51];      // Gris oscuro del encabezado y tablas
  const white = [255, 255, 255];      // Blanco
  const lightGray = [240, 240, 240];  // Gris claro para alternar filas
  const black = [0, 0, 0];
  const redInemec = [200, 30, 30];

  // 1. ENCABEZADO OSCURO (Banda superior completa)
  doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // 1.1 LOGO (Dentro del encabezado, fondo blanco para que resalte)
  doc.setFillColor(255, 255, 255);
  doc.rect(10, 5, 30, 30, 'F');
  try {
    doc.addImage('/images/logo-inemec.png', 'PNG', 12, 7, 26, 26);
  } catch (error) {
    doc.setTextColor(redInemec[0], redInemec[1], redInemec[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INEMEC', 15, 20);
  }

  // 1.2 FECHA Y HORA (Esquina superior derecha)
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${dateStr}`, pageWidth - 35, 12);
  doc.text(`Hora: ${timeStr}`, pageWidth - 35, 18);

  // 1.3 TÍTULO PRINCIPAL (Centrado en el encabezado)
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text('REPORTE DE MANTENIMIENTO', pageWidth / 2, 32, { align: 'center' });

  // 1.4 SUBTÍTULO (Sistema)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('VSD SMART MAINTENANCE SYSTEM', pageWidth / 2, 38, { align: 'center' });

  // 2. INICIO DEL CUERPO DEL DOCUMENTO
  let yPos = 55;

  // Línea separadora sutil debajo del encabezado
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 5;

  // 2.1 INFORMACIÓN GENERAL (Sección 1 - Estilo 2 Columnas)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('1. INFORMACIÓN GENERAL', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black[0], black[1], black[2]);

  // Columna Izquierda
  const leftColX = 15;
  const rightColX = pageWidth / 2 + 10;
  const lineHeight = 7;

  // Datos Columna Izquierda
  doc.setFont('helvetica', 'bold');
  doc.text('Compañía:', leftColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text('INEMEC S.A.S', leftColX + 35, yPos);
  yPos += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Cliente:', leftColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text('CEDCO', leftColX + 35, yPos);
  yPos += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Locación:', leftColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(vsdData.site || 'N/A', leftColX + 35, yPos);
  yPos += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Pozo:', leftColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(vsdData.plant || 'N/A', leftColX + 35, yPos);
  yPos += lineHeight;

  // Reset yPos para la columna derecha (partiendo desde la misma altura inicial)
  let rightY = yPos - (lineHeight * 4);

  // Datos Columna Derecha
  doc.setFont('helvetica', 'bold');
  doc.text('Tipo Mantenimiento:', rightColX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(maintenanceData.tipo || 'Preventivo', rightColX + 50, rightY);
  rightY += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Fecha Ejecución:', rightColX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(maintenanceData.created_at).toLocaleDateString(), rightColX + 50, rightY);
  rightY += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Técnico:', rightColX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(maintenanceData.tecnico || 'Especialistas Inemec', rightColX + 50, rightY);
  rightY += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Service Ticket:', rightColX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text('N/A', rightColX + 50, rightY);
  rightY += lineHeight;

  // Establecer yPos final para la siguiente sección (el más bajo de las dos columnas)
  yPos = Math.max(yPos, rightY) + 10;

  // 2.2 OBJETIVO GENERAL (Sección 2)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('2. OBJETIVO GENERAL', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black[0], black[1], black[2]);
  
  const objetivoText = doc.splitTextToSize(
    "Este documento tiene como propósito orientar las actividades de mantenimiento realizadas por los especialistas de INEMEC en variadores de velocidad (VSD) de baja y media tensión, así como en los transformadores elevadores (SUT) asociados a estos sistemas, con el fin de preservar su confiabilidad, disponibilidad y desempeño operativo. La aplicación de las buenas prácticas aquí descritas contribuye a extender la vida útil de los equipos, disminuir la probabilidad de fallas imprevistas, reducir los tiempos de indisponibilidad y optimizar los costos derivados de reparaciones no planificadas, favoreciendo una operación segura, continua y eficiente.",
    pageWidth - 30
  );
  doc.text(objetivoText, 15, yPos);
  yPos += (objetivoText.length * 5) + 5;

  // 2.3 EQUIPOS DE SUPERFICIE (Sección 3 - Tabla con estilo gris oscuro)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('3. EQUIPOS DE SUPERFICIE', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black[0], black[1], black[2]);

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
    headStyles: { fillColor: darkGray, textColor: white, fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 9, halign: 'center' },
    columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 25 }, 2: { cellWidth: 25 }, 3: { cellWidth: 30 }, 4: { cellWidth: 20 }, 5: { cellWidth: 20 } },
    margin: { left: 15, right: 15 }
  });
  yPos = doc.lastAutoTable.finalY + 10;

  // 2.4 LISTA DE CHEQUEO (Sección 4)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('4. LISTA DE CHEQUEO', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black[0], black[1], black[2]);

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
      headStyles: { fillColor: darkGray, textColor: white, fontSize: 9 },
      columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 20, halign: 'center' }, 2: { cellWidth: 40 }, 3: { cellWidth: 40 } },
      margin: { left: 15, right: 15 },
      alternateRowStyles: { fillColor: lightGray },
      styles: { fontSize: 9 }
    });
    yPos = doc.lastAutoTable.finalY + 10;
  } else {
    doc.text('No hay checklist registrado para este mantenimiento.', 15, yPos);
    yPos += 7;
  }

  // 2.5 PRUEBAS ESTÁTICAS (Sección 5)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('5. PRUEBAS ESTÁTICAS', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black[0], black[1], black[2]);

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
      headStyles: { fillColor: darkGray, textColor: white },
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 40 }, 2: { cellWidth: 40 } },
      margin: { left: 15, right: 15 },
      alternateRowStyles: { fillColor: lightGray },
      styles: { fontSize: 10 }
    });
    yPos = doc.lastAutoTable.finalY + 10;
  }

  // 2.6 ACCESORIOS CAMBIADOS (Sección 6)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('6. ACCESORIOS CAMBIADOS', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black[0], black[1], black[2]);

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
      headStyles: { fillColor: darkGray, textColor: white, fontSize: 9 },
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 30 }, 2: { cellWidth: 80 }, 3: { cellWidth: 30 } },
      margin: { left: 15, right: 15 },
      alternateRowStyles: { fillColor: lightGray },
      styles: { fontSize: 9 }
    });
    yPos = doc.lastAutoTable.finalY + 10;
  } else {
    doc.text('No se registraron accesorios cambiados.', 15, yPos);
    yPos += 7;
  }

  // 2.7 FIRMA DEL TÉCNICO (Sección 7)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('7. FIRMA DEL TÉCNICO', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black[0], black[1], black[2]);

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

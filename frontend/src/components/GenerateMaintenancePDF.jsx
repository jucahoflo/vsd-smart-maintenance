import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Función para convertir imagen a Base64
const imageToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Error al convertir imagen a Base64:', error);
    return null;
  }
};

export const generateMaintenancePDF = async (vsdData, maintenanceData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // COLORES CORPORATIVOS
  const darkGray = [51, 51, 51];
  const white = [255, 255, 255];
  const lightGray = [240, 240, 240];
  const black = [0, 0, 0];
  const redInemec = [200, 30, 30];

  // --- 1. ENCABEZADO OSCURO ---
  doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // --- 2. LOGO ---
  let logoAdded = false;
  try {
    const logoBase64 = await imageToBase64('/images/inemec-logo.png');
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 10, 5, 30, 30);
      logoAdded = true;
    }
  } catch (error) {
    console.warn('Logo no cargado, usando texto alternativo');
  }

  if (!logoAdded) {
    doc.setFillColor(255, 255, 255);
    doc.rect(10, 5, 30, 30, 'F');
    doc.setTextColor(redInemec[0], redInemec[1], redInemec[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INEMEC', 15, 20);
  }

  // --- 3. FECHA Y HORA ---
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${dateStr}`, pageWidth - 35, 12);
  doc.text(`Hora: ${timeStr}`, pageWidth - 35, 18);

  // --- 4. TÍTULO PRINCIPAL ---
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text('REPORTE DE MANTENIMIENTO', pageWidth / 2, 32, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('VSD SMART MAINTENANCE SYSTEM', pageWidth / 2, 38, { align: 'center' });

  let yPos = 55;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 8;

  // ==========================================
  // 1. INFORMACIÓN GENERAL (VSD + MANTENIMIENTO)
  // ==========================================
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('1. INFORMACIÓN GENERAL', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black[0], black[1], black[2]);

  const leftColX = 15;
  const rightColX = pageWidth / 2 + 10;
  const lineHeight = 7;

  let leftY = yPos;
  doc.setFont('helvetica', 'bold');
  doc.text('Compañía:', leftColX, leftY);
  doc.setFont('helvetica', 'normal');
  doc.text('INEMEC S.A.S', leftColX + 35, leftY);
  leftY += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Cliente:', leftColX, leftY);
  doc.setFont('helvetica', 'normal');
  doc.text('CEDCO', leftColX + 35, leftY);
  leftY += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Locación:', leftColX, leftY);
  doc.setFont('helvetica', 'normal');
  doc.text(vsdData.site || 'N/A', leftColX + 35, leftY);
  leftY += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Pozo:', leftColX, leftY);
  doc.setFont('helvetica', 'normal');
  doc.text(vsdData.plant || 'N/A', leftColX + 35, leftY);
  leftY += lineHeight;

  let rightY = yPos;
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

  yPos = Math.max(leftY, rightY) + 12;

  // ==========================================
  // 2. DATOS TÉCNICOS DEL VSD
  // ==========================================
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('2. DATOS TÉCNICOS DEL VSD', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black[0], black[1], black[2]);

  const tecnicosData = [
    ['Marca', vsdData.manufacturer || 'N/A', 'Modelo', vsdData.model || 'N/A'],
    ['Serial Number', vsdData.serial_number || 'N/A', 'KVA', vsdData.kva || 'N/A'],
    ['Voltaje (V)', vsdData.voltage_rating || 'N/A', 'Departamento', vsdData.department || 'N/A'],
    ['Health Score', `${vsdData.health_score || 100}%`, 'Observaciones', vsdData.observations || 'N/A']
  ];

  doc.autoTable({
    startY: yPos,
    body: tecnicosData,
    theme: 'grid',
    headStyles: { fillColor: darkGray, textColor: white, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 30, fontStyle: 'bold' }, 1: { cellWidth: 50 }, 2: { cellWidth: 30, fontStyle: 'bold' }, 3: { cellWidth: 50 } },
    margin: { left: 15, right: 15 },
    styles: { fontSize: 9 }
  });
  yPos = doc.lastAutoTable.finalY + 12;

  // ==========================================
  // 3. IMÁGENES DEL VSD (Inmediatamente después de la tabla técnica)
  // ==========================================
  const vsdImages = [vsdData.image_url_1, vsdData.image_url_2, vsdData.image_url_3].filter(url => url);

  if (vsdImages.length > 0) {
    // Verificar si hay espacio suficiente en la misma página
    if (yPos > 220) {
      doc.addPage();
      yPos = 15;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text('3. REGISTRO FOTOGRÁFICO DEL VSD', 15, yPos);
    yPos += 8;

    let imgY = yPos;
    for (let i = 0; i < vsdImages.length; i++) {
      const base64 = await imageToBase64(vsdImages[i]);
      if (base64) {
        const imgWidth = 55;
        const xPos = 15 + (i * (imgWidth + 8));
        doc.addImage(base64, 'JPEG', xPos, imgY, imgWidth, 40);
      } else {
        doc.setFontSize(8);
        doc.setTextColor(redInemec[0], redInemec[1], redInemec[2]);
        doc.text('Sin imagen', 15 + (i * 60), imgY + 20);
      }
    }
    yPos += 45;
  }

  // ==========================================
  // 4. OBJETIVO GENERAL
  // ==========================================
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('4. OBJETIVO GENERAL', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black[0], black[1], black[2]);

  const objetivoTexto = maintenanceData.conclusiones || maintenanceData.observations || 
    "Aumentar la confiabilidad y vida útil de los equipos mediante la detección temprana de anomalías y la ejecución de acciones correctivas y preventivas.";
  const objetivoLines = doc.splitTextToSize(objetivoTexto, pageWidth - 30);
  doc.text(objetivoLines, 15, yPos);
  yPos += (objetivoLines.length * 5) + 5;

  // ==========================================
  // 5. EQUIPOS DE SUPERFICIE
  // ==========================================
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('5. EQUIPOS DE SUPERFICIE', 15, yPos);
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
  yPos = doc.lastAutoTable.finalY + 12;

  // ==========================================
  // 6. LISTA DE CHEQUEO
  // ==========================================
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('6. LISTA DE CHEQUEO', 15, yPos);
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
    yPos = doc.lastAutoTable.finalY + 12;
  } else {
    doc.text('No hay checklist registrado para este mantenimiento.', 15, yPos);
    yPos += 7;
  }

  // ==========================================
  // 7. ACTIVIDADES REALIZADAS
  // ==========================================
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('7. ACTIVIDADES REALIZADAS', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black[0], black[1], black[2]);

  const actividadesTexto = maintenanceData.descripcion || 'No se registraron actividades específicas.';
  const actividadLines = doc.splitTextToSize(actividadesTexto, pageWidth - 30);
  doc.text(actividadLines, 15, yPos);
  yPos += (actividadLines.length * 5) + 5;

  // ==========================================
  // 8. PRUEBAS ESTÁTICAS
  // ==========================================
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('8. PRUEBAS ESTÁTICAS', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black[0], black[1], black[2]);

  if (maintenanceData.checklist?.static_tests) {
    const staticTests = maintenanceData.checklist.static_tests;
    
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
    yPos = doc.lastAutoTable.finalY + 12;
  }

  // ==========================================
  // 9. ACCESORIOS CAMBIADOS
  // ==========================================
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('9. ACCESORIOS CAMBIADOS', 15, yPos);
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
    yPos = doc.lastAutoTable.finalY + 12;
  } else {
    doc.text('No se registraron accesorios cambiados.', 15, yPos);
    yPos += 7;
  }

  // ==========================================
  // 10. IMÁGENES DEL MANTENIMIENTO (Antes y Después)
  // ==========================================
  const mtoPhotos = maintenanceData.checklist?.photos || {};
  const beforePhotos = mtoPhotos.before || [];
  const afterPhotos = mtoPhotos.after || [];
  const allMtoPhotos = [...beforePhotos, ...afterPhotos];

  if (allMtoPhotos.length > 0) {
    doc.addPage();
    yPos = 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text('10. EVIDENCIA FOTOGRÁFICA DEL MANTENIMIENTO', 15, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(black[0], black[1], black[2]);

    let imgY = yPos;
    for (let i = 0; i < allMtoPhotos.length; i++) {
      const base64 = await imageToBase64(allMtoPhotos[i]);
      if (base64) {
        const imgWidth = 55;
        const xPos = 15 + (i % 3) * (imgWidth + 8);
        doc.addImage(base64, 'JPEG', xPos, imgY, imgWidth, 40);

        // Salto de página si se llenan 3 imágenes
        if ((i + 1) % 3 === 0) {
          imgY += 45;
          if (imgY > 250) {
            doc.addPage();
            imgY = 15;
          }
        }
      } else {
        doc.setFontSize(8);
        doc.setTextColor(redInemec[0], redInemec[1], redInemec[2]);
        doc.text('Sin imagen', 15 + (i % 3) * 60, imgY + 20);
      }
    }
    yPos = imgY + 45;
  } else {
    yPos += 10;
    doc.text('No se registraron imágenes para este mantenimiento.', 15, yPos);
    yPos += 7;
  }

  // ==========================================
  // 11. CONCLUSIONES
  // ==========================================
  if (yPos > 250) doc.addPage();
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('11. CONCLUSIONES', 15, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(black[0], black[1], black[2]);

  const conclusionesTexto = maintenanceData.conclusiones || 'Sin conclusiones registradas para este mantenimiento.';
  const conclusionLines = doc.splitTextToSize(conclusionesTexto, pageWidth - 30);
  doc.text(conclusionLines, 15, yPos);
  yPos += (conclusionLines.length * 5) + 5;

  // ==========================================
  // 12. FIRMA DEL TÉCNICO
  // ==========================================
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('12. FIRMA DEL TÉCNICO', 15, yPos);
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
  
  doc.setDrawColor(0, 0, 0);
  doc.line(15, yPos, 60, yPos);
  yPos += 5;
  doc.text('Firma del Técnico', 15, yPos);

  // --- GUARDAR EL PDF ---
  try {
    doc.save(`Reporte_${vsdData.codigo_vsd}_${Date.now()}.pdf`);
  } catch (error) {
    console.error('Error al guardar el PDF:', error);
    alert('Hubo un error al generar el PDF. Por favor, intenta de nuevo.');
  }
};

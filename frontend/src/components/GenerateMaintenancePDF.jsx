import jsPDF from 'jspdf';
import 'jspdf-autotable';
import imageToBase64 from 'image-to-base64';
import { supabase } from '../config/supabase';

export const generateMaintenancePDF = async (vsdData, maintenanceData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. LOGOTIPO (Desde public/images/)
  try {
    const logoPath = `/images/logo-inemec.png`;
    // Cargar la imagen desde el servidor de desarrollo local o Vercel
    const base64String = await imageToBase64(logoPath);
    doc.addImage(base64String, 'PNG', 15, 10, 30, 15);
  } catch (error) {
    console.warn('⚠️ No se pudo cargar el logo local. Se usará texto.', error);
    doc.setFontSize(16);
    doc.setTextColor(200, 30, 30);
    doc.text('INEMEC', 15, 20);
  }

  // 2. TÍTULO DEL REPORTE
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('REPORTE FINAL DE MANTENIMIENTO', pageWidth / 2, 20, { align: 'center' });

  doc.setDrawColor(200, 30, 30);
  doc.line(15, 25, pageWidth - 15, 25);

  // 3. INFORMACIÓN GENERAL
  let yPos = 35;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('1. INFORMACIÓN GENERAL', 15, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');

  const generalInfo = [
    ['Compañía:', 'INEMEC S.A.S'],
    ['Cliente:', maintenanceData.cliente || 'CEDCO'],
    ['Locación:', vsdData.site || 'N/A'],
    ['Pozo:', vsdData.plant || 'N/A'],
    ['Código VSD:', vsdData.codigo_vsd],
    ['Modelo:', vsdData.model || 'N/A'],
    ['Serial Number:', vsdData.serial_number || 'N/A'],
    ['Tipo Mantenimiento:', maintenanceData.tipo || 'Preventivo'],
    ['Fecha Ejecución:', new Date(maintenanceData.created_at).toLocaleDateString()],
    ['Técnico:', maintenanceData.tecnico || 'Especialistas Inemec']
  ];

  doc.autoTable({
    startY: yPos,
    head: [['Campo', 'Valor']],
    body: generalInfo,
    theme: 'grid',
    headStyles: { fillColor: [200, 30, 30], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold' }, 1: { cellWidth: 130 } },
    margin: { left: 15, right: 15 }
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // 4. OBJETIVO GENERAL
  doc.setFont('helvetica', 'bold');
  doc.text('2. OBJETIVO GENERAL', 15, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  const objetivoText = doc.splitTextToSize(
    "Este documento tiene como propósito orientar las actividades de mantenimiento realizadas por los especialistas de INEMEC en variadores de velocidad (VSD) de baja y media tensión, así como en los transformadores elevadores (SUT) asociados a estos sistemas, con el fin de preservar su confiabilidad, disponibilidad y desempeño operativo. La aplicación de las buenas prácticas aquí descritas contribuye a extender la vida útil de los equipos, disminuir la probabilidad de fallas imprevistas, reducir los tiempos de indisponibilidad y optimizar los costos derivados de reparaciones no planificadas, favoreciendo una operación segura, continua y eficiente.",
    pageWidth - 30
  );
  doc.text(objetivoText, 15, yPos);
  yPos += (objetivoText.length * 5) + 5;

  // 5. LISTA DE CHEQUEO
  doc.setFont('helvetica', 'bold');
  doc.text('3. LISTA DE CHEQUEO', 15, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');

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
      headStyles: { fillColor: [200, 30, 30], textColor: [255, 255, 255], fontSize: 8 },
      columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 20, halign: 'center' }, 2: { cellWidth: 40 }, 3: { cellWidth: 40 } },
      margin: { left: 15, right: 15 }
    });
    yPos = doc.lastAutoTable.finalY + 10;
  } else {
    doc.text('No hay checklist registrado para este mantenimiento.', 15, yPos);
    yPos += 7;
  }

  // 6. ACTIVIDADES REALIZADAS
  doc.setFont('helvetica', 'bold');
  doc.text('4. ACTIVIDADES REALIZADAS', 15, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  const actividadesText = doc.splitTextToSize(
    maintenanceData.descripcion || 'No se registraron actividades específicas.',
    pageWidth - 30
  );
  doc.text(actividadesText, 15, yPos);
  yPos += (actividadesText.length * 5) + 5;

  // 7. PRUEBAS ESTÁTICAS
  if (maintenanceData.checklist?.static_tests) {
    const staticTests = maintenanceData.checklist.static_tests;
    
    // Conversor 1
    doc.setFont('helvetica', 'bold');
    doc.text('5. PRUEBAS ESTÁTICAS - CONVERSOR I', 15, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');

    const testData = staticTests.converter_1?.map(row => [
      row.meter_plus, row.meter_minus, row.expected, row.actual
    ]) || [];

    doc.autoTable({
      startY: yPos,
      head: [['Meter +', 'Meter -', 'Lectura Esperada', 'Lectura Actual']],
      body: testData,
      theme: 'grid',
      headStyles: { fillColor: [200, 30, 30], textColor: [255, 255, 255] },
      columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 35 }, 2: { cellWidth: 40 }, 3: { cellWidth: 40 } },
      margin: { left: 15, right: 15 }
    });
    yPos = doc.lastAutoTable.finalY + 10;
  }

  // 8. ACCESORIOS CAMBIADOS
  doc.setFont('helvetica', 'bold');
  doc.text('6. ACCESORIOS CAMBIADOS', 15, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');

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
      headStyles: { fillColor: [200, 30, 30], textColor: [255, 255, 255], fontSize: 9 },
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 30 }, 2: { cellWidth: 80 }, 3: { cellWidth: 30 } },
      margin: { left: 15, right: 15 }
    });
    yPos = doc.lastAutoTable.finalY + 10;
  } else {
    doc.text('No se registraron accesorios cambiados.', 15, yPos);
    yPos += 7;
  }

  // 9. CONCLUSIONES
  doc.setFont('helvetica', 'bold');
  doc.text('7. CONCLUSIONES', 15, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  const conclusionesText = doc.splitTextToSize(
    maintenanceData.conclusiones || 'Sin conclusiones registradas para este mantenimiento.',
    pageWidth - 30
  );
  doc.text(conclusionesText, 15, yPos);
  yPos += (conclusionesText.length * 5) + 5;

  // 10. FIRMA DEL TÉCNICO
  doc.setFont('helvetica', 'bold');
  doc.text('8. FIRMA DEL TÉCNICO', 15, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${maintenanceData.tecnico || 'Especialistas Inemec'}`, 15, yPos);
  yPos += 5;
  doc.text('Cargo: Variable Speed Drive Specialist', 15, yPos);
  yPos += 15;
  doc.text('__________________________', 15, yPos);
  yPos += 5;
  doc.text('Firma del Técnico', 15, yPos);

  // Guardar el PDF
  doc.save(`Reporte_Mantenimiento_${vsdData.codigo_vsd}.pdf`);
};

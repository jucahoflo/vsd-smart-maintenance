import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useVSD } from '../../context/VSDContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportGenerator = ({ open, onClose }) => {
  const { vsds, maintenances } = useVSD();
  const [loading, setLoading] = useState(false);
  const [selectedVsdId, setSelectedVsdId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reportData, setReportData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // ============ FUNCIÓN PARA AGREGAR LOGO ============
  const agregarLogo = (doc, x, y, size = 28) => {
    try {
      const logoUrl = '/images/inemec-logo.png';
      doc.addImage(logoUrl, 'PNG', x, y, size, size);
      return true;
    } catch (e) {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, size, size, 3, 3, 'F');
      doc.setDrawColor(60, 60, 60);
      doc.roundedRect(x, y, size, size, 3, 3, 'S');
      
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('INEMEC', x + 2, y + 12);
      doc.setFontSize(5);
      doc.setFont('helvetica', 'normal');
      doc.text('Industrial', x + 2, y + 19);
      doc.text('& Mechanical', x + 2, y + 24);
      return false;
    }
  };

  // ============ FUNCIÓN PARA AGREGAR IMÁGENES DEL VSD ============
  const agregarImagenesVSD = (doc, imagenes, y, pageWidth) => {
    if (!imagenes || imagenes.length === 0) {
      return y;
    }

    // Verificar espacio
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Título de la sección
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('📸 EVIDENCIA FOTOGRÁFICA', 15, y);
    y += 8;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('A continuación, un registro fotográfico de las condiciones de los equipos:', 15, y);
    y += 6;

    // Mostrar hasta 4 imágenes en una cuadrícula
    const maxImages = Math.min(imagenes.length, 4);
    const imagesPerRow = 2;
    const imgSize = 65;
    const spacing = 10;
    const startX = 20;

    for (let i = 0; i < maxImages; i++) {
      const row = Math.floor(i / imagesPerRow);
      const col = i % imagesPerRow;
      
      const x = startX + col * (imgSize + spacing);
      const yPos = y + row * (imgSize + spacing + 15);
      
      // Verificar espacio en página
      if (yPos + imgSize > 270) {
        doc.addPage();
        y = 20;
        const newRow = 0;
        const newCol = i % imagesPerRow;
        const newX = startX + newCol * (imgSize + spacing);
        const newY = 20 + newRow * (imgSize + spacing + 15);
        
        try {
          doc.addImage(imagenes[i].url, 'JPEG', newX, newY, imgSize, imgSize);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(`Imagen ${i+1}`, newX + imgSize/2, newY + imgSize + 5, { align: 'center' });
        } catch (e) {
          doc.setDrawColor(200, 200, 200);
          doc.setFillColor(240, 240, 240);
          doc.roundedRect(newX, newY, imgSize, imgSize, 3, 3, 'FD');
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(150, 150, 150);
          doc.text('Imagen', newX + imgSize/2, newY + imgSize/2, { align: 'center' });
          doc.text(`${i+1}`, newX + imgSize/2, newY + imgSize/2 + 6, { align: 'center' });
        }
        continue;
      }
      
      try {
        doc.addImage(imagenes[i].url, 'JPEG', x, yPos, imgSize, imgSize);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Imagen ${i+1}`, x + imgSize/2, yPos + imgSize + 5, { align: 'center' });
      } catch (e) {
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(x, yPos, imgSize, imgSize, 3, 3, 'FD');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('Imagen', x + imgSize/2, yPos + imgSize/2, { align: 'center' });
        doc.text(`${i+1}`, x + imgSize/2, yPos + imgSize/2 + 6, { align: 'center' });
      }
    }

    const rows = Math.ceil(maxImages / imagesPerRow);
    y += rows * (imgSize + spacing + 15) + 10;
    
    return y;
  };

  const generarReporte = () => {
    if (!selectedVsdId) {
      toast.warning('⚠️ Selecciona un VSD');
      return;
    }

    const vsd = vsds.find(v => v._id === selectedVsdId);
    if (!vsd) {
      toast.warning('⚠️ VSD no encontrado');
      return;
    }

    let mantenimientosFiltrados = maintenances.filter(m => m.vsdId === selectedVsdId);

    if (fechaInicio) {
      const inicio = new Date(fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      mantenimientosFiltrados = mantenimientosFiltrados.filter(m => {
        const fecha = new Date(m.fechaProgramada || m.fechaCreacion);
        return fecha >= inicio;
      });
    }

    if (fechaFin) {
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      mantenimientosFiltrados = mantenimientosFiltrados.filter(m => {
        const fecha = new Date(m.fechaProgramada || m.fechaCreacion);
        return fecha <= fin;
      });
    }

    mantenimientosFiltrados = mantenimientosFiltrados.sort((a, b) => {
      const fechaA = new Date(a.fechaProgramada || a.fechaCreacion);
      const fechaB = new Date(b.fechaProgramada || b.fechaCreacion);
      return fechaA - fechaB;
    });

    setReportData({
      vsd,
      mantenimientos: mantenimientosFiltrados,
      totalMantenimientos: mantenimientosFiltrados.length,
      fechaGeneracion: new Date(),
      rangoFechas: {
        inicio: fechaInicio || 'Sin filtro',
        fin: fechaFin || 'Sin filtro'
      }
    });

    setShowPreview(true);
  };

  const generarPDF = () => {
    if (!reportData) return;

    setLoading(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const { vsd, mantenimientos, totalMantenimientos, fechaGeneracion, rangoFechas } = reportData;

      mantenimientos.forEach((m, index) => {
        if (index > 0) {
          doc.addPage();
        }

        let y = 20;

        // ============ ENCABEZADO CON LOGO ============
        doc.setFillColor(40, 40, 40);
        doc.rect(0, 0, pageWidth, 38, 'F');
        agregarLogo(doc, 10, 5, 28);
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('REPORTE DE MANTENIMIENTO', pageWidth / 2, 16, { align: 'center' });
        
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('VSD SMART MAINTENANCE SYSTEM', pageWidth / 2, 24, { align: 'center' });
        
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy')}`, pageWidth - 15, 12, { align: 'right' });
        doc.text(`Hora: ${format(new Date(), 'HH:mm')}`, pageWidth - 15, 19, { align: 'right' });

        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.5);
        doc.line(15, 42, pageWidth - 15, 42);
        y = 50;

        // ============ 1. INFORMACIÓN GENERAL ============
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text('1. INFORMACIÓN GENERAL', 15, y);
        y += 7;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        const infoGeneral = [
          ['Compañía:', m.compania || 'INEMEC S.A.S'],
          ['Cliente:', m.cliente || vsd.nombre || 'N/A'],
          ['Locación:', m.locacion || vsd.ubicacion || 'N/A'],
          ['Pozo:', m.pozo || vsd.serie || 'N/A'],
          ['Tipo Mantenimiento:', m.tipo || 'N/A'],
          ['Fecha Ejecución:', m.fechaEjecucion ? format(new Date(m.fechaEjecucion), 'dd/MM/yyyy') : (m.fechaProgramada ? format(new Date(m.fechaProgramada), 'dd/MM/yyyy') : 'N/A')],
          ['Técnico:', m.tecnico || 'N/A'],
          ['Service Ticket:', m.serviceTicket || 'N/A']
        ];

        const mitad = Math.ceil(infoGeneral.length / 2);
        const col1 = infoGeneral.slice(0, mitad);
        const col2 = infoGeneral.slice(mitad);

        col1.forEach(([label, value], index) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.text(label, 15, y);
          doc.setFont('helvetica', 'normal');
          doc.text(value, 60, y);
          
          if (col2[index]) {
            const [label2, value2] = col2[index];
            doc.setFont('helvetica', 'bold');
            doc.text(label2, 110, y);
            doc.setFont('helvetica', 'normal');
            doc.text(value2, 155, y);
          }
          y += 6;
        });

        y += 5;

        // ============ 2. OBJETIVO GENERAL ============
        if (m.objetivoGeneral) {
          if (y > 260) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(40, 40, 40);
          doc.text('2. OBJETIVO GENERAL', 15, y);
          y += 6;
          
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          const objLines = doc.splitTextToSize(m.objetivoGeneral, pageWidth - 30);
          doc.text(objLines, 15, y);
          y += objLines.length * 5 + 5;
        }

        // ============ 3. EQUIPOS DE SUPERFICIE ============
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text('3. EQUIPOS DE SUPERFICIE', 15, y);
        y += 7;

        const equiposData = [
          ['Equipo', 'Marca', 'Modelo', 'S/N', 'KVA', 'AMPS'],
          ['VSD', m.equipos?.vsd?.marca || 'N/A', m.equipos?.vsd?.modelo || 'N/A', 
           m.equipos?.vsd?.serie || 'N/A', m.equipos?.vsd?.kva || 'N/A', m.equipos?.vsd?.amps || 'N/A'],
          ['SUT', m.equipos?.sut?.marca || 'N/A', m.equipos?.sut?.modelo || 'N/A',
           m.equipos?.sut?.serie || 'N/A', m.equipos?.sut?.kva || 'N/A', m.equipos?.sut?.amps || 'N/A']
        ];

        doc.autoTable({
          startY: y,
          head: [equiposData[0]],
          body: equiposData.slice(1),
          theme: 'striped',
          headStyles: { 
            fillColor: [60, 60, 60], 
            textColor: [255, 255, 255], 
            fontSize: 7, 
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: { fontSize: 7 },
          columnStyles: { 
            0: { cellWidth: 22 }, 
            1: { cellWidth: 28 }, 
            2: { cellWidth: 28 }, 
            3: { cellWidth: 28 }, 
            4: { cellWidth: 18 }, 
            5: { cellWidth: 18 } 
          },
          margin: { left: 15, right: 15 }
        });

        y = doc.lastAutoTable.finalY + 8;

        // ============ 4. EVIDENCIA FOTOGRÁFICA (IMÁGENES DEL VSD) ============
        // UBICADO DESPUÉS DE EQUIPOS DE SUPERFICIE
        const imagenesVSD = vsd.documentos?.imagenes || [];
        if (imagenesVSD.length > 0) {
          y = agregarImagenesVSD(doc, imagenesVSD, y, pageWidth);
        }

        // ============ 5. LISTA DE CHEQUEO ============
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text('4. LISTA DE CHEQUEO', 15, y);
        y += 6;

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('Marque con una X en las casillas Sí o No en cada actividad.', 15, y);
        y += 5;

        const chequeoData = m.listaChequeo?.map(item => [
          item.actividad || '',
          item.hecho ? 'X' : '',
          item.observacion || ''
        ]) || [];

        if (chequeoData.length > 0) {
          doc.autoTable({
            startY: y,
            head: [['Actividad', 'Hecho (X)', 'Observaciones']],
            body: chequeoData,
            theme: 'striped',
            headStyles: { 
              fillColor: [60, 60, 60], 
              textColor: [255, 255, 255], 
              fontSize: 7, 
              fontStyle: 'bold' 
            },
            bodyStyles: { fontSize: 6 },
            columnStyles: { 
              0: { cellWidth: 80 }, 
              1: { cellWidth: 18 }, 
              2: { cellWidth: 60 } 
            },
            margin: { left: 15, right: 15 }
          });

          y = doc.lastAutoTable.finalY + 8;
        }

        // ============ 6. ACTIVIDADES REALIZADAS ============
        if (m.actividadesRealizadas) {
          if (y > 260) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(40, 40, 40);
          doc.text('5. ACTIVIDADES REALIZADAS', 15, y);
          y += 6;
          
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          const actLines = doc.splitTextToSize(m.actividadesRealizadas, pageWidth - 30);
          doc.text(actLines, 15, y);
          y += actLines.length * 5 + 8;
        }

        // ============ 7. PRUEBAS ESTÁTICAS ============
        if (m.pruebasEstaticas) {
          if (y > 200) {
            doc.addPage();
            y = 20;
          }

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(40, 40, 40);
          doc.text('6. PRUEBAS ESTÁTICAS', 15, y);
          y += 7;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(40, 40, 40);
          doc.text('6.1 Conversor', 15, y);
          y += 5;

          const convData = m.pruebasEstaticas.conversor?.map(item => [
            item.medicion || '',
            item.esperado || '',
            item.actual || ''
          ]) || [];

          if (convData.length > 0) {
            doc.autoTable({
              startY: y,
              head: [['Medición', 'Esperado', 'Actual']],
              body: convData,
              theme: 'striped',
              headStyles: { 
                fillColor: [60, 60, 60], 
                textColor: [255, 255, 255], 
                fontSize: 7, 
                fontStyle: 'bold' 
              },
              bodyStyles: { fontSize: 7 },
              columnStyles: { 
                0: { cellWidth: 50 }, 
                1: { cellWidth: 38 }, 
                2: { cellWidth: 38 } 
              },
              margin: { left: 15, right: 15 }
            });

            y = doc.lastAutoTable.finalY + 5;
          }

          if (y > 230) {
            doc.addPage();
            y = 20;
          }

          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(40, 40, 40);
          doc.text('6.2 Inversor', 15, y);
          y += 5;

          const invData = m.pruebasEstaticas.inversor?.map(item => [
            item.medicion || '',
            item.esperado || '',
            item.actual || ''
          ]) || [];

          if (invData.length > 0) {
            doc.autoTable({
              startY: y,
              head: [['Medición', 'Esperado', 'Actual']],
              body: invData,
              theme: 'striped',
              headStyles: { 
                fillColor: [60, 60, 60], 
                textColor: [255, 255, 255], 
                fontSize: 7, 
                fontStyle: 'bold' 
              },
              bodyStyles: { fontSize: 7 },
              columnStyles: { 
                0: { cellWidth: 50 }, 
                1: { cellWidth: 38 }, 
                2: { cellWidth: 38 } 
              },
              margin: { left: 15, right: 15 }
            });

            y = doc.lastAutoTable.finalY + 8;
          }
        }

        // ============ 8. ACCESORIOS CAMBIADOS ============
        if (m.accesoriosCambiados?.length > 0 && m.accesoriosCambiados[0]?.codigoSap) {
          if (y > 200) {
            doc.addPage();
            y = 20;
          }

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(40, 40, 40);
          doc.text('7. ACCESORIOS CAMBIADOS', 15, y);
          y += 7;

          const accData = m.accesoriosCambiados.map(item => [
            item.cantidad || '',
            item.codigoSap || '',
            item.detalle || '',
            item.total || ''
          ]);

          doc.autoTable({
            startY: y,
            head: [['Cant', 'Código SAP', 'Detalle', 'Total']],
            body: accData,
            theme: 'striped',
            headStyles: { 
              fillColor: [60, 60, 60], 
              textColor: [255, 255, 255], 
              fontSize: 7, 
              fontStyle: 'bold' 
            },
            bodyStyles: { fontSize: 7 },
            columnStyles: { 
              0: { cellWidth: 18 }, 
              1: { cellWidth: 38 }, 
              2: { cellWidth: 58 }, 
              3: { cellWidth: 28 } 
            },
            margin: { left: 15, right: 15 }
          });

          y = doc.lastAutoTable.finalY + 8;
        }

        // ============ 9. CONCLUSIONES Y RECOMENDACIONES ============
        if (m.conclusiones || m.recomendaciones) {
          if (y > 200) {
            doc.addPage();
            y = 20;
          }

          if (m.conclusiones) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40, 40, 40);
            doc.text('8. CONCLUSIONES', 15, y);
            y += 6;
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const conLines = doc.splitTextToSize(m.conclusiones, pageWidth - 30);
            doc.text(conLines, 15, y);
            y += conLines.length * 5 + 5;
          }

          if (m.recomendaciones) {
            if (y > 200) {
              doc.addPage();
              y = 20;
            }
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40, 40, 40);
            doc.text('9. RECOMENDACIONES', 15, y);
            y += 6;
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const recLines = doc.splitTextToSize(m.recomendaciones, pageWidth - 30);
            doc.text(recLines, 15, y);
            y += recLines.length * 5 + 5;
          }
        }

        // ============ 10. FIRMA DEL TÉCNICO ============
        if (y > 200) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text('10. FIRMA DEL TÉCNICO', 15, y);
        y += 8;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Nombre: ${m.firmaTecnico?.nombre || m.tecnico || 'N/A'}`, 15, y);
        y += 5;
        doc.text(`Cargo: ${m.firmaTecnico?.cargo || 'Field Specialist'}`, 15, y);
        y += 5;
        doc.text(`Teléfono: ${m.firmaTecnico?.telefono || 'N/A'}`, 15, y);
        y += 5;
        doc.text(`Correo: ${m.firmaTecnico?.correo || 'N/A'}`, 15, y);
        y += 10;

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(15, y, 80, y);
        y += 4;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text('Firma del Técnico', 15, y);

        // ============ PIE DE PÁGINA ============
        const pageCount = doc.internal.pages.length;
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(6);
          doc.setTextColor(180, 180, 180);
          doc.setFont('helvetica', 'normal');
          doc.text(
            `INEMEC - Industrial & Mechanical Solutions - Reporte generado el ${format(new Date(), 'dd/MM/yyyy HH:mm')} - Página ${i} de ${pageCount}`,
            pageWidth / 2,
            pageHeight - 6,
            { align: 'center' }
          );
        }
      });

      const nombreArchivo = `REPORTE_MANTENIMIENTO_${vsd.serie || 'VSD'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(nombreArchivo);
      
      toast.success(`✅ PDF generado: ${nombreArchivo}`);
      setShowPreview(false);
      setReportData(null);
      onClose();
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error(`❌ Error al generar el PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setSelectedVsdId('');
    setFechaInicio('');
    setFechaFin('');
    setReportData(null);
    setShowPreview(false);
  };

  const handleClose = () => {
    limpiarFiltros();
    onClose();
  };

  const getEstadoColor = (estado) => {
    const colors = {
      activo: 'success',
      mantenimiento: 'warning',
      inactivo: 'error',
      pendiente: 'warning',
      en_progreso: 'info',
      completado: 'success',
      cancelado: 'error'
    };
    return colors[estado] || 'default';
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      preventivo: '🛠️ Preventivo',
      correctivo: '🔧 Correctivo',
      predictivo: '📊 Predictivo'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <PdfIcon sx={{ color: '#ef4444', fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold">
              Generar Reporte PDF
            </Typography>
          </Box>
          <IconButton onClick={handleClose}><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {!showPreview ? (
          <Box sx={{ py: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              📄 Selecciona el VSD y el rango de fechas para generar el reporte profesional.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Seleccionar VSD *"
                  value={selectedVsdId}
                  onChange={(e) => setSelectedVsdId(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="">Selecciona un VSD</option>
                  {vsds.map((vsd) => (
                    <option key={vsd._id} value={vsd._id}>
                      {vsd.nombre} - {vsd.marca} {vsd.modelo}
                    </option>
                  ))}
                </TextField>
                {selectedVsdId && (
                  <Box mt={1}>
                    <Chip
                      label={vsds.find(v => v._id === selectedVsdId)?.nombre || 'VSD seleccionado'}
                      color="primary"
                      size="small"
                    />
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fecha Inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ startAdornment: <CalendarIcon sx={{ mr: 1, color: '#6b7280' }} /> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fecha Fin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ startAdornment: <CalendarIcon sx={{ mr: 1, color: '#6b7280' }} /> }}
                />
              </Grid>

              {(selectedVsdId || fechaInicio || fechaFin) && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc' }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      📋 Resumen de filtros
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {selectedVsdId && (
                        <Chip
                          label={vsds.find(v => v._id === selectedVsdId)?.nombre || 'VSD'}
                          size="small"
                          color="primary"
                          onDelete={() => setSelectedVsdId('')}
                        />
                      )}
                      {fechaInicio && (
                        <Chip
                          label={`Desde: ${format(new Date(fechaInicio), 'dd/MM/yyyy')}`}
                          size="small"
                          onDelete={() => setFechaInicio('')}
                        />
                      )}
                      {fechaFin && (
                        <Chip
                          label={`Hasta: ${format(new Date(fechaFin), 'dd/MM/yyyy')}`}
                          size="small"
                          onDelete={() => setFechaFin('')}
                        />
                      )}
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        ) : (
          <Box sx={{ py: 2 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              ✅ Reporte generado correctamente. Haz clic en "Descargar PDF" para guardarlo.
            </Alert>

            {reportData && (
              <Paper sx={{ p: 3, bgcolor: '#f8fafc', maxHeight: 450, overflow: 'auto' }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  📄 Reporte de Mantenimiento
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" fontWeight="bold">
                  VSD: {reportData.vsd.nombre}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Serie: {reportData.vsd.serie} | Marca: {reportData.vsd.marca} | Modelo: {reportData.vsd.modelo}
                </Typography>

                <Box mt={2}>
                  <Typography variant="caption" color="textSecondary">
                    Total mantenimientos: <strong>{reportData.totalMantenimientos}</strong>
                  </Typography>
                  <br />
                  <Typography variant="caption" color="textSecondary">
                    Rango: {reportData.rangoFechas.inicio} - {reportData.rangoFechas.fin}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {reportData.mantenimientos.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                    No hay mantenimientos en el período seleccionado.
                  </Typography>
                ) : (
                  <Box>
                    {reportData.mantenimientos.map((m, index) => (
                      <Paper key={m._id} sx={{ p: 2, mb: 2, bgcolor: 'white', border: '1px solid #e5e7eb', borderRadius: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {index + 1}. {m.titulo || 'Sin título'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" display="block">
                              {getTipoLabel(m.tipo)} • {m.prioridad || 'Sin prioridad'}
                            </Typography>
                          </Box>
                          <Chip
                            label={m.estado || 'Sin estado'}
                            size="small"
                            color={getEstadoColor(m.estado)}
                          />
                        </Box>

                        <Grid container spacing={1} sx={{ mt: 1 }}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="textSecondary">
                              📅 Fecha Programada: <strong>{m.fechaProgramada ? format(new Date(m.fechaProgramada), 'dd/MM/yyyy') : 'N/A'}</strong>
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="textSecondary">
                              👤 Técnico: <strong>{m.tecnico || 'N/A'}</strong>
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="textSecondary">
                              💰 Costo: <strong>{m.costo ? `$${m.costo}` : '$0'}</strong>
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="textSecondary">
                              ⏱️ Duración: <strong>{m.duracion ? `${m.duracion}h` : 'N/A'}</strong>
                            </Typography>
                          </Grid>
                        </Grid>

                        {m.descripcion && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="textSecondary">
                              📝 Descripción:
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {m.descripcion}
                            </Typography>
                          </Box>
                        )}

                        {m.observaciones && (
                          <Box sx={{ mt: 1, bgcolor: '#fef3c7', p: 1, borderRadius: 1 }}>
                            <Typography variant="caption" color="textSecondary">
                              📋 Observaciones:
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {m.observaciones}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Box>
                )}
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={handleClose} variant="outlined" color="inherit">
          Cancelar
        </Button>
        
        {showPreview ? (
          <>
            <Button onClick={() => setShowPreview(false)} variant="outlined">
              Atrás
            </Button>
            <Button
              onClick={generarPDF}
              variant="contained"
              color="success"
              startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
              disabled={loading}
            >
              {loading ? 'Generando...' : 'Descargar PDF'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={limpiarFiltros} variant="outlined" color="inherit">
              Limpiar
            </Button>
            <Button
              onClick={generarReporte}
              variant="contained"
              color="primary"
              startIcon={<PdfIcon />}
              disabled={!selectedVsdId}
            >
              Generar Reporte
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReportGenerator;
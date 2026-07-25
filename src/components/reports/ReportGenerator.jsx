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

  // ============ CONFIGURACIÓN DE NORMAS APA ============
  const CONFIG = {
    // Márgenes APA: 2.54 cm (1 pulgada) en todos los lados
    marginLeft: 25.4,
    marginRight: 25.4,
    marginTop: 25.4,
    marginBottom: 25.4,
    // Fuente Times New Roman
    fontFamily: 'times',
    // Tamaños de fuente
    fontSizeTitle: 14,
    fontSizeSubtitle: 12,
    fontSizeBody: 12,
    fontSizeCaption: 10,
    // Interlineado 1.5 (espaciado entre líneas)
    lineHeight: 1.5,
    // Sangría para párrafos: 1.27 cm (0.5 pulgadas)
    indent: 12.7
  };

  const getPageWidth = (doc) => doc.internal.pageSize.getWidth();
  const getPageHeight = (doc) => doc.internal.pageSize.getHeight();
  const getContentWidth = (doc) => getPageWidth(doc) - CONFIG.marginLeft - CONFIG.marginRight;

  // ============ FUNCIÓN PARA AGREGAR LOGO ============
  const agregarLogo = (doc, x, y, size = 20) => {
    try {
      const logoUrl = '/images/inemec-logo.png';
      doc.addImage(logoUrl, 'PNG', x, y, size, size);
      return true;
    } catch (e) {
      // Si no se encuentra la imagen, mostrar texto
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, size, size, 3, 3, 'F');
      doc.setDrawColor(60, 60, 60);
      doc.roundedRect(x, y, size, size, 3, 3, 'S');
      
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.setFont(CONFIG.fontFamily, 'bold');
      doc.text('INEMEC', x + 2, y + 10);
      doc.setFontSize(6);
      doc.setFont(CONFIG.fontFamily, 'normal');
      doc.text('Industrial', x + 2, y + 16);
      doc.text('& Mechanical', x + 2, y + 20);
      return false;
    }
  };

  // ============ FUNCIÓN PARA AGREGAR IMÁGENES DEL VSD ============
  const agregarImagenesVSD = (doc, imagenes, y, pageWidth) => {
    if (!imagenes || imagenes.length === 0) {
      return y;
    }

    const marginLeft = CONFIG.marginLeft;
    const marginRight = CONFIG.marginRight;
    const contentWidth = pageWidth - marginLeft - marginRight;

    if (y > getPageHeight(doc) - 50) {
      doc.addPage();
      y = CONFIG.marginTop;
    }

    // Título de la sección (APA: centrado, negrita)
    doc.setFontSize(CONFIG.fontSizeSubtitle);
    doc.setFont(CONFIG.fontFamily, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Evidencia Fotográfica', pageWidth / 2, y, { align: 'center' });
    y += 8;

    // Descripción
    doc.setFontSize(CONFIG.fontSizeBody);
    doc.setFont(CONFIG.fontFamily, 'italic');
    doc.setTextColor(80, 80, 80);
    doc.text('Registro fotográfico de las condiciones del equipo.', pageWidth / 2, y, { align: 'center' });
    y += 10;

    const maxImages = Math.min(imagenes.length, 4);
    const imagesPerRow = 2;
    const imgSize = 60;
    const spacing = 15;
    const startX = marginLeft + (contentWidth - (imagesPerRow * (imgSize + spacing) - spacing)) / 2;

    for (let i = 0; i < maxImages; i++) {
      const row = Math.floor(i / imagesPerRow);
      const col = i % imagesPerRow;
      
      const x = startX + col * (imgSize + spacing);
      const yPos = y + row * (imgSize + spacing + 20);
      
      if (yPos + imgSize > getPageHeight(doc) - 40) {
        doc.addPage();
        y = CONFIG.marginTop;
        const newRow = 0;
        const newCol = i % imagesPerRow;
        const newX = startX + newCol * (imgSize + spacing);
        const newY = y + newRow * (imgSize + spacing + 20);
        
        try {
          doc.addImage(imagenes[i].url, 'JPEG', newX, newY, imgSize, imgSize);
          doc.setFontSize(8);
          doc.setFont(CONFIG.fontFamily, 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(`Imagen ${i+1}`, newX + imgSize/2, newY + imgSize + 5, { align: 'center' });
        } catch (e) {
          doc.setDrawColor(200, 200, 200);
          doc.setFillColor(240, 240, 240);
          doc.roundedRect(newX, newY, imgSize, imgSize, 3, 3, 'FD');
          doc.setFontSize(8);
          doc.setFont(CONFIG.fontFamily, 'italic');
          doc.setTextColor(150, 150, 150);
          doc.text('Imagen', newX + imgSize/2, newY + imgSize/2, { align: 'center' });
          doc.text(`${i+1}`, newX + imgSize/2, newY + imgSize/2 + 6, { align: 'center' });
        }
        continue;
      }
      
      try {
        doc.addImage(imagenes[i].url, 'JPEG', x, yPos, imgSize, imgSize);
        doc.setFontSize(8);
        doc.setFont(CONFIG.fontFamily, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Imagen ${i+1}`, x + imgSize/2, yPos + imgSize + 5, { align: 'center' });
      } catch (e) {
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(x, yPos, imgSize, imgSize, 3, 3, 'FD');
        doc.setFontSize(8);
        doc.setFont(CONFIG.fontFamily, 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('Imagen', x + imgSize/2, yPos + imgSize/2, { align: 'center' });
        doc.text(`${i+1}`, x + imgSize/2, yPos + imgSize/2 + 6, { align: 'center' });
      }
    }

    const rows = Math.ceil(maxImages / imagesPerRow);
    y += rows * (imgSize + spacing + 20) + 10;
    
    return y;
  };

  // ============ FUNCIÓN PARA AGREGAR REGISTRO FOTOGRÁFICO ============
  const agregarRegistroFotografico = (doc, registro, y, pageWidth) => {
    if (!registro) return y;
    const { antes, despues } = registro;
    
    if ((!antes || antes.length === 0) && (!despues || despues.length === 0)) {
      return y;
    }

    const marginLeft = CONFIG.marginLeft;
    const marginRight = CONFIG.marginRight;
    const contentWidth = pageWidth - marginLeft - marginRight;

    if (y > getPageHeight(doc) - 50) {
      doc.addPage();
      y = CONFIG.marginTop;
    }

    doc.setFontSize(CONFIG.fontSizeSubtitle);
    doc.setFont(CONFIG.fontFamily, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Registro Fotográfico del Mantenimiento', pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(CONFIG.fontSizeBody);
    doc.setFont(CONFIG.fontFamily, 'italic');
    doc.setTextColor(80, 80, 80);
    doc.text('Evidencia del estado del equipo antes y después de la intervención.', pageWidth / 2, y, { align: 'center' });
    y += 12;

    const mostrarImagenes = (imagenes, titulo, yPos) => {
      if (!imagenes || imagenes.length === 0) return yPos;
      
      if (yPos > getPageHeight(doc) - 50) {
        doc.addPage();
        yPos = CONFIG.marginTop;
      }

      doc.setFontSize(CONFIG.fontSizeBody);
      doc.setFont(CONFIG.fontFamily, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(titulo, marginLeft, yPos);
      yPos += 6;

      const imagesPerRow = 3;
      const imgSize = 45;
      const spacing = 8;
      const startX = marginLeft;

      for (let i = 0; i < Math.min(imagenes.length, 5); i++) {
        const row = Math.floor(i / imagesPerRow);
        const col = i % imagesPerRow;
        
        const x = startX + col * (imgSize + spacing);
        const yImg = yPos + row * (imgSize + spacing + 12);
        
        if (yImg + imgSize > getPageHeight(doc) - 30) {
          doc.addPage();
          yPos = CONFIG.marginTop;
          const newRow = 0;
          const newCol = i % imagesPerRow;
          const newX = startX + newCol * (imgSize + spacing);
          const newY = yPos + newRow * (imgSize + spacing + 12);
          try {
            doc.addImage(imagenes[i].url, 'JPEG', newX, newY, imgSize, imgSize);
          } catch (e) {
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(240, 240, 240);
            doc.roundedRect(newX, newY, imgSize, imgSize, 3, 3, 'FD');
            doc.setFontSize(7);
            doc.setFont(CONFIG.fontFamily, 'italic');
            doc.setTextColor(150, 150, 150);
            doc.text('Imagen', newX + imgSize/2, newY + imgSize/2, { align: 'center' });
          }
          continue;
        }
        
        try {
          doc.addImage(imagenes[i].url, 'JPEG', x, yImg, imgSize, imgSize);
        } catch (e) {
          doc.setDrawColor(200, 200, 200);
          doc.setFillColor(240, 240, 240);
          doc.roundedRect(x, yImg, imgSize, imgSize, 3, 3, 'FD');
          doc.setFontSize(7);
          doc.setFont(CONFIG.fontFamily, 'italic');
          doc.setTextColor(150, 150, 150);
          doc.text('Imagen', x + imgSize/2, yImg + imgSize/2, { align: 'center' });
        }
      }

      const rows = Math.ceil(Math.min(imagenes.length, 5) / imagesPerRow);
      return yPos + rows * (imgSize + spacing + 12) + 8;
    };

    if (antes && antes.length > 0) {
      y = mostrarImagenes(antes, 'Antes del mantenimiento:', y);
    }

    if (despues && despues.length > 0) {
      y = mostrarImagenes(despues, 'Después del mantenimiento:', y);
    }

    y += 5;
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

      // Configurar márgenes APA
      const marginLeft = CONFIG.marginLeft;
      const marginRight = CONFIG.marginRight;
      const marginTop = CONFIG.marginTop;
      const marginBottom = CONFIG.marginBottom;
      const contentWidth = pageWidth - marginLeft - marginRight;

      mantenimientos.forEach((m, index) => {
        if (index > 0) {
          doc.addPage();
        }

        let y = marginTop;

        // ============ ENCABEZADO CON LOGO ============
        doc.setFillColor(40, 40, 40);
        doc.rect(0, 0, pageWidth, 35, 'F');
        
        // LOGO (IZQUIERDA)
        agregarLogo(doc, 15, 8, 18);
        
        // TÍTULO (CENTRO)
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont(CONFIG.fontFamily, 'bold');
        doc.text('VSD SMART MAINTENANCE', pageWidth / 2, 16, { align: 'center' });
        
        doc.setFontSize(8);
        doc.setFont(CONFIG.fontFamily, 'normal');
        doc.text('Sistema de Gestión de Mantenimiento de Variadores de Frecuencia', pageWidth / 2, 23, { align: 'center' });
        
        // FECHA Y HORA (DERECHA)
        doc.setFontSize(7);
        doc.setFont(CONFIG.fontFamily, 'normal');
        doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy')}`, pageWidth - 15, 12, { align: 'right' });
        doc.text(`Hora: ${format(new Date(), 'HH:mm')}`, pageWidth - 15, 18, { align: 'right' });

        // Línea separadora
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.line(marginLeft, 38, pageWidth - marginRight, 38);
        
        y = 48;

        // ============ 1. TÍTULO PRINCIPAL (APA: centrado, negrita, mayúsculas) ============
        doc.setFontSize(CONFIG.fontSizeTitle);
        doc.setFont(CONFIG.fontFamily, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('REPORTE DE MANTENIMIENTO', pageWidth / 2, y, { align: 'center' });
        y += 10;

        // ============ 2. INFORMACIÓN GENERAL (APA: sangría) ============
        doc.setFontSize(CONFIG.fontSizeSubtitle);
        doc.setFont(CONFIG.fontFamily, 'bold');
        doc.text('Información General', marginLeft, y);
        y += 8;

        doc.setFontSize(CONFIG.fontSizeBody);
        doc.setFont(CONFIG.fontFamily, 'normal');
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

        // Organizar en 2 columnas
        const mitad = Math.ceil(infoGeneral.length / 2);
        const col1 = infoGeneral.slice(0, mitad);
        const col2 = infoGeneral.slice(mitad);
        const colWidth = (contentWidth - 10) / 2;

        col1.forEach(([label, value], index) => {
          if (y > pageHeight - 40) {
            doc.addPage();
            y = marginTop;
          }
          doc.setFont(CONFIG.fontFamily, 'bold');
          doc.text(label, marginLeft, y);
          doc.setFont(CONFIG.fontFamily, 'normal');
          doc.text(value, marginLeft + 50, y);
          
          if (col2[index]) {
            const [label2, value2] = col2[index];
            doc.setFont(CONFIG.fontFamily, 'bold');
            doc.text(label2, marginLeft + colWidth + 10, y);
            doc.setFont(CONFIG.fontFamily, 'normal');
            doc.text(value2, marginLeft + colWidth + 60, y);
          }
          y += 7;
        });

        y += 5;

        // ============ 3. OBJETIVO GENERAL ============
        if (m.objetivoGeneral) {
          if (y > pageHeight - 50) {
            doc.addPage();
            y = marginTop;
          }
          doc.setFontSize(CONFIG.fontSizeSubtitle);
          doc.setFont(CONFIG.fontFamily, 'bold');
          doc.text('Objetivo General', marginLeft, y);
          y += 8;
          
          doc.setFontSize(CONFIG.fontSizeBody);
          doc.setFont(CONFIG.fontFamily, 'normal');
          doc.setTextColor(0, 0, 0);
          const objLines = doc.splitTextToSize(m.objetivoGeneral, contentWidth);
          doc.text(objLines, marginLeft + CONFIG.indent, y);
          y += objLines.length * 6 + 5;
        }

        // ============ 4. EQUIPOS DE SUPERFICIE ============
        if (y > pageHeight - 60) {
          doc.addPage();
          y = marginTop;
        }
        doc.setFontSize(CONFIG.fontSizeSubtitle);
        doc.setFont(CONFIG.fontFamily, 'bold');
        doc.text('Equipos de Superficie', marginLeft, y);
        y += 8;

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
          styles: {
            font: CONFIG.fontFamily,
            fontSize: 9,
            textColor: [0, 0, 0],
          },
          headStyles: {
            fillColor: [60, 60, 60],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 9
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 30 },
            2: { cellWidth: 30 },
            3: { cellWidth: 30 },
            4: { cellWidth: 20 },
            5: { cellWidth: 20 }
          },
          margin: { left: marginLeft, right: marginRight }
        });

        y = doc.lastAutoTable.finalY + 8;

        // ============ 5. EVIDENCIA FOTOGRÁFICA (IMÁGENES DEL VSD) ============
        const imagenesVSD = vsd.documentos?.imagenes || [];
        if (imagenesVSD.length > 0) {
          y = agregarImagenesVSD(doc, imagenesVSD, y, pageWidth);
        }

        // ============ 6. LISTA DE CHEQUEO ============
        if (y > pageHeight - 60) {
          doc.addPage();
          y = marginTop;
        }
        doc.setFontSize(CONFIG.fontSizeSubtitle);
        doc.setFont(CONFIG.fontFamily, 'bold');
        doc.text('Lista de Chequeo', marginLeft, y);
        y += 8;

        doc.setFontSize(CONFIG.fontSizeBody);
        doc.setFont(CONFIG.fontFamily, 'italic');
        doc.setTextColor(80, 80, 80);
        doc.text('Marque con una X en las casillas Sí o No en cada actividad.', marginLeft + CONFIG.indent, y);
        y += 6;

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
            styles: {
              font: CONFIG.fontFamily,
              fontSize: 8,
              textColor: [0, 0, 0],
            },
            headStyles: {
              fillColor: [60, 60, 60],
              textColor: [255, 255, 255],
              fontSize: 8,
              fontStyle: 'bold'
            },
            bodyStyles: {
              fontSize: 8
            },
            columnStyles: {
              0: { cellWidth: 80 },
              1: { cellWidth: 18 },
              2: { cellWidth: 60 }
            },
            margin: { left: marginLeft, right: marginRight }
          });

          y = doc.lastAutoTable.finalY + 8;
        }

        // ============ 7. ACTIVIDADES REALIZADAS ============
        if (m.actividadesRealizadas) {
          if (y > pageHeight - 50) {
            doc.addPage();
            y = marginTop;
          }
          doc.setFontSize(CONFIG.fontSizeSubtitle);
          doc.setFont(CONFIG.fontFamily, 'bold');
          doc.text('Actividades Realizadas', marginLeft, y);
          y += 8;
          
          doc.setFontSize(CONFIG.fontSizeBody);
          doc.setFont(CONFIG.fontFamily, 'normal');
          doc.setTextColor(0, 0, 0);
          const actLines = doc.splitTextToSize(m.actividadesRealizadas, contentWidth);
          doc.text(actLines, marginLeft + CONFIG.indent, y);
          y += actLines.length * 6 + 5;
        }

        // ============ 8. PRUEBAS ESTÁTICAS ============
        if (m.pruebasEstaticas) {
          if (y > pageHeight - 50) {
            doc.addPage();
            y = marginTop;
          }

          doc.setFontSize(CONFIG.fontSizeSubtitle);
          doc.setFont(CONFIG.fontFamily, 'bold');
          doc.text('Pruebas Estáticas', marginLeft, y);
          y += 8;

          // Conversor
          doc.setFontSize(CONFIG.fontSizeBody);
          doc.setFont(CONFIG.fontFamily, 'bold');
          doc.text('Conversor', marginLeft, y);
          y += 6;

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
              styles: {
                font: CONFIG.fontFamily,
                fontSize: 8,
                textColor: [0, 0, 0],
              },
              headStyles: {
                fillColor: [60, 60, 60],
                textColor: [255, 255, 255],
                fontSize: 8,
                fontStyle: 'bold'
              },
              bodyStyles: {
                fontSize: 8
              },
              columnStyles: {
                0: { cellWidth: 55 },
                1: { cellWidth: 40 },
                2: { cellWidth: 40 }
              },
              margin: { left: marginLeft, right: marginRight }
            });

            y = doc.lastAutoTable.finalY + 5;
          }

          if (y > pageHeight - 50) {
            doc.addPage();
            y = marginTop;
          }

          doc.setFontSize(CONFIG.fontSizeBody);
          doc.setFont(CONFIG.fontFamily, 'bold');
          doc.text('Inversor', marginLeft, y);
          y += 6;

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
              styles: {
                font: CONFIG.fontFamily,
                fontSize: 8,
                textColor: [0, 0, 0],
              },
              headStyles: {
                fillColor: [60, 60, 60],
                textColor: [255, 255, 255],
                fontSize: 8,
                fontStyle: 'bold'
              },
              bodyStyles: {
                fontSize: 8
              },
              columnStyles: {
                0: { cellWidth: 55 },
                1: { cellWidth: 40 },
                2: { cellWidth: 40 }
              },
              margin: { left: marginLeft, right: marginRight }
            });

            y = doc.lastAutoTable.finalY + 8;
          }
        }

        // ============ 9. ACCESORIOS CAMBIADOS ============
        if (m.accesoriosCambiados?.length > 0 && m.accesoriosCambiados[0]?.codigoSap) {
          if (y > pageHeight - 50) {
            doc.addPage();
            y = marginTop;
          }

          doc.setFontSize(CONFIG.fontSizeSubtitle);
          doc.setFont(CONFIG.fontFamily, 'bold');
          doc.text('Accesorios Cambiados', marginLeft, y);
          y += 8;

          const accData = m.accesoriosCambiados.map(item => [
            item.cantidad || '',
            item.codigoSap || '',
            item.detalle || '',
            item.reserva || ''
          ]);

          doc.autoTable({
            startY: y,
            head: [['Cant', 'Código SAP', 'Detalle', 'Reserva']],
            body: accData,
            theme: 'striped',
            styles: {
              font: CONFIG.fontFamily,
              fontSize: 8,
              textColor: [0, 0, 0],
            },
            headStyles: {
              fillColor: [60, 60, 60],
              textColor: [255, 255, 255],
              fontSize: 8,
              fontStyle: 'bold'
            },
            bodyStyles: {
              fontSize: 8
            },
            columnStyles: {
              0: { cellWidth: 18 },
              1: { cellWidth: 38 },
              2: { cellWidth: 58 },
              3: { cellWidth: 28 }
            },
            margin: { left: marginLeft, right: marginRight }
          });

          y = doc.lastAutoTable.finalY + 8;
        }

        // ============ 10. REGISTRO FOTOGRÁFICO ============
        if (m.registroFotografico) {
          y = agregarRegistroFotografico(doc, m.registroFotografico, y, pageWidth);
        }

        // ============ 11. CONCLUSIONES Y RECOMENDACIONES ============
        if (m.conclusiones || m.recomendaciones) {
          if (y > pageHeight - 50) {
            doc.addPage();
            y = marginTop;
          }

          if (m.conclusiones) {
            doc.setFontSize(CONFIG.fontSizeSubtitle);
            doc.setFont(CONFIG.fontFamily, 'bold');
            doc.text('Conclusiones', marginLeft, y);
            y += 8;
            
            doc.setFontSize(CONFIG.fontSizeBody);
            doc.setFont(CONFIG.fontFamily, 'normal');
            doc.setTextColor(0, 0, 0);
            const conLines = doc.splitTextToSize(m.conclusiones, contentWidth);
            doc.text(conLines, marginLeft + CONFIG.indent, y);
            y += conLines.length * 6 + 5;
          }

          if (m.recomendaciones) {
            if (y > pageHeight - 50) {
              doc.addPage();
              y = marginTop;
            }
            doc.setFontSize(CONFIG.fontSizeSubtitle);
            doc.setFont(CONFIG.fontFamily, 'bold');
            doc.text('Recomendaciones', marginLeft, y);
            y += 8;
            
            doc.setFontSize(CONFIG.fontSizeBody);
            doc.setFont(CONFIG.fontFamily, 'normal');
            doc.setTextColor(0, 0, 0);
            const recLines = doc.splitTextToSize(m.recomendaciones, contentWidth);
            doc.text(recLines, marginLeft + CONFIG.indent, y);
            y += recLines.length * 6 + 5;
          }
        }

        // ============ 12. FIRMA DEL TÉCNICO ============
        if (y > pageHeight - 60) {
          doc.addPage();
          y = marginTop;
        }

        doc.setFontSize(CONFIG.fontSizeSubtitle);
        doc.setFont(CONFIG.fontFamily, 'bold');
        doc.text('Firma del Técnico', marginLeft, y);
        y += 10;

        doc.setFontSize(CONFIG.fontSizeBody);
        doc.setFont(CONFIG.fontFamily, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Nombre: ${m.firmaTecnico?.nombre || m.tecnico || 'N/A'}`, marginLeft + CONFIG.indent, y);
        y += 7;
        doc.text(`Cargo: ${m.firmaTecnico?.cargo || 'Field Specialist'}`, marginLeft + CONFIG.indent, y);
        y += 7;
        doc.text(`Teléfono: ${m.firmaTecnico?.telefono || 'N/A'}`, marginLeft + CONFIG.indent, y);
        y += 7;
        doc.text(`Correo: ${m.firmaTecnico?.correo || 'N/A'}`, marginLeft + CONFIG.indent, y);
        y += 12;

        // Línea de firma
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(marginLeft + CONFIG.indent, y, marginLeft + CONFIG.indent + 80, y);
        y += 5;
        doc.setFontSize(CONFIG.fontSizeCaption);
        doc.setFont(CONFIG.fontFamily, 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text('Firma del Técnico', marginLeft + CONFIG.indent, y);

        // ============ PIE DE PÁGINA (APA: número de página en esquina inferior derecha) ============
        const pageCount = doc.internal.pages.length;
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(CONFIG.fontSizeCaption);
          doc.setTextColor(150, 150, 150);
          doc.setFont(CONFIG.fontFamily, 'normal');
          // Número de página en esquina inferior derecha (APA)
          doc.text(
            `${i}`,
            pageWidth - marginRight,
            pageHeight - marginBottom + 8,
            { align: 'right' }
          );
          // Pie de página con nombre del reporte
          doc.setFontSize(7);
          doc.setTextColor(180, 180, 180);
          doc.text(
            `INEMEC - Reporte de Mantenimiento - ${format(fechaGeneracion, 'dd/MM/yyyy')}`,
            pageWidth / 2,
            pageHeight - marginBottom + 8,
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
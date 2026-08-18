import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  CircularProgress, Alert, Paper
} from '@mui/material';
import {
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Dangerous as DangerousIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { getVSDStats, getVSDs } from '../services/vsdService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    mantenimiento: 0,
    criticos: 0,
    inactivos: 0
  });
  const [vsds, setVsds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, vsdsData] = await Promise.all([
        getVSDStats(),
        getVSDs()
      ]);
      setStats(statsData);
      setVsds(vsdsData || []);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Datos para gráfico de barras (estados)
  const barData = {
    labels: ['Activos', 'Mantenimiento', 'Críticos', 'Inactivos'],
    datasets: [
      {
        label: 'VSDs por Estado',
        data: [
          stats.activos,
          stats.mantenimiento,
          stats.criticos,
          stats.inactivos
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderColor: [
          '#22c55e',
          '#eab308',
          '#ef4444',
          '#6b7280'
        ],
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  // Datos para gráfico de pastel (fabricantes)
  const getManufacturerData = () => {
    const manufacturers = {};
    vsds.forEach(vsd => {
      const key = vsd.manufacturer || 'Sin fabricante';
      manufacturers[key] = (manufacturers[key] || 0) + 1;
    });
    const labels = Object.keys(manufacturers);
    const values = Object.values(manufacturers);
    const colors = [
      'rgba(37, 99, 235, 0.8)',
      'rgba(234, 179, 8, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(236, 72, 153, 0.8)'
    ];
    return { labels, values, colors };
  };

  const manufacturerData = getManufacturerData();

  const pieData = {
    labels: manufacturerData.labels,
    datasets: [
      {
        data: manufacturerData.values,
        backgroundColor: manufacturerData.colors,
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  };

  // Opciones de gráficos
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Distribución de VSDs por Estado',
        color: '#1a1a1a',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'VSDs por Fabricante',
        color: '#1a1a1a',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const cards = [
    { title: 'Total VSDs', value: stats.total, icon: BuildIcon, color: '#2563eb', bg: '#eff6ff' },
    { title: 'Activos', value: stats.activos, icon: CheckCircleIcon, color: '#22c55e', bg: '#f0fdf4' },
    { title: 'Mantenimiento', value: stats.mantenimiento, icon: WarningIcon, color: '#eab308', bg: '#fefce8' },
    { title: 'Críticos', value: stats.criticos, icon: DangerousIcon, color: '#ef4444', bg: '#fef2f2' },
    { title: 'Inactivos', value: stats.inactivos, icon: BlockIcon, color: '#6b7280', bg: '#f3f4f6' }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card sx={{ bgcolor: card.bg, borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" variant="subtitle2">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {card.value}
                    </Typography>
                  </Box>
                  <card.icon sx={{ fontSize: 40, color: card.color }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Gráfico de barras */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ height: 300 }}>
              <Bar data={barData} options={barOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico de pastel */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ height: 300 }}>
              {manufacturerData.labels.length > 0 ? (
                <Doughnut data={pieData} options={pieOptions} />
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography color="textSecondary">No hay datos de fabricantes</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

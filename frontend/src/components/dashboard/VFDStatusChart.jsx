import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

const COLORS = {
  online: '#4caf50',
  offline: '#f44336',
  alarm: '#ff9800',
  maintenance: '#2196f3'
};

const VFDStatusChart = ({ data }) => {
  const theme = useTheme();

  // Transformar datos para el gráfico
  const chartData = Object.keys(data).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: data[key],
    color: COLORS[key] || '#9e9e9e'
  }));

  if (!chartData || chartData.length === 0 || chartData.every(d => d.value === 0)) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="textSecondary">No hay datos disponibles</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Estado de VFDs
      </Typography>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default VFDStatusChart;

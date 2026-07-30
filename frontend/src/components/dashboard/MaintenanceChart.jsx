import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

const MaintenanceChart = ({ data, title = "Mantenimientos por Tipo" }) => {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="textSecondary">No hay datos disponibles</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="value"
            fill={theme.palette.primary.main}
            radius={[8, 8, 0, 0]}
            name="Cantidad"
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default MaintenanceChart;

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

const HealthChart = ({ data, title = "Health Score Histórico" }) => {
  const theme = useTheme();

  // Si no hay datos, mostrar mensaje
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
        <AreaChart data={data}>
          <defs>
            <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="health"
            stroke={theme.palette.primary.main}
            fillOpacity={1}
            fill="url(#healthGradient)"
            name="Health Score"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default HealthChart;

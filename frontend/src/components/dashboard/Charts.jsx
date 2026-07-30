import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';
import { maintenance } from '../../api/endpoints';

const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3'];

const Charts = ({ type, stats }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (type === 'maintenance') {
        const res = await maintenance.getAll();
        const maintenanceData = res.data.data || [];
        
        const grouped = maintenanceData.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.keys(grouped).map(key => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: grouped[key]
        }));
        
        setData(chartData);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  if (type === 'health') {
    const healthData = [
      { name: 'Excelente (>80%)', value: stats?.avgHealth > 80 ? 1 : 0 },
      { name: 'Regular (60-80%)', value: stats?.avgHealth >= 60 && stats?.avgHealth <= 80 ? 1 : 0 },
      { name: 'Crítico (<60%)', value: stats?.avgHealth < 60 ? 1 : 0 }
    ];

    return (
      <Box height={200}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={healthData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {healthData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    );
  }

  if (type === 'maintenance') {
    return (
      <Box height={250}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.length > 0 ? data : [{ name: 'Sin datos', value: 0 }]}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#1976d2" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  }

  return null;
};

export default Charts;

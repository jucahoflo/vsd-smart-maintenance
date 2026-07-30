const { Server } = require('socket.io');
const { supabaseAdmin } = require('../config/supabase');

let io;

function initWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*', // Permitir todos los orígenes
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    socket.on('join-vfd', (vfdId) => {
      socket.join(`vfd-${vfdId}`);
      console.log(`📡 Cliente ${socket.id} unido a VFD: ${vfdId}`);
    });

    socket.on('leave-vfd', (vfdId) => {
      socket.leave(`vfd-${vfdId}`);
      console.log(`📡 Cliente ${socket.id} salió de VFD: ${vfdId}`);
    });

    socket.on('telemetry-update', async (data) => {
      try {
        const { vfd_id, ...telemetryData } = data;

        const telemetry = {
          vfd_id,
          frequency: telemetryData.frequency || 0,
          voltage: telemetryData.voltage || 0,
          current: telemetryData.current || 0,
          power: telemetryData.power || 0,
          speed: telemetryData.speed || 0,
          temperature: telemetryData.temperature || 0,
          torque: telemetryData.torque || 0,
          timestamp: new Date().toISOString()
        };

        const { error } = await supabaseAdmin
          .from('telemetry')
          .insert([telemetry]);

        if (error) throw error;

        await updateVFDStatus(vfd_id, telemetryData);

        io.to(`vfd-${vfd_id}`).emit('telemetry-received', {
          vfd_id,
          ...telemetryData,
          timestamp: new Date().toISOString()
        });

        await checkAlerts(vfd_id, telemetryData);

      } catch (error) {
        console.error('Error en telemetry-update:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
}

async function updateVFDStatus(vfdId, data) {
  const updates = {
    current_frequency: data.frequency,
    current_voltage: data.voltage,
    current_current: data.current,
    current_power: data.power,
    current_speed: data.speed,
    current_temperature: data.temperature,
    current_torque: data.torque,
    status: 'online',
    updated_at: new Date().toISOString()
  };

  let healthScore = 100;
  if (data.temperature > 60) healthScore -= 20;
  else if (data.temperature > 50) healthScore -= 10;
  if (data.current > 100) healthScore -= 20;
  else if (data.current > 85) healthScore -= 10;

  updates.health_score = Math.max(0, Math.min(100, healthScore));

  if (healthScore < 60) updates.risk_level = 'high';
  else if (healthScore < 80) updates.risk_level = 'medium';
  else updates.risk_level = 'low';

  const { error } = await supabaseAdmin
    .from('vfds')
    .update(updates)
    .eq('id', vfdId);

  if (error) throw error;
}

async function checkAlerts(vfdId, data) {
  const { data: vfd, error } = await supabaseAdmin
    .from('vfds')
    .select('thresholds')
    .eq('id', vfdId)
    .single();

  if (error || !vfd?.thresholds) return;

  const thresholds = vfd.thresholds;
  let alerts = [];

  if (data.temperature > thresholds.temperature?.critical) {
    alerts.push({
      vfd_id: vfdId,
      type: 'parameter_exceeded',
      severity: 'critical',
      message: `Temperatura crítica: ${data.temperature}°C`,
      parameter: 'temperature',
      current_value: data.temperature,
      threshold_value: thresholds.temperature.critical
    });
  } else if (data.temperature > thresholds.temperature?.max) {
    alerts.push({
      vfd_id: vfdId,
      type: 'parameter_exceeded',
      severity: 'warning',
      message: `Temperatura alta: ${data.temperature}°C`,
      parameter: 'temperature',
      current_value: data.temperature,
      threshold_value: thresholds.temperature.max
    });
  }

  if (data.current > thresholds.current?.critical) {
    alerts.push({
      vfd_id: vfdId,
      type: 'parameter_exceeded',
      severity: 'critical',
      message: `Corriente crítica: ${data.current}A`,
      parameter: 'current',
      current_value: data.current,
      threshold_value: thresholds.current.critical
    });
  } else if (data.current > thresholds.current?.max) {
    alerts.push({
      vfd_id: vfdId,
      type: 'parameter_exceeded',
      severity: 'warning',
      message: `Corriente alta: ${data.current}A`,
      parameter: 'current',
      current_value: data.current,
      threshold_value: thresholds.current.max
    });
  }

  for (const alert of alerts) {
    await supabaseAdmin
      .from('alerts')
      .insert([alert]);
  }

  if (alerts.length > 0) {
    io.to(`vfd-${vfdId}`).emit('alerts', alerts);
  }
}

module.exports = { initWebSocket, getIO: () => io };

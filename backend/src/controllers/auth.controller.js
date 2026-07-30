const { supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'vsd_secret_key';

class AuthController {
  // ===========================
  // REGISTRO
  // ===========================
  async register(req, res) {
    try {
      const { username, password, name, role } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Usuario y contraseña son requeridos'
        });
      }

      // Verificar si el usuario ya existe
      const { data: existing } = await supabaseAdmin
        .from('usuarios')
        .select('username')
        .eq('username', username)
        .single();

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'El usuario ya existe'
        });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const { data, error } = await supabaseAdmin
        .from('usuarios')
        .insert([{
          username,
          password: hashedPassword,
          name: name || username,
          role: role || 'technician'
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        message: '✅ Usuario registrado exitosamente',
        data: {
          id: data.id,
          username: data.username,
          name: data.name,
          role: data.role
        }
      });

    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // LOGIN
  // ===========================
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Usuario y contraseña son requeridos'
        });
      }

      // Buscar usuario
      const { data: user, error } = await supabaseAdmin
        .from('usuarios')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: 'Usuario o contraseña incorrectos'
        });
      }

      // Verificar contraseña
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          error: 'Usuario o contraseña incorrectos'
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: '✅ Login exitoso',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
          }
        }
      });

    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===========================
  // PERFIL
  // ===========================
  async getProfile(req, res) {
    try {
      const user = req.user;
      
      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new AuthController();

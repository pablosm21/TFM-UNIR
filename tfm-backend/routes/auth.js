const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ✓ REGISTRO DE USUARIO
router.post('/register', async (req, res) => {
  try {
    const { email, password, nombre } = req.body;

    // Validar entrada
    if (!email || !password || !nombre) {
      return res.status(400).json({ 
        error: 'Email, contraseña y nombre son requeridos' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Email inválido' 
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    const connection = await pool.getConnection();

    try {
      // Verificar si el usuario ya existe
      const [existingUser] = await connection.query(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );

      if (existingUser.length > 0) {
        return res.status(409).json({ 
          error: 'El email ya está registrado' 
        });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar usuario en BD
      const [result] = await connection.query(
        'INSERT INTO usuarios (email, password, nombre, created_at) VALUES (?, ?, ?, NOW())',
        [email, hashedPassword, nombre]
      );

      res.status(201).json({ 
        message: 'Usuario registrado correctamente',
        userId: result.insertId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario' 
    });
  }
});

// ✓ LOGIN DE USUARIO
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    const connection = await pool.getConnection();

    try {
      // Buscar usuario
      const [users] = await connection.query(
        'SELECT id, email, password, nombre FROM usuarios WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ 
          error: 'Credenciales inválidas' 
        });
      }

      const user = users[0];

      // Comparar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ 
          error: 'Credenciales inválidas' 
        });
      }

      // Generar JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Registrar último login
      await connection.query(
        'UPDATE usuarios SET last_login = NOW() WHERE id = ?',
        [user.id]
      );

      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión' 
    });
  }
});

// ✓ VERIFICAR TOKEN
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.query(
        'SELECT id, email, nombre FROM usuarios WHERE id = ?',
        [req.userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ 
          error: 'Usuario no encontrado' 
        });
      }

      res.json({
        message: 'Token válido',
        user: users[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({ 
      error: 'Error al verificar token' 
    });
  }
});

// ✓ OBTENER PERFIL DEL USUARIO
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.query(
        'SELECT id, email, nombre, created_at, last_login FROM usuarios WHERE id = ?',
        [req.userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ 
          error: 'Usuario no encontrado' 
        });
      }

      res.json(users[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ 
      error: 'Error al obtener perfil' 
    });
  }
});

// ✓ LOGOUT (simplemente elimina el token del cliente)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Sesión cerrada correctamente' 
  });
});

module.exports = router;

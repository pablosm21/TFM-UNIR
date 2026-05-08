require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;
const cors = require('cors');

// Importar rutas de autenticación
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

// Habilitar CORS para permitir solicitudes desde el frontend
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// ✓ RUTAS DE AUTENTICACIÓN
app.use('/api/auth', authRoutes);

// Endpoint protegido de prueba
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Acceso autorizado',
    userId: req.userId,
    userEmail: req.userEmail
  });
});

// Endpoint para ejecutar un comando de bash (protegido)
app.post('/api/execute', authMiddleware, (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'No se proporcionó ningún comando' });
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ stdout, stderr });
  });
});

// Endpoint para recibir parámetros y procesarlos (protegido)
app.post('/api/process', authMiddleware, (req, res) => {
  const { param1, param2, param3 } = req.body;

  if (!param1 || !param2 || !param3) {
    return res.status(400).json({ error: 'Faltan parámetros en la solicitud' });
  }

  // Procesar los parámetros (ejemplo)
  const result = {
    message: 'Parámetros recibidos correctamente',
    processedData: {
      param1: param1.toUpperCase(),
      param2: param2 * 2,
      param3: `Hola, ${param3}`
    }
  };

  res.json(result);
});

const componentDirs = {
  1: '/home/psmolina/TFM-SIMULATION/project/javascript_component',
  2: '/home/psmolina/TFM-SIMULATION/project/java_component',
  3: '/home/psmolina/TFM-SIMULATION/project/cpp_component',
  4: '/home/psmolina/TFM-SIMULATION/project/python_component',
  5: '/home/psmolina/TFM-SIMULATION/project/log_component',
};

const getBoxColor = (salidaOutExists, validCompilationExists) => {
  if (!salidaOutExists && !validCompilationExists) return 'white';
  if (salidaOutExists && !validCompilationExists) return 'red';
  if (salidaOutExists && validCompilationExists) return 'green';
  return 'yellow';
};

app.get('/api/box-statuses', authMiddleware, (req, res) => {
  const statuses = Object.entries(componentDirs).map(([id, dir]) => {
    const salidaOutPath = path.join(dir, 'salida.log');
    const validCompilationPath = path.join(dir, 'valid_compilation');

    const salidaOutExists = fs.existsSync(salidaOutPath);
    const validCompilationExists = fs.existsSync(validCompilationPath);

    return {
      id: Number(id),
      salidaOutExists,
      validCompilationExists,
      color: getBoxColor(salidaOutExists, validCompilationExists),
      salidaOutPath,
      validCompilationPath,
    };
  });

  res.json({ statuses });
});

// Crear el servidor HTTP y conectar WebSockets
const http = require('http');
const server = http.createServer(app);

// Integrar sockets.js
require('./sockets')(server);

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
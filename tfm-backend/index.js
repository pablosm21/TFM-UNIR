const express = require('express');
const { exec } = require('child_process');
const app = express();
const PORT = 3001;
const cors = require('cors');

// Habilitar CORS para permitir solicitudes desde el frontend
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Endpoint para ejecutar un comando de bash
app.post('/execute', (req, res) => {
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

// Endpoint para recibir parámetros y procesarlos
app.post('/process', (req, res) => {
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

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
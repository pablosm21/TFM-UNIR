const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/app');
const { buildStatuses } = require('./services/boxStatusService');
const { executeWhitelistedAction } = require('./services/commandService');

const app = express();

// Importar rutas de autenticación
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (config.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: false,
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/box-statuses' || req.path === '/api/health',
});

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '64kb' }));
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
app.use(generalLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: config.env,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

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
  const { boxId, actionLabel } = req.body || {};

  if (!boxId || !actionLabel) {
    return res.status(400).json({ error: 'boxId y actionLabel son requeridos' });
  }

  executeWhitelistedAction({ boxId, actionLabel })
    .then((result) => {
      res.json({
        boxId: Number(boxId),
        actionLabel: String(actionLabel),
        ...result,
      });
    })
    .catch((error) => {
      if (error.message === 'Accion no permitida') {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
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

app.get('/api/box-statuses', authMiddleware, (req, res) => {
  res.json({ statuses: buildStatuses() });
});

// Crear el servidor HTTP y conectar WebSockets
const http = require('http');
const server = http.createServer(app);

// Integrar sockets.js
require('./sockets')(server);

server.listen(config.port, () => {
  console.log(`Servidor corriendo en http://localhost:${config.port}`);
});
const jwt = require('jsonwebtoken');
const config = require('../config/app');

// Middleware para verificar JWT
const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer') {
    return res.status(401).json({
      error: 'No autorizado - Esquema Bearer requerido'
    });
  }

  if (!token) {
    return res.status(401).json({ 
      error: 'No autorizado - Token requerido' 
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado' 
      });
    }
    return res.status(401).json({ 
      error: 'Token inválido' 
    });
  }
};

module.exports = authMiddleware;

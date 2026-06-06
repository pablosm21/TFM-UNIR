# TFM Backend - Sistema de Autenticación

Sistema backend con autenticación JWT y BD MySQL independiente.

## 📋 Requisitos

- Node.js v14+
- MySQL Server corriendo en una máquina (local o remota)

## 🚀 Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar la Base de Datos

#### En tu servidor MySQL (local o remoto):

```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar el script de inicialización
mysql -u root -p < init_database.sql

# O ejecutar manualmente:
```

```sql
CREATE DATABASE IF NOT EXISTS tfm_unir;
USE tfm_unir;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Configurar variables de entorno

Copiar `.env.example` a `.env` y actualizar con tus datos:

```bash
cp .env.example .env
```

Editar `.env` con tus datos de conexión:

```env
# BASE DE DATOS MySQL
DB_HOST=localhost           # O IP del servidor MySQL remoto
DB_PORT=3306
DB_USER=root                # Tu usuario MySQL
DB_PASSWORD=tu_contraseña   # Tu contraseña MySQL
DB_NAME=tfm_unir

# JWT
JWT_SECRET=clave_secreta_muy_segura_aqui_123!@#
JWT_EXPIRE=7d

# SERVER
PORT=3001
NODE_ENV=development
```

### 4. Iniciar el servidor

```bash
npm start
# o
node index.js
```

Deberías ver:
```
✓ Conectado a MySQL correctamente
Servidor corriendo en http://localhost:3001
```

## 📡 Endpoints API

### Autenticación (sin protección)

#### Registro
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña123",
  "nombre": "Juan Pérez"
}

Respuesta (201):
{
  "message": "Usuario registrado correctamente",
  "userId": 1
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña123"
}

Respuesta (200):
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "nombre": "Juan Pérez"
  }
}
```

### Rutas Protegidas (requieren token JWT)

**Header requerido:**
```
Authorization: Bearer <tu_token_jwt>
```

#### Verificar Token
```bash
GET /api/auth/verify
Authorization: Bearer <token>

Respuesta (200):
{
  "message": "Token válido",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "nombre": "Juan Pérez"
  }
}
```

#### Obtener Perfil
```bash
GET /api/auth/profile
Authorization: Bearer <token>

Respuesta (200):
{
  "id": 1,
  "email": "usuario@example.com",
  "nombre": "Juan Pérez",
  "created_at": "2026-05-08T10:30:00.000Z",
  "last_login": "2026-05-08T11:45:00.000Z"
}
```

#### Logout
```bash
POST /api/auth/logout
Authorization: Bearer <token>

Respuesta (200):
{
  "message": "Sesión cerrada correctamente"
}
```

#### Endpoint Protegido de Prueba
```bash
GET /api/protected
Authorization: Bearer <token>

Respuesta (200):
{
  "message": "Acceso autorizado",
  "userId": 1,
  "userEmail": "usuario@example.com"
}
```

#### Ejecutar Acción Permitida (protegido)
```bash
POST /api/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "boxId": 5,
  "actionLabel": "m"
}
```

> Seguridad: el backend ya no ejecuta comandos arbitrarios enviados por el cliente.
> Solo ejecuta acciones permitidas por una allowlist interna.

#### Procesar Parámetros (protegido)
```bash
POST /api/process
Authorization: Bearer <token>
Content-Type: application/json

{
  "param1": "texto",
  "param2": 5,
  "param3": "nombre"
}
```

#### Box Statuses (protegido)
```bash
GET /api/box-statuses
Authorization: Bearer <token>

Respuesta (200):
{
  "statuses": [...]
}
```

#### Healthcheck
```bash
GET /api/health

Respuesta (200):
{
  "status": "ok",
  "env": "development",
  "uptimeSeconds": 123,
  "timestamp": "2026-06-06T12:34:56.000Z"
}
```

## 🔒 Seguridad

✓ Contraseñas hasheadas con bcryptjs
✓ JWT con expiración configurables
✓ Endpoints protegidos con middleware
✓ Validación de entrada en servidor
✓ Índices de BD para rendimiento
✓ Rate limiting global y en autenticación
✓ Helmet para cabeceras HTTP seguras
✓ CORS restringido por origen configurable
✓ Ejecución de acciones por allowlist

## 📝 Estructura de Carpetas

```
tfm-backend/
├── config/
│   └── database.js        # Configuración de MySQL
├── middleware/
│   └── auth.js            # Middleware JWT
├── routes/
│   └── auth.js            # Rutas de autenticación
├── index.js               # Servidor principal
├── package.json
├── .env.example           # Variables de entorno template
├── .env                   # Variables de entorno (NO subir a git)
├── init_database.sql      # Script SQL para crear BD
└── sockets.js             # WebSockets
```

## 🧪 Pruebas con cURL

```bash
# Registrar usuario
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","nombre":"Test User"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"12345678"}' | jq -r '.token')

# Usar token en endpoint protegido
curl -X GET http://localhost:3001/api/protected \
  -H "Authorization: Bearer $TOKEN"
```

## 🛠️ Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| DB_HOST | Host de MySQL | localhost o 192.168.1.100 |
| DB_PORT | Puerto de MySQL | 3306 |
| DB_USER | Usuario MySQL | root |
| DB_PASSWORD | Contraseña MySQL | secure_password |
| DB_NAME | Nombre de BD | tfm_unir |
| JWT_SECRET | Clave para firmar JWT | clave_super_segura |
| JWT_EXPIRE | Expiración del token | 7d, 24h, etc |
| PORT | Puerto del servidor | 3001 |
| NODE_ENV | Ambiente | development, production |
| CORS_ORIGINS | Lista de orígenes HTTP permitidos (CSV) | http://localhost:3000 |
| SOCKET_CORS_ORIGINS | Lista de orígenes Socket.IO permitidos (CSV) | http://localhost:3000 |
| COMMAND_TIMEOUT_MS | Timeout de ejecución de acción | 120000 |
| COMMAND_MAX_BUFFER_BYTES | Buffer máximo stdout/stderr | 1048576 |
| STATUS_POLL_INTERVAL_MS | Intervalo sugerido de polling para frontend | 3000 |

## 🐛 Troubleshooting

### Error: "connect ECONNREFUSED"
- ✓ Verifica que MySQL esté corriendo
- ✓ Verifica host y puerto en .env
- ✓ Prueba: `mysql -h 192.168.x.x -u root -p`

### Error: "Unknown database 'tfm_unir'"
- ✓ Ejecuta el script init_database.sql
- ✓ Verifica que creaste la BD

### Error: "ER_ACCESS_DENIED_FOR_USER"
- ✓ Verifica usuario y contraseña en .env
- ✓ Resetea la contraseña MySQL si es necesario

## 📚 Recursos

- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)

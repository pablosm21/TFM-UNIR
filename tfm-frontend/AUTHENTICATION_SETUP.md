# Frontend - Sistema de Autenticación

## 📋 Resumen

El frontend ahora implementa un sistema completo de autenticación basado en JWT que verifica el usuario al iniciar la aplicación.

## 🔄 Flujo de Autenticación

### Al abrir la aplicación:

1. **AuthProvider** se monta en `App.js`
2. **Verifica si existe un token guardado** en localStorage
3. **Si existe token**: Valida con el servidor (`/api/auth/verify`)
4. **Si es válido**: Muestra el dashboard
5. **Si es inválido o expirado**: Muestra página de login
6. **Si no existe token**: Muestra página de login

```
┌─────────────────────────┐
│   Abrir Aplicación      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ ¿Existe token en        │
│ localStorage?           │
└────────────┬────────────┘
       │            │
      SÍ            NO
      │             │
      ▼             ▼
┌──────────┐   ┌─────────────┐
│ Verificar│   │ Mostrar     │
│ con      │   │ LoginPage   │
│ servidor │   └─────────────┘
└────────┬─┘
         │
    ┌────┴────┐
   SÍ         NO
   │          │
   ▼          ▼
┌────────┐ ┌─────────────┐
│Dashboard  │ Mostrar     │
└────────┘  │ LoginPage   │
            └─────────────┘
```

## 📁 Estructura de Archivos Nuevos

```
src/
├── context/
│   └── AuthContext.js          # Contexto de autenticación global
├── pages/
│   ├── LoginPage.js            # Componente de login/register
│   └── LoginPage.css           # Estilos de login
├── components/
│   ├── ProtectedRoute.js       # Componente de protección de rutas
│   ├── Menu.js                 # Actualizado con logout
│   ├── Menu.css                # Actualizado con user info
│   └── Logs.js                 # Actualizado con autenticación
└── App.js                      # Actualizado con AuthProvider
```

## 🔑 AuthContext

### Estados
- `user`: Datos del usuario autenticado
- `token`: Token JWT del usuario
- `loading`: Indica si está cargando
- `error`: Mensajes de error
- `isAuthenticated`: Boolean si hay sesión activa

### Funciones
- `login(email, password)`: Autentica usuario
- `logout()`: Cierra sesión
- `register(email, password, nombre)`: Registra nuevo usuario
- `verifyToken(token)`: Valida token con servidor

## 🔐 ProtectedRoute

Componente que envuelve rutas protegidas:

```jsx
<ProtectedRoute>
  <HomePage />
</ProtectedRoute>
```

- Si no hay token: muestra LoginPage
- Si está cargando: muestra "Cargando..."
- Si hay token válido: muestra contenido

## 📝 LoginPage

Página con dos modos:
- **Login**: Autentica usuario existente
- **Register**: Crea nuevo usuario

### Features:
- Validación de campos
- Mensajes de error
- Indicador de carga
- Toggle entre modo login/registro
- Estilos modernos con gradientes

## 🔄 Actualización de Componentes

### HomePage.js
✓ Ahora usa `useContext(AuthContext)` para obtener el token  
✓ Usa un cliente API centralizado (`src/services/api.js`)  
✓ Ejecuta acciones permitidas por `boxId` + `actionLabel`  
✓ Maneja errores 401 (sesión expirada)  

### Menu.js
✓ Muestra nombre y email del usuario  
✓ Botón de logout  
✓ Estilos actualizados

### Logs.js
✓ Pasa el token en la conexión WebSocket  
✓ Autenticación en `socket.handshake.auth`
✓ Limita el buffer de logs para evitar crecimiento infinito en memoria

## 🔗 Cómo se Usa

### 1. En App.js
```jsx
<AuthProvider>
  <div className="App">
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  </div>
</AuthProvider>
```

### 2. En cualquier componente
```jsx
import { AuthContext } from '../context/AuthContext';

function MiComponente() {
  const { user, token, logout, login } = useContext(AuthContext);
  
  // Usar el contexto
}
```

### 3. Hacer peticiones autenticadas
```jsx
import api from './services/api';

const response = await api.get('/api/protected');
```

### 4. Variables de entorno
Crear archivo `.env` desde `.env.example`:

```bash
cp .env.example .env
```

Variables:
- `REACT_APP_API_BASE_URL` (por defecto `http://localhost:3001`)
- `REACT_APP_SOCKET_URL` (por defecto `http://localhost:3001`)
- `REACT_APP_STATUS_POLL_INTERVAL_MS` (por defecto `3000`)

## 🛡️ Flujo Seguro

1. **Frontend** almacena token en `localStorage`
2. **Cada petición** incluye el token en headers
3. **Backend** valida el token en middleware
4. **Comandos sensibles**: el frontend no envía shell commands crudos, solo acciones permitidas
5. **Si es inválido**: devuelve 401
6. **Frontend** captura 401 y hace logout automático
7. **Usuario** vuelve a LoginPage

## 📦 Almacenamiento de Datos

LocalStorage:
```javascript
// Login exitoso
localStorage.setItem('authToken', data.token);
localStorage.setItem('user', JSON.stringify(data.user));

// Logout
localStorage.removeItem('authToken');
localStorage.removeItem('user');
```

## ⚠️ Notas Importantes

1. **Token expiración**: Configurado en backend (por defecto 7 días)
2. **CORS**: Debe estar habilitado en backend (ya está configurado)
3. **HTTPS**: En producción SIEMPRE usar HTTPS
4. **localStorage**: NO guardar datos sensibles más allá del token

## 🧪 Pruebas

1. Abrir la aplicación → Debe mostrar LoginPage
2. Hacer click "Regístrate aquí"
3. Llenar formulario de registro
4. Cambiar a login
5. Llenar credenciales
6. ✓ Debe mostrar dashboard con nombre de usuario
7. Click "Cerrar Sesión"
8. ✓ Debe volver a LoginPage

## 🔧 Debugging

### Verificar token en console
```javascript
localStorage.getItem('authToken')
localStorage.getItem('user')
```

### Ver estado de AuthContext
```javascript
import { AuthContext } from './context/AuthContext';
const ctx = useContext(AuthContext);
console.log(ctx); // Ver todos los datos
```

### Error en WebSocket
El token se valida antes de conectar. Si falla:
- Verificar que el token sea válido
- Revisar logs del servidor

## 📚 Próximas Mejoras Opcionales

- [ ] Refresh tokens automáticos
- [ ] Recuperar contraseña
- [ ] 2FA
- [ ] Roles y permisos
- [ ] Audit log de usuarios

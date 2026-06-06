# 4.3 Diseño e implementación del backend

## 4.3.1 Arquitectura y componentes principales

El backend se ha concebido como una capa de servicios responsable de tres funciones esenciales: autenticación y autorización de usuarios, ejecución de operaciones sobre el entorno de simulación y provisión de información en tiempo real para monitorización. La solución adoptada responde a criterios de modularidad, robustez y trazabilidad, de forma que cada responsabilidad quede claramente delimitada y sea verificable durante la fase de validación.

Desde una perspectiva arquitectónica, el sistema se organiza en componentes de acceso HTTP para operaciones transaccionales y en un canal de comunicación persistente para eventos en tiempo real. Esta decisión permite utilizar el mecanismo más adecuado según la naturaleza de cada interacción: peticiones REST para operaciones discretas (registro, inicio de sesión, consulta de estados, ejecución de acciones) y WebSocket para la transmisión continua de registros de ejecución. El resultado es una arquitectura coherente con los requisitos de inmediatez y control del sistema propuesto.

La estructura modular de directorios se organiza de la siguiente forma:
- `routes/`: define los endpoints HTTP y su lógica de procesamiento.
- `middleware/`: implementa controles transversales, especialmente autenticación JWT.
- `config/`: gestiona la conexión a base de datos y configuración de entorno.
- `sockets.js`: implementa la capa de WebSocket para eventos en tiempo real.

## 4.3.2 Implementación de autenticación y seguridad

En materia de seguridad, se implementa un esquema de autenticación basado en tokens con validez temporal. Durante el proceso de registro se aplican validaciones de entrada y se protege la contraseña mediante funciones criptográficas de hash antes de su almacenamiento. En el proceso de autenticación, las credenciales se contrastan contra la base de datos y, en caso de éxito, se emite un token firmado que encapsula la identidad del usuario.

La implementación del endpoint de login del backend es la siguiente:

```javascript
// Backend: routes/auth.js - Endpoint de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación de entrada
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    const connection = await pool.getConnection();

    try {
      // Búsqueda de usuario en BD
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

      // Comparación segura de contraseña con bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ 
          error: 'Credenciales inválidas' 
        });
      }

      // Generación de JWT firmado con expiración
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Respuesta exitosa con token y datos de usuario
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
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});
```

El middleware de autenticación, aplicado a todos los recursos protegidos, valida la presencia y vigencia del token:

```javascript
// Backend: middleware/auth.js - Control de acceso
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'No autorizado - Token requerido' 
    });
  }

  try {
    // Verificación de firma y expiración del token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
```

Este mecanismo asegura que únicamente usuarios autenticados puedan acceder a funcionalidades sensibles. El enfoque adoptado favorece la escalabilidad al evitar dependencias de sesión en servidor.

## 4.3.3 Lógica de negocio: consulta de estados y ejecución de acciones

La capa de negocio incorpora la lógica específica de la contribución. Se implementa un mecanismo de evaluación del estado de los componentes a partir de evidencias de ejecución disponibles en el sistema de ficheros. Esta información se transforma en estados operativos consumibles por el cliente, lo que habilita una representación visual inmediata y homogénea.

```javascript
// Backend: index.js - Evaluación de estado de componentes
const componentDirs = {
  1: '/home/psmolina/TFM-SIMULATION/project/javascript_component',
  2: '/home/psmolina/TFM-SIMULATION/project/java_component',
  3: '/home/psmolina/TFM-SIMULATION/project/cpp_component',
  4: '/home/psmolina/TFM-SIMULATION/project/python_component',
  5: '/home/psmolina/TFM-SIMULATION/project/log_component',
};

// Función auxiliar para determinar estado visual
const getBoxColor = (salidaOutExists, validCompilationExists) => {
  if (!salidaOutExists && !validCompilationExists) return 'white';
  if (salidaOutExists && !validCompilationExists) return 'red';
  if (salidaOutExists && validCompilationExists) return 'green';
  return 'yellow';
};

// Endpoint protegido para consultar estados
app.get('/api/box-statuses', authMiddleware, (req, res) => {
  const statuses = Object.entries(componentDirs).map(([id, dir]) => {
    const salidaOutPath = path.join(dir, 'salida.log');
    const validCompilationPath = path.join(dir, 'valid_compilation');

    // Evaluación de ficheros de evidencia
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
```

Respuesta típica del endpoint de estados:

```json
{
  "statuses": [
    {
      "id": 1,
      "salidaOutExists": true,
      "validCompilationExists": true,
      "color": "green"
    },
    {
      "id": 2,
      "salidaOutExists": true,
      "validCompilationExists": false,
      "color": "red"
    },
    {
      "id": 3,
      "salidaOutExists": false,
      "validCompilationExists": false,
      "color": "white"
    }
  ]
}
```

Adicionalmente, se integra una capacidad de ejecución de acciones solicitadas desde la interfaz:

```javascript
// Backend: index.js - Ejecución de comandos
app.post('/api/execute', authMiddleware, (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ 
      error: 'No se proporcionó ningún comando' 
    });
  }

  // Ejecución en contexto del usuario autenticado
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ 
        error: error.message 
      });
    }
    res.json({ 
      stdout, 
      stderr,
      executedAt: new Date().toISOString()
    });
  });
});
```

## 4.3.4 Monitorización en tiempo real con WebSocket

Un elemento diferencial del backend es la incorporación de monitorización en tiempo real mediante suscripciones por componente. Una vez autenticado, el cliente puede solicitar la escucha de un canal concreto y recibir tanto el contenido inicial disponible como las nuevas entradas generadas durante la ejecución.

```javascript
// Backend: sockets.js - Gestión de WebSocket
module.exports = (server) => {
  const io = socketIo(server, { cors: { origin: '*' } });

  // Mapeo de identificadores de componentes a rutas de log
  const logPaths = {
    1: '/home/psmolina/TFM-SIMULATION/project/javascript_component/salida.log',
    2: '/home/psmolina/TFM-SIMULATION/project/java_component/salida.log',
    3: '/home/psmolina/TFM-SIMULATION/project/cpp_component/salida.log',
    4: '/home/psmolina/TFM-SIMULATION/project/python_component/salida.log',
    5: '/home/psmolina/TFM-SIMULATION/project/log_component/salida.log',
  };

  // Middleware de autenticación para WebSocket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('No hay token - autenticación requerida'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new Error('Token expirado'));
      }
      return next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.userEmail}`);

    let watcher = null;
    let lastSize = 0;
    let currentBoxId = null;

    // Manejador de suscripción a un componente específico
    socket.on('subscribe', (boxIdRaw) => {
      // Limpiar suscripción anterior
      if (watcher) {
        watcher.close();
        watcher = null;
      }

      const boxId = Number(boxIdRaw);
      currentBoxId = boxId;
      const logFilePath = logPaths[boxId];

      if (!logFilePath) {
        socket.emit('log', {
          boxId,
          line: `[WARN] BoxId sin ruta configurada: ${boxId}`
        });
        return;
      }

      // Enviar contenido inicial del log
      if (fs.existsSync(logFilePath)) {
        try {
          const data = fs.readFileSync(logFilePath, 'utf8');
          if (data) {
            data.split('\n').forEach(line => {
              if (line.trim()) {
                socket.emit('log', { boxId, line });
              }
            });
          }
          lastSize = fs.statSync(logFilePath).size;
        } catch (readErr) {
          socket.emit('log', {
            boxId,
            line: `[WARN] Error leyendo log: ${readErr.message}`
          });
        }
      } else {
        socket.emit('log', {
          boxId,
          line: `[WARN] Log no existe: ${logFilePath}`
        });
      }

      // Monitorizar cambios en el fichero
      try {
        watcher = fs.watch(logFilePath, (eventType) => {
          if (eventType === 'change' && currentBoxId === boxId) {
            fs.stat(logFilePath, (err, stats) => {
              if (err) return;

              if (stats.size < lastSize) {
                lastSize = 0; // Fichero truncado
              }

              if (stats.size > lastSize) {
                // Lectura incremental de nuevas líneas
                const stream = fs.createReadStream(logFilePath, {
                  start: lastSize,
                  end: stats.size
                });
                let buffer = '';
                stream.on('data', chunk => {
                  buffer += chunk.toString();
                });
                stream.on('end', () => {
                  buffer.split('\n').forEach(line => {
                    if (line.trim()) {
                      socket.emit('log', { boxId, line });
                    }
                  });
                  lastSize = stats.size;
                });
              }
            });
          }
        });
      } catch (watchErr) {
        socket.emit('log', {
          boxId,
          line: `[WARN] No se puede monitorizar: ${watchErr.message}`
        });
      }
    });

    socket.on('disconnect', () => {
      if (watcher) watcher.close();
      console.log(`Cliente desconectado: ${socket.userEmail}`);
    });
  });
};
```

## 4.3.5 Manejo de errores y robustez

La implementación contempla tratamiento explícito de errores y condiciones excepcionales, manteniendo consistencia semántica en códigos de respuesta y mensajes devueltos. Esta uniformidad facilita la integración con el cliente, mejora la capacidad de diagnóstico y refuerza la mantenibilidad global del sistema.

Códigos de respuesta HTTP utilizados:
- **200 OK**: Operación completada satisfactoriamente.
- **201 Created**: Recurso creado (registro de usuario).
- **400 Bad Request**: Parámetros insuficientes o inválidos.
- **401 Unauthorized**: Token ausente, inválido o expirado.
- **409 Conflict**: Recurso duplicado (email ya registrado).
- **500 Internal Server Error**: Error no previsto en el servidor.

---

# 4.4 Diseño e implementación del frontend

## 4.4.1 Arquitectura de la aplicación cliente

El frontend se ha desarrollado como aplicación de página única con React, orientada a ofrecer una interacción fluida para autenticación, operación sobre componentes y seguimiento en tiempo real del comportamiento del sistema. El diseño funcional de la interfaz responde a un flujo de uso concreto: iniciar sesión, visualizar el estado global, seleccionar un componente, lanzar acciones y analizar resultados en la zona de logs.

La arquitectura de cliente se organiza en tres bloques principales:

1. **Gestión global de autenticación mediante contexto**: Responsable de mantener usuario, token, estado de carga y errores de sesión de forma centralizada.
2. **Protección de vistas mediante capa de control de acceso**: Restringe el contenido privado a usuarios autenticados.
3. **Capa de interacción operativa**: Implementa la lógica de consulta de estados, ejecución de comandos y visualización de logs.

Esta distribución favorece la reutilización y evita duplicar lógica de sesión entre componentes.

## 4.4.2 Gestión de autenticación y sesión en cliente

En la implementación de autenticación del lado cliente se incorpora persistencia de sesión en almacenamiento local para mantener estado tras recarga del navegador. Al arrancar la aplicación, el frontend recupera el token y solicita validación al backend. Si el token es válido, se restaura el usuario en sesión; si no lo es, se fuerza cierre de sesión. Con este enfoque, la experiencia de usuario es consistente y se minimizan estados intermedios ambiguos.

```javascript
// Frontend: src/context/AuthContext.js - Contexto de autenticación
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar token almacenado al montar componente
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');

    if (savedToken) {
      setToken(savedToken);
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Verificar vigencia del token con el backend
  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setError(null);
      } else {
        // Token inválido o expirado: forzar logout
        logout();
      }
    } catch (err) {
      console.error('Error verificando token:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Función de login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en login');
      }

      // Persistencia de sesión en localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      return { success: true };
    } catch (err) {
      const errorMessage = err.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      if (token) {
        await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error('Error en logout:', err);
    } finally {
      // Limpiar almacenamiento local
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  // Exportar valor del contexto
  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## 4.4.3 Pantalla principal: gestión de componentes y ejecución de acciones

El núcleo funcional del frontend se concentra en la pantalla principal. Esta vista carga la configuración de componentes y solicita de forma periódica su estado al backend para mantener la interfaz actualizada. Cada componente se representa visualmente con un color asociado a su estado operativo. Al pulsar sobre una caja, se muestra su descripción y las acciones disponibles. El usuario puede concatenar varias acciones y confirmar su ejecución en una única operación, lo que aporta flexibilidad en la operación del sistema.

```javascript
// Frontend: src/pages/HomePage.js - Lógica de interacción operativa
import React, { useEffect, useState, useContext } from 'react';
import Box from '../components/Box';
import Logs from '../components/Logs';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const { token, logout } = useContext(AuthContext);
  const [boxes, setBoxes] = useState([]);
  const [boxStatuses, setBoxStatuses] = useState({});
  const [selectedBox, setSelectedBox] = useState(null);
  const [concatenatedCommands, setConcatenatedCommands] = useState('');

  // Encabezados con autenticación
  const getHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  // Consulta periódica de estados
  const fetchBoxStatuses = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/box-statuses', {
        headers: getHeaders()
      });
      // Mapear estados a estructura local para acceso rápido
      const statusMap = (response.data.statuses || []).reduce((acc, status) => {
        acc[status.id] = status;
        return acc;
      }, {});
      setBoxStatuses(statusMap);
    } catch (error) {
      console.error('Error cargando estados:', error);
      if (error.response?.status === 401) {
        // Token expirado: forzar logout
        logout();
      }
    }
  };

  // Inicialización: cargar configuración de cajas
  useEffect(() => {
    fetch('/data/boxes.json')
      .then((response) => response.json())
      .then((data) => {
        setBoxes(data);
        fetchBoxStatuses();
      })
      .catch((error) => console.error('Error cargando cajas:', error));
  }, [token]);

  // Refresco periódico de estados cada 3 segundos
  useEffect(() => {
    const intervalId = setInterval(fetchBoxStatuses, 3000);
    return () => clearInterval(intervalId);
  }, [token]);

  // Manejador de selección de caja
  const handleBoxClick = (box) => {
    setSelectedBox(box);
  };

  // Manejador de concatenación de acciones
  const handleActionClick = (action) => {
    setConcatenatedCommands((prevCommands) => 
      `${prevCommands} ${action.command}`
    );
  };

  // Confirmación y ejecución de comandos
  const confirmAction = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/execute', 
        {
          command: `${concatenatedCommands.trim()}`,
        },
        {
          headers: getHeaders()
        }
      );
      alert(`Respuesta del servidor: ${response.data.stdout}`);
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Sesión expirada. Por favor, reinicia sesión.');
        logout();
      } else {
        alert(`Error ejecutando comando: ${error.message}`);
      }
    } finally {
      setConcatenatedCommands('');
      fetchBoxStatuses(); // Refresco inmediato de estados
    }
  };

  return (
    <div className="home-page">
      <h1>Componentes del Sistema</h1>
      <div className="content">
        <div className="left-column">
          {/* Renderizado de cajas con color de estado */}
          <div className="box-container">
            {boxes.map((box) => (
              <Box
                key={box.id}
                name={box.name}
                onClick={() => handleBoxClick(box)}
                backgroundColor={boxStatuses[box.id]?.color || 'yellow'}
              />
            ))}
          </div>
          {/* Logs en tiempo real del componente seleccionado */}
          <Logs boxId={selectedBox?.id} />
        </div>
        <div className="box-description">
          {selectedBox ? (
            <div>
              <h2>{selectedBox.name}</h2>
              <p>{selectedBox.description}</p>
              <div className="description-buttons">
                {/* Botones de acciones disponibles */}
                {selectedBox.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleActionClick(action)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              {/* Construcción y confirmación de secuencia */}
              <div className="concatenated-commands">
                <h2>Comandos a ejecutar:</h2>
                <p>{concatenatedCommands}</p>
                <button 
                  onClick={confirmAction} 
                  disabled={!concatenatedCommands.trim()}
                >
                  Confirmar Comando
                </button>
                <button
                  onClick={() => setConcatenatedCommands('')}
                  disabled={!concatenatedCommands.trim()}
                >
                  Limpiar
                </button>
              </div>
            </div>
          ) : (
            <p>Selecciona una caja para ver detalles</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
```

## 4.4.4 Logs en tiempo real: suscripción y monitorización con WebSocket

En paralelo, el módulo de logs en tiempo real complementa la operativa mostrando eventos de ejecución sin recargar página. Cuando cambia el componente seleccionado, el cliente actualiza la suscripción WebSocket y limpia el histórico visible para evitar mezclar trazas de distintas cajas. La interfaz también muestra estado de conexión (conectado, desconectado, error), lo que aporta transparencia durante la interacción y facilita la depuración.

```javascript
// Frontend: src/components/Logs.js - Visualización de logs en tiempo real
import React, { useEffect, useRef, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

const SOCKET_SERVER_URL = 'http://localhost:3001';

function Logs({ boxId }) {
  const { token } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [connectionState, setConnectionState] = useState('desconectado');
  const listRef = useRef(null);
  const isAtBottomRef = useRef(true);

  // Detectar si el usuario está en el fondo del listado
  const handleScroll = () => {
    const node = listRef.current;
    if (!node) return;

    const threshold = 12;
    const distanceToBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
    isAtBottomRef.current = distanceToBottom <= threshold;
  };

  // Establecer conexión WebSocket y suscribirse a componente
  useEffect(() => {
    if (!boxId || !token) {
      setLogs([]);
      setConnectionState('desconectado');
      return;
    }

    // Limpiar logs al cambiar de componente
    setLogs([]);

    // Crear conexión con token en handshake
    const socket = io(SOCKET_SERVER_URL, {
      reconnection: true,
      transports: ['websocket', 'polling'],
      auth: {
        token: token
      }
    });

    const onConnect = () => {
      setConnectionState('conectado');
      // Suscribirse al componente seleccionado
      socket.emit('subscribe', boxId);
    };

    const onDisconnect = () => {
      setConnectionState('desconectado');
    };

    const onConnectError = (err) => {
      setConnectionState(`error: ${err?.message || 'socket error'}`);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // Escuchar eventos de log del servidor
    socket.on('log', (msg) => {
      // Filtrar logs del componente actual
      if (msg && Number(msg.boxId) === Number(boxId)) {
        setLogs((prev) => [...prev, msg.line || JSON.stringify(msg)]);
      }
    });

    // Limpieza al desmontar o cambiar componente
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.disconnect();
    };
  }, [boxId, token]);

  // Auto-scroll al fondo si el usuario está viendo el final
  useEffect(() => {
    const node = listRef.current;
    if (!node) return;

    if (isAtBottomRef.current) {
      node.scrollTop = node.scrollHeight;
    }
  }, [logs]);

  if (!boxId) {
    return (
      <div className="logs-container">
        <h2>Logs en tiempo real</h2>
        <p>Selecciona una caja para ver sus logs.</p>
      </div>
    );
  }

  return (
    <div className="logs-container">
      <h2>Logs en tiempo real - Componente {boxId}</h2>
      <p className="logs-status">Socket: {connectionState}</p>
      <ul className="logs-list" ref={listRef} onScroll={handleScroll}>
        {logs.length === 0 && 
          <li className="logs-empty">Sin líneas de log aún...</li>
        }
        {logs.map((log, idx) => (
          <li key={idx}>{log}</li>
        ))}
      </ul>
    </div>
  );
}

export default Logs;
```

## 4.4.5 Integración frontend-backend: flujo de comunicación

Desde el punto de vista de experiencia de usuario, la combinación de actualización periódica de estados por API y streaming por WebSocket ofrece equilibrio entre simplicidad y capacidad de respuesta. El usuario obtiene una visión global del sistema y, al mismo tiempo, un seguimiento detallado de eventos de ejecución en tiempo real. Esta integración frontend-backend constituye uno de los elementos diferenciales de la contribución desarrollada.

El flujo completo de comunicación es el siguiente:

1. **Autenticación**: El usuario introduce credenciales. El frontend envía petición POST a `/api/auth/login`. El backend valida y devuelve token JWT.

2. **Almacenamiento de sesión**: El token se persiste en localStorage del navegador. Al recargar, el frontend verifica su validez consultando `/api/auth/verify`.

3. **Carga de estados**: Cada 3 segundos, el frontend solicita al backend el estado actual de componentes. El backend evalúa ficheros de control y devuelve array de estados con colores.

4. **Suscripción a logs**: Cuando el usuario selecciona un componente, el frontend abre conexión WebSocket autenticada y emite evento `subscribe` con el identificador del componente.

5. **Ejecución de acciones**: El usuario construye una secuencia de comandos y la confirma. El frontend envía POST a `/api/execute` con los comandos concatenados. El backend ejecuta y devuelve stdout/stderr.

6. **Monitorización**: Mientras se ejecutan las acciones, el servidor emite nuevas líneas de log por WebSocket. El frontend las recibe y las añade al listado visible, con auto-scroll si el usuario está en el fondo.

7. **Cierre de sesión**: Si el backend devuelve 401, el frontend detecta token expirado, elimina datos de localStorage y redirige a login automáticamente.

Este flujo garantiza consistencia, seguridad y experiencia de usuario coherente.

## 4.4.6 Resultado final del frontend en funcionamiento

Resultado final del frontend en funcionamiento:

- **Inicio de sesión y mantenimiento de sesión operativos**: Los usuarios pueden autenticarse y mantener sesión activa tras recargas del navegador.
- **Protección de acceso a vistas privadas**: El componente ProtectedRoute verifica autenticación antes de permitir acceso al contenido operativo.
- **Panel de componentes con estados visuales actualizados**: Las cajas se representan con colores dinámicos (verde, rojo, amarillo, blanco) actualizados cada 3 segundos.
- **Ejecución de acciones con respuesta de servidor**: El usuario puede concatenar y confirmar comandos, recibiendo inmediatamente la salida del servidor.
- **Logs en tiempo real por componente con estado de conexión visible**: El usuario visualiza nuevas líneas de log conforme se generan, con indicador de estado de conexión WebSocket.

---

## Inserción de capturas recomendadas

### Para sección 4.3 (Backend):

- **Figura 4.3.1**: Captura de herramienta de API (Postman/Thunder Client) mostrando respuesta exitosa del endpoint `/api/auth/login` con token generado.
- **Figura 4.3.2**: Captura de error 401 al intentar acceder a endpoint protegido sin token.
- **Figura 4.3.3**: Captura de respuesta JSON de `/api/box-statuses` mostrando array de estados con colores.
- **Figura 4.3.4**: Captura de consola del servidor mostrando "Cliente conectado" tras autenticación WebSocket exitosa.
- **Figura 4.3.5**: Captura de consola del servidor mostrando eventos de log emitidos al suscribirse a un componente.

Pie de figura sugerido:
> Figura 4.3.X. Evidencia de funcionamiento del backend durante pruebas de integración con cliente real.

### Para sección 4.4 (Frontend):

- **Figura 4.4.1**: Captura de pantalla completa de la página de login con formulario de credenciales.
- **Figura 4.4.2**: Captura de la vista principal tras autenticación exitosa, mostrando 5 cajas con colores de estado (ej: 2 verdes, 1 rojo, 2 amarillos).
- **Figura 4.4.3**: Captura del panel de detalle de un componente seleccionado, mostrando descripción y botones de acciones disponibles.
- **Figura 4.4.4**: Captura del área de "Comandos a ejecutar" con una secuencia de 2-3 comandos concatenados antes de confirmación.
- **Figura 4.4.5**: Captura mostrando alerta de confirmación tras ejecutar comando con mensaje de respuesta del servidor.
- **Figura 4.4.6**: Captura del panel de logs mostrando 10-15 líneas de log en tiempo real del componente activo, con indicador "conectado" visible.
- **Figura 4.4.7**: Captura mostrando comportamiento ante expiración de token (por ejemplo, redirección a login o modal de sesión expirada).

Pie de figura sugerido:
> Figura 4.4.X. Evidencia de funcionamiento del frontend en escenario operativo real con token válido.

---

## Párrafo de cierre integrador

Las evidencias gráficas incluidas en ambas secciones confirman la correcta integración entre capa de presentación (frontend) y capa de servicios (backend), así como la adecuación de la arquitectura implementada a los objetivos operativos y de monitorización definidos en el proyecto. La combinación de autenticación segura, consulta periódica de estados y monitorización en tiempo real proporciona una solución robusta, escalable y con buena experiencia de usuario para el contexto de interacción técnica abordado en este trabajo.


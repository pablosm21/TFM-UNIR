// Ejemplo de cómo usar la autenticación desde el Frontend

// ============================================
// 1. REGISTRAR USUARIO
// ============================================
async function registerUser(email, password, nombre) {
  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        nombre
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    console.log('Usuario registrado:', data);
    return data;
  } catch (error) {
    console.error('Error en registro:', error.message);
  }
}

// ============================================
// 2. LOGIN DE USUARIO
// ============================================
async function loginUser(email, password) {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    // Guardar token en localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    console.log('Login exitoso:', data.user);
    return data;
  } catch (error) {
    console.error('Error en login:', error.message);
  }
}

// ============================================
// 3. OBTENER TOKEN DEL ALMACENAMIENTO
// ============================================
function getToken() {
  return localStorage.getItem('authToken');
}

// ============================================
// 4. REALIZAR PETICIÓN CON AUTENTICACIÓN
// ============================================
async function authenticatedFetch(url, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error('No hay token - usuario no autenticado');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Si el token expiró (401), limpiar localStorage
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Redirigir al login
  }

  return response;
}

// ============================================
// 5. VERIFICAR TOKEN
// ============================================
async function verifyToken() {
  try {
    const response = await authenticatedFetch('http://localhost:3001/api/auth/verify');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    console.log('Token válido:', data.user);
    return data.user;
  } catch (error) {
    console.error('Error verificando token:', error.message);
    return null;
  }
}

// ============================================
// 6. OBTENER PERFIL DE USUARIO
// ============================================
async function getProfile() {
  try {
    const response = await authenticatedFetch('http://localhost:3001/api/auth/profile');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    console.log('Perfil:', data);
    return data;
  } catch (error) {
    console.error('Error obteniendo perfil:', error.message);
  }
}

// ============================================
// 7. LOGOUT
// ============================================
async function logout() {
  try {
    const response = await authenticatedFetch(
      'http://localhost:3001/api/auth/logout',
      { method: 'POST' }
    );

    const data = await response.json();

    // Limpiar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    console.log(data.message);
    return true;
  } catch (error) {
    console.error('Error en logout:', error.message);
  }
}

// ============================================
// 8. EJECUTAR COMANDO (protegido)
// ============================================
async function executeCommand(command) {
  try {
    const response = await authenticatedFetch(
      'http://localhost:3001/api/execute',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    console.log('Salida:', data.stdout);
    return data;
  } catch (error) {
    console.error('Error ejecutando comando:', error.message);
  }
}

// ============================================
// 9. USAR EN COMPONENTES REACT (ejemplo)
// ============================================
/*
import React, { useState, useEffect } from 'react';

function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginUser(email, password);
      // Redirigir a dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Cargando...' : 'Login'}
      </button>
    </form>
  );
}

export default LoginComponent;
*/

// ============================================
// 10. PROTEGER RUTAS (React Router ejemplo)
// ============================================
/*
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" />;
}

// Uso:
// <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
*/

// ============================================
// EJEMPLOS DE USO EN CONSOLA
// ============================================
/*
// 1. Registrar
await registerUser('usuario@example.com', '123456', 'Juan Pérez');

// 2. Login
await loginUser('usuario@example.com', '123456');

// 3. Verificar token
await verifyToken();

// 4. Obtener perfil
await getProfile();

// 5. Ejecutar comando
await executeCommand('ls -la');

// 6. Logout
await logout();
*/

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await login(email, password);

    if (result.success) {
      setSuccess('¡Login exitoso!');
      setEmail('');
      setPassword('');
      // La redirección se hace en App.js cuando detecta que hay token
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    const result = await register(email, password, nombre);

    if (result.success) {
      setSuccess('¡Registro exitoso! Ahora inicia sesión');
      setEmail('');
      setPassword('');
      setNombre('');
      setTimeout(() => {
        setIsLogin(true);
        setSuccess(null);
      }, 2000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
    setEmail('');
    setPassword('');
    setNombre('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>TFM-UNIR</h1>
        <div className="login-box">
          {isLogin ? (
            <>
              <h2>Iniciar Sesión</h2>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Contraseña:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    required
                    disabled={loading}
                  />
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button type="submit" disabled={loading}>
                  {loading ? 'Cargando...' : 'Iniciar Sesión'}
                </button>
              </form>

              <p className="toggle-mode">
                ¿No tienes cuenta?{' '}
                <button type="button" onClick={toggleMode} className="link-button">
                  Regístrate aquí
                </button>
              </p>
            </>
          ) : (
            <>
              <h2>Registrarse</h2>
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre completo"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Contraseña (mín. 8 caracteres):</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    required
                    disabled={loading}
                  />
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button type="submit" disabled={loading}>
                  {loading ? 'Cargando...' : 'Registrarse'}
                </button>
              </form>

              <p className="toggle-mode">
                ¿Ya tienes cuenta?{' '}
                <button type="button" onClick={toggleMode} className="link-button">
                  Inicia sesión aquí
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

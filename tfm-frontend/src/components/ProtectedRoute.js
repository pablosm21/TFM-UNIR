import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';

// Componente que protege rutas que requieren autenticación
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.5em',
        color: '#666'
      }}>
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return children;
};

export default ProtectedRoute;

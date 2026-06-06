import React, { useContext } from 'react';
import './Menu.css';
import { AuthContext } from '../context/AuthContext';

const Menu = () => {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="menu">
      <ul>
        <li><button type="button">Panel</button></li>
        <li><button type="button">Componentes</button></li>
        <li><button type="button">Actividad</button></li>
      </ul>
      <div className="menu-right">
        {user && (
          <>
            <span className="user-info">
              Usuario: {user.nombre} ({user.email})
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Cerrar Sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Menu;
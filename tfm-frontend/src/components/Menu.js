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
        <li><a href="#">Opción 1</a></li>
        <li><a href="#">Opción 2</a></li>
        <li><a href="#">Opción 3</a></li>
      </ul>
      <div className="menu-right">
        {user && (
          <>
            <span className="user-info">
              👤 {user.nombre} ({user.email})
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
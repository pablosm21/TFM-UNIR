import React, { useEffect, useState, useContext } from 'react';
import Box from '../components/Box';
import Logs from '../components/Logs';
import './HomePage.css';
import Menu from '../components/Menu';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const { token, logout } = useContext(AuthContext);
  const [boxes, setBoxes] = useState([]);
  const [boxStatuses, setBoxStatuses] = useState({});
  const [selectedBox, setSelectedBox] = useState(null);
  const [hoveredAction, setHoveredAction] = useState('');
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [concatenatedCommands, setConcatenatedCommands] = useState('');

  // Configurar axios con el token
  const getHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const fetchBoxStatuses = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/box-statuses', {
        headers: getHeaders()
      });
      const statusMap = (response.data.statuses || []).reduce((acc, status) => {
        acc[status.id] = status;
        return acc;
      }, {});
      setBoxStatuses(statusMap);
    } catch (error) {
      console.error('Error loading box statuses:', error);
      if (error.response?.status === 401) {
        // Token expirado
        logout();
      }
    }
  };

  useEffect(() => {
    fetch('/data/boxes.json')
      .then((response) => response.json())
      .then((data) => {
        setBoxes(data);
        fetchBoxStatuses();
      })
      .catch((error) => console.error('Error loading boxes:', error));
  }, [token]);

  useEffect(() => {
    const intervalId = setInterval(fetchBoxStatuses, 3000);
    return () => clearInterval(intervalId);
  }, [token]);

  const handleBoxClick = (box) => {
    setSelectedBox(box);
  };

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
        alert('Sesión expirada. Por favor, vuelve a iniciar sesión.');
        logout();
      } else {
        alert(`Error al ejecutar el comando: ${error.message}`);
      }
    } finally {
      setConcatenatedCommands('');
      fetchBoxStatuses();
    }
  };

  const handleActionClick = (action) => {
    setConcatenatedCommands((prevCommands) => `${prevCommands} ${action.command}`);
  };

  return (
    <div className="home-page">
      <Menu />
      <h1>Components</h1>
      <div className="content">
        <div className="left-column">
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
          {/* Mostrar logs en tiempo real del box seleccionado */}
          <Logs boxId={selectedBox?.id} />
        </div>
        <div className="box-description">
          {selectedBox ? (
            <div>
              <h2>{selectedBox.name}</h2>
              <p>{selectedBox.description}</p>
              <div className="description-buttons">
                {selectedBox.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleActionClick(action)}
                    onMouseEnter={() => setHoveredAction(action.message)}
                    onMouseLeave={() => setHoveredAction('')}
                  >
                    {action.label}
                  </button>
                ))}
                {hoveredAction && <p className="hover-description">{hoveredAction}</p>}
              </div>
              <div className="concatenated-commands">
                <h2>Comandos concatenados:</h2>
                <p>{concatenatedCommands}</p>
                <button onClick={confirmAction} disabled={!concatenatedCommands.trim()}>
                  Confirmar Comando
                </button>
                <button
                  onClick={() => setConcatenatedCommands('')}
                  disabled={!concatenatedCommands.trim()}
                >
                  Borrar Comandos
                </button>
              </div>
            </div>
          ) : (
            <p>Haz clic en una caja para ver la descripción</p>
          )}
        </div>
        {actionToConfirm && (
          <div className="confirmation-modal">
            <p>¿Estás seguro de que deseas ejecutar esta acción?</p>
            <button onClick={confirmAction}>Confirmar</button>
            <button onClick={() => setActionToConfirm(null)}>Cancelar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
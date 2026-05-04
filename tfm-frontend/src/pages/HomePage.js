import React, { useEffect, useState } from 'react';
import Box from '../components/Box';
import Logs from '../components/Logs';
import './HomePage.css';
import Menu from '../components/Menu';
import axios from 'axios';

const HomePage = () => {
  const [boxes, setBoxes] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [hoveredAction, setHoveredAction] = useState('');
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [concatenatedCommands, setConcatenatedCommands] = useState('');

  useEffect(() => {
    fetch('/data/boxes.json')
      .then((response) => response.json())
      .then((data) => setBoxes(data))
      .catch((error) => console.error('Error loading boxes:', error));
  }, []);

  const handleBoxClick = (box) => {
    setSelectedBox(box);
  };

  const confirmAction = async () => {
    try {
      const response = await axios.post('http://localhost:3001/execute', {
        command: `${concatenatedCommands.trim()}`,
      });
      alert(`Respuesta del servidor: ${response.data.stdout}`);
    } catch (error) {
      alert(`Error al ejecutar el comando: ${error.message}`);
    } finally {
      setConcatenatedCommands('');
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
        <div className="box-container">
          {boxes.map((box) => (
            <Box key={box.id} name={box.name} onClick={() => handleBoxClick(box)} />
          ))}
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

      {/* Mostrar logs en tiempo real */}
      <Logs />
    </div>
  );
};

export default HomePage;
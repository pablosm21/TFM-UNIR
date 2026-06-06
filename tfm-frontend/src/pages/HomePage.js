import React, { useEffect, useState, useContext } from 'react';
import Box from '../components/Box';
import Logs from '../components/Logs';
import './HomePage.css';
import Menu from '../components/Menu';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import config from '../config';

const HomePage = () => {
  const { token, logout } = useContext(AuthContext);
  const [boxes, setBoxes] = useState([]);
  const [boxStatuses, setBoxStatuses] = useState({});
  const [selectedBox, setSelectedBox] = useState(null);
  const [hoveredAction, setHoveredAction] = useState('');
  const [selectedActions, setSelectedActions] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchBoxStatuses = async () => {
    try {
      const response = await api.get('/api/box-statuses');
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
        if (data.length > 0) {
          setSelectedBox(data[0]);
        }
        fetchBoxStatuses();
      })
      .catch((error) => console.error('Error loading boxes:', error));
  }, [token]);

  useEffect(() => {
    const intervalId = setInterval(fetchBoxStatuses, config.statusPollIntervalMs);
    return () => clearInterval(intervalId);
  }, [token, selectedBox]);

  const handleBoxClick = (box) => {
    setSelectedBox(box);
    setSelectedActions([]);
    setExecutionOutput('');
    setErrorMessage('');
  };

  const executeSelectedActions = async () => {
    if (!selectedBox || selectedActions.length === 0) {
      return;
    }

    setIsExecuting(true);
    setExecutionOutput('');
    setErrorMessage('');

    try {
      const outputs = [];

      for (const actionLabel of selectedActions) {
        const response = await api.post('/api/execute', {
          boxId: selectedBox.id,
          actionLabel,
        });
        const { stdout, stderr, skipped, reason } = response.data;
        const header = `Accion ${actionLabel}`;
        const details = skipped
          ? `[SKIPPED] ${reason || 'Sin comando'}`
          : `${stdout || ''}${stderr ? `\n[STDERR]\n${stderr}` : ''}`;
        outputs.push(`${header}\n${details}`.trim());
      }

      setExecutionOutput(outputs.join('\n\n'));
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      } else {
        setErrorMessage(error.response?.data?.error || error.message);
      }
    } finally {
      setSelectedActions([]);
      setIsExecuting(false);
      fetchBoxStatuses();
    }
  };

  const handleActionClick = (action) => {
    setSelectedActions((prevActions) => {
      if (prevActions.includes(action.label)) {
        return prevActions.filter((item) => item !== action.label);
      }
      return [...prevActions, action.label];
    });
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
                    className={selectedActions.includes(action.label) ? 'selected-action' : ''}
                  >
                    {action.label}
                  </button>
                ))}
                {hoveredAction && <p className="hover-description">{hoveredAction}</p>}
              </div>
              <div className="concatenated-commands">
                <h2>Acciones seleccionadas:</h2>
                <p>{selectedActions.length ? selectedActions.join(', ') : 'Ninguna'}</p>
                <button onClick={executeSelectedActions} disabled={!selectedActions.length || isExecuting}>
                  {isExecuting ? 'Ejecutando...' : 'Ejecutar acciones'}
                </button>
                <button
                  onClick={() => setSelectedActions([])}
                  disabled={!selectedActions.length || isExecuting}
                >
                  Borrar Seleccion
                </button>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {executionOutput && <pre>{executionOutput}</pre>}
              </div>
            </div>
          ) : (
            <p>Haz clic en una caja para ver la descripción</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
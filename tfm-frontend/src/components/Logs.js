import React, { useEffect, useRef, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import './Logs.css';
import { AuthContext } from '../context/AuthContext';
import config from '../config';

const MAX_LOG_LINES = 1000;
const SOCKET_SERVER_URL = config.socketUrl;


function Logs({ boxId }) {
  const { token } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [connectionState, setConnectionState] = useState('desconectado');
  const listRef = useRef(null);
  const isAtBottomRef = useRef(true);

  const handleScroll = () => {
    const node = listRef.current;
    if (!node) return;

    const threshold = 12;
    const distanceToBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
    isAtBottomRef.current = distanceToBottom <= threshold;
  };

  useEffect(() => {
    if (!boxId || !token) {
      setLogs([]);
      setConnectionState('desconectado');
      return;
    }

    // Al cambiar de caja, limpiar primero para mostrar solo su contenido.
    setLogs([]);

    const socket = io(SOCKET_SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
      auth: {
        token: token
      }
    });

    const onConnect = () => {
      setConnectionState('conectado');
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

    // Registrar listener antes de suscribirse para evitar perder eventos iniciales.
    const onLog = (msg) => {
      // Solo mostrar logs que incluyan el boxId
      if (msg && Number(msg.boxId) === Number(boxId)) {
        setLogs((prev) => {
          const updated = [...prev, msg.line || JSON.stringify(msg)];
          if (updated.length > MAX_LOG_LINES) {
            return updated.slice(updated.length - MAX_LOG_LINES);
          }
          return updated;
        });
      }
    };
    socket.on('log', onLog);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('log', onLog);
      socket.disconnect();
    };
  }, [boxId, token]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;

    if (isAtBottomRef.current) {
      // Usar requestAnimationFrame para asegurar que el DOM esté actualizado
      requestAnimationFrame(() => {
        node.scrollTop = node.scrollHeight;
      });
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
      <h2>Logs en tiempo real - Caja {boxId}</h2>
      <p className="logs-status">Socket: {connectionState}</p>
      <ul className="logs-list" ref={listRef} onScroll={handleScroll}>
        {logs.length === 0 && <li className="logs-empty">Sin lineas de log todavia...</li>}
        {logs.map((log, idx) => (
          <li key={idx}>{log}</li>
        ))}
      </ul>
    </div>
  );
}

export default Logs;

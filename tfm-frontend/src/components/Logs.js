import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './Logs.css';

const SOCKET_SERVER_URL = 'http://localhost:3001'; // Cambia si tu backend está en otro host/puerto


function Logs({ boxId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!boxId) return;
    const socket = io(SOCKET_SERVER_URL);
    // Informar al backend del boxId que nos interesa
    socket.emit('subscribe', boxId);
    socket.on('log', (msg) => {
      // Solo mostrar logs que incluyan el boxId
      if (msg && msg.boxId === boxId) {
        setLogs((prev) => [...prev, msg.line]);
      }
    });
    return () => socket.disconnect();
  }, [boxId]);

  if (!boxId) return null;

  return (
    <div className="logs-container">
      <h2>Logs en tiempo real</h2>
      <ul className="logs-list">
        {logs.map((log, idx) => (
          <li key={idx}>{log}</li>
        ))}
      </ul>
    </div>
  );
}

export default Logs;

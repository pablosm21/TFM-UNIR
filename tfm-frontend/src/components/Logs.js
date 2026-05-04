import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3001'; // Cambia si tu backend está en otro host/puerto

function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);
    socket.on('log', (msg) => {
      setLogs((prev) => [...prev, msg]);
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <h2>Logs en tiempo real</h2>
      <ul style={{ maxHeight: 200, overflowY: 'auto', background: '#222', color: '#0f0', padding: '1em', borderRadius: 8 }}>
        {logs.map((log, idx) => (
          <li key={idx}>{log}</li>
        ))}
      </ul>
    </div>
  );
}

export default Logs;

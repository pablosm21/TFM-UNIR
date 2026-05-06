const socketIo = require('socket.io');

module.exports = (server) => {
  const io = socketIo(server, { cors: { origin: '*' } });

  const fs = require('fs');
  // Mapeo de boxId a ruta de log
  const logPaths = {
    1: '/home/psmolina/TFM-SIMULATION/project/javascript_component/salida.log',
    2: '/home/psmolina/TFM-SIMULATION/project/java_component/salida.log',
    3: '/home/psmolina/TFM-SIMULATION/project/cpp_component/salida.log',
    4: '/home/psmolina/TFM-SIMULATION/project/python_component/salida.log',
    5: '/home/psmolina/TFM-SIMULATION/project/log_component/salida.log',
  };

  io.on('connection', (socket) => {
    console.log('Cliente WebSocket conectado');

    let watcher = null;
    let lastSize = 0;
    let currentBoxId = null;


    socket.on('subscribe', (boxIdRaw) => {
      // Cerrar watcher anterior si existe
      if (watcher) {
        watcher.close();
        watcher = null;
      }
      // Convertir a número para asegurar coincidencia con logPaths
      const boxId = Number(boxIdRaw);
      currentBoxId = boxId;

      const logFilePath = logPaths[boxId];
      if (!logFilePath) {
        socket.emit('log', {
          boxId,
          line: `[WARN] BoxId sin ruta de log configurada: ${boxId}`
        });
        return;
      }


      // Enviar el contenido actual del log al suscribirse
      if (fs.existsSync(logFilePath)) {
        try {
          const data = fs.readFileSync(logFilePath, 'utf8');
          if (data) {
            data.split('\n').forEach(line => {
              if (line.trim()) socket.emit('log', { boxId, line });
            });
          } else {
            socket.emit('log', { boxId, line: '[INFO] El fichero de log esta vacio.' });
          }
          lastSize = fs.statSync(logFilePath).size;
        } catch (readErr) {
          socket.emit('log', {
            boxId,
            line: `[WARN] Error leyendo log inicial (${logFilePath}): ${readErr.message}`
          });
          lastSize = 0;
          return;
        }
      } else {
        socket.emit('log', {
          boxId,
          line: `[WARN] No existe el fichero de log: ${logFilePath}`
        });
        lastSize = 0;
        return;
      }

      try {
        watcher = fs.watch(logFilePath, (eventType) => {
          if (eventType === 'change' && currentBoxId === boxId) {
            fs.stat(logFilePath, (err, stats) => {
              if (err) {
                socket.emit('log', {
                  boxId,
                  line: `[WARN] No se puede leer el log (${logFilePath}): ${err.message}`
                });
                return;
              }

              // Si el fichero se trunca/rota, reajustar el puntero.
              if (stats.size < lastSize) {
                lastSize = 0;
              }

              if (stats.size > lastSize) {
                const stream = fs.createReadStream(logFilePath, {
                  start: lastSize,
                  end: stats.size
                });
                let buffer = '';
                stream.on('data', chunk => {
                  buffer += chunk.toString();
                });
                stream.on('end', () => {
                  buffer.split('\n').forEach(line => {
                    if (line.trim()) socket.emit('log', { boxId, line });
                  });
                  lastSize = stats.size;
                });
                stream.on('error', (streamErr) => {
                  socket.emit('log', {
                    boxId,
                    line: `[WARN] Error leyendo stream de log: ${streamErr.message}`
                  });
                });
              }
            });
          }
        });
      } catch (watchErr) {
        socket.emit('log', {
          boxId,
          line: `[WARN] No se puede monitorizar el log (${logFilePath}): ${watchErr.message}`
        });
      }
    });

    socket.on('disconnect', () => {
      if (watcher) watcher.close();
      console.log('Cliente WebSocket desconectado');
    });
  });
};
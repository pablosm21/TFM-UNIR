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
      if (!logFilePath) return;


      // Enviar el contenido actual del log al suscribirse
      if (fs.existsSync(logFilePath)) {
        const data = fs.readFileSync(logFilePath, 'utf8');
        if (data) {
          data.split('\n').forEach(line => {
            if (line.trim()) socket.emit('log', { boxId, line });
          });
        }
        lastSize = fs.statSync(logFilePath).size;
      } else {
        lastSize = 0;
      }

      watcher = fs.watch(logFilePath, (eventType) => {
        if (eventType === 'change' && currentBoxId === boxId) {
          fs.stat(logFilePath, (err, stats) => {
            if (err) return;
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
            }
          });
        }
      });
    });

    socket.on('disconnect', () => {
      if (watcher) watcher.close();
      console.log('Cliente WebSocket desconectado');
    });
  });
};
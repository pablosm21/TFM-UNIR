const socketIo = require('socket.io');

module.exports = (server) => {
  const io = socketIo(server, { cors: { origin: '*' } });

  const fs = require('fs');
  const logFilePath = '/home/psmolina/TFM-SIMULATION/project/log_component/salida.log';

  io.on('connection', (socket) => {
    console.log('Cliente WebSocket conectado');

    // Leer el archivo de logs y enviar las nuevas líneas en tiempo real
    let lastSize = 0;
    // Enviar el contenido actual al conectar
    if (fs.existsSync(logFilePath)) {
      const data = fs.readFileSync(logFilePath, 'utf8');
      if (data) {
        data.split('\n').forEach(line => {
          if (line.trim()) socket.emit('log', line);
        });
      }
      lastSize = fs.statSync(logFilePath).size;
    }

    // Vigilar cambios en el archivo
    const watcher = fs.watch(logFilePath, (eventType) => {
      if (eventType === 'change') {
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
                if (line.trim()) socket.emit('log', line);
              });
              lastSize = stats.size;
            });
          }
        });
      }
    });

    socket.on('disconnect', () => {
      watcher.close();
      console.log('Cliente WebSocket desconectado');
    });
  });
};
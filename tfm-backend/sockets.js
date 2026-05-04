const socketIo = require('socket.io');

module.exports = (server) => {
  const io = socketIo(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log('Cliente WebSocket conectado');
    // Ejemplo: enviar un log cada 2 segundos
    const interval = setInterval(() => {
      socket.emit('log', `Log generado a las ${new Date().toLocaleTimeString()}`);
    }, 2000);

    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log('Cliente WebSocket desconectado');
    });
  });
};
const socketIo = require('socket.io');

const socketSetup = (server) => {
  const io = socketIo(server);

  io.on('connection', (socket) => {
    socket.on('drawEvent', (drawData) => {
      console.log(drawData);
      socket.broadcast.emit('drawEvent', drawData);
    });
  });
}

module.exports = socketSetup;

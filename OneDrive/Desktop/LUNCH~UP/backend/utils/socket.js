const { Server } = require('socket.io');

let io;
const connectedUsers = {}; // userId -> socketId

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('register', ({ userId, role }) => {
      if (userId) {
        connectedUsers[userId] = socket.id;
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // remove any user pointing to this socket
      for (const [uid, sid] of Object.entries(connectedUsers)) {
        if (sid === socket.id) {
          delete connectedUsers[uid];
        }
      }
    });
  });
}

function getIo() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

module.exports = { initSocket, getIo, connectedUsers };

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let players = {};

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('joinRoom', (roomId) => {
    if (!players[roomId]) {
      players[roomId] = [];
    }
    if (players[roomId].length < 2) {
      players[roomId].push(socket.id);
      socket.join(roomId);
      socket.emit('joinedRoom', players[roomId].length);
      io.to(roomId).emit('playersUpdate', players[roomId].length);
    } else {
      socket.emit('roomFull');
    }
  });

  socket.on('playMove', ({ roomId, index, symbol }) => {
    socket.to(roomId).emit('receiveMove', { index, symbol });
  });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
    for (const roomId in players) {
      players[roomId] = players[roomId].filter(id => id !== socket.id);
      io.to(roomId).emit('playersUpdate', players[roomId].length);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-stream', (roomId) => {
      socket.join(roomId);
      
      // Make first user the host
      const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      const isHost = roomSize === 1;
      socket.emit('host-status', isHost);
      
      if (!isHost) {
        // Request current playback state from host
        socket.to(roomId).emit('request-sync', socket.id);
      }
    });

    socket.on('sync-response', (targetSocketId, data) => {
      socket.to(targetSocketId).emit('sync-playback', data);
    });

    socket.on('mediaControl', (roomId, action) => {
      socket.to(roomId).emit('mediaControl', action);
    });

    socket.on('playback-progress', (roomId, data) => {
      socket.to(roomId).emit('sync-playback', data);
    });

    // Handle video call room joining
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-connected', userId);
      
      socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected', userId);
      });
    });
  });

  server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
});
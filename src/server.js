import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { PeerServer } from 'peer';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize PeerJS Server
  PeerServer({ port: 9000, path: '/myapp' });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    let currentRoom = null;

    socket.on('join-stream', (roomId) => {
      currentRoom = roomId;
      socket.join(roomId);
      const room = io.sockets.adapter.rooms.get(roomId);
      const isHost = room.size === 1;
      
      socket.emit('host-status', isHost);
      
      if (!isHost) {
        // Request current state from host
        socket.to(roomId).emit('request-sync', socket.id);
      }
    });

    socket.on('mediaControl', (roomId, action) => {
      // Add server timestamp to help with synchronization
      action.serverTime = Date.now();
      socket.to(roomId).emit('mediaControl', action);
    });

    socket.on('playback-progress', (roomId, data) => {
      // Add server timestamp and broadcast to all clients except sender
      data.serverTime = Date.now();
      socket.to(roomId).emit('sync-playback', data);
    });

    socket.on('disconnect', () => {
      if (currentRoom) {
        socket.to(currentRoom).emit('user-disconnected', socket.id);
      }
    });
  });

  server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
    console.log('PeerJS server running on port 9000');
  });
});
// src/lib/socket.js
import { Server } from 'socket.io';

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
      credentials: true
    },
    path: '/socket.io'
  });

  const rooms = new Map();

  io.on('connection', (socket) => {
    socket.on('join-stream', (roomId) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, socket.id);
        socket.emit('host-status', true);
      } else {
        socket.emit('host-status', false);
        socket.emit('sync-request');
      }
    });

    socket.on('sync-response', (data) => {
      socket.to(Array.from(socket.rooms)[1]).emit('sync-playback', data);
    });

    socket.on('playback-progress', (data) => {
      socket.to(Array.from(socket.rooms)[1]).emit('sync-playback', {
        ...data,
        playing: true
      });
    });

    socket.on('disconnect', () => {
      rooms.forEach((hostId, roomId) => {
        if (hostId === socket.id) {
          rooms.delete(roomId);
        }
      });
    });
  });

  return io;
};
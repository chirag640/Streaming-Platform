// src/components/VideoCall.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'peerjs';

export default function VideoCall({ roomId }) {
  const userVideoRef = useRef();
  const peersRef = useRef({});
  const [peerVideos, setPeerVideos] = useState({});
  const socketRef = useRef();
  const peerRef = useRef();

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${port}`;
    socketRef.current = io(socketUrl);

   peerRef.current = new Peer(undefined, {
  host: process.env.NEXT_PUBLIC_BASE_URL || 'localhost',
  port: process.env.NEXT_PUBLIC_PEER_PORT || 9000,
  path: '/myapp',
  secure: process.env.NODE_ENV === 'production'
});

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }

        peerRef.current.on('open', (userId) => {
          socketRef.current.emit('join-room', roomId, userId);
        });

        peerRef.current.on('call', (call) => {
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            setPeerVideos(prev => ({
              ...prev,
              [call.peer]: remoteStream
            }));
          });
        });

        socketRef.current.on('user-connected', (userId) => {
          const call = peerRef.current.call(userId, stream);
          call.on('stream', (remoteStream) => {
            setPeerVideos(prev => ({
              ...prev,
              [userId]: remoteStream
            }));
          });
          peersRef.current[userId] = call;
        });

        socketRef.current.on('user-disconnected', (userId) => {
          if (peersRef.current[userId]) {
            peersRef.current[userId].close();
          }
          setPeerVideos(prev => {
            const newPeers = { ...prev };
            delete newPeers[userId];
            return newPeers;
          });
        });
      });

    return () => {
      Object.values(peersRef.current).forEach(call => call.close());
      socketRef.current?.disconnect();
      peerRef.current?.destroy();
    };
  }, [roomId]);

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={userVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
          You
        </div>
      </div>
      {Object.entries(peerVideos).map(([peerId, stream]) => (
        <div key={peerId} className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <video
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            ref={el => {
              if (el) el.srcObject = stream;
            }}
          />
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
            Peer
          </div>
        </div>
      ))}
    </div>
  );
}
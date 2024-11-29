// src/components/VideoCall.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'peerjs';

export default function VideoCall({ roomId }) {
  const userVideoRef = useRef();
  const peersRef = useRef({});
  const [peers, setPeers] = useState({});
  const socketRef = useRef();
  const peerRef = useRef();

  useEffect(() => {
    const port = window.location.port || '3000';
    socketRef.current = io(`http://localhost:${port}`);
    peerRef.current = new Peer();

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideoRef.current.srcObject = stream;

        peerRef.current.on('open', (userId) => {
          socketRef.current.emit('join-room', roomId, userId);
        });

        peerRef.current.on('call', (call) => {
          call.answer(stream);
          const video = document.createElement('video');
          
          call.on('stream', (userVideoStream) => {
            addVideoStream(call.peer, video, userVideoStream);
          });
        });

        socketRef.current.on('user-connected', (userId) => {
          connectToNewUser(userId, stream);
        });

        socketRef.current.on('user-disconnected', (userId) => {
          if (peersRef.current[userId]) {
            peersRef.current[userId].close();
          }
          setPeers(prevPeers => {
            const newPeers = { ...prevPeers };
            delete newPeers[userId];
            return newPeers;
          });
        });
      });

    return () => {
      Object.values(peersRef.current).forEach(call => call.close());
      socketRef.current.disconnect();
      peerRef.current.destroy();
    };
  }, [roomId]);

  function connectToNewUser(userId, stream) {
    const call = peerRef.current.call(userId, stream);
    const video = document.createElement('video');

    call.on('stream', (userVideoStream) => {
      addVideoStream(userId, video, userVideoStream);
    });

    call.on('close', () => {
      setPeers(prevPeers => {
        const newPeers = { ...prevPeers };
        delete newPeers[userId];
        return newPeers;
      });
    });

    peersRef.current[userId] = call;
  }

  function addVideoStream(userId, video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });
    setPeers(prevPeers => ({
      ...prevPeers,
      [userId]: stream
    }));
  }

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      <div className="relative aspect-video">
        <video
          ref={userVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
          You
        </div>
      </div>
      {Object.entries(peers).map(([peerId, stream]) => (
        <div key={peerId} className="relative aspect-video">
          <video
            autoPlay
            playsInline
            srcObject={stream}
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
            Peer
          </div>
        </div>
      ))}
    </div>
  );
}
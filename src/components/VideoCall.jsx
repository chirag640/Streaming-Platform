// src/components/VideoCall.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'peerjs';

export default function VideoCall({ roomId }) {
  const [peers, setPeers] = useState({});
  const socketRef = useRef();
  const userVideoRef = useRef();
  const peersRef = useRef({});

  useEffect(() => {
    const port = window.location.port || '3000';
    socketRef.current = io(`http://localhost:${port}`);
    const peer = new Peer();

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      userVideoRef.current.srcObject = stream;

      peer.on('open', (userId) => {
        socketRef.current.emit('join-room', roomId, userId);
      });

      socketRef.current.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
      });

      socketRef.current.on('user-disconnected', (userId) => {
        if (peersRef.current[userId]) {
          peersRef.current[userId].close();
        }
        setPeers((prevPeers) => {
          const newPeers = { ...prevPeers };
          delete newPeers[userId];
          return newPeers;
        });
      });
    });

    function connectToNewUser(userId, stream) {
      const call = peer.call(userId, stream);
      const video = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream, userId);
      });
      call.on('close', () => {
        video.remove();
      });

      peersRef.current[userId] = call;
    }

    function addVideoStream(video, stream, userId) {
      video.srcObject = stream;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
      setPeers((prevPeers) => ({
        ...prevPeers,
        [userId]: video,
      }));
    }

    return () => {
      socketRef.current.disconnect();
      Object.values(peersRef.current).forEach((call) => call.close());
    };
  }, [roomId]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <video ref={userVideoRef} muted autoPlay playsInline className="w-full" />
      {Object.entries(peers).map(([userId, video]) => (
        <video key={userId} ref={(ref) => ref && (ref.srcObject = video.srcObject)} autoPlay playsInline className="w-full" />
      ))}
    </div>
  );
}
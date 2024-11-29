// src/components/MediaPlayer.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export default function MediaPlayer({ fileUrl, roomId }) {
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const [error, setError] = useState(null);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const port = window.location.port || '3000';
    const socketUrl = `http://localhost:${port}`;
    
    socketRef.current = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current.emit('join-stream', roomId);
    
    socketRef.current.on('host-status', (status) => {
      setIsHost(status);
    });

    socketRef.current.on('sync-request', () => {
      if (isHost && videoRef.current) {
        socketRef.current.emit('sync-response', {
          currentTime: videoRef.current.currentTime,
          playing: !videoRef.current.paused
        });
      }
    });

    socketRef.current.on('sync-playback', (data) => {
      if (!videoRef.current || isHost) return;

      videoRef.current.currentTime = data.currentTime;
      if (data.playing) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, isHost]);

  const handleTimeUpdate = () => {
    if (isHost && socketRef.current) {
      socketRef.current.emit('playback-progress', {
        currentTime: videoRef.current.currentTime
      });
    }
  };

  const handlePlay = () => {
    if (socketRef.current) {
      socketRef.current.emit('mediaControl', 'play');
    }
  };

  const handlePause = () => {
    if (socketRef.current) {
      socketRef.current.emit('mediaControl', 'pause');
    }
  };

  const handleSeek = () => {
    if (socketRef.current && videoRef.current) {
      socketRef.current.emit('mediaControl', {
        type: 'seek',
        time: videoRef.current.currentTime
      });
    }
  };

  const handleError = (e) => {
    console.error('Video error:', e);
    setError('Failed to load video. Please try again later.');
  };

  return (
<div className="relative w-full aspect-video rounded-ios overflow-hidden shadow-ios">
      {error ? (
        <div className="w-full h-full flex items-center justify-center bg-ios-background text-ios-blue">
          {error}
        </div>
      ) : (
        <video
          ref={videoRef}
          src={fileUrl}
          controls
          controlsList="nodownload"
          className="w-full h-full"
          onPlay={handlePlay}
          onPause={handlePause}
          onSeeked={handleSeek}
          onTimeUpdate={handleTimeUpdate}
          onError={handleError}
          playsInline
          crossOrigin="anonymous"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
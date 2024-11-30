// src/components/MediaPlayer.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export default function MediaPlayer({ fileUrl, roomId }) {
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const [error, setError] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${port}`;
socketRef.current = io(socketUrl);

    
    socketRef.current.emit('join-stream', roomId);
    
    socketRef.current.on('host-status', (status) => {
      setIsHost(status);
    });

    socketRef.current.on('mediaControl', (action) => {
      if (!videoRef.current || isHost || isSeeking) return;

      switch (action.type) {
        case 'play':
          videoRef.current.currentTime = action.time;
          videoRef.current.play().catch(console.error);
          break;
        case 'pause':
          videoRef.current.currentTime = action.time;
          videoRef.current.pause();
          break;
        case 'seek':
          videoRef.current.currentTime = action.time;
          break;
      }
    });

    const syncInterval = setInterval(() => {
      if (isHost && videoRef.current && !videoRef.current.paused) {
        emitPlaybackState();
      }
    }, 1000);

    return () => {
      clearInterval(syncInterval);
      socketRef.current?.disconnect();
    };
  }, [roomId, isHost]);

  const emitPlaybackState = () => {
    const now = Date.now();
    if (now - lastUpdateRef.current > 500) {
      socketRef.current.emit('playback-progress', roomId, {
        currentTime: videoRef.current.currentTime,
        playing: !videoRef.current.paused,
        timestamp: now
      });
      lastUpdateRef.current = now;
    }
  };

  const handlePlay = () => {
    if (isHost && socketRef.current) {
      socketRef.current.emit('mediaControl', roomId, {
        type: 'play',
        time: videoRef.current.currentTime,
        timestamp: Date.now()
      });
    }
  };

  const handlePause = () => {
    if (isHost && socketRef.current) {
      socketRef.current.emit('mediaControl', roomId, {
        type: 'pause',
        time: videoRef.current.currentTime,
        timestamp: Date.now()
      });
    }
  };

  const handleSeeking = () => {
    setIsSeeking(true);
  };

  const handleSeeked = () => {
    setIsSeeking(false);
    if (isHost && socketRef.current) {
      socketRef.current.emit('mediaControl', roomId, {
        type: 'seek',
        time: videoRef.current.currentTime,
        timestamp: Date.now()
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
        <>
          <video
            ref={videoRef}
            src={fileUrl}
            controls
            controlsList="nodownload"
            className="w-full h-full"
            onPlay={handlePlay}
            onPause={handlePause}
            onSeeking={handleSeeking}
            onSeeked={handleSeeked}
            onError={handleError}
            playsInline
            crossOrigin="anonymous"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
          {isHost && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
              Host
            </div>
          )}
        </>
      )}
    </div>
  );
}
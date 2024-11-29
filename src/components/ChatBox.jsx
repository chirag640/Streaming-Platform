// src/components/ChatBox.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

export default function ChatBox({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const socketRef = useRef();

  useEffect(() => {
    const port = window.location.port || '3000';
    socketRef.current = io(`http://localhost:${port}`);

    socketRef.current.emit('join-room', roomId);

    socketRef.current.on('receive-message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      socketRef.current.emit('send-message', roomId, inputMessage);
      setMessages((prevMessages) => [...prevMessages, inputMessage]);
      setInputMessage('');
    }
  };

  return (
    <div className="chat-box">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            {msg}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
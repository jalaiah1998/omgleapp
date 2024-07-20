import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import VideoCall from './components/VideoCall';

const App = () => {
  const [status, setStatus] = useState('waiting');
  const [channel, setChannel] = useState(null);
  const [token, setToken] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:4444', {
      autoConnect: false, 
    });
    setSocket(newSocket);

    newSocket.on('waiting', () => {
      setStatus('waiting');
    });

    newSocket.on('matched', (data) => {
      setStatus('matched');
      setChannel(data.channelName);
      setToken(data.token);
    });

    return () => newSocket.close();
  }, []);

  const joinHandler = () => {
    setStatus('connecting');
    socket.connect(); 
    socket.emit('join');
  };

  const exitHandler = () => {
    setStatus('waiting');
    setChannel(null);
    setToken(null);
    socket.disconnect();
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12 text-center">
          <h1>Omegle App</h1>
          {status === 'waiting' && (
            <button className="btn btn-primary mt-3" onClick={joinHandler} disabled={status !== 'waiting'}>
              Join Me
            </button>
          )}
        </div>
      </div>
      <div className="row mt-5">
        <div className="col-12 text-center">
          {status === 'waiting' && <p>Waiting for a match...</p>}
          {status === 'connecting' && <p>Connecting...</p>}
          {status === 'matched' && (
            <div>
              <p>Connected to a user!</p>
              <div id="video-container">
                <VideoCall channel={channel} token={token} onExit={exitHandler} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

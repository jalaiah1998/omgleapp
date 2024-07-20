import React, { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const YOUR_AGORA_APP_ID = "6d51df87d2d141f4b7c301ab19d65793";

const VideoCall = ({ channel, token, onExit }) => {
  const [rtc, setRtc] = useState({
    client: AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }),
    localAudioTrack: null,
    localVideoTrack: null,
  });

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  useEffect(() => {
    const startBasicCall = async () => {
      const client = rtc.client;
      
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        
        if (mediaType === 'video') {
          const remoteVideoTrack = user.videoTrack;
          const remotePlayerContainer = document.createElement('div');
          remotePlayerContainer.id = `remote-player-${user.uid}`;
          remotePlayerContainer.style.width = '400px';
          remotePlayerContainer.style.height = '300px';
          document.getElementById('video-container').append(remotePlayerContainer);
          remoteVideoTrack.play(remotePlayerContainer);
        }

        if (mediaType === 'audio') {
          const remoteAudioTrack = user.audioTrack;
          remoteAudioTrack.play();
        }
      });

      client.on('user-unpublished', (user) => {
        const remotePlayerContainer = document.getElementById(`remote-player-${user.uid}`);
        if (remotePlayerContainer) {
          remotePlayerContainer.remove();
        }
      });

      await client.join(YOUR_AGORA_APP_ID, channel, token, null);

      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const localVideoTrack = await AgoraRTC.createCameraVideoTrack();

      localVideoTrack.play('local-player');
      
      await client.publish([localAudioTrack, localVideoTrack]);

      setRtc({
        client,
        localAudioTrack,
        localVideoTrack
      });
    };

    startBasicCall();

    return () => {
      rtc.localAudioTrack && rtc.localAudioTrack.close();
      rtc.localVideoTrack && rtc.localVideoTrack.close();
      rtc.client && rtc.client.leave();
      onExit();
    };
  }, [channel, token]);

  const toggleAudio = () => {
    if (isAudioMuted) {
      rtc.localAudioTrack.setEnabled(true);
      setIsAudioMuted(false);
    } else {
      rtc.localAudioTrack.setEnabled(false);
      setIsAudioMuted(true);
    }
  };

  const toggleVideo = () => {
    if (isVideoMuted) {
      rtc.localVideoTrack.setEnabled(true);
      setIsVideoMuted(false);
    } else {
      rtc.localVideoTrack.setEnabled(false);
      setIsVideoMuted(true);
    }
  };

  return (
    <div className='mb-5'>
      <div id="local-player" style={{ height: '300px', width: '400px' }}></div>
      <div id="video-container" style={{ display: 'flex', flexDirection: 'row' }}></div>
      <div className="controls mt-3">
        <button onClick={toggleAudio} className='btn btn-primary m-1'>{isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}</button>
        <button onClick={toggleVideo} className='btn btn-warning m-1'>{isVideoMuted ? 'Turn On Camera' : 'Turn Off Camera'}</button>
        <button onClick={onExit} className='btn btn-danger m-1'>Exit</button>
      </div>
    </div>
  );
};

export default VideoCall;

import React, { useRef, useEffect, useState } from 'react';
import { Video, VideoOff } from 'lucide-react';

const CameraProctor = () => {
  const videoRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsActive(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasError(true);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      border: '2px solid rgba(255,255,255,0.1)'
    }}>
      {hasError ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#ef4444' }}>
          <VideoOff size={32} />
          <span style={{ fontSize: '12px', marginTop: '8px' }}>Camera Disabled</span>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
          />
          {!isActive && (
            <div style={{ position: 'absolute', color: 'rgba(255,255,255,0.5)' }}>
              Starting...
            </div>
          )}
          {isActive && (
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              boxShadow: '0 0 8px #10b981'
            }} />
          )}
        </>
      )}
    </div>
  );
};

export default CameraProctor;

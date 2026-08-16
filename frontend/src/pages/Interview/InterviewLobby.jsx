import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { VideoOff, Camera } from 'lucide-react';
import '../../styles/Lobby.css';

const InterviewLobby = () => {
  let navigate = () => { };
  let location = { state: undefined };
  try {
    navigate = useNavigate();
    location = useLocation();
  } catch (e) {
    /* no Router */
  }

  const [cameraGranted, setCameraGranted] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [denied, setDenied] = useState(false);
  const [checking, setChecking] = useState(false);

  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(true);

  // Dynamic role logic
  const jobRole = location?.state?.jobTitle || location?.state?.jobRole || location?.state?.role || 'Frontend Developer';
  const userName = location?.state?.userName || 'Candidate';

  const enterFullScreen = () => {
    try {
      const doc = document.documentElement;
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement
      ) {
        if (doc.requestFullscreen) {
          doc.requestFullscreen().catch((e) => console.log(e));
        } else if (doc.webkitRequestFullscreen) {
          doc.webkitRequestFullscreen();
        } else if (doc.msRequestFullscreen) {
          doc.msRequestFullscreen();
        }
      }
    } catch (e) { }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullScreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);

    enterFullScreen(); 
    
    // Automatically try to request permissions on load
    requestPermissions();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const setVideoRef = useCallback((element) => {
    videoRef.current = element;
    if (element && streamRef.current && element.srcObject !== streamRef.current) {
      element.srcObject = streamRef.current;
    }
  }, []);

  const requestPermissions = async () => {
    setChecking(true);
    setDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setCameraGranted(true);
      setMicGranted(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Permissions denied:', err);
      setDenied(true);
    } finally {
      setChecking(false);
    }
  };

  const handleProceed = () => {
    if (!cameraGranted || !micGranted) {
      requestPermissions();
      return;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    navigate('/interview-mode', { state: location.state });
  };

  return (
    <div className="pis-lobby-wrapper">
      {!isFullScreen && (
        <div className="pis-fullscreen-warning">
          <div className="pis-fullscreen-warning-box">
            <h2>Fullscreen Required</h2>
            <p>The interview must be taken in fullscreen mode to prevent distractions. Timers and recording are paused.</p>
            <div className="pis-warning-actions">
              <button className="pis-btn-warning-exit" onClick={() => navigate('/user-dashboard')}>
                Exit Interview
              </button>
              <button className="pis-btn-warning-enter" onClick={enterFullScreen}>
                Enter Fullscreen to Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pis-lobby-container" onClick={enterFullScreen}>
        {/* Logo in top left */}
        <div className="pis-lobby-logo">
          <img src="/preepx_logo.png" alt="Preepx Logo" />
        </div>

        <div className="pis-lobby-content">
          {/* Left Side: Video Preview */}
          <div className="pis-video-section">
            <div className="pis-video-wrapper">
              {cameraGranted ? (
                <>
                  <video
                    ref={setVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="pis-lobby-video"
                  />
                  <div className="pis-name-tag">
                    {userName} (You)
                  </div>
                </>
              ) : denied ? (
                <div className="pis-video-placeholder">
                  <VideoOff size={48} className="pis-placeholder-icon error" />
                  <p>Camera and Microphone access denied.</p>
                  <button className="pis-btn-retry" onClick={requestPermissions}>Retry Permissions</button>
                </div>
              ) : (
                <div className="pis-video-placeholder">
                  <Camera size={48} className="pis-placeholder-icon" />
                  <p>{checking ? 'Starting camera...' : 'Camera is off'}</p>
                </div>
              )}
            </div>

            <div className="pis-device-status-row">
              <div className="pis-device-pill">
                <span className="pis-device-icon">📹</span>
                Camera: {cameraGranted ? 'Default Camera' : 'Not Allowed'}
              </div>
              <div className="pis-device-pill">
                <span className="pis-device-icon">🎤</span>
                Microphone: {micGranted ? 'Default Microphone' : 'Not Allowed'}
              </div>
            </div>
          </div>

          {/* Right Side: Role & Join Button */}
          <div className="pis-info-section">
            <h1 className="pis-role-title">{jobRole}</h1>
            
            <div className="pis-status-indicator">
              <div className="pis-status-avatar">I</div>
              <span className="pis-status-text">Interviewer has joined</span>
            </div>

            <button 
              className={`pis-join-btn ${cameraGranted && micGranted ? 'ready' : ''}`}
              onClick={handleProceed}
            >
              {cameraGranted && micGranted ? 'Join Now' : 'Allow Permissions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewLobby;

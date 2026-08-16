import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Info,
  Mic,
  Lightbulb,
  VideoOff,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import '../../styles/PreInterviewSetup.css';

const PreInterviewSetup = () => {
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

  const [showAllNotes, setShowAllNotes] = useState(false);
  const streamRef = useRef(null);
  const videoRef = useRef(null);

  const [isFullScreen, setIsFullScreen] = useState(true);

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

    enterFullScreen(); // Try on mount

    navigator.permissions?.query({ name: 'camera' }).then((res) => {
      if (res.state === 'granted') requestCamera();
    }).catch(() => { });

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const setVideoRef = useCallback((element) => {
    videoRef.current = element;
    if (element && streamRef.current && element.srcObject !== streamRef.current) {
      element.srcObject = streamRef.current;
    }
  }, []);

  const requestCamera = async () => {
    enterFullScreen();
    setChecking(true);
    setDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (streamRef.current) {
        stream.getTracks().forEach(t => streamRef.current.addTrack(t));
      } else {
        streamRef.current = stream;
      }
      setCameraGranted(true);
    } catch (err) {
      console.error('Camera access denied:', err);
      setDenied(true);
    } finally {
      setChecking(false);
    }
  };

  const requestAudio = async () => {
    enterFullScreen();
    setChecking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (streamRef.current) {
        stream.getTracks().forEach(t => streamRef.current.addTrack(t));
      } else {
        streamRef.current = stream;
      }
      setMicGranted(true);
    } catch (err) {
      console.error('Audio access denied:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleProceed = () => {
    if (!cameraGranted || !micGranted) return;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    navigate('/lobby', { state: location.state });
  };

  const ready = cameraGranted && micGranted;

  return (
    <>
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
      <div className="pis-wrapper" onClick={enterFullScreen}>
        <div className="pis-modal">
          <div className="pis-modal-body">
            {/* Left Column */}
            <div className="pis-left-col">
              <div className="pis-header">
                <h1 className="pis-title">System Permissions Setup</h1>
                <p className="pis-subtitle">Activates checks that maintain the integrity of your test</p>
              </div>

              <div className="pis-cards-container">
                {/* Camera Card */}
                <div className={`pis-card ${!cameraGranted ? 'pis-card-active' : 'pis-card-success'}`}>
                  <div className={`pis-icon-circle ${cameraGranted ? 'pis-icon-success' : denied ? 'pis-icon-error' : 'pis-icon-error'}`}>
                    {cameraGranted ? <CheckCircle2 size={24} /> : <Info size={24} />}
                  </div>
                  <div className="pis-card-content">
                    <h3 className="pis-card-title">Camera Access</h3>
                    <p className="pis-card-desc">Required for face verification and detection during the assessment.</p>

                    {!cameraGranted && denied && (
                      <p className="pis-error-text">Camera access was denied.</p>
                    )}

                    {!cameraGranted && (
                      <button
                        className="pis-btn-dark"
                        onClick={requestCamera}
                        disabled={checking}
                      >
                        {checking ? 'Checking...' : 'Enable Camera Access'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Audio Card */}
                <div className={`pis-card ${cameraGranted && !micGranted ? 'pis-card-active' : micGranted ? 'pis-card-success' : ''}`}>
                  <div className={`pis-icon-circle ${micGranted ? 'pis-icon-success' : 'pis-icon-neutral'}`}>
                    {micGranted ? <CheckCircle2 size={24} /> : <Mic size={24} />}
                  </div>
                  <div className="pis-card-content">
                    <h3 className="pis-card-title">Audio Check</h3>
                    <p className="pis-card-desc">Required to ensure your microphone is working correctly and audio can be captured during the assessment.</p>

                    {cameraGranted && !micGranted && (
                      <button
                        className="pis-btn-dark"
                        onClick={requestAudio}
                        disabled={checking}
                        style={{ marginTop: '12px' }}
                      >
                        {checking ? 'Checking...' : 'Enable Microphone Access'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Note Section */}
              <div className="pis-wavy-divider"></div>

              <div className="pis-notes-section">
                <h3 className="pis-notes-title">Please note,</h3>
                <div className="pis-notes-box">
                  <ul className={`pis-notes-list ${showAllNotes ? 'expanded' : ''}`}>
                    <li>Preepx requires access to your camera feed for identity verification and continuous monitoring during the assessment.</li>
                    <li>I confirm that I am the registered candidate taking this test and will not seek any external assistance.</li>
                    <li>My face will remain clearly visible within the camera frame for the entire duration of the exam.</li>
                    {showAllNotes && (
                      <>
                        <li>I grant Preepx microphone access to record audio for monitoring purposes.</li>
                        <li>I will ensure my microphone stays active and unmuted as required by the platform.</li>
                        <li>The use of voice-altering software, background noise masking, or any other unfair practices is strictly prohibited.</li>
                        <li>I confirm that I am in a quiet environment and will prevent any background conversations that might disrupt the monitoring.</li>
                      </>
                    )}
                  </ul>
                  <button
                    className="pis-read-more-btn"
                    onClick={(e) => { e.stopPropagation(); setShowAllNotes(!showAllNotes); }}
                  >
                    {showAllNotes ? 'Read Less' : 'Read More'}
                  </button>
                </div>
              </div>
            </div>

            <div className="pis-divider"></div>

            {/* Right Column */}
            <div className="pis-right-col">
              <div className="pis-inst-header">
                <Lightbulb size={24} className="pis-inst-icon" />
                <h2 className="pis-inst-title">Important Instructions</h2>
              </div>

              <div className="pis-inst-body">
                <p className="pis-inst-heading">For Camera access and Face verification :</p>
                <ul className="pis-inst-list">
                  <li>Use good lighting: face a light source; avoid strong back lighting or dark shadows.</li>
                  <li>When prompted, click <strong>Allow</strong> in the browser pop-up for <strong>Camera access</strong>.</li>
                  <li>Confirm your webcam is uncovered and functional.</li>
                  <li>The system will automatically detect your face. Ensure your face is clearly visible.</li>
                  <li><strong>If You Blocked Camera Access:</strong>
                    <ul>
                      <li>Chrome (Windows): Click the camera icon in the address bar &rarr; select "Always allow..." &rarr; refresh the page.</li>
                    </ul>
                  </li>
                </ul>
              </div>

              {/* Camera Frame Overlay (Always visible) */}
              <div className={`pis-camera-overlay ${denied && !cameraGranted ? 'pis-camera-denied' : ''}`}>
                {cameraGranted ? (
                  <video
                    ref={setVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="pis-video-feed"
                  />
                ) : denied ? (
                  <div className="pis-camera-placeholder">
                    <VideoOff size={48} className="pis-error-overlay-icon" />
                    <p className="pis-error-overlay-text">Camera access was denied.</p>
                  </div>
                ) : (
                  <div className="pis-camera-placeholder">
                    <Camera size={48} className="pis-placeholder-icon" />
                    <p className="pis-placeholder-text">Awaiting Camera...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pis-modal-footer">
            <button
              className={`pis-btn-proceed ${ready ? 'pis-btn-ready' : ''}`}
              onClick={handleProceed}
              disabled={!ready}
            >
              I understand, proceed
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PreInterviewSetup;

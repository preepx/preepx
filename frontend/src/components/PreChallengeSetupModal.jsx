import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Info, Mic, Lightbulb, VideoOff, Camera, CheckCircle2, X } from 'lucide-react';
import '../styles/PreInterviewSetup.css';

const PreChallengeSetupModal = ({ onProceed, onCancel, title = "System Permissions Setup" }) => {
  const [cameraGranted, setCameraGranted] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [denied, setDenied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.dataset.theme === 'dark');
  
  const streamRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.permissions?.query({ name: 'camera' }).then((res) => {
      if (res.state === 'granted') requestCamera();
    }).catch(() => { });

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.dataset.theme === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      observer.disconnect();
    };
  }, []);

  const setVideoRef = useCallback((element) => {
    videoRef.current = element;
    if (element && streamRef.current && element.srcObject !== streamRef.current) {
      element.srcObject = streamRef.current;
    }
  }, []);

  const requestCamera = async () => {
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

  const handleProceedClick = () => {
    if (!cameraGranted || !micGranted) return;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    onProceed();
  };
  
  const handleCancelClick = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (onCancel) onCancel();
  };

  const ready = cameraGranted && micGranted;

  return (
    <div className="pis-wrapper" style={{ zIndex: 9999, background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(241, 245, 249, 0.95)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="pis-modal" style={{ maxHeight: '90vh', overflowY: 'auto', position: 'relative', width: '100%', maxWidth: '1000px', margin: '20px' }}>
        <button 
          onClick={handleCancelClick}
          style={{ position: 'absolute', top: '20px', right: '20px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', border: 'none', color: isDark ? '#fff' : '#0f172a', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', zIndex: 10 }}
        >
          <X size={20} />
        </button>
        <div className="pis-modal-body" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          {/* Left Column */}
          <div className="pis-left-col" style={{ flex: '1 1 500px' }}>
            <div className="pis-header">
              <h1 className="pis-title">{title}</h1>
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
                  {!cameraGranted && denied && <p className="pis-error-text">Camera access was denied.</p>}
                  {!cameraGranted && (
                    <button className="pis-btn-dark" onClick={requestCamera} disabled={checking}>
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
                    <button className="pis-btn-dark" onClick={requestAudio} disabled={checking} style={{ marginTop: '12px' }}>
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
                    </>
                  )}
                </ul>
                <button className="pis-read-more-btn" onClick={(e) => { e.stopPropagation(); setShowAllNotes(!showAllNotes); }}>
                  {showAllNotes ? 'Read Less' : 'Read More'}
                </button>
              </div>
            </div>
          </div>

          <div className="pis-divider"></div>

          {/* Right Column */}
          <div className="pis-right-col" style={{ flex: '1 1 300px' }}>
            <div className="pis-inst-header">
              <Lightbulb size={24} className="pis-inst-icon" />
              <h2 className="pis-inst-title">Important Instructions</h2>
            </div>
            <div className="pis-inst-body">
              <p className="pis-inst-heading">For Camera access and Face verification :</p>
              <ul className="pis-inst-list">
                <li>Use good lighting: face a light source; avoid strong back lighting or dark shadows.</li>
                <li>When prompted, click <strong>Allow</strong> in the browser pop-up.</li>
                <li>Confirm your webcam is uncovered and functional.</li>
              </ul>
            </div>

            <div className={`pis-camera-overlay ${denied && !cameraGranted ? 'pis-camera-denied' : ''}`}>
              {cameraGranted ? (
                <video ref={setVideoRef} autoPlay playsInline muted className="pis-video-feed" />
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
            onClick={handleProceedClick}
            disabled={!ready}
            style={{ width: '100%' }}
          >
            Start Coding Challenge
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreChallengeSetupModal;

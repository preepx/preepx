import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { useNavigate } from 'react-router-dom';
import notify from "@/utils/notify";

export const useFaceDetection = (webcamRefs, isActive, onViolation) => {
  const [faceWarning, setFaceWarning] = useState(null);
  const [model, setModel] = useState(null);
  const detectIntervalRef = useRef(null);
  const warningCountRef = useRef(0);
  const warningActiveRef = useRef(false);
  const navigate = useNavigate();
  
  // Load model once
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await blazeface.load();
        setModel(loadedModel);
      } catch (err) {
        console.error("Failed to load blazeface model", err);
      }
    };
    loadModel();
  }, []);

  // Run detection loop
  useEffect(() => {
    const refsArray = Array.isArray(webcamRefs) ? webcamRefs : [webcamRefs];
    
    if (!isActive || !model) {
      if (detectIntervalRef.current) {
        clearInterval(detectIntervalRef.current);
        detectIntervalRef.current = null;
      }
      setFaceWarning(null); // Clear warnings if not active
      return;
    }

    const detect = async () => {
      // Find the first valid video element that is actually visible (videoWidth > 0)
      const activeRef = refsArray.find(ref => ref?.current?.video?.readyState === 4 && ref?.current?.video?.videoWidth > 0);
      if (!activeRef) return;
      
      const video = activeRef.current.video;
      
      try {
        const predictions = await model.estimateFaces(video, false);
        
        let newWarningMsg = null;

        if (predictions.length === 0) {
          newWarningMsg = "No face detected";
        } else if (predictions.length > 1) {
          newWarningMsg = "Multiple faces detected";
        } else {
          // One face detected, check boundaries (optional strict check)
          const prediction = predictions[0];
          const topLeft = prediction.topLeft; // [x, y]
          const bottomRight = prediction.bottomRight; // [x, y]
          
          // Basic check: if face is too close to the edge
          const vidW = video.videoWidth;
          const vidH = video.videoHeight;
          
          const isTooFarLeft = topLeft[0] < vidW * 0.02;
          const isTooFarRight = bottomRight[0] > vidW * 0.98;
          const isTooFarTop = topLeft[1] < vidH * 0.02;
          const isTooFarBottom = bottomRight[1] > vidH * 0.98;
          
          if (isTooFarLeft || isTooFarRight || isTooFarTop || isTooFarBottom) {
             newWarningMsg = "Center your face";
          }
        }

        if (newWarningMsg) {
          if (!warningActiveRef.current) {
            warningActiveRef.current = true;
            warningCountRef.current += 1;
            
            if (onViolation) {
              onViolation(newWarningMsg);
            }
          }
          setFaceWarning(newWarningMsg);
        } else {
          warningActiveRef.current = false;
          setFaceWarning(null);
        }
      } catch (err) {
        // Ignore frame errors silently
      }
    };

    detectIntervalRef.current = setInterval(detect, 1000); // Check every second

    return () => {
      if (detectIntervalRef.current) {
        clearInterval(detectIntervalRef.current);
      }
    };
  }, [isActive, model]);

  return { faceWarning };
};

import { useEffect, useRef, useState } from 'react';
import * as faceDetection from '@tensorflow-models/face-detection';
import '@tensorflow/tfjs';
import { analyzeFace, PROCTORING_SEVERITY } from '../utils/proctoring/faceAnalysis';
import {
  flushProctoringEvents,
  getProctoringQueueStats,
  queueProctoringEvent,
  saveProctoringEvidenceSnapshot,
  saveInterviewSnapshot,
  saveProctoringSummary
} from '../utils/proctoring/eventReporter';

const DETECTION_INTERVAL_MS = 1800;
const MAX_RECENT_EVENTS = 8;
const MAX_EVIDENCE_CAPTURES = 4;
const EVIDENCE_CAPTURE_COOLDOWN_MS = 15000;
const EVENT_COOLDOWN_MS = {
  TAB_SWITCH: 1200,
  WINDOW_BLUR: 1500,
  NO_FACE: 4000,
  MULTIPLE_FACES: 2500,
  LOOKING_AWAY: 3000,
  TOO_FAR: 5000,
  TOO_CLOSE: 7000,
  ANALYSIS_ERROR: 3000
};

const FACE_MODEL = faceDetection.SupportedModels.MediaPipeFaceDetector;

function toRecentEvent(event) {
  return {
    ...event,
    timestamp: event.timestamp || new Date().toISOString()
  };
}

export function useInterviewProctoring({
  token,
  videoRef,
  enabled = true,
  interviewComplete = false
}) {
  const detectorRef = useRef(null);
  const cooldownRef = useRef(new Map());
  const processingRef = useRef(false);
  const snapshotCapturedRef = useRef(false);
  const snapshotUploadInFlightRef = useRef(false);
  const evidenceUploadInFlightRef = useRef(false);
  const evidenceCaptureCountRef = useRef(0);
  const evidenceCooldownRef = useRef(new Map());
  const latestSummaryRef = useRef({
    faceDetectionCount: 0,
    warningCount: 0,
    alertCount: 0,
    criticalCount: 0
  });
  const [modelStatus, setModelStatus] = useState('idle');
  const [analysis, setAnalysis] = useState({
    hasFace: false,
    faceCount: 0,
    faceWidth: 0,
    lookingDirection: 'CENTER',
    distance: 'UNKNOWN',
    alerts: []
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [queueStats, setQueueStats] = useState(getProctoringQueueStats());
  const [counts, setCounts] = useState({ total: 0, critical: 0, warning: 0, info: 0 });
  const [faceDetectionCount, setFaceDetectionCount] = useState(0);

  useEffect(() => {
    cooldownRef.current.clear();
    snapshotCapturedRef.current = false;
    snapshotUploadInFlightRef.current = false;
    evidenceUploadInFlightRef.current = false;
    evidenceCaptureCountRef.current = 0;
    evidenceCooldownRef.current.clear();
    latestSummaryRef.current = {
      faceDetectionCount: 0,
      warningCount: 0,
      alertCount: 0,
      criticalCount: 0
    };
    setAnalysis({
      hasFace: false,
      faceCount: 0,
      faceWidth: 0,
      lookingDirection: 'CENTER',
      distance: 'UNKNOWN',
      alerts: []
    });
    setRecentEvents([]);
    setCounts({ total: 0, critical: 0, warning: 0, info: 0 });
    setFaceDetectionCount(0);
    setQueueStats(getProctoringQueueStats());
  }, [token]);

  useEffect(() => {
    latestSummaryRef.current = {
      faceDetectionCount,
      warningCount: counts.warning,
      alertCount: counts.total,
      criticalCount: counts.critical
    };
  }, [counts, faceDetectionCount]);

  const captureFrame = ({ maxWidth = 360, quality = 0.72 } = {}) => {
    const video = videoRef.current;
    if (!video || video.readyState !== 4 || !video.videoWidth || !video.videoHeight) {
      return null;
    }

    const scale = Math.min(1, maxWidth / video.videoWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));

    const context = canvas.getContext('2d');
    if (!context) {
      return null;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg', quality);

    if (!imageData || imageData === 'data:,') {
      return null;
    }

    return imageData;
  };

  const syncSummary = async () => {
    if (!token) {
      return;
    }

    const summary = latestSummaryRef.current;

    if (summary.faceDetectionCount === 0 && summary.alertCount === 0) {
      return;
    }

    try {
      await saveProctoringSummary(token, summary);
    } catch (error) {
      console.error('Failed to save proctoring summary:', error);
    }
  };

  const captureInterviewSnapshot = async () => {
    if (!token || snapshotCapturedRef.current || snapshotUploadInFlightRef.current) {
      return;
    }

    const imageData = captureFrame({ maxWidth: 360, quality: 0.72 });
    if (!imageData) {
      return;
    }

    snapshotUploadInFlightRef.current = true;

    try {
      await saveInterviewSnapshot(token, imageData);
      snapshotCapturedRef.current = true;
    } catch (error) {
      console.error('Failed to save interview snapshot:', error);
    } finally {
      snapshotUploadInFlightRef.current = false;
    }
  };

  const captureProctoringEvidence = async (event) => {
    if (
      !token ||
      !event?.eventType ||
      evidenceUploadInFlightRef.current ||
      evidenceCaptureCountRef.current >= MAX_EVIDENCE_CAPTURES
    ) {
      return;
    }

    const lastCapturedAt = evidenceCooldownRef.current.get(event.eventType);
    const now = Date.now();
    if (lastCapturedAt && now - lastCapturedAt < EVIDENCE_CAPTURE_COOLDOWN_MS) {
      return;
    }

    const imageData = captureFrame({ maxWidth: 320, quality: 0.64 });
    if (!imageData) {
      return;
    }

    evidenceUploadInFlightRef.current = true;

    try {
      await saveProctoringEvidenceSnapshot(token, {
        eventType: event.eventType,
        message: event.message || null,
        details: event.details || {},
        timestamp: event.timestamp || new Date().toISOString(),
        imageData
      });
      evidenceCooldownRef.current.set(event.eventType, now);
      evidenceCaptureCountRef.current += 1;
    } catch (error) {
      console.error('Failed to save suspicious proctoring evidence:', error);
    } finally {
      evidenceUploadInFlightRef.current = false;
    }
  };

  const pushRecentEvent = (event) => {
    setRecentEvents((prev) => {
      const next = [toRecentEvent(event), ...prev];
      return next.slice(0, MAX_RECENT_EVENTS);
    });
  };

  const emitEvent = async (event) => {
    if (!token || !event?.eventType) {
      return false;
    }

    const cooldown = EVENT_COOLDOWN_MS[event.eventType] || 2500;
    const lastSeenAt = cooldownRef.current.get(event.eventType);
    const now = Date.now();

    if (lastSeenAt && now - lastSeenAt < cooldown) {
      return false;
    }

    cooldownRef.current.set(event.eventType, now);
    pushRecentEvent(event);
    setCounts((prev) => ({
      total: prev.total + 1,
      critical: prev.critical + (event.severity === 'critical' ? 1 : 0),
      warning: prev.warning + (event.severity === 'warning' ? 1 : 0),
      info: prev.info + (event.severity === 'info' ? 1 : 0)
    }));
    await queueProctoringEvent(token, {
      eventType: event.eventType,
      severity: event.severity || PROCTORING_SEVERITY[event.eventType] || 'info',
      message: event.message || null,
      details: event.details || {},
      timestamp: event.timestamp || new Date().toISOString()
    });
    setQueueStats(getProctoringQueueStats());
    return true;
  };

  useEffect(() => {
    let cancelled = false;

    if (!enabled || !token) {
      return undefined;
    }

    const loadDetector = async () => {
      try {
        setModelStatus('loading');
        const detector = await faceDetection.createDetector(FACE_MODEL, {
          runtime: 'tfjs',
          modelType: 'short',
          maxFaces: 4
        });

        if (cancelled) {
          detector.dispose();
          return;
        }

        detectorRef.current = detector;
        setModelStatus('active');
      } catch (error) {
        console.error('Proctoring model init error:', error);
        setModelStatus('error');
        pushRecentEvent({
          eventType: 'ANALYSIS_ERROR',
          severity: 'warning',
          message: 'Proctoring model failed to initialize.',
          timestamp: new Date().toISOString()
        });
      }
    };

    loadDetector();

    return () => {
      cancelled = true;

      if (detectorRef.current) {
        detectorRef.current.dispose();
        detectorRef.current = null;
      }
    };
  }, [enabled, token]);

  useEffect(() => {
    if (!enabled || interviewComplete || modelStatus !== 'active') {
      return undefined;
    }

    const intervalId = window.setInterval(async () => {
      if (processingRef.current) {
        return;
      }

      const video = videoRef.current;
      if (!detectorRef.current || !video || video.readyState !== 4) {
        return;
      }

      processingRef.current = true;

      try {
        const faces = await detectorRef.current.estimateFaces(video, {
          flipHorizontal: true
        });
        const nextAnalysis = analyzeFace(
          faces,
          video.videoWidth || video.clientWidth || 0
        );

        setAnalysis(nextAnalysis);

        if (nextAnalysis.hasFace && nextAnalysis.faceCount === 1) {
          setFaceDetectionCount((prev) => prev + 1);
          await captureInterviewSnapshot();
        }

        for (const alert of nextAnalysis.alerts) {
          const recorded = await emitEvent(alert);

          if (recorded && alert.eventType === 'MULTIPLE_FACES') {
            await captureProctoringEvidence(alert);
          }
        }
      } catch (error) {
        console.error('Proctoring analysis error:', error);
        setModelStatus('error');
        await emitEvent({
          eventType: 'ANALYSIS_ERROR',
          severity: 'warning',
          message: 'Face analysis failed during the interview.',
          details: {
            error: error.message
          },
          timestamp: new Date().toISOString()
        });
      } finally {
        processingRef.current = false;
      }
    }, DETECTION_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, interviewComplete, modelStatus, token, videoRef]);

  useEffect(() => {
    if (!enabled || interviewComplete) {
      return undefined;
    }

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        await emitEvent({
          eventType: 'TAB_SWITCH',
          severity: 'critical',
          message: 'Candidate switched tabs or minimized the interview window.',
          timestamp: new Date().toISOString()
        });
      }
    };

    const handleBlur = async () => {
      await emitEvent({
        eventType: 'WINDOW_BLUR',
        severity: 'warning',
        message: 'Interview window lost focus.',
        timestamp: new Date().toISOString()
      });
    };

    const handleBeforeUnload = () => {
      syncSummary();
      flushProctoringEvents().catch((error) => {
        console.error('Failed to flush proctoring events:', error);
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, interviewComplete, token]);

  useEffect(() => {
    if (!enabled || !token) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      syncSummary();
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [enabled, token]);

  useEffect(() => {
    if (!interviewComplete) {
      return undefined;
    }

    syncSummary();
    flushProctoringEvents().catch((error) => {
      console.error('Failed to flush proctoring events:', error);
    });

    return undefined;
  }, [interviewComplete]);

  return {
    modelStatus,
    analysis,
    recentEvents,
    queueStats,
    counts
  };
}

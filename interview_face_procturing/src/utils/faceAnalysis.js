import { reportEvent } from "./eventReporter";

// Cache for tracking consecutive events (prevent spam)
const eventCache = new Map();
const CACHE_DURATION = 2000; // 2 seconds

/**
 * Advanced Face Analysis with Confidence Scoring
 * Detects: face presence, position, distance, looking direction
 * @param {Array} predictions - Face predictions from TensorFlow
 * @param {Function} logEvent - Callback to log events
 * @returns {Object} Analysis results with confidence scores
 */
export function analyzeFace(predictions, logEvent = null) {
  const analysis = {
    hasFace: false,
    confidence: 0,
    faceCount: 0,
    faceWidth: 0,
    faceHeight: 0,
    lookingDirection: "CENTER",
    distance: "OPTIMAL",
    alerts: [],
    timestamp: Date.now(),
  };

  try {
    // Check face count
    if (predictions.length === 0) {
      reportEventIfNotCached("NO_FACE", logEvent);
      analysis.alerts.push({ type: "NO_FACE", severity: "CRITICAL" });
      return analysis;
    }

    analysis.faceCount = predictions.length;

    if (predictions.length > 1) {
      reportEventIfNotCached("MULTIPLE_FACES", logEvent);
      analysis.alerts.push({
        type: "MULTIPLE_FACES",
        severity: "CRITICAL",
      });
      return analysis;
    }

    // Single face detected
    analysis.hasFace = true;
    const face = predictions[0];
    const keypoints = face.scaledMesh;

    // Get key facial landmarks
    const leftEye = keypoints[33];
    const rightEye = keypoints[263];
    const nose = keypoints[1];
    const forehead = keypoints[10];
    const chin = keypoints[152];

    // Calculate face dimensions
    analysis.faceWidth = Math.abs(rightEye[0] - leftEye[0]);
    analysis.faceHeight = Math.abs(forehead[1] - chin[1]);
    analysis.confidence = face.confidence || 0.95;

    // Analyze looking direction
    const eyeCenterX = (leftEye[0] + rightEye[0]) / 2;
    const deviation = Math.abs(nose[0] - eyeCenterX);

    if (deviation < 8) {
      analysis.lookingDirection = "CENTER";
    } else if (deviation < 20) {
      analysis.lookingDirection = nose[0] > eyeCenterX ? "SLIGHTLY_RIGHT" : "SLIGHTLY_LEFT";
    } else {
      analysis.lookingDirection = nose[0] > eyeCenterX ? "RIGHT" : "LEFT";
      reportEventIfNotCached("LOOKING_AWAY", logEvent);
      analysis.alerts.push({
        type: "LOOKING_AWAY",
        severity: "WARNING",
        direction: analysis.lookingDirection,
      });
    }

    // Analyze distance
    if (analysis.faceWidth < 40) {
      analysis.distance = "TOO_FAR";
      reportEventIfNotCached("TOO_FAR", logEvent);
      analysis.alerts.push({
        type: "TOO_FAR",
        severity: "WARNING",
        width: analysis.faceWidth,
      });
    } else if (analysis.faceWidth > 300) {
      analysis.distance = "TOO_CLOSE";
      reportEventIfNotCached("TOO_CLOSE", logEvent);
      analysis.alerts.push({
        type: "TOO_CLOSE",
        severity: "WARNING",
        width: analysis.faceWidth,
      });
    } else {
      analysis.distance = "OPTIMAL";
    }
  } catch (error) {
    console.error("Face analysis error:", error);
    analysis.alerts.push({ type: "ANALYSIS_ERROR", severity: "ERROR", error: error.message });
  }

  return analysis;
}

/**
 * Report event only if not cached (prevents spam)
 * @param {string} event - Event type
 * @param {Function} logEvent - Log callback
 */
function reportEventIfNotCached(event, logEvent) {
  const now = Date.now();
  const cached = eventCache.get(event);

  if (!cached || now - cached > CACHE_DURATION) {
    if (logEvent) logEvent(event);
    reportEvent(event);
    eventCache.set(event, now);
  }
}

/**
 * Clear event cache when needed
 */
export function clearEventCache() {
  eventCache.clear();
}

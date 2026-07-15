/**
 * ADVANCED FACE ANALYSIS
 * Comprehensive facial analysis with metrics & confidence scores
 */

import { reportEvent } from "./eventReporter";

// Advanced face metrics tracking
export class AdvancedFaceAnalyzer {
  constructor() {
    this.faceHistory = [];
    this.suspicionScore = 0;
    this.warningThreshold = 70;
    this.criticalThreshold = 85;
    this.maxHistorySize = 100;
  }

  analyze(predictions) {
    if (predictions.length === 0) {
      return this.handleNoFace();
    }

    if (predictions.length > 1) {
      return this.handleMultipleFaces();
    }

    return this.analyzeSingleFace(predictions[0]);
  }

  analyzeSingleFace(prediction) {
    const keypoints = prediction.scaledMesh;
    const metrics = {
      timestamp: Date.now(),
      faceWidth: 0,
      faceHeight: 0,
      eyeOpenness: 0,
      headPose: { x: 0, y: 0, z: 0 },
      lookingDirection: "CENTER",
      suspicionScore: 0,
      alerts: [],
    };

    // Calculate face dimensions
    metrics.faceWidth = Math.abs(keypoints[263][0] - keypoints[33][0]);
    metrics.faceHeight = Math.abs(keypoints[152][1] - keypoints[10][1]);

    // Analyze eye openness
    metrics.eyeOpenness = this.calculateEyeOpenness(keypoints);

    // Analyze head pose
    metrics.headPose = this.calculateHeadPose(keypoints);

    // Determine looking direction
    metrics.lookingDirection = this.determineLookingDirection(keypoints);

    // Calculate suspicion score
    metrics.suspicionScore = this.calculateSuspicionScore(metrics);

    // Generate alerts
    this.generateAlerts(metrics);

    // Store in history
    this.recordMetrics(metrics);

    return metrics;
  }

  calculateEyeOpenness(keypoints) {
    const leftEye = keypoints[33];
    const leftEyeTop = keypoints[159];
    const leftEyeBottom = keypoints[145];
    const leftOpenness = Math.sqrt(
      Math.pow(leftEyeTop[1] - leftEyeBottom[1], 2)
    );

    const rightEye = keypoints[263];
    const rightEyeTop = keypoints[386];
    const rightEyeBottom = keypoints[374];
    const rightOpenness = Math.sqrt(
      Math.pow(rightEyeTop[1] - rightEyeBottom[1], 2)
    );

    return (leftOpenness + rightOpenness) / 2;
  }

  calculateHeadPose(keypoints) {
    const nose = keypoints[1];
    const forehead = keypoints[10];
    const chin = keypoints[152];
    const leftEar = keypoints[234];
    const rightEar = keypoints[454];

    return {
      x: (leftEar[0] - rightEar[0]) / 100, // Horizontal tilt
      y: (forehead[1] - chin[1]) / 100, // Vertical tilt
      z: Math.abs(leftEar[0] - rightEar[0]) / 100, // Depth (forward/backward)
    };
  }

  determineLookingDirection(keypoints) {
    const nose = keypoints[1];
    const leftEye = keypoints[33];
    const rightEye = keypoints[263];
    const eyeCenterX = (leftEye[0] + rightEye[0]) / 2;

    const deviation = Math.abs(nose[0] - eyeCenterX);

    if (deviation < 10) return "CENTER";
    if (deviation < 25) return deviation > 0 ? "SLIGHTLY_RIGHT" : "SLIGHTLY_LEFT";
    if (nose[0] > eyeCenterX) return "RIGHT";
    return "LEFT";
  }

  calculateSuspicionScore(metrics) {
    let score = 0;

    // Face too small (camera too far)
    if (metrics.faceWidth < 50) score += 15;
    // Face too large (camera too close)
    if (metrics.faceWidth > 400) score += 10;

    // Eye closed
    if (metrics.eyeOpenness < 5) score += 20;

    // Looking away significantly
    if (
      metrics.lookingDirection === "LEFT" ||
      metrics.lookingDirection === "RIGHT"
    ) {
      score += 25;
    }

    // Excessive head tilt
    if (Math.abs(metrics.headPose.x) > 30) score += 20;
    if (Math.abs(metrics.headPose.y) > 35) score += 20;

    this.suspicionScore = score;
    return score;
  }

  generateAlerts(metrics) {
    metrics.alerts = [];

    if (metrics.eyeOpenness < 5) {
      metrics.alerts.push({
        level: "WARNING",
        message: "Eyes appear closed",
        code: "EYES_CLOSED",
      });
    }

    if (metrics.suspicionScore > this.criticalThreshold) {
      metrics.alerts.push({
        level: "CRITICAL",
        message: "Suspicious activity detected",
        code: "CRITICAL_SUSPICION",
      });
      reportEvent("CRITICAL_SUSPICION");
    } else if (metrics.suspicionScore > this.warningThreshold) {
      metrics.alerts.push({
        level: "WARNING",
        message: "Unusual behavior detected",
        code: "WARNING_SUSPICION",
      });
      reportEvent("WARNING_SUSPICION");
    }

    if (
      metrics.lookingDirection === "LEFT" ||
      metrics.lookingDirection === "RIGHT"
    ) {
      metrics.alerts.push({
        level: "CAUTION",
        message: `Looking ${metrics.lookingDirection.toLowerCase()}`,
        code: "LOOKING_AWAY",
      });
    }
  }

  recordMetrics(metrics) {
    this.faceHistory.push(metrics);
    if (this.faceHistory.length > this.maxHistorySize) {
      this.faceHistory.shift();
    }
  }

  handleNoFace() {
    this.suspicionScore = 50;
    reportEvent("NO_FACE_DETECTED");
    return {
      timestamp: Date.now(),
      event: "NO_FACE",
      suspicionScore: 50,
      alerts: [{ level: "CRITICAL", message: "No face detected" }],
    };
  }

  handleMultipleFaces() {
    this.suspicionScore = 100;
    reportEvent("MULTIPLE_FACES_DETECTED");
    return {
      timestamp: Date.now(),
      event: "MULTIPLE_FACES",
      suspicionScore: 100,
      alerts: [{ level: "CRITICAL", message: "Multiple faces detected" }],
    };
  }

  getSessionMetrics() {
    return {
      totalFramesAnalyzed: this.faceHistory.length,
      averageSuspicionScore:
        this.faceHistory.reduce((sum, m) => sum + m.suspicionScore, 0) /
        this.faceHistory.length,
      maxSuspicionScore: Math.max(...this.faceHistory.map((m) => m.suspicionScore)),
      sessionDuration: this.faceHistory.length > 0
        ? this.faceHistory[this.faceHistory.length - 1].timestamp -
          this.faceHistory[0].timestamp
        : 0,
      anomalies: this.faceHistory.filter((m) => m.alerts.length > 0).length,
    };
  }
}

// Export singleton instance
export const advancedAnalyzer = new AdvancedFaceAnalyzer();

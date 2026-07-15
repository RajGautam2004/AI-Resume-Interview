const FACE_KEYPOINT_NAMES = [
  'rightEye',
  'leftEye',
  'noseTip',
  'mouthCenter',
  'rightEarTragion',
  'leftEarTragion'
];

export const PROCTORING_SEVERITY = {
  TAB_SWITCH: 'critical',
  WINDOW_BLUR: 'warning',
  MULTIPLE_FACES: 'critical',
  NO_FACE: 'critical',
  LOOKING_AWAY: 'warning',
  TOO_FAR: 'warning',
  TOO_CLOSE: 'info',
  WINDOW_FOCUS: 'info',
  ANALYSIS_ERROR: 'warning'
};

function buildKeypointMap(keypoints = []) {
  return keypoints.reduce((acc, point, index) => {
    const name = point?.name || FACE_KEYPOINT_NAMES[index];

    if (name && typeof point?.x === 'number' && typeof point?.y === 'number') {
      acc[name] = point;
    }

    return acc;
  }, {});
}

function createAlert(eventType, message, details = {}) {
  return {
    eventType,
    severity: PROCTORING_SEVERITY[eventType] || 'info',
    message,
    details,
    timestamp: new Date().toISOString()
  };
}

export function analyzeFace(predictions = [], videoWidth = 0) {
  const analysis = {
    hasFace: false,
    faceCount: predictions.length,
    faceWidth: 0,
    lookingDirection: 'CENTER',
    distance: 'UNKNOWN',
    alerts: []
  };

  if (predictions.length === 0) {
    analysis.alerts.push(createAlert('NO_FACE', 'No face detected in the camera feed.'));
    return analysis;
  }

  if (predictions.length > 1) {
    analysis.alerts.push(
      createAlert('MULTIPLE_FACES', 'Multiple faces detected in frame.', {
        faceCount: predictions.length
      })
    );
    return analysis;
  }

  const face = predictions[0];
  const keypointMap = buildKeypointMap(face.keypoints || []);
  const rightEye = keypointMap.rightEye;
  const leftEye = keypointMap.leftEye;
  const noseTip = keypointMap.noseTip;
  const rightEar = keypointMap.rightEarTragion;
  const leftEar = keypointMap.leftEarTragion;
  const boxWidth = face?.box?.width || 0;
  const earSpan =
    rightEar && leftEar ? Math.abs(rightEar.x - leftEar.x) : 0;

  analysis.hasFace = true;
  analysis.faceWidth = Math.max(boxWidth, earSpan);

  if (leftEye && rightEye && noseTip) {
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const deviation = noseTip.x - eyeCenterX;
    const lookingAwayThreshold = Math.max(analysis.faceWidth * 0.08, 18);

    if (Math.abs(deviation) > lookingAwayThreshold) {
      analysis.lookingDirection = deviation > 0 ? 'RIGHT' : 'LEFT';
      analysis.alerts.push(
        createAlert(
          'LOOKING_AWAY',
          `Candidate appears to be looking ${analysis.lookingDirection.toLowerCase()}.`,
          {
            lookingDirection: analysis.lookingDirection,
            deviation: Math.round(deviation)
          }
        )
      );
    }
  }

  if (videoWidth > 0 && analysis.faceWidth > 0) {
    const faceWidthRatio = analysis.faceWidth / videoWidth;

    if (faceWidthRatio < 0.18) {
      analysis.distance = 'TOO_FAR';
      analysis.alerts.push(
        createAlert('TOO_FAR', 'Candidate is too far from the camera.', {
          faceWidthRatio: Number(faceWidthRatio.toFixed(3))
        })
      );
    } else if (faceWidthRatio > 0.62) {
      analysis.distance = 'TOO_CLOSE';
      analysis.alerts.push(
        createAlert('TOO_CLOSE', 'Candidate is too close to the camera.', {
          faceWidthRatio: Number(faceWidthRatio.toFixed(3))
        })
      );
    } else {
      analysis.distance = 'OPTIMAL';
    }
  }

  return analysis;
}

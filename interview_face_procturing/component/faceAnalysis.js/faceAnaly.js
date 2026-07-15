import { reportEvent } from "./eventReporter";

export function analyzeFace(predictions) {
  if (predictions.length === 0) {
    reportEvent("NO_FACE");
    return;
  }

  if (predictions.length > 1) {
    reportEvent("MULTIPLE_FACES");
    return;
  }

  const keypoints = predictions[0].scaledMesh;

  const leftEye = keypoints[33];
  const rightEye = keypoints[263];
  const nose = keypoints[1];

  const eyeCenterX = (leftEye[0] + rightEye[0]) / 2;

  if (Math.abs(nose[0] - eyeCenterX) > 20) {
    reportEvent("LOOKING_AWAY");
  }

  const faceWidth = Math.abs(leftEye[0] - rightEye[0]);

  if (faceWidth < 50) {
    reportEvent("TOO_FAR");
  }
}
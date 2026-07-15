import React, { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

import { analyzeFace } from "../utils/faceAnalysis";
import { reportEvent } from "../utils/eventReporter";

let model;
let animationId;

export default function Proctoring() {
  const webcamRef = useRef(null);

  useEffect(() => {
    init();

    // ✅ Tab switch detection (correct place)
    const handleVisibility = () => {
      if (document.hidden) {
        reportEvent("TAB_SWITCH");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    // ✅ Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const init = async () => {
    await tf.setBackend("webgl");

    model = await faceLandmarksDetection.createDetector(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      {
        runtime: "tfjs",
      }
    );

    detectLoop();
  };

  const detectLoop = async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;

      const faces = await model.estimateFaces(video);

      analyzeFace(faces);
    }

    animationId = requestAnimationFrame(detectLoop);
  };

  return (
    <div>
      <h2>AI Proctoring Active</h2>

      <Webcam
        ref={webcamRef}
        audio={false}
        style={{ width: 400 }}
        videoConstraints={{
          width: 320,
          height: 240,
          facingMode: "user",
        }}
      />
    </div>
  );
}
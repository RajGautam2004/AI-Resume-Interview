import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

import { analyzeFace, clearEventCache } from "../utils/faceAnalysis";
import { reportEvent, getEventStats, flushEvents } from "../utils/eventReporter";

let model = null;
let animationId = null;
let detectionCount = 0;

/**
 * Optimized Proctoring Component
 * Features: Real-time face detection, event logging, performance tracking
 */
export default function Proctoring() {
  const webcamRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("initializing");
  const [metrics, setMetrics] = useState({
    detections: 0,
    fps: 0,
    modelReady: false,
  });

  // Memoized log event function
  const logEvent = useCallback((eventName) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents((prev) => [
      { event: eventName, time: timestamp },
      ...prev.slice(0, 14),
    ]);
  }, []);

  // Initialize face detection model
  const init = useCallback(async () => {
    try {
      setStatus("initializing");
      setIsLoading(true);

      // Set TensorFlow backend
      try {
        await tf.setBackend("webgl");
      } catch {
        console.warn("WebGL not available, using default backend");
        await tf.setBackend("cpu");
      }

      await tf.ready();
      console.log("✅ TensorFlow ready");

      // Load face detection model
      model = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {\n          runtime: "tfjs",\n        }\n      );\n\n      console.log(\"✅ Face detection model loaded\");\n      setMetrics((prev) => ({ ...prev, modelReady: true }));\n      setStatus(\"active\");\n      setIsLoading(false);\n\n      // Start detection loop\n      detectLoop();\n    } catch (err) {\n      console.error(\"Initialization error:\", err);\n      setError(`Failed to initialize: ${err.message}`);\n      setStatus(\"error\");\n      reportEvent(\"MODEL_INIT_ERROR\", { error: err.message });\n    }\n  }, []);\n\n  // Main detection loop with performance optimization\n  const detectLoop = useCallback(async () => {\n    try {\n      if (\n        !model ||\n        !webcamRef.current ||\n        !webcamRef.current.video ||\n        webcamRef.current.video.readyState !== 4\n      ) {\n        animationId = requestAnimationFrame(detectLoop);\n        return;\n      }\n\n      const video = webcamRef.current.video;\n      const startTime = performance.now();\n\n      // Run face detection\n      const faces = await model.estimateFaces(video, false);\n\n      // Analyze detected faces\n      if (faces.length > 0) {\n        const analysis = analyzeFace(faces, logEvent);\n        setMetrics((prev) => ({\n          ...prev,\n          detections: prev.detections + 1,\n        }));\n      }\n\n      // Calculate FPS\n      const endTime = performance.now();\n      const frameTime = endTime - startTime;\n      const fps = Math.round(1000 / frameTime);\n\n      setMetrics((prev) => ({\n        ...prev,\n        fps,\n        detections: prev.detections + 1,\n      }));\n\n      detectionCount++;\n    } catch (err) {\n      console.error(\"Detection error:\", err);\n    }\n\n    animationId = requestAnimationFrame(detectLoop);\n  }, [logEvent]);\n\n  // Initialize on mount\n  useEffect(() => {
    init();

    // Tab switch detection\n    const handleVisibility = () => {\n      if (document.hidden) {\n        logEvent(\"TAB_SWITCH\");\n        reportEvent(\"TAB_SWITCH\");\n      }\n    };\n\n    // Blur/focus detection\n    const handleBlur = () => {\n      logEvent(\"WINDOW_BLUR\");\n      reportEvent(\"WINDOW_BLUR\");\n    };\n\n    const handleFocus = () => {\n      logEvent(\"WINDOW_FOCUS\");\n    };\n\n    document.addEventListener(\"visibilitychange\", handleVisibility);\n    window.addEventListener(\"blur\", handleBlur);\n    window.addEventListener(\"focus\", handleFocus);\n\n    // Handle page unload\n    const handleBeforeUnload = async () => {\n      await flushEvents();\n    };\n\n    window.addEventListener(\"beforeunload\", handleBeforeUnload);\n\n    // Cleanup function\n    return () => {\n      document.removeEventListener(\"visibilitychange\", handleVisibility);\n      window.removeEventListener(\"blur\", handleBlur);\n      window.removeEventListener(\"focus\", handleFocus);\n      window.removeEventListener(\"beforeunload\", handleBeforeUnload);\n\n      if (animationId) {\n        cancelAnimationFrame(animationId);\n      }\n    };\n  }, [logEvent]);\n\n  // Helper functions\n  const getStatusColor = useCallback(() => {\n    if (status === \"active\") return \"#10b981\";\n    if (status === \"error\") return \"#ef4444\";\n    return \"#f59e0b\";\n  }, [status]);\n\n  const getStatusText = useCallback(() => {\n    if (status === \"active\") return \"🟢 Active\";\n    if (status === \"error\") return \"🔴 Error\";\n    return \"🟡 Initializing...\";\n  }, [status]);\n\n  const getSeverityColor = (event) => {\n    if ([\"MULTIPLE_FACES\", \"NO_FACE\", \"TAB_SWITCH\"].includes(event)) {\n      return \"#ef4444\"; // Red\n    }\n    if ([\"LOOKING_AWAY\", \"TOO_FAR\"].includes(event)) {\n      return \"#f59e0b\"; // Orange\n    }\n    return \"#3b82f6\"; // Blue\n  };\n\n  return (\n    <div style={{ maxWidth: \"100%\", width: \"100%\", padding: \"20px\" }}>\n      {/* Header */}\n      <div style={{ marginBottom: \"24px\" }}>\n        <h2 style={{ fontSize: \"28px\", marginBottom: \"8px\", margin: \"0 0 8px 0\" }}>\n          🎓 AI Proctoring System\n        </h2>\n        <div style={{ display: \"flex\", alignItems: \"center\", gap: \"12px\", flexWrap: \"wrap\" }}>\n          {/* Status Indicator */}\n          <div style={{ display: \"flex\", alignItems: \"center\", gap: \"8px\" }}>\n            <span\n              style={{\n                display: \"inline-block\",\n                width: \"12px\",\n                height: \"12px\",\n                borderRadius: \"50%\",\n                backgroundColor: getStatusColor(),\n                animation: status !== \"error\" ? \"pulse 2s infinite\" : \"none\",\n              }}\n            />\n            <span style={{ fontSize: \"14px\", fontWeight: \"500\" }}>\n              {getStatusText()}\n            </span>\n          </div>\n\n          {/* Metrics */}\n          <div style={{ fontSize: \"12px\", color: \"#6b7280\" }}>\n            FPS: {metrics.fps} | Detections: {metrics.detections}\n          </div>\n        </div>\n      </div>\n\n      {/* Error Display */}\n      {error && (\n        <div\n          style={{\n            background: \"#fee2e2\",\n            border: \"1px solid #fecaca\",\n            color: \"#991b1b\",\n            padding: \"12px\",\n            borderRadius: \"8px\",\n            marginBottom: \"16px\",\n            fontSize: \"14px\",\n          }}\n        >\n          ⚠️ Error: {error}\n        </div>\n      )}\n\n      {/* Webcam Container */}\n      <div\n        style={{\n          borderRadius: \"12px\",\n          overflow: \"hidden\",\n          marginBottom: \"20px\",\n          border: \"2px solid #e5e7eb\",\n          background: \"#000\",\n        }}\n      >\n        {isLoading ? (\n          <div\n            style={{\n              display: \"flex\",\n              justifyContent: \"center\",\n              alignItems: \"center\",\n              height: \"300px\",\n              background: \"#f3f4f6\",\n              fontSize: \"14px\",\n            }}\n          >\n            <span style={{ marginRight: \"8px\" }}>⏳ Loading webcam...</span>\n            <span\n              style={{\n                display: \"inline-block\",\n                width: \"16px\",\n                height: \"16px\",\n                border: \"2px solid #e5e7eb\",\n                borderTopColor: \"#667eea\",\n                borderRadius: \"50%\",\n                animation: \"spin 0.8s linear infinite\",\n              }}\n            />\n          </div>\n        ) : (\n          <Webcam\n            ref={webcamRef}\n            audio={false}\n            style={{ width: \"100%\", display: \"block\", height: \"auto\" }}\n            videoConstraints={{\n              width: { ideal: 320 },\n              height: { ideal: 240 },\n              facingMode: \"user\",\n            }}\n          />\n        )}\n      </div>\n\n      {/* Events Log */}\n      <div\n        style={{\n          background: \"#f9fafb\",\n          padding: \"16px\",\n          borderRadius: \"8px\",\n          border: \"1px solid #e5e7eb\",\n        }}\n      >\n        <div\n          style={{\n            display: \"flex\",\n            justifyContent: \"space-between\",\n            alignItems: \"center\",\n            marginBottom: \"12px\",\n          }}\n        >\n          <h3 style={{ fontSize: \"14px\", fontWeight: \"600\", margin: 0 }}>\n            📋 Recent Events ({events.length})\n          </h3>\n          <span style={{ fontSize: \"11px\", color: \"#9ca3af\" }}>\n            Queue: {getEventStats().queued}\n          </span>\n        </div>\n\n        {events.length === 0 ? (\n          <p style={{ fontSize: \"12px\", color: \"#6b7280\", margin: 0 }}>\n            ✅ No suspicious activity detected\n          </p>\n        ) : (\n          <div style={{ display: \"flex\", flexDirection: \"column\", gap: \"6px\" }}>\n            {events.map((e, i) => (\n              <div\n                key={`${e.time}-${i}`}\n                style={{\n                  display: \"flex\",\n                  justifyContent: \"space-between\",\n                  alignItems: \"center\",\n                  fontSize: \"12px\",\n                  padding: \"8px\",\n                  background: \"white\",\n                  borderRadius: \"6px\",\n                  borderLeft: `3px solid ${getSeverityColor(e.event)}`,\n                }}\n              >\n                <span style={{ fontWeight: \"500\", flex: 1 }}>🔴 {e.event}</span>\n                <span style={{ color: \"#9ca3af\", fontSize: \"11px\" }}>{e.time}</span>\n              </div>\n            ))}\n          </div>\n        )}\n      </div>\n\n      {/* Footer Info */}\n      <p\n        style={{\n          fontSize: \"12px\",\n          color: \"#6b7280\",\n          marginTop: \"16px\",\n          textAlign: \"center\",\n          margin: \"16px 0 0 0\",\n        }}\n      >\n        ℹ️ This system monitors your behavior during the interview\n      </p>\n    </div>\n  );\n}

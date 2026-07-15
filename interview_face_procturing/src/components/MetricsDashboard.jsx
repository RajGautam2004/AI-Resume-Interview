import React, { useState, useEffect } from "react";

/**
 * ADVANCED METRICS DASHBOARD
 * Real-time proctoring metrics and alerts
 */

export default function MetricsDashboard({ sessionMetrics, alerts }) {
  const [displayMetrics, setDisplayMetrics] = useState(null);

  useEffect(() => {
    setDisplayMetrics(sessionMetrics);
  }, [sessionMetrics]);

  const getSuspicionColor = (score) => {
    if (score > 85) return "#ef4444"; // Red - Critical
    if (score > 70) return "#f59e0b"; // Orange - Warning
    if (score > 50) return "#eab308"; // Yellow - Caution
    return "#10b981"; // Green - Safe
  };

  return (
    <div style={{ padding: "20px", background: "#f3f4f6", borderRadius: "12px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          borderBottom: "2px solid #e5e7eb",
          paddingBottom: "12px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
          📊 Session Metrics
        </h3>
        <span
          style={{
            fontSize: "12px",
            color: "#6b7280",
            background: "white",
            padding: "4px 12px",
            borderRadius: "20px",
          }}
        >
          Live
        </span>
      </div>

      {/* Suspicion Score */}
      {displayMetrics && (
        <>
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <label style={{ fontSize: "14px", fontWeight: "500" }}>
                Suspicion Score
              </label>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: getSuspicionColor(
                    displayMetrics.suspicionScore || 0
                  ),
                }}
              >
                {displayMetrics.suspicionScore || 0}%
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#e5e7eb",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${displayMetrics.suspicionScore || 0}%`,
                  height: "100%",
                  background: getSuspicionColor(
                    displayMetrics.suspicionScore || 0
                  ),
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Face Metrics Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <MetricBox
              label="Face Width"
              value={Math.round(displayMetrics.faceWidth || 0) + "px"}
              status={displayMetrics.faceWidth > 50 ? "good" : "warning"}
            />
            <MetricBox
              label="Eye Openness"
              value={Math.round(displayMetrics.eyeOpenness || 0)}
              status={displayMetrics.eyeOpenness > 5 ? "good" : "warning"}
            />
            <MetricBox
              label="Looking Direction"
              value={displayMetrics.lookingDirection || "CENTER"}
              status={
                displayMetrics.lookingDirection === "CENTER" ? "good" : "warning"
              }
            />
            <MetricBox
              label="Head Tilt"
              value={
                Math.round(Math.abs(displayMetrics.headPose?.x || 0)) + "°"
              }
              status={Math.abs(displayMetrics.headPose?.x || 0) < 30 ? "good" : "warning"}
            />
          </div>

          {/* Alerts Section */}
          {displayMetrics.alerts && displayMetrics.alerts.length > 0 && (
            <div
              style={{
                background: "white",
                border: "2px solid #fed7aa",
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#d97706",
                }}
              >
                ⚠️ Active Alerts
              </h4>
              {displayMetrics.alerts.map((alert, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "13px",
                    marginBottom: i < displayMetrics.alerts.length - 1 ? "8px" : 0,
                    paddingBottom: i < displayMetrics.alerts.length - 1 ? "8px" : 0,
                    borderBottom:
                      i < displayMetrics.alerts.length - 1
                        ? "1px solid #f3e8ff"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      background:
                        alert.level === "CRITICAL"
                          ? "#ef4444"
                          : alert.level === "WARNING"
                          ? "#f59e0b"
                          : "#3b82f6",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      marginRight: "8px",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    {alert.level}
                  </span>
                  {alert.message}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MetricBox({ label, value, status }) {
  const statusColor = status === "good" ? "#10b981" : "#f59e0b";

  return (
    <div
      style={{
        background: "white",
        border: `2px solid ${statusColor}`,
        borderRadius: "8px",
        padding: "12px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "16px",
          fontWeight: "700",
          color: statusColor,
        }}
      >
        {value}
      </div>
    </div>
  );
}

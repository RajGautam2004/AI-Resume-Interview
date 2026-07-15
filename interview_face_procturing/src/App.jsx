import React, { Component } from "react";
import Proctoring from "./components/Proctoring";

/**
 * Error Boundary for graceful error handling
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            background: "#fee2e2",
            borderRadius: "12px",
            margin: "20px",
          }}
        >
          <h2 style={{ color: "#991b1b" }}>⚠️ Something went wrong</h2>
          <p style={{ color: "#7f1d1d", marginBottom: "20px" }}>
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Main App Component
 * Provides error boundary and proctoring functionality
 */
function App() {
  return (
    <ErrorBoundary>
      <div style={{ minHeight: "100vh" }}>
        <Proctoring />
      </div>
    </ErrorBoundary>
  );
}

export default App;

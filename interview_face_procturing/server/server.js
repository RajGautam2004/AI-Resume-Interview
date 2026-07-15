import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Store events
const proctorEvents = [];

// API endpoint to receive proctoring events
app.post("/api/proctoring-event", (req, res) => {
  const { event, timestamp } = req.body;

  if (!event || !timestamp) {
    return res.status(400).json({ error: "Missing event or timestamp" });
  }

  const eventData = {
    event,
    timestamp,
    receivedAt: new Date().toISOString(),
  };

  proctorEvents.push(eventData);
  console.log("Event received:", eventData);

  // Flag suspicious events
  if (
    ["TAB_SWITCH", "MULTIPLE_FACES", "LOOKING_AWAY", "NO_FACE"].includes(event)
  ) {
    console.warn(" SUSPICIOUS ACTIVITY:", event);
  }

  res.json({ success: true, message: "Event recorded" });
});

// Get all events
app.get("/api/proctoring-events", (req, res) => {
  res.json({
    total: proctorEvents.length,
    events: proctorEvents,
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Proctoring server running on http://localhost:${PORT}`);
  console.log(` View events at http://localhost:${PORT}/api/proctoring-events`);
});

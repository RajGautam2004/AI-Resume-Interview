/**
 * ADVANCED DATABASE SETUP
 * MongoDB connection & schemas
 */

// This file demonstrates database setup
// In production, install: npm install mongoose
// Or use: npm install pg (for PostgreSQL)

/*
Example MongoDB Setup (uncomment when ready):

import mongoose from "mongoose";

// Event Schema
const eventSchema = new mongoose.Schema({
  userId: String,
  sessionId: String,
  event: String,
  timestamp: Date,
  faceMetrics: {
    faceWidth: Number,
    eyeOpenness: Number,
    headPose: Object,
    suspicionScore: Number,
  },
  severity: String,
  resolved: Boolean,
  createdAt: { type: Date, default: Date.now },
});

// Session Schema
const sessionSchema = new mongoose.Schema({
  userId: String,
  startTime: Date,
  endTime: Date,
  status: String,
  totalEvents: Number,
  averageSuspicionScore: Number,
  flagged: Boolean,
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

export const Event = mongoose.model("Event", eventSchema);
export const Session = mongoose.model("Session", sessionSchema);

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/proctoring");
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}
*/

// Temporary In-Memory Database (development)
export const database = {
  sessions: [],
  events: [],
  users: [],
};

export function saveEvent(eventData) {
  database.events.push({
    ...eventData,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
  });
  return database.events[database.events.length - 1];
}

export function saveSession(sessionData) {
  database.sessions.push({
    ...sessionData,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
  });
  return database.sessions[database.sessions.length - 1];
}

export function getSessionEvents(sessionId) {
  return database.events.filter((e) => e.sessionId === sessionId);
}

export function getSuspiciousSessions() {
  return database.sessions.filter((s) => s.flagged === true);
}

export function getSessionReport(sessionId) {
  const session = database.sessions.find((s) => s.id === sessionId);
  const events = getSessionEvents(sessionId);

  return {
    session,
    events,
    summary: {
      totalEvents: events.length,
      criticalEvents: events.filter((e) => e.severity === "CRITICAL").length,
      warningEvents: events.filter((e) => e.severity === "WARNING").length,
      avgSuspicion:
        events.reduce((sum, e) => sum + (e.faceMetrics?.suspicionScore || 0), 0) /
        events.length,
    },
  };
}

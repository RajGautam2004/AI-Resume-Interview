# 📋 Integration Guide - 5 Optimized Core Files

## Overview

This guide explains how to integrate the **5 production-optimized files** into your main project folder:

1. ✅ `src/utils/faceAnalysis.js` - Face detection with event caching
2. ✅ `src/utils/eventReporter.js` - Event reporter with queue/batch/retry
3. ✅ `src/App.jsx` - React app with error boundary
4. ✅ `src/components/Proctoring.jsx` - UI component with performance metrics
5. ✅ `server/server.js` - Express backend with advanced features

---

## File Locations (After Integration)

```
your-main-folder/
├── src/
│   ├── App.jsx                          ✅ OPTIMIZED
│   ├── index.jsx
│   ├── components/
│   │   └── Proctoring.jsx               ✅ OPTIMIZED
│   └── utils/
│       ├── eventReporter.js             ✅ OPTIMIZED
│       └── faceAnalysis.js              ✅ OPTIMIZED
│
├── server/
│   └── server.js                        ✅ OPTIMIZED (Replace this)
│
├── package.json                         (Update dependencies)
├── index.html                           (Keep existing)
└── vite.config.js                       (Keep existing)
```

---

## Step-by-Step Integration

### Step 1: Backup Your Current Files
```bash
# Create backup folder
mkdir backup

# Backup your current files
cp -r src backup/src-backup
cp -r server backup/server-backup
cp package.json backup/package.json-backup
```

### Step 2: Update package.json

**Add/Update these dependencies:**

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-webcam": "^7.1.0",
    "@tensorflow/tfjs": "^4.11.0",
    "@tensorflow-models/face-landmarks-detection": "^0.0.7",
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "concurrently": "^8.2.0"
  }
}
```

**Add/Update these scripts:**

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "vite",
    "dev:backend": "node server/server.js",
    "build:frontend": "vite build",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server/server.js",
    "test": "node test-integration.js"
  }
}
```

**Then install:**
```bash
npm install
```

### Step 3: Copy Optimized Files

#### 3.1 Frontend Files

**File 1: `src/App.jsx` (with Error Boundary)**
- Copy the optimized version to: `src/App.jsx`
- This adds error boundary for graceful error handling
- Wraps your Proctoring component

**File 2: `src/components/Proctoring.jsx` (Optimized UI)**
- Copy to: `src/components/Proctoring.jsx`
- Creates component directory if needed: `mkdir -p src/components`
- Includes memoization, performance metrics, enhanced event handling

**File 3: `src/utils/faceAnalysis.js` (Face Detection)**
- Copy to: `src/utils/faceAnalysis.js`
- Creates utils directory if needed: `mkdir -p src/utils`
- Handles all face detection logic with caching
- Exports: `analyzeFace()`, `clearEventCache()`

**File 4: `src/utils/eventReporter.js` (Event Reporting)**
- Copy to: `src/utils/eventReporter.js`
- Handles reliable event delivery with queue/batch/retry
- Exports: `reportEvent()`, `getEventStats()`, `flushEvents()`, `clearFailedEvents()`

#### 3.2 Backend File

**File 5: `server/server.js` (Express Backend)**
- Copy to: `server/server.js` (creates directory if needed: `mkdir -p server`)
- Replace your current backend with this optimized version
- Includes batch processing, sessions, statistics

### Step 4: Update Entry Point

**Make sure `src/index.jsx` imports from optimized files:**

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Step 5: Create/Update index.html

**Ensure `index.html` has:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Proctoring System</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f3f4f6; }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/index.jsx"></script>
</body>
</html>
```

### Step 6: Create `.env` File

```bash
cp .env.example .env
# Or create new:
cat > .env << EOF
VITE_API_URL=http://localhost:5000
NODE_ENV=development
PORT=5000
EOF
```

### Step 7: Install Dependencies

```bash
npm install

# Wait for completion (2-5 minutes)
# Should see: added XX packages, audited XX packages
```

---

## File Dependencies Map

### Frontend Dependencies

```
src/App.jsx
├── Imports: React, Proctoring
└── Exports: App component

src/components/Proctoring.jsx
├── Imports: 
│   ├── React hooks (useRef, useEffect, useState, useCallback)
│   ├── Webcam from react-webcam
│   ├── @tensorflow/tfjs
│   ├── @tensorflow-models/face-landmarks-detection
│   ├── analyzeFace from ../utils/faceAnalysis.js
│   └── reportEvent, getEventStats, flushEvents from ../utils/eventReporter.js
└── Exports: Proctoring functional component

src/utils/faceAnalysis.js
├── Imports: None (standalone)
├── Exports:
│   ├── analyzeFace(faces, logEventCallback)
│   └── clearEventCache()
└── Uses: Face detection logic with event caching

src/utils/eventReporter.js
├── Imports: None (standalone)
├── Exports:
│   ├── reportEvent(eventName, data)
│   ├── getEventStats()
│   ├── flushEvents()
│   └── clearFailedEvents()
└── Uses: Event queue, batching, retry logic
```

### Backend Dependencies

```
server/server.js
├── Imports:
│   ├── express
│   ├── cors
│   └── Node.js built-ins (http, fs)
├── Exports: Express app
└── Endpoints:
    ├── POST /api/proctoring-event
    ├── GET /api/proctoring-events
    ├── POST /api/session/start
    ├── POST /api/session/end
    ├── GET /api/statistics
    └── GET /api/health
```

---

## API Endpoints (After Integration)

### Events

**Record Event (Frontend → Backend)**
```
POST /api/proctoring-event
Content-Type: application/json

Request:
{
  "eventType": "FACE_DETECTED",
  "timestamp": "2026-04-11T10:30:00Z",
  "data": {
    "confidence": 0.95,
    "faceCount": 1
  }
}

Response (200 OK):
{
  "success": true,
  "eventId": "evt_123456",
  "stored": true
}
```

**Retrieve Events**
```
GET /api/proctoring-events
GET /api/proctoring-events?eventType=TAB_SWITCH
GET /api/proctoring-events?sessionId=sess_123

Response (200 OK):
[
  {
    "id": "evt_1",
    "eventType": "TAB_SWITCH",
    "timestamp": "2026-04-11T10:30:00Z",
    "severity": "WARNING"
  }
]
```

### Statistics

**Get Event Statistics**
```
GET /api/statistics

Response (200 OK):
{
  "totalEvents": 45,
  "byType": {
    "FACE_DETECTED": 15,
    "TAB_SWITCH": 5,
    "MULTIPLE_FACES": 2,
    "NO_FACE": 8
  },
  "bySeverity": {
    "CRITICAL": 2,
    "WARNING": 13,
    "INFO": 30
  }
}
```

### Sessions

**Start Session**
```
POST /api/session/start
Response: { "sessionId": "sess_123", "startTime": "2026-04-11T10:30:00Z" }
```

**End Session**
```
POST /api/session/end
Body: { "sessionId": "sess_123" }
Response: { "duration": 1800, "eventCount": 45 }
```

### Health

**Health Check**
```
GET /api/health

Response (200 OK):
{
  "status": "ok",
  "uptime": 3600,
  "memory": 42.5,
  "timestamp": "2026-04-11T10:30:00Z"
}
```

---

## Testing Integration

### Test 1: Verify File Structure
```bash
# Check all files exist
test -f src/App.jsx && echo "✅ App.jsx found"
test -f src/components/Proctoring.jsx && echo "✅ Proctoring.jsx found"
test -f src/utils/faceAnalysis.js && echo "✅ faceAnalysis.js found"
test -f src/utils/eventReporter.js && echo "✅ eventReporter.js found"
test -f server/server.js && echo "✅ server.js found"
```

### Test 2: Verify Dependencies
```bash
npm list react
npm list express
npm list @tensorflow/tfjs

# Should show installed versions
```

### Test 3: Build Frontend
```bash
npm run build:frontend

# Check output
ls -la dist/
# Should show index.html, assets/
```

### Test 4: Start Backend
```bash
npm run dev:backend

# Expected output:
# ✅ Express server running on port 5000
# ✅ CORS enabled for http://localhost:3000
# ✅ Ready to accept events
```

### Test 5: Start Frontend
```bash
npm run dev:frontend

# Expected output:
# ✨ vite v5.0.8 dev server running at:
# > Local:   http://localhost:3000/
```

### Test 6: Full Stack Test
```bash
npm run dev

# First terminal should show both:
# ✨ Frontend running on http://localhost:3000
# ✅ Backend running on http://localhost:5000
```

### Test 7: API Test
```bash
# Check health
curl http://localhost:5000/api/health

# Should respond with 200 and JSON
```

---

## Common Integration Issues

### Issue 1: Import Path Errors
**Problem**: `Cannot find module '../utils/faceAnalysis'`

**Solution**:
```bash
# Check directory structure
tree src/
# Should show:
# src/
#   ├── App.jsx
#   ├── components/
#   │   └── Proctoring.jsx
#   └── utils/
#       ├── faceAnalysis.js
#       └── eventReporter.js
```

### Issue 2: Module Type Errors
**Problem**: `This type of module is not supported`

**Solution**: Ensure `package.json` has `"type": "module"` for ES modules

```json
{
  "type": "module",
  ...
}
```

### Issue 3: Missing Dependencies
**Problem**: `Cannot find module 'react'`

**Solution**:
```bash
npm install
npm list | grep react
```

### Issue 4: Port Conflicts
**Problem**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Change port in .env
PORT=5001

# Or kill process
lsof -ti:5000 | xargs kill -9
```

### Issue 5: CORS Errors
**Problem**: `Access to XMLHttpRequest blocked by CORS`

**Solution**: Verify `server.js` has CORS enabled:
```javascript
const cors = require('cors')
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
```

---

## Verification Checklist

After integration, verify:

- [ ] All 5 files copied to correct locations
- [ ] `package.json` updated with dependencies and scripts
- [ ] `.env` file created and configured
- [ ] `npm install` completed successfully
- [ ] `npm run build:frontend` builds without errors
- [ ] Backend starts: `npm run dev:backend`
- [ ] Frontend starts: `npm run dev:frontend`
- [ ] Browser loads: `http://localhost:3000`
- [ ] Webcam displays video
- [ ] Face detection works (events appear in log)
- [ ] API responds: `curl http://localhost:5000/api/health`
- [ ] No console errors (F12)
- [ ] No CORS errors
- [ ] Performance metrics visible (FPS, detections)

---

## Optimizations in These 5 Files

### 1. faceAnalysis.js Optimizations
- ✅ Event caching (2000ms) prevents event spam
- ✅ Detailed analysis object with confidence scores
- ✅ Smart direction detection (CENTER, LEFT, RIGHT)
- ✅ Distance analysis (TOO_FAR, OPTIMAL, TOO_CLOSE)
- ✅ Try-catch error handling

### 2. eventReporter.js Optimizations
- ✅ Event queueing for reliability
- ✅ Batch processing (max 10 events or 5s timeout)
- ✅ Retry logic with exponential backoff (3 attempts)
- ✅ Failed event tracking
- ✅ Statistics tracking

### 3. App.jsx Optimizations
- ✅ Error boundary component
- ✅ Graceful error handling
- ✅ Error recovery UI
- ✅ Prevents white screen of death

### 4. Proctoring.jsx Optimizations
- ✅ useCallback memoization for performance
- ✅ FPS tracking and metrics display
- ✅ Performance monitoring
- ✅ Enhanced event handling
- ✅ Graceful cleanup

### 5. server.js Optimizations
- ✅ Batch event processing
- ✅ Session management
- ✅ Statistics aggregation
- ✅ Event filtering and retrieval
- ✅ Severity calculation
- ✅ Graceful shutdown

---

## Next Steps

1. **Complete**: Follow the step-by-step integration above
2. **Test**: Run all verification tests
3. **Customize**: Adjust thresholds/timings as needed
4. **Deploy**: Follow deployment guide
5. **Monitor**: Use statistics endpoint to track performance

For more details, see:
- [SETUP.md](SETUP.md) - Detailed setup and installation
- [README.md](README.md) - Project overview
- [TESTS.md](TESTS.md) - Comprehensive testing guide


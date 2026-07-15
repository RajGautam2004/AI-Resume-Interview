# Quick Start Guide - AI Proctoring System

## 🚀 30-Second Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Environment
```bash
npm run dev
```

This will start:
- ✅ **Frontend**: http://localhost:3000
- ✅ **Backend**: http://localhost:5000

### Step 3: Test in Browser
1. Open http://localhost:3000
2. Allow webcam access
3. You should see the proctoring interface with:
   - Live webcam feed
   - Status indicator (green = active)
   - Event log showing detected behaviors

---

## 🧪 Testing

### Run API Tests (requires backend running)
```bash
node test-api.js
```

### Manual Testing Checklist
- [ ] Webcam starts and displays video
- [ ] No console errors
- [ ] Tab switching triggers TAB_SWITCH event
- [ ] Moving away from camera triggers LOOKING_AWAY
- [ ] Events appear in the sidebar within 1-2 seconds
- [ ] Backend can be reached at http://localhost:5000/api/health

---

## 📊 API Endpoints

```bash
# Health check
curl http://localhost:5000/api/health

# Get all events (replace with actual IP for remote access)
curl http://localhost:5000/api/proctoring-events

# Report an event (for testing)
curl -X POST http://localhost:5000/api/proctoring-event \
  -H "Content-Type: application/json" \
  -d '{"event":"TAB_SWITCH","timestamp":'$(date +%s000)'}'
```

---

## 📁 Project Structure
```
interview_face_procturing/
├── src/
│   ├── components/Proctoring.jsx   ← Main UI & webcam
│   ├── utils/faceAnalysis.js       ← Face detection logic
│   ├── utils/eventReporter.js      ← Sends events to backend
│   ├── App.jsx
│   └── index.jsx
├── server/server.js                ← Express backend
├── index.html                      ← HTML page
├── vite.config.js                  ← Frontend config
├── package.json
└── test-api.js                     ← API testing script
```

---

## ⚠️ Troubleshooting

### Webcam Not Showing
- [ ] Check browser permissions (allow camera access)
- [ ] Make sure no other app is using the webcam
- [ ] Try a different browser

### Backend Not Connecting
- [ ] Make sure `npm run dev:backend` is running
- [ ] Check if port 5000 is free
- [ ] Check firewall settings

### Model Failed to Load
- [ ] Check internet connection (downloads TensorFlow models)
- [ ] Try disabling browser extensions
- [ ] Clear browser cache

---

## 🚢 Deployment

### Frontend (Vite Build)
```bash
npm run build:frontend
```
Deploy the `dist/` folder to:
- Netlify
- Vercel  
- AWS S3
- GitHub Pages

### Backend (Node.js Server)
Deploy `server/server.js` to:
- Heroku
- Railway
- AWS EC2
- DigitalOcean
- Railway

---

## 📚 Additional Commands

```bash
# Frontend only
npm run dev:frontend

# Backend only  
npm run dev:backend

# Build for production
npm run build:frontend

# Preview production build
npm run preview

# Start just the server
npm start
```

---

## 🔑 Environment Variables (Optional)

Create `.env.local`:
```
VITE_API_URL=http://your-backend-url/api
```

See `.env.example` for all variables.

---

**Ready to test? Run `npm install && npm run dev` 🎉**

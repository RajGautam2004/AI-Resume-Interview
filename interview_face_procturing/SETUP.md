# 🚀 Complete Setup & Installation Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Project Structure](#project-structure)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Starting Development](#starting-development)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher (or yarn)
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, Edge, or Safari (with WebCamera support)
- **Webcam**: Required for face detection

### Check Installation
```bash
# Verify Node.js
node --version          # Should be v14+
npm --version          # Should be v6+

# Verify Git
git --version          # Any recent version

# Check Node modules path (important for global packages)
npm config get prefix
```

---

## Installation Steps

### Step 1: Extract/Clone the Project
```bash
# If you have the zip file, extract it:
# Windows: Right-click → Extract All
# Mac/Linux: unzip interview_face_procturing.zip

# Navigate to the project directory
cd interview_face_procturing
```

### Step 2: Install Dependencies
```bash
# Install all npm packages
npm install

# This will install:
# - Frontend: React, Vite, React-Webcam
# - Backend: Express, CORS
# - ML: TensorFlow.js, Face Detection Model
# - Utils: Concurrently, Dotenv
```

**Time**: Takes 2-5 minutes depending on internet speed

### Step 3: Create Environment File
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env (Windows)
notepad .env

# Edit .env (Mac/Linux)
nano .env
```

**Update these values in `.env`:**
```env
VITE_API_URL=http://localhost:5000
VITE_API_KEY=your_secret_key_here
NODE_ENV=development
PORT=5000
FRONTEND_PORT=3000
```

### Step 4: Verify Installation
```bash
# Check if all files exist
npm run test

# Expected output:
# ✅ All files created successfully
# ✅ Dependencies installed
# ✅ Ready to start development
```

---

## Project Structure

```
interview_face_procturing/
│
├── src/                           # Frontend source code
│   ├── App.jsx                    # Main app with error boundary ✅ OPTIMIZED
│   ├── index.jsx                  # React entry point
│   ├── components/
│   │   └── Proctoring.jsx         # Main UI component ✅ OPTIMIZED
│   └── utils/
│       ├── faceAnalysis.js        # Face detection logic ✅ OPTIMIZED
│       └── eventReporter.js       # Event reporting system ✅ OPTIMIZED
│
├── server/                        # Backend code
│   ├── server.js                  # Express server (OPTIMIZED) ✅
│   ├── server-advanced.js         # Advanced features
│   ├── auth.js                    # Authentication
│   └── database.js                # Database setup
│
├── component/                     # Old structure (can delete)
│   └── proctoring.jsx             # Legacy - use src/components instead
│
├── public/                        # Static files
├── dist/                          # Build output (created after build)
│
├── package.json                   # Dependencies & scripts
├── vite.config.js                 # Vite configuration
├── index.html                     # HTML template
├── .env.example                   # Environment template
├── .env                           # Your environment (create this)
│
├── SETUP.md                       # This file ✅
├── INTEGRATION.md                 # Integration guide ✅
├── README.md                      # Project overview
└── TESTS.md                       # Testing guide
```

---

## Configuration

### Environment Variables Explained

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000
# URL where backend API is running (development)
```

**Backend (.env):**
```env
PORT=5000
# Port for Express server

NODE_ENV=development
# development | production | test

API_SECRET=your_secret_key_here
# JWT secret for authentication
```

### Vite Configuration (vite.config.js)
```javascript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

---

## Running the Application

### Option 1: Development Mode (Both Frontend & Backend)
**Recommended for development**

```bash
# Run both frontend and backend concurrently
npm run dev

# Terminal output:
# ✨ Frontend: http://localhost:3000
# ✨ Backend: http://localhost:5000
# 📝 API Endpoint: http://localhost:5000/api
```

What happens:
- ✅ Vite dev server starts on port 3000
- ✅ Express backend starts on port 5000  
- ✅ Hot module replacement (HMR) enabled
- ✅ API requests proxied to backend

### Option 2: Development Mode (Basic Server Only)
**Faster if you don't need advanced features**

```bash
# Frontend only (first terminal)
npm run dev:frontend

# Backend only (second terminal)
npm run dev:basic

# Open browser to http://localhost:3000
```

### Option 3: Production Build
**For deployment**

```bash
# Build frontend
npm run build:frontend

# Start backend in production
NODE_ENV=production npm start

# Open browser to http://localhost:3000
```

### Option 4: Docker (All-in-One)
```bash
# Build and run with Docker Compose
npm run docker:compose

# Or manually:
docker build -t proctoring-system .
docker run -p 3000:3000 -p 5000:5000 proctoring-system

# Access at http://localhost:3000
```

---

## Starting Development

### First Time Setup Checklist

- [ ] Extracted project folder
- [ ] Installed Node.js v14+
- [ ] Ran `npm install` (wait for completion)
- [ ] Created `.env` file from `.env.example`
- [ ] Updated `.env` with your API URL
- [ ] Ran `npm run test` (all items green ✅)
- [ ] Have a webcam connected
- [ ] Using a modern browser

### Start the Application

```bash
# Terminal 1: Start the entire stack
npm run dev

# Wait for output:
# ✨ vite v5.0.8 dev server running at:
# > Local:   http://localhost:3000/
# ✅ Express server running on port 5000
```

### Access the Application

Open your browser and go to:
```
http://localhost:3000
```

### What You Should See

1. **AI Proctoring System Header** with:
   - Status indicator (🟢 Active)
   - FPS counter
   - Detection count

2. **Webcam Display** showing your face

3. **Recent Events Panel** with:
   - Event log
   - Event timestamps
   - Event severity (color-coded)

4. **System Information**
   - Queue status
   - Model status

---

## Production Deployment

### Build Frontend
```bash
# Create optimized production build
npm run build:frontend

# Output:
# dist/
#   ├── index.html (3.2 kB)
#   ├── assets/
#   │   ├── index.xxxxx.js (156.2 kB)
#   │   └── vendor.xxxxx.js (89.4 kB)
```

### Deploy Backend
```bash
# Option 1: Node.js Server
NODE_ENV=production npm start

# Option 2: Docker
docker build -t proctoring-system:v1.0 .
docker run -p 3000:3000 -p 5000:5000 \
  -e NODE_ENV=production \
  -e API_SECRET=your_secret_key \
  proctoring-system:v1.0

# Option 3: Docker Compose
docker-compose -f docker-compose.yml up -d
```

### Environment for Production
```env
NODE_ENV=production
PORT=5000
VITE_API_URL=https://your-domain.com/api
API_SECRET=your_super_secret_key_here
LOG_LEVEL=error
```

---

## Troubleshooting

### Issue 1: "npm: command not found"
**Solution**: Install Node.js from https://nodejs.org/

```bash
# Verify installation
node --version
npm --version
```

### Issue 2: "Module not found" errors
**Solution**: Reinstall dependencies

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue 3: Port Already in Use
**Solution**: Change port or kill process

```bash
# Change in .env
PORT=5001

# Or kill process on port 5000:
# Windows:
lsof -ti:5000 | xargs kill -9
# Mac/Linux:
kill -9 $(lsof -t -i:5000)
```

### Issue 4: "Cannot find module '@tensorflow/tfjs'"
**Solution**: Install missing dependencies

```bash
npm install @tensorflow/tfjs @tensorflow-models/face-landmarks-detection
```

### Issue 5: Webcam Not Working
**Solution**: Check permissions and browser

```console
1. Allow browser camera permissions
2. Refresh the page
3. Try different browser
4. Check if webcam is connected (ls /dev/video* on Linux)
```

### Issue 6: API Connection Error
**Solution**: Check backend is running

```bash
# Terminal 1: Start backend
npm run dev:backend

# Terminal 2: Check if running
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok","uptime":123,"timestamp":"2026-04-11T10:30:00Z"}
```

### Issue 7: CORS Errors in Console
**Solution**: Check CORS configuration

In `server.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## Verification Commands

### Check Everything Works
```bash
# 1. Verify files are in correct location
ls -la src/components/Proctoring.jsx
ls -la src/utils/faceAnalysis.js
ls -la src/utils/eventReporter.js
ls -la server/server.js

# 2. Run tests
npm test

# 3. Check API
curl http://localhost:5000/api/health

# 4. Check frontend build
npm run build:frontend

# 5. Visit http://localhost:3000
```

### Common Good Signs
✅ All dependencies installed
✅ Backend starts without errors  
✅ Frontend loads in browser
✅ Face detection model loads (watch console)
✅ Webcam streams video
✅ Events appear in log when face detected
✅ Browser shows no CORS errors
✅ API responses successful (200 status)

---

## Next Steps

1. **Complete**: Run the application with `npm run dev`
2. **Explore**: Test all features (tab switch, multiple faces, etc.)
3. **Customize**: Modify thresholds in `faceAnalysis.js`
4. **Deploy**: Follow production deployment steps
5. **Integrate**: Add to your main system

---

## Help & Support

If you encounter issues:

1. **Check Console**: Open DevTools (F12) for error messages
2. **Check Terminal**: Look for backend error messages
3. **Check Configuration**: Verify `.env` file settings
4. **Clear Cache**: `npm cache clean --force`
5. **Reinstall**: Follow Installation Steps again

For more details, see:
- [INTEGRATION.md](INTEGRATION.md) - Integration details
- [README.md](README.md) - Project overview
- [TESTS.md](TESTS.md) - Testing guide

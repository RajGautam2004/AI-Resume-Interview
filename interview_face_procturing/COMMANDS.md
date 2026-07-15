# 🚀 QUICK START - Complete Commands List

## 📋 Overview

This guide contains **all the exact commands** you need to get the AI Proctoring System working with your main project.

---

## ✅ Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js** installed (v14 or higher)
  - Download: https://nodejs.org/
  - Verify: `node --version` (should show v14+)
  - Verify: `npm --version` (should show v6+)

- [ ] **Webcam** connected to your computer

- [ ] **Modern Browser** (Chrome, Firefox, Edge, Safari)

- [ ] **Project folder** extracted: `interview_face_procturing/`

---

## 🎯 STEP 1: Verify Node.js Installation

Open PowerShell or Command Prompt and run:

```powershell
node --version
npm --version
```

**Expected output:**
```
v18.0.0  (or similar v14+)
9.0.0    (or similar v6+)
```

❌ **If you see "command not found"**: 
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation
- Try again

---

## 🎯 STEP 2: Navigate to Project Folder

```powershell
# Navigate to the project
cd "C:\Users\CSE_SDPL\Desktop\interview_face_procturing"

# Verify you're in the right place
dir

# You should see: SETUP.md, INTEGRATION.md, README.md, package.json, etc.
```

---

## 🎯 STEP 3: Install All Dependencies

```powershell
# Install all npm packages (takes 2-5 minutes)
npm install

# Wait for it to complete - you should see:
# added XXX packages, audited XXX packages in Xs
```

**What gets installed:**
- ✅ React & React-DOM (frontend framework)
- ✅ Vite (fast build tool)
- ✅ TensorFlow.js (AI framework)
- ✅ MediaPipe Face Detection (face recognition model)
- ✅ Express.js (backend framework)
- ✅ And many other dependencies

---

## 🎯 STEP 4: Create Environment Configuration

```powershell
# Copy the example environment file
copy .env.example .env

# Edit the .env file (use Notepad or your editor)
notepad .env

# The file should have:
VITE_API_URL=http://localhost:5000
NODE_ENV=development
PORT=5000
```

---

## 🎯 STEP 5: Run Integration Tests

```powershell
# Run comprehensive tests
npm test

# Expected output shows:
# ✅ Test 1: File Existence
# ✅ Test 2: Syntax Validation
# ✅ Test 3: Dependency Validation
# ✅ Test 4: Import/Export Validation
# ✅ Test 5: Optimization Features
# ✅ Test 6: Environment Configuration
# ✅ Test 7: Build Configuration
# ✅ Test 8: Integration Readiness
# 
# 📊 ALL TESTS PASSED!
```

---

## 🎯 STEP 6-A: Start Everything (Recommended)

Run both frontend and backend together:

```powershell
npm run dev

# You should see:
# ✨ vite v5.0.8 dev server running at:
# > Local:   http://localhost:3000/
# ✅ Express server running on port 5000
```

**Now open your browser:**
```
http://localhost:3000
```

You should see:
- Webcam displaying your face
- Status: "🟢 Active"
- FPS counter
- Recent Events panel

---

## 🎯 STEP 6-B: Start Separately (If Needed)

If the combined start doesn't work, try separately:

**Terminal 1 - Frontend:**
```powershell
npm run dev:frontend

# Opens on http://localhost:3000
```

**Terminal 2 - Backend (new terminal):**
```powershell
npm run dev:backend

# Runs on http://localhost:5000
```

---

## 📡 STEP 7: Test Everything Works

### Check Backend is Running
```powershell
# In a new terminal or PowerShell window:
curl http://localhost:5000/api/health

# Should return:
# {"status":"ok","uptime":...}
```

### Check Frontend is Running
```
Open http://localhost:3000 in browser
- You should see the proctoring UI
- Webcam should be streaming
- Status should show "🟢 Active"
```

### Test Face Detection
```
1. Allow camera access (browser will ask)
2. Face detection starts automatically
3. Look away from camera
4. You should see "LOOKING_AWAY" event logged
5. Alt-Tab to another window
6. You should see "TAB_SWITCH" event logged
7. Put multiple faces in view
8. You should see "MULTIPLE_FACES" event logged
```

---

## 🔨 ADDITIONAL USEFUL COMMANDS

### Build for Production
```powershell
# Create optimized production build
npm run build:frontend

# Creates dist/ folder with optimized files
# dist/ size should be ~280KB
```

### Start Production Backend Only
```powershell
$env:NODE_ENV = "production"
npm start
```

### Run Tests Again
```powershell
npm test
```

### Run Advanced Tests
```powershell
npm run test:advanced
```

### Docker Commands (if Docker installed)
```powershell
# Build Docker image
npm run docker:build

# Run with Docker Compose
npm run docker:compose

# Access at http://localhost:3000
```

### Check All Installed Packages
```powershell
npm list --depth=0
```

### Update All Packages
```powershell
npm update
```

### Clear Cache and Reinstall
```powershell
npm cache clean --force
Remove-Item -Recurse node_modules
Remove-Item package-lock.json
npm install
```

---

## 🧪 Integration Verification Commands

### Verify File Structure
```powershell
# Check all core files exist
Test-Path "src\App.jsx"
Test-Path "src\components\Proctoring.jsx"
Test-Path "src\utils\faceAnalysis.js"
Test-Path "src\utils\eventReporter.js"
Test-Path "server\server.js"

# All should return: True
```

### Verify Dependencies
```powershell
npm list react
npm list express
npm list @tensorflow/tfjs

# Should show versions installed
```

### Check Build Output
```powershell
npm run build:frontend

# Check if dist folder created
dir dist/

# You should see:
# - index.html
# - assets/ (folder with .js and .css files)
```

---

## 🆘 Troubleshooting Commands

### If npm install fails:
```powershell
# Try this sequence:
npm cache clean --force
Remove-Item -Recurse node_modules -Force
Remove-Item package-lock.json -Force
npm install
```

### If port 5000 is already in use:
```powershell
# Find and kill process on port 5000:
Get-NetTCPConnection -LocalPort 5000 | Select-Object -First 1 | Stop-Process -Force

# Or change port in .env:
# PORT=5001
```

### If frontend won't load:
```powershell
# Clear browser cache:
Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)

# Or try different port:
# Edit .env and change FRONTEND_PORT
```

### If face detection doesn't work:
```
1. Check browser console: F12 → Console
2. Look for error messages about TensorFlow
3. Check if camera was allowed (browser usually asks)
4. Refresh page: F5
5. Try different browser
6. Check camera is connected: Settings → Privacy & Security → Camera
```

### If you get CORS errors:
```
CORS error means backend and frontend can't communicate
Solution:
1. Verify backend is running: npm run dev:backend
2. Verify VITE_API_URL in .env is correct
3. Verify both are on localhost
4. Restart both frontend and backend
```

---

## 📊 Command Quick Reference

| What You Want | Command |
|---------------|---------|
| **Install everything** | `npm install` |
| **Start everything** | `npm run dev` |
| **Start frontend only** | `npm run dev:frontend` |
| **Start backend only** | `npm run dev:backend` |
| **Run tests** | `npm test` |
| **Build for production** | `npm run build:frontend` |
| **Start production** | `npm start` |
| **Check health** | `curl http://localhost:5000/api/health` |
| **View recent events** | `curl http://localhost:5000/api/proctoring-events` |
| **Get statistics** | `curl http://localhost:5000/api/statistics` |
| **Docker build** | `npm run docker:build` |
| **Docker run** | `npm run docker:compose` |

---

## 📝 Integration Steps Summary

### Option A: Fresh Installation
```powershell
# 1. Navigate to folder
cd "C:\Users\CSE_SDPL\Desktop\interview_face_procturing"

# 2. Install
npm install

# 3. Configure
copy .env.example .env

# 4. Test
npm test

# 5. Run
npm run dev

# 6. Open browser
Start-Process "http://localhost:3000"
```

### Option B: Add to Existing Project
```powershell
# 1. Copy 5 core files to your project:
#    - src/utils/faceAnalysis.js
#    - src/utils/eventReporter.js
#    - src/App.jsx
#    - src/components/Proctoring.jsx
#    - server/server.js

# 2. Update your package.json with dependencies

# 3. Run:
npm install
npm run dev

# 4. Update your imports to use new files
```

---

## 🎯 Expected Success Indicators

### ✅ If Everything Works:
- [ ] `npm run dev` starts without errors
- [ ] Terminal shows: "vite v5.0.8 dev server running at http://localhost:3000"
- [ ] Terminal shows: "Express server running on port 5000"
- [ ] Browser shows AI Proctoring System UI
- [ ] Webcam displays video
- [ ] Status shows "🟢 Active" 
- [ ] When you look away, "LOOKING_AWAY" appears in event log
- [ ] When you Alt-Tab, "TAB_SWITCH" appears in event log
- [ ] Console shows no errors (F12)
- [ ] `curl http://localhost:5000/api/health` returns JSON

### ❌ If Something Fails:
1. **Check console** for error messages (F12 in browser, or terminal output)
2. **Check port conflicts** (is 3000 or 5000 already in use?)
3. **Verify Node.js** is installed (`node --version`)
4. **Check file structure** (all 5 core files in place?)
5. **Read logs** in terminal and browser console
6. **Try restarting** terminal and browser
7. **Check SETUP.md and INTEGRATION.md** for more details

---

## 📚 Documentation

For more detailed information:
- **[SETUP.md](SETUP.md)** - Complete setup guide with prerequisites
- **[INTEGRATION.md](INTEGRATION.md)** - Detailed integration instructions
- **[README.md](README-OPTIMIZED.md)** - Project overview and features
- **[TESTS.md](TESTS.md)** - Comprehensive testing guide

---

## 📞 Getting Help

### Step-by-step debugging:

1. **Check Node.js installed:**
   ```powershell
   node --version
   npm --version
   ```

2. **Check files in place:**
   ```powershell
   ls src/utils/
   ls src/components/
   ls server/
   ```

3. **Verify dependencies:**
   ```powershell
   npm list --depth=0
   ```

4. **Run tests:**
   ```powershell
   npm test
   ```

5. **Check backend:**
   ```powershell
   curl http://localhost:5000/api/health
   ```

6. **Check browser console:**
   - Press F12
   - Go to Console tab
   - Look for red error messages

7. **Check if ports are free:**
   ```powershell
   netstat -ano | findstr :3000
   netstat -ano | findstr :5000
   ```

---

## ⚡ Quick Tips

- 💡 **First time?** Start with `npm run dev` - it runs everything
- 💡 **Port in use?** Change PORT in .env file
- 💡 **Tests failing?** Run `npm cache clean --force` then `npm install`
- 💡 **Face detection slow?** Check GPU is available (check F12 console)
- 💡 **Want production?** Run `npm run build:frontend` then `NODE_ENV=production npm start`
- 💡 **Docker?** Easiest: `npm run docker:compose`
- 💡 **Stuck?** Check browser console (F12) and terminal output
- 💡 **Need help?** Read SETUP.md, INTEGRATION.md, and TESTS.md

---

## ✨ You're Ready!

```powershell
# Copy and paste this to get started:
cd "C:\Users\CSE_SDPL\Desktop\interview_face_procturing"
npm install
copy .env.example .env
npm test
npm run dev
```

Then open: **http://localhost:3000**

---

**Questions?** Check SETUP.md, INTEGRATION.md, or README-OPTIMIZED.md

**Ready?** Let's go! 🚀

# Interview Face Proctoring System

An AI-powered proctoring system that monitors student behavior during interviews using face detection. Real-time face analysis with event logging.

## ✨ Features

- **Real-time Face Detection** - Tracks student position and engagement
- **Smart Proctoring Events**:
  - 🔄 Tab switching detection
  - 👥 Multiple faces detected
  - 👀 Looking away from camera
  - 📏 Too far from camera
  - ✋ No face detected
- **Live Event Dashboard** - Real-time event logging UI
- **REST API** - Record and retrieve events
- **Responsive Design** - Works on desktop & tablets

## 🎯 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| State | React Hooks |
| ML | TensorFlow.js + Face Landmarks |
| Backend | Express.js |
| Communication | REST API + Fetch |

## 📋 Prerequisites

- Node.js 14+ 
- npm or yarn
- Modern web browser with webcam
- Good internet (for model downloads)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development
```bash
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api/proctoring-events

### 3. Test the System
```bash
node test-api.js
```

For detailed setup guide, see [QUICK_START.md](QUICK_START.md).

## 📁 Project Structure

```
interview_face_procturing/
├── src/
│   ├── components/
│   │   └── Proctoring.jsx       # Main component with UI & detection
│   ├── utils/
│   │   ├── faceAnalysis.js      # Face detection logic
│   │   └── eventReporter.js     # Event API communication
│   ├── App.jsx                  # App wrapper
│   └── index.jsx                # React entry point
├── server/
│   └── server.js                # Express backend server
├── index.html                   # HTML template
├── vite.config.js               # Frontend config
├── package.json                 # Dependencies
├── test-api.js                  # API test suite
├── TESTS.md                     # Test documentation
└── QUICK_START.md               # Setup guide
```

## 🔧 Available Scripts

```bash
# Development
npm run dev                   # Start both frontend & backend
npm run dev:frontend         # Frontend only (port 3000)
npm run dev:backend          # Backend only (port 5000)

# Production
npm run build:frontend       # Optimize for production
npm run preview             # Preview production build
npm start                   # Start backend only

# Testing
node test-api.js            # Test API endpoints
```

## 📡 API Reference

### POST /api/proctoring-event
Report a proctoring event.

```json
{
  "event": "TAB_SWITCH",
  "timestamp": 1712876543921
}
```

### GET /api/proctoring-events
Get all recorded events.

```json
{
  "total": 5,
  "events": [
    {
      "event": "TAB_SWITCH",
      "timestamp": 1712876543921,
      "receivedAt": "2024-04-11T14:35:43.921Z"
    }
  ]
}
```

### GET /api/health
Health check endpoint.

```json
{
  "status": "ok"
}
```

## 🎨 Event Types

| Event | When Triggered |
|-------|----------------|
| `TAB_SWITCH` | Browser tab changed |
| `NO_FACE` | No face in frame |
| `MULTIPLE_FACES` | More than 1 face |
| `LOOKING_AWAY` | Head turned >20px from center |
| `TOO_FAR` | Face width < 50px |

## 🧪 Testing Guide

For comprehensive testing documentation, see [TESTS.md](TESTS.md).

### Quick Test
```bash
# Terminal 1
npm run dev

# Terminal 2 (after 10 seconds)
node test-api.js
```

**Manual Testing:**
1. Open http://localhost:3000
2. Allow camera access
3. Switch browser tabs → See TAB_SWITCH event
4. Look away → See LOOKING_AWAY event
5. Move back → Events stop

## 🚢 Deployment

### Frontend Deployment
```bash
npm run build:frontend
```
Deploy `dist/` folder to:
- [Netlify](https://netlify.com) (easiest)
- [Vercel](https://vercel.com)
- AWS S3 + CloudFront
- GitHub Pages

### Backend Deployment
Deploy `server/server.js` to:
- [Heroku](https://www.heroku.com)
- [Railway](https://railway.app)
- AWS EC2/Lambda
- DigitalOcean

**Example Heroku Deployment:**
```bash
heroku create your-proctoring-app
git push heroku main
```

## 🔒 Security Considerations

⚠️ **This is a basic demonstration system. For production use:**

- ✅ Implement authentication (JWT/OAuth)
- ✅ Add database storage (PostgreSQL/MongoDB)
- ✅ Use HTTPS for all connections
- ✅ Validate events server-side
- ✅ Implement rate limiting
- ✅ Add encryption for event data
- ✅ Audit logging for compliance
- ✅ GDPR compliance for camera data

## 🐛 Troubleshooting

**Webcam not showing?**
- Allow camera permissions in browser
- Check if another app is using camera
- Try a different browser

**Backend not responding?**
- Ensure backend is running on port 5000
- Check firewall settings
- Verify CORS is enabled

**Events not reporting?**
- Check browser console for errors
- Verify backend is accessible
- Check network tab in DevTools

## 📦 Dependencies

- `react:` UI framework
- `react-webcam:` Webcam streaming
- `@tensorflow/tfjs:` ML runtime
- `@tensorflow-models/face-landmarks-detection:` Face detection
- `express:` Backend server
- `cors:` Cross-origin requests
- `vite:` Frontend build tool

## 📝 License

MIT License - Feel free to use for educational purposes

## 🤝 Contributing

Contributions welcome! Please read our guidelines first.

## 💬 Support

- Check [QUICK_START.md](QUICK_START.md) for setup help
- Review [TESTS.md](TESTS.md) for testing guidance
- See [API Reference](#-api-reference) for endpoint docs

---

**Last Updated:** April 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

# 🤖 AI Screener Platform

> A complete AI-powered HR recruitment platform with intelligent resume screening, dynamic Gemini interviews, and advanced anti-cheat proctoring.

![Platform](https://img.shields.io/badge/Platform-Web-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-AI-orange)

## ✨ Features

### 🏢 HR Admin Console
- **Analytics Dashboard** - Real-time metrics on jobs, applicants, and AI match scores
- **Job Management** - Full CRUD operations for job postings
- **AI Leaderboard** - Candidates ranked by AI scoring (SBERT simulation)
- **Interview Tracking** - Monitor candidate progress and scores
- **Malpractice Detection** - Flag candidates who violated interview policies

### 👔 Student Application Portal
- **Public Job Board** - Browse open positions without login
- **One-Click Apply** - Simple application with resume upload
- **AI Resume Analysis** - Automatic scoring (60% threshold)
- **Magic Link System** - Email-based interview access
- **Smart Rejection** - Candidates below threshold receive polite emails

### 🎯 AI Interview Room
- **Dynamic Gemini Questions** - AI-generated questions based on resume
- **Live Chat Interface** - Natural conversation flow
- **Real-time Scoring** - Technical assessment with feedback
- **60-Second Timer** - Per-question countdown
- **Anti-Cheat Features**:
  - 👁️ Face detection (MediaPipe + TensorFlow.js)
  - 🚫 Tab switch monitoring
  - ⌨️ Paste blocking
  - ⚠️ Three-strikes termination system

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:5173
```

### Demo Credentials
- **HR Login**: Any email + any password
- **No registration required**

## 📋 User Journeys

### As a Job Seeker

1. **Browse Jobs** → Visit `/jobs`
2. **Apply** → Click any job → Fill form → Upload PDF resume
3. **Get Scored** → AI analyzes resume (simulated SBERT)
4. **Interview** → If score ≥60%, click demo interview link
5. **Complete Interview** → Answer 5-6 AI questions with proctoring
6. **View Results** → See technical score, strengths, weaknesses

### As HR Admin

1. **Login** → `/hr/login` with any credentials
2. **View Dashboard** → See analytics and recent applications
3. **Manage Jobs** → Create, edit, delete job postings
4. **Review Candidates** → View ranked leaderboards by AI score
5. **Track Interviews** → Monitor completion and malpractice flags

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                   React Frontend                      │
│  • React Router (Data mode)                          │
│  • Tailwind CSS + Shadcn UI                          │
│  • TensorFlow.js Face Detection                      │
│  • Mock API (simulates backend)                      │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│                  LocalStorage                         │
│  • Jobs, Candidates, Interviews                      │
│  • Auth Tokens, Session Data                         │
└──────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18 (JavaScript) |
| **Routing** | React Router 7 |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | Shadcn UI + Radix UI |
| **Icons** | Lucide React |
| **Face Detection** | TensorFlow.js + MediaPipe |
| **Webcam** | React Webcam |
| **Forms** | React Hook Form |
| **State** | React Hooks (no Redux) |
| **Storage** | LocalStorage (mock backend) |
| **Notifications** | Sonner |

## 📁 Project Structure

```
/src/app/
├── App.tsx                      # Main app entry
├── routes.js                    # Route configuration
│
├── services/
│   └── mockApi.js              # Simulated backend API
│
├── components/
│   ├── ProtectedRoute.jsx      # Auth wrapper
│   ├── LoadingSpinner.jsx      # Reusable loader
│   └── ui/                     # Shadcn UI components
│
└── pages/
    ├── hr/
    │   ├── HrLogin.jsx         # Admin login
    │   ├── HrDashboard.jsx     # Analytics dashboard
    │   ├── HrJobs.jsx          # Job CRUD
    │   └── HrCandidates.jsx    # Ranked leaderboard
    │
    ├── public/
    │   ├── JobBoard.jsx        # Public job listings
    │   └── JobApplication.jsx  # Application form
    │
    └── interview/
        └── InterviewRoom.jsx   # AI interview + proctoring
```

## 🎮 Testing the Platform

### Scenario 1: Successful Hire
1. Go to `/jobs`
2. Apply to "Senior React Developer"
3. Upload any PDF
4. Get score ≥60% (random)
5. Start demo interview
6. Enable webcam
7. Answer all questions
8. View final results

### Scenario 2: Interview Termination
1. Start an interview
2. Enable webcam
3. Trigger 3 violations:
   - Leave camera view
   - Switch tabs
   - Or mix of both
4. Watch interview terminate with malpractice flag

### Scenario 3: HR Workflow
1. Login as HR
2. Create new job posting
3. View job on public board
4. Apply as candidate
5. Return to HR panel
6. See your application in leaderboard

## 🔐 Anti-Cheat Features

### Browser Security
- **Visibility API**: Detects tab switching
- **Paste Prevention**: Input fields block paste events
- **Timer Enforcement**: 60-second limit per question

### Visual Proctoring
- **Face Count**: Detects 0 (absent) or >1 (cheating)
- **Real-time Analysis**: Checks every 1 second
- **Violation Logging**: Timestamps all infractions
- **Progressive Warnings**: Visual overlays on webcam

### Penalty System
| Strike | Action |
|--------|--------|
| 1 | Warning overlay + audio alert |
| 2 | Second warning logged |
| 3 | Interview terminated, score = 0, malpractice flag |

## 📊 Mock Data

Pre-loaded with:
- **3 job postings** (React, Full Stack, Frontend roles)
- **7 sample candidates** with varying scores
- **Realistic interview transcripts**
- **Analytics data**

## 🔄 Data Flow

### Application Submission
```
User Upload PDF 
  → Mock AI scores (50-95%)
  → Threshold check (60%)
  → If pass: Generate magic token
  → If fail: Show rejection
  → Save to localStorage
```

### Interview Process
```
Verify token
  → Load candidate + job data
  → Start Gemini conversation (mocked)
  → User answers with proctoring
  → After 5-6 questions: Calculate score
  → Save results to candidate record
```

## 🚧 Limitations (Demo Mode)

⚠️ **This is a frontend-only demo**:
- No real backend server
- No actual AI (responses are scripted)
- PDFs aren't processed (file upload is simulated)
- No emails sent (magic links shown on screen)
- Data only persists in browser localStorage
- Face detection may not work on all devices

## 🌐 Production Deployment

To make this production-ready:

### Backend Requirements
1. **Node.js + Express** API server
2. **Python microservice** for SBERT resume analysis
3. **Gemini API** integration for real interviews
4. **PostgreSQL/MongoDB** for persistence
5. **AWS S3/Supabase** for resume storage
6. **Brevo SMTP** for email magic links

### Security Enhancements
- JWT authentication with HttpOnly cookies
- CORS configuration
- Rate limiting
- Input sanitization
- CSRF protection
- SSL/TLS encryption
- Video recording for audit trails

### Scalability
- Redis for session management
- CDN for static assets
- Load balancing for API
- WebSocket for real-time updates
- Microservices architecture

## 📖 Documentation

- **[Getting Started Guide](GETTING_STARTED.md)** - Walkthrough for users
- **[Feature Documentation](APP_FEATURES.md)** - Technical deep dive
- **[Debug Guide](DEBUG_INFO.md)** - Troubleshooting help

## 🎨 UI/UX Features

- **Responsive Design** - Mobile, tablet, desktop optimized
- **Gradient Backgrounds** - Modern, professional aesthetics
- **Smooth Animations** - Hover effects, transitions
- **Toast Notifications** - Real-time feedback
- **Loading States** - Skeleton screens, spinners
- **Error Handling** - Graceful failure messages
- **Accessibility** - ARIA labels, keyboard navigation

## 🧪 Browser Support

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Face detection works best on Chrome/Edge

## 📝 License

This is a demo project for educational purposes.

## 🤝 Contributing

This is a demonstration project. For production use, significant backend development is required.

## 📧 Contact

For questions about implementation or deployment, refer to the documentation files.

---

**Built with ❤️ using React, TensorFlow.js, and AI-powered technology**

🚀 **Ready to revolutionize hiring with AI!**

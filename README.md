# AI Recruitment, ATS, Interview, and Proctoring Platform

## 1. Project Overview

This project is an end-to-end AI-assisted recruitment platform that helps an HR team manage the complete hiring pipeline from job creation to candidate evaluation. The system combines:

- a public job board for applicants
- an HR admin portal for recruiters
- automated resume parsing and ATS-style matching
- AI-generated technical interviews
- browser-based interview proctoring
- detailed post-interview review for HR

The platform is designed to reduce manual screening effort, shorten the time between application and interview, and give recruiters richer decision-making data. Instead of evaluating candidates only through resumes, the system combines:

- resume relevance
- interview performance
- transcript-level feedback
- proctoring signals
- interview snapshot evidence

As it currently stands, the project follows a three-service architecture:

1. A React frontend for the HR and candidate experience
2. A Node.js and Express backend for business logic, database access, authentication, and AI orchestration
3. A Python FastAPI microservice for semantic resume-to-job matching

In addition, Google Gemini is used to generate and evaluate interview questions, MongoDB stores persistent hiring data, and SMTP email is used to send secure interview links.

---

## 2. Problem Statement

Traditional recruitment workflows are slow, repetitive, and difficult to scale. HR teams typically spend significant time on:

- posting jobs across portals
- manually screening resumes
- deciding which candidates should be interviewed
- conducting initial technical screening
- documenting interview outcomes
- comparing candidates consistently

This project addresses those pain points by building a structured AI-based hiring pipeline. The system automatically:

- accepts job applications
- parses PDF resumes
- computes a semantic ATS-style match score
- shortlists candidates above a threshold
- sends secure interview links by email
- conducts a technical interview through AI
- monitors basic interview integrity with proctoring
- stores structured evaluation results for HR review

The result is a more efficient, consistent, and data-rich recruitment process.

---

## 3. Project Objectives

The major objectives of the project are:

- To build a full-stack hiring workflow rather than an isolated demo
- To automate first-level resume screening using NLP
- To generate interview questions dynamically from the candidate profile
- To evaluate candidate answers with an LLM
- To introduce interview integrity monitoring through face-based proctoring
- To provide HR with a centralized dashboard for decisions
- To preserve a clean candidate experience while adding meaningful AI automation

---

## 4. High-Level Architecture

```text
                           +----------------------+
                           |   HR Admin Portal    |
                           | React + Vite         |
                           +----------+-----------+
                                      |
                                      |
Candidate Portal / Interview UI       |
React + Vite                          |
          \                           |
           \                          v
            +--------------------------------------+
            |      Node.js + Express Backend       |
            |--------------------------------------|
            | Auth, Jobs, Resume Upload, Interview |
            | Token Verification, Proctoring APIs  |
            | Gemini Integration, Email Sending    |
            +----------------+---------------------+
                             |
              +--------------+--------------+
              |                             |
              v                             v
   +------------------------+     +------------------------+
   |    MongoDB Database    |     |  Python ATS Service    |
   | HR, Jobs, Candidates   |     | FastAPI + SBERT Model  |
   +------------------------+     +------------------------+
                             \
                              \
                               v
                    +------------------------+
                    | Google Gemini Models   |
                    | Question Gen + Eval    |
                    +------------------------+
```

### Architecture Summary

- The frontend handles UI, navigation, webcam access, speech recognition, and live proctoring display.
- The backend controls application submission, PDF parsing, database persistence, secure interview token flow, Gemini integration, and result aggregation.
- The Python service computes semantic similarity between the resume and the job description.
- MongoDB persists all major entities and interview artifacts.
- SMTP sends secure interview links and password reset emails.

---

## 5. Core Modules

### 5.1 Public Candidate Module

This module is used by candidates who are not logged in.

Main functions:

- View all open jobs
- Read a single job description
- Submit an application
- Upload a PDF resume
- Receive secure interview access if shortlisted
- Attend the AI interview
- Complete the interview with webcam-enabled proctoring

Main frontend files:

- `Frontend/src/app/pages/public/JobBoard.jsx`
- `Frontend/src/app/pages/public/JobDescription.jsx`
- `Frontend/src/app/pages/public/JobApplication.jsx`
- `Frontend/src/app/pages/public/InterviewRoom.jsx`

### 5.2 HR Admin Module

This module is used by recruiters after authentication.

Main functions:

- Register and log in as HR admin
- Manage jobs
- View dashboard analytics
- Track applicants by job
- Review ATS scores
- Review interview scores and question-level breakdown
- Review transcript and proctoring events
- View the captured interview snapshot
- Delete job or candidate records

Main frontend files:

- `Frontend/src/app/pages/hr/HrLogin.jsx`
- `Frontend/src/app/pages/hr/HrRegister.jsx`
- `Frontend/src/app/pages/hr/HrDashboard.jsx`
- `Frontend/src/app/pages/hr/HrJobs.jsx`
- `Frontend/src/app/pages/hr/HrCandidates.jsx`

### 5.3 Backend Orchestration Module

This is the main business logic layer.

Main functions:

- HR authentication with JWT cookie
- Job CRUD operations
- Resume upload and PDF extraction
- ATS microservice integration
- Secure interview token generation
- Email sending
- Interview verification
- Gemini question generation
- Transcript storage
- Final Gemini evaluation
- Proctoring event ingestion
- Proctoring summary storage
- Interview snapshot storage

Main backend files:

- `Backend/Backend/PDP_Backend/server.js`
- `Backend/Backend/PDP_Backend/routes/auth.js`
- `Backend/Backend/PDP_Backend/routes/jobs.js`
- `Backend/Backend/PDP_Backend/middleware/verifyToken.js`

### 5.4 ATS AI Service Module

This service is currently separate from the main project folder and is invoked by the backend.

Main functions:

- Receive resume text and job description
- Compute semantic embeddings with `SentenceTransformer`
- Use cosine similarity to compute raw matching score
- Apply score normalization
- Return final ATS-style match percentage

Observed service file:

- `../Python_AI_Server/main.py`

### 5.5 Proctoring Module

This module was integrated from the `interview_face_procturing` folder into the main application.

Main functions:

- Detect no face in frame
- Detect multiple faces
- Detect looking away from camera
- Detect candidate being too far from camera
- Detect candidate switching tabs or losing window focus
- Save proctoring events to the backend
- Save summary counts for HR review
- Capture one candidate snapshot from the interview

Main integrated files:

- `Frontend/src/app/hooks/useInterviewProctoring.js`
- `Frontend/src/app/utils/proctoring/faceAnalysis.js`
- `Frontend/src/app/utils/proctoring/eventReporter.js`
- `Frontend/src/app/components/interview/ProctoringPanel.jsx`

---

## 6. Complete Workflow of the Project

This section explains the actual operational flow of the platform from start to finish.

### 6.1 HR Registration and Login Workflow

1. HR opens the HR portal.
2. HR registers with name, email, password, and company name.
3. Password is hashed using `bcryptjs`.
4. HR logs in with email and password.
5. Backend creates a JWT containing the admin ID.
6. JWT is stored in an `HttpOnly` cookie.
7. Protected HR routes use middleware to validate the cookie.

Outcome:

- Only authenticated HR admins can create jobs, view analytics, or review candidates.

### 6.2 Job Creation Workflow

1. HR opens the Jobs page.
2. HR creates a job with:
   - title
   - description
   - required skills
   - interview topics
3. Backend stores the job in MongoDB and links it with the HR admin ID.
4. Job becomes visible on the public job board.

Outcome:

- Public applicants can see all active jobs without authentication.

### 6.3 Candidate Application Workflow

1. Candidate browses the public job board.
2. Candidate opens a job detail page.
3. Candidate clicks Apply.
4. Candidate fills in name and email and uploads a PDF resume.
5. Frontend sends a multipart request to `/api/upload-resume`.
6. Backend validates the job ID and uploaded file.
7. `multer` stores the PDF in memory.
8. `pdf-extraction` extracts raw text from the PDF.
9. Backend sends extracted text and job description to the Python AI service.

Outcome:

- The resume is transformed from a document into structured text for AI screening.

### 6.4 ATS Scoring Workflow

1. Python FastAPI service receives:
   - `resume_text`
   - `job_description`
2. The service splits the resume into chunks.
3. It generates embeddings for:
   - the job description
   - each resume chunk
4. It averages the resume chunk embeddings.
5. It computes cosine similarity between the job vector and the averaged resume vector.
6. It normalizes the raw similarity into a percentage score.
7. It returns `match_score` to the backend.

Current behavior:

- The backend uses the ATS score to decide shortlisting.
- Candidates with score `>= 50` receive an interview token.

Outcome:

- The system performs semantic resume screening before interview scheduling.

### 6.5 Candidate Shortlisting and Magic Link Workflow

1. Backend stores a new `Candidate` record.
2. If ATS score is high enough, backend generates a secure interview token with `crypto.randomBytes`.
3. Backend creates a magic-link URL in the form:

```text
http://localhost:3000/interview/<token>
```

4. Backend sends the interview link by email using Nodemailer and SMTP.
5. Candidate receives the secure link in the inbox.

Outcome:

- Only shortlisted candidates are invited to the interview stage.

### 6.6 Interview Session Initialization Workflow

1. Candidate opens the interview link.
2. Frontend calls `/api/interview/verify/:token`.
3. Backend verifies the token by searching the candidate record.
4. If valid, backend resets the interview session state:
   - pre-generated questions
   - current question index
   - transcript
   - interview score
   - evaluation status
   - strengths and weaknesses
   - proctoring events
   - proctoring summary
   - interview snapshot
5. Frontend loads:
   - webcam
   - speech recognition
   - live transcript area
   - proctoring panel
6. Interview starts with an introduction question.

Outcome:

- Each interview opens with a clean session state and does not mix with old interview data.

### 6.7 AI Interview Question Flow

The current interview asks **3 total questions**:

- 1 fixed introductory question
- 2 Gemini-generated technical questions

Detailed flow:

1. Candidate answers the introduction question.
2. Backend stores the answer in `interviewTranscript`.
3. If technical questions have not yet been generated, backend sends a prompt to Gemini.
4. Gemini generates exactly 2 personalized technical questions from the resume.
5. Questions are stored in MongoDB.
6. Backend serves one question at a time.
7. Candidate answers each question through voice input.
8. Each answer is saved to the transcript.
9. After the last question, interview completion response is returned.

Outcome:

- The system creates a structured but still personalized interview experience.

### 6.8 Interview Evaluation Workflow

After the final question:

1. Backend marks `evaluationStatus` as `pending`.
2. A background evaluation job starts.
3. Backend re-fetches the final transcript from MongoDB.
4. It sends the transcript plus resume summary to Gemini.
5. Gemini is instructed to return structured JSON containing:
   - score
   - question-level feedback
   - overall summary
   - strengths
   - weaknesses
   - final recommendation
6. Backend parses the JSON.
7. Backend stores the evaluation into the candidate record.
8. Status changes from `pending` to `complete`.
9. Frontend polls `/api/interview/score/:token` until evaluation is ready.

Outcome:

- HR receives structured candidate evaluation instead of only a raw transcript.

### 6.9 Live Proctoring Workflow

During the interview:

1. The webcam feed is already active.
2. TensorFlow.js face detection runs at intervals on the video stream.
3. The system analyzes the face geometry and screen behavior.
4. Alerts are generated for:
   - `NO_FACE`
   - `MULTIPLE_FACES`
   - `LOOKING_AWAY`
   - `TOO_FAR`
   - `TOO_CLOSE`
   - `TAB_SWITCH`
   - `WINDOW_BLUR`
5. Events are queued and sent to the backend in batches.
6. The frontend also maintains rolling counts.
7. Summary counts are periodically synced to the backend.

Outcome:

- The interview is monitored in near real time and HR gets additional trust signals.

### 6.10 Candidate Snapshot Workflow

This feature was recently integrated into the main project.

1. During face analysis, if exactly one valid face is detected, the frontend captures one still frame from the interview video.
2. The image is compressed as JPEG and converted to a base64 data URL.
3. The image is sent to `/api/interview/snapshot/:token`.
4. Backend validates the payload and stores it inside the candidate record.
5. HR can later view the image inside the candidate review panel.

Outcome:

- HR can see the candidate face associated with the interview session.

### 6.11 HR Candidate Review Workflow

1. HR opens the Candidates page for a specific job.
2. Backend returns all candidates sorted by ATS score.
3. HR sees per-candidate summary data:
   - ATS score
   - interview score
   - faces count
   - warnings count
   - alerts count
4. When HR expands a candidate row, the system shows:
   - interview snapshot
   - overall summary
   - strengths
   - weaknesses
   - question-by-question feedback
   - full transcript
   - proctoring summary
   - recruiter review note
5. If evaluation is still pending, the page auto-refreshes in the background.

Outcome:

- HR gets a complete decision dashboard for each candidate rather than scattered information.

---

## 7. Major Functions and Responsibilities

### 7.1 Backend API Responsibilities

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/register` | `POST` | Register HR admin |
| `/api/auth/login` | `POST` | Login and set JWT cookie |
| `/api/auth/logout` | `POST` | Clear auth cookie |
| `/api/auth/forgot-password` | `POST` | Send reset password email |
| `/api/auth/reset-password/:token` | `POST` | Reset HR password |
| `/api/jobs` | `GET` | Fetch public job list |
| `/api/jobs` | `POST` | Create new job |
| `/api/jobs/:jobId` | `GET` | Fetch job details |
| `/api/jobs/:jobId` | `PUT` | Update job |
| `/api/jobs/:jobId` | `DELETE` | Delete job |
| `/api/jobs/stats/dashboard` | `GET` | HR dashboard analytics |
| `/api/jobs/:jobId/candidates` | `GET` | Fetch candidates for job |
| `/api/jobs/:jobId/candidates/:candidateId` | `DELETE` | Delete candidate |
| `/api/upload-resume` | `POST` | Parse PDF and score ATS |
| `/api/interview/verify/:token` | `GET` | Validate interview link |
| `/api/interview/chat` | `POST` | Run interview flow |
| `/api/interview/score/:token` | `GET` | Poll final interview score |
| `/api/interview/proctoring/:token` | `POST` | Save proctoring events and summary |
| `/api/interview/snapshot/:token` | `POST` | Save interview face snapshot |

### 7.2 Frontend Page Responsibilities

| Page | Responsibility |
|---|---|
| `JobBoard` | Show public open jobs |
| `JobDescription` | Show detailed role information |
| `JobApplication` | Accept candidate application and PDF upload |
| `InterviewRoom` | Run interview, transcript, webcam, voice, proctoring |
| `HrLogin` | HR authentication |
| `HrRegister` | HR registration |
| `HrDashboard` | Analytics overview |
| `HrJobs` | Job management CRUD |
| `HrCandidates` | Candidate ranking and detailed evaluation review |

### 7.3 Important Internal Logic

| Functionality | What it does |
|---|---|
| PDF parsing | Converts resume PDF to text |
| Semantic scoring | Computes ATS-style match score through SBERT |
| Secure token generation | Creates magic interview links |
| Transcript persistence | Stores question-answer pairs safely |
| Gemini fallback logic | Rotates models when rate-limited |
| Queue management | Protects against Gemini RPM issues |
| Session reset | Prevents old interview data contamination |
| Proctoring batching | Reduces network overhead during monitoring |
| Snapshot capture | Stores a face image for HR review |

---

## 8. Database Design

The project primarily uses three MongoDB collections through Mongoose models.

### 8.1 HRAdmin

Key fields:

- `name`
- `email`
- `password`
- `companyName`
- `resetPasswordToken`
- `resetPasswordExpires`
- `createdAt`

Purpose:

- Stores recruiter account information
- Supports authentication and password reset

### 8.2 Job

Key fields:

- `title`
- `description`
- `requiredSkills`
- `interviewTopics`
- `adminId`
- `createdAt`

Purpose:

- Represents a job posting published by a specific HR admin

### 8.3 Candidate

Key fields:

- `name`
- `email`
- `phone`
- `appliedJobId`
- `resumeText`
- `interviewToken`
- `atsMatchScore`
- `interviewScore`
- `evaluationStatus`
- `questionFeedback`
- `overallSummary`
- `strengths`
- `weaknesses`
- `finalRecommendation`
- `preGeneratedQuestions`
- `currentQuestionIndex`
- `interviewTranscript`
- `proctoringEvents`
- `proctoringSummary`
- `interviewSnapshot`
- `status`
- `appliedAt`

Purpose:

- Central record of the candidate journey from application to evaluation

---

## 9. Tech Stack Used

### 9.1 Frontend Stack

| Category | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite |
| Routing | React Router 7 |
| Animation | Motion |
| HTTP Client | Axios |
| Styling | Tailwind CSS v4 |
| UI Primitives | Radix UI |
| Icons | Lucide React |
| Theme Support | next-themes |
| Speech Input | Browser SpeechRecognition API |
| Face Detection | `@tensorflow-models/face-detection` + `@tensorflow/tfjs` |

### 9.2 Backend Stack

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB |
| ODM | Mongoose |
| Auth | JWT + HttpOnly cookies |
| Password Hashing | bcryptjs |
| File Upload | multer |
| PDF Parsing | pdf-extraction |
| Email | Nodemailer |
| AI Orchestration | Google Generative AI SDK |
| HTTP Client | Axios |
| Rate Limiting | express-rate-limit |
| Queue Control | p-queue |

### 9.3 Python AI Service Stack

| Category | Technology |
|---|---|
| Framework | FastAPI |
| Validation | Pydantic |
| NLP Model | SentenceTransformers |
| Similarity | scikit-learn cosine similarity |
| Math | NumPy |
| Serving | Uvicorn |

### 9.4 AI and ML Services

| Purpose | Technology |
|---|---|
| Resume semantic matching | SBERT (`all-MiniLM-L6-v2`) |
| Interview question generation | Google Gemini |
| Interview evaluation | Google Gemini |
| Face monitoring | TensorFlow.js face detection |

---

## 10. Security Mechanisms

The system already includes several security-oriented features.

### 10.1 Authentication Security

- HR authentication uses JWT
- JWT is stored in `HttpOnly` cookie
- Protected routes validate the token using middleware
- Passwords are hashed before storage

### 10.2 Interview Security

- Interview access is based on secure random token links
- Invalid tokens are rejected
- Session reset prevents old interview reuse artifacts
- Proctoring records browser focus changes and facial anomalies

### 10.3 API Security and Abuse Protection

- Resume upload route uses rate limiting
- Invalid or missing inputs return safe errors
- Shortlisted candidates are separated from low-scoring applications

---

## 11. Current Features in the Final Integrated System

The current system includes the following implemented features:

- HR registration, login, logout, and password reset
- Public job board and job details
- Job CRUD for HR
- Resume PDF upload
- Resume text extraction
- ATS semantic matching using Python microservice
- Score-based shortlisting
- Secure email-based interview magic links
- AI interview with 3 total questions
- Live interview transcript
- Voice input using browser speech recognition
- Gemini-based evaluation and recommendation
- HR dashboard analytics
- Candidate ranking by ATS score
- Detailed candidate evaluation view
- Live interview proctoring
- Proctoring summary counts visible to HR
- Interview snapshot visible to HR
- Candidate deletion and job deletion workflows

---

## 12. Key Challenges Faced During the Project

This project involved multiple technical and design challenges. The following were the most important.

### 12.1 Multi-Service Integration

The project is not a single application. It depends on:

- React frontend
- Express backend
- MongoDB database
- Python AI server
- Gemini API
- SMTP mail server

Coordinating all of them in local development and ensuring they communicate correctly was one of the biggest integration challenges.

### 12.2 Resume Parsing and Semantic Matching

PDF resumes are often inconsistent:

- different templates
- broken formatting
- multi-column layouts
- unexpected spacing

After extraction, the text still needs meaningful semantic comparison against job descriptions. Choosing chunking, embedding, and score normalization required careful tuning to produce usable ATS scores.

### 12.3 LLM Output Reliability

Gemini is asked to return strict JSON for both question generation and evaluation. In practice, LLMs may:

- include extra text
- produce malformed JSON
- omit required fields
- hit quota or rate limits

To handle this, the backend uses:

- regex extraction of JSON
- fallback question lists
- fallback evaluation values
- model fallback rotation
- queue-based throttling

### 12.4 Maintaining Interview State Correctly

The interview flow must preserve:

- transcript order
- question index
- generated question list
- evaluation status

At the same time, it must avoid duplicate transcript entries or corrupted state if the page is refreshed or requests overlap. Session reset and atomic database updates were necessary to keep the interview stable.

### 12.5 Integrating Proctoring Without Breaking the Main App

The `interview_face_procturing` folder originally existed as a standalone system. Integrating it into the live project required:

- reusing only the valuable monitoring logic
- avoiding duplicate servers and entry points
- preventing UI conflicts
- preserving the original interview flow

This was especially important because the main objective was to add proctoring while not changing other platform functionality.

### 12.6 Browser and Webcam Limitations

Client-side proctoring depends on:

- webcam permission
- browser support
- hardware performance
- lighting quality
- camera placement

These factors make real-time monitoring less predictable than backend-only logic.

### 12.7 UI and Layout Stability

When proctoring was integrated, the transcript area and live interview layout needed careful balancing so that:

- webcam remains visible
- transcript remains readable
- event logs do not push out core interview content

Making the experience functional for both candidate and HR was a major usability challenge.

### 12.8 Evidence Handling and Storage Decisions

Storing proctoring information and a face snapshot introduced new design decisions:

- what to store
- how much to store
- how frequently to sync
- how to show it to HR
- how to reset it for a new session

The final design stores:

- raw proctoring events
- summary counts
- one interview face snapshot

This is a practical compromise between evidence richness and implementation simplicity.

---

## 13. Limitations of the Current System

Although the platform is functional, the current version still has limitations.

- The Python ATS service is outside the main repo directory and should be packaged more cleanly.
- Proctoring is browser-side and therefore limited by client hardware and permissions.
- Face snapshot is stored as base64 in MongoDB instead of dedicated media storage.
- Resume scoring currently uses semantic similarity mainly against job description text, not a richer weighted rubric.
- Interview evaluation depends on external Gemini availability and quota.
- Real-time updates are based on polling, not WebSockets.
- There is limited automated test coverage.
- There is no role-based multi-organization admin separation beyond simple admin ownership.
- There is no audit log or compliance layer for enterprise deployments.

---

## 14. Future Improvements

The project has strong potential for future enhancement. The following improvements would significantly increase production readiness.

### 14.1 Platform and Deployment Improvements

- Move the Python AI service inside the project monorepo or Dockerize all services together
- Add Docker Compose for one-command local setup
- Add environment-specific configuration management
- Add CI/CD for build, test, and deployment

### 14.2 AI and Scoring Improvements

- Add hybrid ATS ranking using:
  - semantic similarity
  - required skill overlap
  - experience extraction
  - education and certification matching
- Introduce job-specific evaluation rubrics
- Add difficulty levels for interview questions
- Add question diversity constraints to avoid repetitive prompts
- Add answer-level scoring calibration and benchmarking

### 14.3 Interview Experience Improvements

- Add text-based fallback if speech recognition fails
- Add server-side speech-to-text for better consistency
- Add timer and question progress indicator if desired
- Support follow-up questions based on previous answers
- Add multilingual interview support

### 14.4 Proctoring Improvements

- Add head pose estimation and gaze confidence scoring
- Add audio anomaly detection
- Add suspicious copy-paste and keyboard activity monitoring
- Save optional short evidence clips instead of only one image
- Add recruiter-configurable proctoring sensitivity
- Add policy controls for warning versus hard disqualification

### 14.5 HR Analytics Improvements

- Add search, filters, and bulk actions for candidates
- Add comparative candidate scoring views
- Add downloadable interview reports in PDF
- Add recruiter notes and collaborative review workflow
- Add hiring funnel visual analytics

### 14.6 Security and Compliance Improvements

- Add refresh tokens and stronger session management
- Add role-based access control for multiple recruiter roles
- Add audit logging and admin action history
- Add encryption and retention rules for interview evidence
- Add privacy consent workflow for webcam-based monitoring

---

## 15. Setup and Run Instructions

### 15.1 Services You Need to Run

The full system requires these services:

1. Frontend on port `3000`
2. Backend on port `8000`
3. Python AI server on port `8001`
4. MongoDB
5. SMTP configuration for email delivery

### 15.2 Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

Current Vite configuration uses:

- `http://localhost:3000`

Optional frontend environment variable:

```env
VITE_API_URL=http://localhost:8000
```

### 15.3 Backend Setup

```bash
cd Backend/Backend/PDP_Backend
npm install
npm run dev
```

Default backend port:

- `http://localhost:8000`

Required backend environment variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SENDER_EMAIL=your_sender_email
GEMINI_MAIN_KEY=your_gemini_api_key
PORT=8000
NODE_ENV=development
```

### 15.4 Python AI Server Setup

Observed service file:

```text
../Python_AI_Server/main.py
```

Run command:

```bash
cd ../Python_AI_Server
uvicorn main:app --reload --port 8001
```

Suggested Python dependencies:

```bash
pip install fastapi uvicorn sentence-transformers scikit-learn numpy
```

### 15.5 MongoDB

Make sure MongoDB is running locally or use MongoDB Atlas.

---

## 16. Suggested Report Structure for a 20-Page Academic or Project Report

This README can directly serve as the base for your full report. A good 20-page report can be organized like this:

1. Title Page
2. Certificate or Declaration
3. Acknowledgement
4. Abstract
5. Table of Contents
6. Introduction
7. Problem Statement
8. Objectives
9. Literature or Technology Background
10. System Architecture
11. Module Description
12. Database Design
13. Detailed Workflow
14. API and Functional Design
15. Tech Stack Justification
16. Implementation Details
17. Challenges Faced
18. Results and Screenshots
19. Future Scope
20. Conclusion

To extend this into a strong final report, add screenshots for:

- Job board
- Job application page
- HR dashboard
- Job creation modal
- Candidate leaderboard
- Interview room
- Proctoring panel
- HR candidate expanded report

---

## 17. Conclusion

This project demonstrates a full-stack AI recruitment platform that goes beyond a basic ATS. It brings together:

- applicant tracking
- semantic screening
- AI interviewing
- structured evaluation
- recruiter analytics
- interview proctoring

The most important contribution of the project is that it turns the hiring process into a connected workflow rather than isolated features. A candidate can move from application to AI interview, and HR can later review a single unified profile containing resume score, interview quality, transcript, proctoring behavior, and face snapshot evidence.

From a software engineering perspective, the project also shows how multiple services can be combined into one business process:

- React for user experience
- Express for orchestration
- MongoDB for persistence
- FastAPI plus SBERT for ATS scoring
- Gemini for interview intelligence
- TensorFlow.js for client-side proctoring

With further improvement in deployment, security, testing, and analytics, this system can evolve from a strong academic or portfolio project into a production-grade recruitment platform.


# PDP Repository Workflow and Connectivity Guide

## Project Title

**PDP: AI Recruitment, ATS Screening, Gemini Interview, and Proctoring Platform**

## Project Overview

This repository contains a recruitment workflow that starts at public job discovery, moves through resume screening and interview invitation, runs an AI interview with browser-side proctoring, and ends in an HR review dashboard.

The live application is mainly built from two codebases:

- `Frontend` for the React candidate and HR interfaces
- `Backend/Backend/PDP_Backend` for the Express, MongoDB, Gemini, SMTP, and ATS orchestration logic

There is also a third folder, `interview_face_procturing`, but it is a separate standalone proctoring project/prototype. The main routed application does **not** import or run it directly.

One more important truth for viva and developer handoff: the backend clearly expects a Python ATS server at `http://127.0.0.1:8001/api/match`, but no Python source file exists in this repository. That service is an external dependency from the point of view of this repo.

## Problem Statement

Traditional recruitment pipelines make HR teams manually repeat the same steps: publish jobs, collect resumes, shortlist applicants, schedule interviews, assess answers, and maintain records. This project tries to automate those steps by connecting resume parsing, ATS-style scoring, secure interview links, AI interviewing, proctoring, and recruiter review into one code-connected flow.

## Objectives

- Provide a public application flow for candidates.
- Let HR admins manage jobs and inspect applicants from one dashboard.
- Parse PDF resumes and score them against a job description.
- Shortlist candidates automatically using an ATS threshold.
- Send interview links by email.
- Generate interview questions with Gemini.
- Evaluate interview answers with Gemini and store structured feedback.
- Capture proctoring signals, summary counts, and one snapshot for HR review.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, React Router 7, Motion, Axios, Tailwind CSS v4, Radix UI, Lucide React |
| Browser APIs | `navigator.mediaDevices.getUserMedia`, `SpeechRecognition`, `speechSynthesis`, `document.visibilitychange`, `window.blur` |
| Frontend AI / CV | `@tensorflow-models/face-detection`, `@tensorflow/tfjs` |
| Backend | Node.js, Express 5, Axios, Multer, `pdf-extraction`, `p-queue`, `express-rate-limit`, `cookie-parser`, `cors` |
| Database | MongoDB with Mongoose |
| Auth | JWT in `HttpOnly` cookie for HR admins |
| LLM | Google Gemini via `@google/generative-ai` |
| Email | Nodemailer SMTP transport |
| External ATS dependency | Python microservice at `127.0.0.1:8001` |
| Standalone proctoring prototype | React + Express in `interview_face_procturing` |

## High-Level Architecture

```text
Frontend/index.html
  -> Frontend/src/main.jsx
  -> Frontend/src/app/App.jsx
  -> Frontend/src/app/routes.jsx
  -> Candidate pages or HR pages

Candidate pages
  -> Frontend/src/app/services/api.js
  -> or direct axios/fetch in Frontend/src/app/pages/public/InterviewRoom.jsx
  -> Backend/Backend/PDP_Backend/server.js or routes/*.js
  -> MongoDB models in Backend/Backend/PDP_Backend/models
  -> external services:
       - Python ATS server at 127.0.0.1:8001
       - Gemini API
       - SMTP server
  -> response back to candidate page or HR dashboard

HR pages
  -> Frontend/src/app/services/api.js
  -> Backend/Backend/PDP_Backend/routes/auth.js
  -> Backend/Backend/PDP_Backend/routes/jobs.js
  -> Backend/Backend/PDP_Backend/middleware/verifyToken.js
  -> MongoDB

Main-app proctoring path
  -> Frontend/src/app/pages/public/InterviewRoom.jsx
  -> Frontend/src/app/hooks/useInterviewProctoring.js
  -> Frontend/src/app/utils/proctoring/faceAnalysis.js
  -> Frontend/src/app/utils/proctoring/eventReporter.js
  -> Backend/Backend/PDP_Backend/server.js
  -> Candidate.proctoringEvents / proctoringSummary / interviewSnapshot
  -> Frontend/src/app/pages/hr/HrCandidates.jsx
```

## Repository Truths That Matter

- The active candidate interview route is `Frontend/src/app/pages/public/InterviewRoom.jsx` because `Frontend/src/app/routes.jsx` imports that file for `/interview/:token`.
- `Frontend/src/app/pages/interview/InterviewRoom.jsx` exists, but it is a legacy, unrouted page and is not wired into `routes.jsx`.
- `Frontend/src/app/services/mockApi.js` exists, but no file imports it.
- The backend does **not** have a `controllers/` or `services/` folder. Most business logic is inline inside `Backend/Backend/PDP_Backend/server.js`, `routes/auth.js`, and `routes/jobs.js`.
- The actual shortlist threshold in code is `aiScore >= 50` in `Backend/Backend/PDP_Backend/server.js`, not 60.
- The actual total interview question count in code is 3: one fixed intro question plus two generated questions.
- The main application stores proctoring data in the `Candidate` Mongo document. The `interview_face_procturing` backend stores data only in its own in-memory arrays and maps.
- The frontend success UI in `Frontend/src/app/pages/public/JobApplication.jsx` always speaks as if an email was sent, but the backend only emails when the ATS score passes the threshold.
- `Frontend/src/app/pages/public/InterviewRoom.jsx` hardcodes `http://localhost:8000` for verify/chat/score calls, while other frontend network helpers use `VITE_API_URL`.

## Folder Structure

```text
Frontend/
  src/main.jsx
  src/app/App.jsx
  src/app/routes.jsx
  src/app/services/api.js
  src/app/services/mockApi.js
  src/app/pages/public/
    JobBoard.jsx
    JobDescription.jsx
    JobApplication.jsx
    InterviewRoom.jsx
  src/app/pages/hr/
    HrLogin.jsx
    HrRegister.jsx
    HrForgotPassword.jsx
    HrResetPassword.jsx
    HrDashboard.jsx
    HrJobs.jsx
    HrCandidates.jsx
  src/app/pages/interview/
    InterviewRoom.jsx
  src/app/hooks/useInterviewProctoring.js
  src/app/utils/proctoring/
    faceAnalysis.js
    eventReporter.js
  src/app/components/
    ProtectedRoute.jsx
    HrLayout.jsx
    AuthShell.jsx
    interview/ProctoringPanel.jsx

Backend/Backend/PDP_Backend/
  server.js
  routes/
    auth.js
    jobs.js
  middleware/
    verifyToken.js
  models/
    HRAdmin.js
    Job.js
    Candidate.js
  utils/
    email.js
  test-ai.js
  test-token.js

interview_face_procturing/
  src/App.jsx
  src/components/
    Proctoring.jsx
    MetricsDashboard.jsx
  src/utils/
    faceAnalysis.js
    eventReporter.js
    advancedAnalysis.js
  server/
    server.js
    server-advanced.js
    auth.js
    database.js
```

## Section-wise File Explanation

### Frontend Core and Routing

| File Path | Role in Project | Imported / Called By | Depends On | Functionality and Data |
|---|---|---|---|---|
| `Frontend/src/main.jsx` | SPA bootstrap | `Frontend/index.html` | `Frontend/src/app/App.jsx`, `Frontend/src/styles/index.css` | Mounts the full React app into `#root`. |
| `Frontend/src/app/App.jsx` | Root provider layer | `Frontend/src/main.jsx` | `routes.jsx`, `ThemeContext.jsx`, `components/ui/sonner.jsx` | Wraps the router, theme provider, and toast notifications. |
| `Frontend/src/app/routes.jsx` | Live route map | `App.jsx` | All page components, `ProtectedRoute.jsx` | Connects URL paths to page components. This file decides that `/interview/:token` uses `pages/public/InterviewRoom.jsx`. |
| `Frontend/src/app/services/api.js` | Shared API client | Used by most HR pages and public job pages | `axios`, `VITE_API_URL` | Sends JSON or multipart requests to backend endpoints. Contains HR auth, job CRUD, candidate fetch, and application submission helpers. Interview helpers here are partly stale compared with the routed interview page. |
| `Frontend/src/app/components/ProtectedRoute.jsx` | HR route gate | Used by `routes.jsx` for HR dashboard, jobs, candidates | `api.checkHrAuth()`, `LoadingSpinner.jsx` | Calls `GET /api/jobs/stats/dashboard` to test whether the `HttpOnly` cookie is valid, then either renders the HR page or redirects to `/hr/login`. |
| `Frontend/src/app/components/HrLayout.jsx` | Shared HR shell | Used by `HrDashboard.jsx`, `HrJobs.jsx`, `HrCandidates.jsx` | `api.hrLogout()`, `ThemeToggle.jsx`, `BrandMark.jsx` | Renders HR navigation and logout UI. Important note: `api.hrLogout()` does not call the backend logout route. |

### Candidate-Facing Frontend Files

| File Path | Role in Project | Imported / Called By | Depends On | Functionality and Data |
|---|---|---|---|---|
| `Frontend/src/app/pages/public/JobBoard.jsx` | Public job listing page | `routes.jsx` for `/jobs` | `api.getJobs()`, `BrandMark`, `ThemeToggle` | Fetches all jobs from `GET /api/jobs`, renders cards, and navigates to job detail pages. |
| `Frontend/src/app/pages/public/JobDescription.jsx` | Single job detail page | `routes.jsx` for `/jobs/:jobId` | `api.getJobById(jobId)` | Loads one job by ID and forwards candidates to `/jobs/:jobId/apply`. |
| `Frontend/src/app/pages/public/JobApplication.jsx` | Candidate application page | `routes.jsx` for `/jobs/:jobId/apply` | `api.getJobById`, `api.submitApplication` | Collects `name`, `email`, `jobId`, and PDF resume; submits `FormData` to `POST /api/upload-resume`. |
| `Frontend/src/app/pages/public/InterviewRoom.jsx` | Active interview page and result page | `routes.jsx` for `/interview/:token` | direct `axios` calls to verify/chat/score endpoints, `useInterviewProctoring`, browser camera/audio APIs | Verifies the interview token, initializes webcam and speech recognition, posts answers to `/api/interview/chat`, polls `/api/interview/score/:token`, shows final score and feedback, and renders the live proctoring panel. |
| `Frontend/src/app/hooks/useInterviewProctoring.js` | Main-app proctoring engine | Imported by `pages/public/InterviewRoom.jsx` | TensorFlow face detector, `faceAnalysis.js`, `eventReporter.js` | Runs face checks every 1.8s, records tab blur events, maintains local counts, periodically saves summary, and uploads one interview snapshot. |
| `Frontend/src/app/utils/proctoring/faceAnalysis.js` | Proctoring event generator | Imported by `useInterviewProctoring.js` | TensorFlow face predictions | Converts face detector output into normalized analysis plus alert objects such as `NO_FACE`, `MULTIPLE_FACES`, `LOOKING_AWAY`, `TOO_FAR`, `TOO_CLOSE`. |
| `Frontend/src/app/utils/proctoring/eventReporter.js` | Proctoring network bridge | Imported by `useInterviewProctoring.js` | `fetch`, `VITE_API_URL` | Batches events to `POST /api/interview/proctoring/:token`, sends summary to the same endpoint, and sends snapshot data to `POST /api/interview/snapshot/:token`. |
| `Frontend/src/app/components/interview/ProctoringPanel.jsx` | Candidate-side monitoring panel | Imported by `pages/public/InterviewRoom.jsx` | Hook state from `useInterviewProctoring` | Shows model status, face count, gaze state, event counts, queue count, and recent proctoring events. |
| `Frontend/src/app/pages/interview/InterviewRoom.jsx` | Legacy interview page | Not referenced by `routes.jsx` | `api.verifyMagicToken`, `api.sendChatMessage`, `api.submitInterviewResult`, webcam, face detection | Older interview implementation. It is useful for reference but is not the live route. |

### HR Frontend Files

| File Path | Role in Project | Imported / Called By | Depends On | Functionality and Data |
|---|---|---|---|---|
| `Frontend/src/app/pages/hr/HrLogin.jsx` | HR login page | `routes.jsx` for `/hr/login` | `api.hrLogin(email, password)` | Sends credentials to `POST /api/auth/login`, expects success, then navigates to `/hr/dashboard`. |
| `Frontend/src/app/pages/hr/HrRegister.jsx` | HR registration page | `routes.jsx` for `/hr/register` | `api.hrRegister(...)` | Sends name, email, password, and company name to `POST /api/auth/register`, then routes back to login. |
| `Frontend/src/app/pages/hr/HrForgotPassword.jsx` | Password reset request page | `routes.jsx` for `/hr/forgot-password` | `api.hrForgotPassword(email)` | Triggers `POST /api/auth/forgot-password` so the backend can email a reset link. |
| `Frontend/src/app/pages/hr/HrResetPassword.jsx` | Password reset completion page | `routes.jsx` for `/hr/reset-password/:token` | `api.hrResetPassword(token, password)` | Posts the new password to `POST /api/auth/reset-password/:token`. |
| `Frontend/src/app/pages/hr/HrDashboard.jsx` | HR analytics page | `routes.jsx` for `/hr/dashboard` through `ProtectedRoute` | `api.getDashboardStats()` | Calls `GET /api/jobs/stats/dashboard`, shows totals, average ATS score, and recent applications. |
| `Frontend/src/app/pages/hr/HrJobs.jsx` | HR job management page | `routes.jsx` for `/hr/jobs` through `ProtectedRoute` | `api.getJobs`, `api.createJob`, `api.updateJob`, `api.deleteJob` | Lists jobs, opens create/edit dialog, and triggers CRUD calls. It uses the public `GET /api/jobs` endpoint for listing. |
| `Frontend/src/app/pages/hr/HrCandidates.jsx` | HR candidate leaderboard and evidence review page | `routes.jsx` for `/hr/jobs/:jobId/candidates` through `ProtectedRoute` | `api.getJobById`, `api.getCandidatesByJob`, `api.deleteCandidate` | Fetches candidates for a job, shows ATS and interview scores, renders transcript, summary, question feedback, proctoring review, and interview snapshot. |

### Backend Core Files

| File Path | Role in Project | Imported / Called By | Depends On | Functionality and Data |
|---|---|---|---|---|
| `Backend/Backend/PDP_Backend/server.js` | Main application server and most business logic | Executed by `npm run dev` / `npm start` | Express, Mongoose, Multer, `pdf-extraction`, Axios, `p-queue`, Gemini SDK, `Candidate`, `Job`, `authRoutes`, `jobRoutes`, `utils/email.js` | Registers `/api/auth` and `/api/jobs`, handles resume upload, ATS call, shortlist token generation, interview verification, proctoring ingestion, snapshot save, Gemini chat flow, transcript persistence, background evaluation, and score polling. |
| `Backend/Backend/PDP_Backend/routes/auth.js` | HR auth route module | Mounted by `server.js` on `/api/auth` | `HRAdmin`, `bcryptjs`, `jsonwebtoken`, `crypto`, `utils/email.js` | Registers admins, logs them in, sets the JWT cookie, clears cookie on logout, creates password reset tokens, and sends reset emails. |
| `Backend/Backend/PDP_Backend/routes/jobs.js` | Job and candidate route module | Mounted by `server.js` on `/api/jobs` | `Job`, `Candidate`, `verifyToken` | Handles job creation, public job listing, dashboard analytics, single-job fetch, candidate leaderboard, job update/delete, and candidate deletion. |
| `Backend/Backend/PDP_Backend/middleware/verifyToken.js` | JWT cookie guard | Imported by `routes/jobs.js` | `jsonwebtoken`, `JWT_SECRET` | Reads `req.cookies.token`, verifies it, and attaches `{ adminId }` to `req.admin`. |
| `Backend/Backend/PDP_Backend/utils/email.js` | Shared SMTP transporter | Imported by `server.js` and `routes/auth.js` | `nodemailer`, `SMTP_*` env vars | Creates the reusable transport that sends interview and password reset emails. |
| `Backend/Backend/PDP_Backend/models/Candidate.js` | Central persistence model | Imported by `server.js`, `routes/jobs.js`, `test-token.js` | `mongoose` | Stores resume text, ATS score, interview token, transcript, evaluation, proctoring events, summary, snapshot, and status. |
| `Backend/Backend/PDP_Backend/models/Job.js` | Job posting model | Imported by `server.js`, `routes/jobs.js` | `mongoose` | Stores job title, description, required skills, interview topics, and owner admin ID. |
| `Backend/Backend/PDP_Backend/models/HRAdmin.js` | HR account model | Imported by `routes/auth.js` | `mongoose` | Stores HR admin profile, hashed password, and reset token fields. |
| `Backend/Backend/PDP_Backend/test-ai.js` | Gemini connectivity helper script | Manual developer use | `@google/generative-ai` | Tests Gemini API access. Important note: it checks `GEMINI_API_KEY`, while runtime code uses `GEMINI_MAIN_KEY`. |
| `Backend/Backend/PDP_Backend/test-token.js` | Candidate token inspection helper | Manual developer use | `Candidate`, `MONGO_URI` | Prints one existing interview token from MongoDB for debugging. |

### Standalone `interview_face_procturing` Files

| File Path | Role in Project | Imported / Called By | Depends On | Functionality and Data |
|---|---|---|---|---|
| `interview_face_procturing/src/App.jsx` | Prototype app root | `interview_face_procturing/src/index.jsx` | `components/Proctoring.jsx` | Renders the standalone proctoring UI inside an error boundary. |
| `interview_face_procturing/src/components/Proctoring.jsx` | Standalone proctoring UI | `src/App.jsx` | `react-webcam`, TensorFlow, `src/utils/faceAnalysis.js`, `src/utils/eventReporter.js` | Runs a separate face monitoring loop and posts events to the standalone proctoring backend. |
| `interview_face_procturing/src/utils/faceAnalysis.js` | Standalone face event logic | Imported by `components/Proctoring.jsx` | `reportEvent()` | Generates `NO_FACE`, `MULTIPLE_FACES`, `LOOKING_AWAY`, `TOO_FAR`, `TOO_CLOSE` alerts and reports them. |
| `interview_face_procturing/src/utils/eventReporter.js` | Standalone event queue | Imported by standalone proctoring code | `fetch`, `REACT_APP_API_URL` fallback | Sends queued events to `POST /api/proctoring-event` on the standalone backend. |
| `interview_face_procturing/server/server.js` | Basic standalone proctoring backend | Run by `npm run dev:basic` | Express, CORS | Stores events in an in-memory `proctorEvents` array and exposes `POST /api/proctoring-event` and `GET /api/proctoring-events`. |
| `interview_face_procturing/server/server-advanced.js` | Advanced standalone proctoring backend | Run by `npm run dev:backend` or `npm start` | Express, CORS | Adds auth-like endpoints, session start/end, analytics, suspicious session review, and in-memory event/session tracking. |
| `interview_face_procturing/server/database.js` | Standalone prototype data layer | Not imported by `server-advanced.js` or `server.js` | optional Mongoose example plus in-memory arrays | Demonstrates how events and sessions could be stored, but is not wired into the running standalone servers. |
| `interview_face_procturing/server/auth.js` | Standalone JWT helper | Not imported by the running standalone servers | `jsonwebtoken` | Contains JWT helpers and mock user registration/login logic for the prototype codebase. |

## Feature-wise File Mapping

| Feature | Frontend File(s) | Backend File(s) | External / AI File(s) | Database File(s) | Purpose |
|---|---|---|---|---|---|
| HR registration and login | `Frontend/src/app/pages/hr/HrRegister.jsx`, `Frontend/src/app/pages/hr/HrLogin.jsx`, `Frontend/src/app/components/ProtectedRoute.jsx` | `Backend/Backend/PDP_Backend/routes/auth.js`, `Backend/Backend/PDP_Backend/middleware/verifyToken.js` | JWT library | `Backend/Backend/PDP_Backend/models/HRAdmin.js` | Create HR accounts, set JWT cookie, and protect HR pages. |
| Forgot / reset password | `Frontend/src/app/pages/hr/HrForgotPassword.jsx`, `Frontend/src/app/pages/hr/HrResetPassword.jsx` | `Backend/Backend/PDP_Backend/routes/auth.js`, `Backend/Backend/PDP_Backend/utils/email.js` | SMTP | `Backend/Backend/PDP_Backend/models/HRAdmin.js` | Generate reset token and email the reset URL. |
| Public job board | `Frontend/src/app/pages/public/JobBoard.jsx`, `Frontend/src/app/pages/public/JobDescription.jsx` | `Backend/Backend/PDP_Backend/routes/jobs.js` | None | `Backend/Backend/PDP_Backend/models/Job.js` | Publish jobs to candidates and load job details. |
| Job CRUD | `Frontend/src/app/pages/hr/HrJobs.jsx` | `Backend/Backend/PDP_Backend/routes/jobs.js`, `Backend/Backend/PDP_Backend/middleware/verifyToken.js` | None | `Backend/Backend/PDP_Backend/models/Job.js` | Create, edit, and delete jobs. |
| Resume upload and parsing | `Frontend/src/app/pages/public/JobApplication.jsx`, `Frontend/src/app/services/api.js` | `Backend/Backend/PDP_Backend/server.js` | `pdf-extraction`, Multer | `Backend/Backend/PDP_Backend/models/Candidate.js`, `Backend/Backend/PDP_Backend/models/Job.js` | Accept the PDF, extract text, validate job, and create candidate record. |
| ATS score and shortlisting | `Frontend/src/app/pages/public/JobApplication.jsx`, `Frontend/src/app/pages/hr/HrDashboard.jsx`, `Frontend/src/app/pages/hr/HrCandidates.jsx` | `Backend/Backend/PDP_Backend/server.js`, `Backend/Backend/PDP_Backend/routes/jobs.js` | external Python service at `127.0.0.1:8001` | `Backend/Backend/PDP_Backend/models/Candidate.js` | Compute ATS score, store it, and decide whether to generate an interview token. |
| Interview link verification | `Frontend/src/app/pages/public/InterviewRoom.jsx` | `Backend/Backend/PDP_Backend/server.js` | None | `Backend/Backend/PDP_Backend/models/Candidate.js` | Validate token and reset interview state before starting. |
| Gemini question generation | `Frontend/src/app/pages/public/InterviewRoom.jsx` | `Backend/Backend/PDP_Backend/server.js` | Google Gemini | `Backend/Backend/PDP_Backend/models/Candidate.js` | Generate resume-based technical questions. |
| Transcript save and chat flow | `Frontend/src/app/pages/public/InterviewRoom.jsx` | `Backend/Backend/PDP_Backend/server.js` | Google Gemini | `Backend/Backend/PDP_Backend/models/Candidate.js` | Save answer text, serve next question, and move interview state forward. |
| Gemini evaluation and final result | `Frontend/src/app/pages/public/InterviewRoom.jsx`, `Frontend/src/app/pages/hr/HrCandidates.jsx` | `Backend/Backend/PDP_Backend/server.js` | Google Gemini, `p-queue` | `Backend/Backend/PDP_Backend/models/Candidate.js` | Evaluate full transcript, store score and structured feedback, then return/poll results. |
| Main-app proctoring | `Frontend/src/app/pages/public/InterviewRoom.jsx`, `Frontend/src/app/hooks/useInterviewProctoring.js`, `Frontend/src/app/utils/proctoring/*`, `Frontend/src/app/components/interview/ProctoringPanel.jsx` | `Backend/Backend/PDP_Backend/server.js` | TensorFlow.js face detection | `Backend/Backend/PDP_Backend/models/Candidate.js` | Capture suspicious behavior, summary counts, and one interview snapshot. |
| HR review dashboard | `Frontend/src/app/pages/hr/HrDashboard.jsx`, `Frontend/src/app/pages/hr/HrCandidates.jsx` | `Backend/Backend/PDP_Backend/routes/jobs.js` | None | `Candidate.js`, `Job.js` | Surface ATS scores, interview scores, transcript, proctoring, and summary data to recruiters. |
| Standalone proctoring prototype | `interview_face_procturing/src/components/Proctoring.jsx` | `interview_face_procturing/server/server.js`, `interview_face_procturing/server/server-advanced.js` | TensorFlow.js face landmarks | in-memory arrays/maps, optional `server/database.js` example | Demonstrates a separate proctoring system not directly used by the main app flow. |

## Frontend Page Connectivity

| Route / Page | Component File | API It Calls | Backend File Handling the API | DB / Service Used | Next Page or Module |
|---|---|---|---|---|---|
| `/` | `Frontend/src/app/routes.jsx` redirect | None | None | None | Redirects to `/jobs`. |
| `/jobs` | `Frontend/src/app/pages/public/JobBoard.jsx` | `GET /api/jobs` through `api.getJobs()` | `Backend/Backend/PDP_Backend/routes/jobs.js` | `Job` collection | Candidate clicks a card and goes to `/jobs/:jobId`. |
| `/jobs/:jobId` | `Frontend/src/app/pages/public/JobDescription.jsx` | `GET /api/jobs/:jobId` through `api.getJobById()` | `routes/jobs.js` | `Job` collection | Apply button routes to `/jobs/:jobId/apply`. |
| `/jobs/:jobId/apply` | `Frontend/src/app/pages/public/JobApplication.jsx` | `GET /api/jobs/:jobId`, `POST /api/upload-resume` | `routes/jobs.js`, then `Backend/Backend/PDP_Backend/server.js` | `Job`, `Candidate`, external ATS service, SMTP | If shortlisted, the next real step is the email link to `/interview/:token`. |
| `/interview/:token` | `Frontend/src/app/pages/public/InterviewRoom.jsx` | `GET /api/interview/verify/:token`, `POST /api/interview/chat`, `GET /api/interview/score/:token`, proctoring `POST /api/interview/proctoring/:token`, snapshot `POST /api/interview/snapshot/:token` | `Backend/Backend/PDP_Backend/server.js` | `Candidate`, Gemini, TensorFlow.js, browser camera/audio APIs | Shows candidate result UI when complete; stored data later appears in HR candidate review. |
| `/hr/login` | `Frontend/src/app/pages/hr/HrLogin.jsx` | `POST /api/auth/login` | `Backend/Backend/PDP_Backend/routes/auth.js` | `HRAdmin`, JWT cookie | Successful login goes to `/hr/dashboard`. |
| `/hr/register` | `Frontend/src/app/pages/hr/HrRegister.jsx` | `POST /api/auth/register` | `routes/auth.js` | `HRAdmin` | On success returns user to `/hr/login`. |
| `/hr/forgot-password` | `Frontend/src/app/pages/hr/HrForgotPassword.jsx` | `POST /api/auth/forgot-password` | `routes/auth.js` | `HRAdmin`, SMTP | Email link routes user to `/hr/reset-password/:token`. |
| `/hr/reset-password/:token` | `Frontend/src/app/pages/hr/HrResetPassword.jsx` | `POST /api/auth/reset-password/:token` | `routes/auth.js` | `HRAdmin` | On success it returns to `/hr/login`. |
| `/hr/dashboard` | `Frontend/src/app/pages/hr/HrDashboard.jsx` under `ProtectedRoute.jsx` | `GET /api/jobs/stats/dashboard` | `Backend/Backend/PDP_Backend/routes/jobs.js` | `Job`, `Candidate` | User can navigate to `/hr/jobs` or `/jobs`. |
| `/hr/jobs` | `Frontend/src/app/pages/hr/HrJobs.jsx` under `ProtectedRoute.jsx` | `GET /api/jobs`, `POST /api/jobs`, `PUT /api/jobs/:jobId`, `DELETE /api/jobs/:jobId` | `routes/jobs.js` | `Job` | Candidates button opens `/hr/jobs/:jobId/candidates`. |
| `/hr/jobs/:jobId/candidates` | `Frontend/src/app/pages/hr/HrCandidates.jsx` under `ProtectedRoute.jsx` | `GET /api/jobs/:jobId`, `GET /api/jobs/:jobId/candidates`, `DELETE /api/jobs/:jobId/candidates/:candidateId` | `routes/jobs.js` | `Job`, `Candidate` | Final recruiter review surface for ATS, interview, transcript, proctoring, and snapshot. |

## Backend Route Connectivity

> There is no separate controller or service layer in this repo. The “controller/service” work happens inline inside the route handlers below.

| Endpoint | Route File | Depends On | Reads / Writes | Returned to Frontend | Frontend Consumer |
|---|---|---|---|---|---|
| `POST /api/auth/register` | `Backend/Backend/PDP_Backend/routes/auth.js` | `HRAdmin`, `bcryptjs` | Writes new HR admin with hashed password | `{ message }` | `HrRegister.jsx` |
| `POST /api/auth/login` | `routes/auth.js` | `HRAdmin`, `bcryptjs`, `jsonwebtoken` | Reads admin, sets `token` cookie | `{ message, adminName }` | `HrLogin.jsx` |
| `POST /api/auth/logout` | `routes/auth.js` | Express cookie clearing | Clears auth cookie | `{ message }` | Not actually called by `api.hrLogout()` |
| `POST /api/auth/forgot-password` | `routes/auth.js` | `HRAdmin`, `crypto`, `utils/email.js` | Writes reset token and expiry | `{ message }` | `HrForgotPassword.jsx` |
| `POST /api/auth/reset-password/:token` | `routes/auth.js` | `HRAdmin`, `bcryptjs` | Reads reset token, writes new hashed password | `{ message }` | `HrResetPassword.jsx` |
| `GET /api/jobs` | `Backend/Backend/PDP_Backend/routes/jobs.js` | `Job.find()` | Reads all jobs | job array | `JobBoard.jsx`, `HrJobs.jsx` |
| `POST /api/jobs` | `routes/jobs.js` | `verifyToken`, `Job` | Writes new job with `adminId` from JWT | `{ message, job }` | `HrJobs.jsx` |
| `GET /api/jobs/stats/dashboard` | `routes/jobs.js` | `verifyToken`, `Job`, `Candidate` | Reads jobs owned by admin and candidates linked to those jobs | `{ totalJobs, totalApplicants, averageMatchScore, recentActivity }` | `ProtectedRoute.jsx`, `HrDashboard.jsx` |
| `GET /api/jobs/:jobId` | `routes/jobs.js` | `Job.findById()` | Reads single job | job object | `JobDescription.jsx`, `JobApplication.jsx`, `HrCandidates.jsx` |
| `GET /api/jobs/:jobId/candidates` | `routes/jobs.js` | `verifyToken`, `Candidate.find()` | Reads candidates for the selected job, excluding `resumeText` | candidate array | `HrCandidates.jsx` |
| `PUT /api/jobs/:jobId` | `routes/jobs.js` | `verifyToken`, `Job.findByIdAndUpdate()` | Updates job if current admin owns it | `{ message, job }` | `HrJobs.jsx` |
| `DELETE /api/jobs/:jobId` | `routes/jobs.js` | `verifyToken`, `Job.findByIdAndDelete()` | Deletes job if current admin owns it | `{ message }` | `HrJobs.jsx` |
| `DELETE /api/jobs/:jobId/candidates/:candidateId` | `routes/jobs.js` | `verifyToken`, `Candidate.findOne()`, `Candidate.findByIdAndDelete()` | Deletes candidate record for the given job | `{ message, candidateId }` | `HrCandidates.jsx` |
| `POST /api/upload-resume` | `Backend/Backend/PDP_Backend/server.js` | Multer, `pdf-extraction`, `Job`, Axios, `crypto`, `Candidate`, `utils/email.js` | Reads uploaded PDF and job, writes candidate, optionally writes `interviewToken`, optionally sends email | `{ message, candidateId }` | `JobApplication.jsx` |
| `GET /api/interview/verify/:token` | `server.js` | `Candidate.findOne()`, `Candidate.findByIdAndUpdate()` | Reads candidate by token and resets interview-related fields | `{ isValid, candidateName }` | `public/InterviewRoom.jsx` |
| `POST /api/interview/proctoring/:token` | `server.js` | `Candidate.findOne()`, normalizers | Appends `proctoringEvents` and/or overwrites `proctoringSummary` | `{ success, recorded, summarySaved }` | `utils/proctoring/eventReporter.js` |
| `POST /api/interview/snapshot/:token` | `server.js` | `Candidate.findOne()`, snapshot validator | Overwrites `interviewSnapshot` | `{ success, capturedAt }` | `utils/proctoring/eventReporter.js` |
| `POST /api/interview/chat` | `server.js` | `Candidate`, Gemini SDK, `p-queue` | Saves transcript, generates questions, increments question index, triggers background evaluation | `{ nextQuestion, isInterviewComplete, finalScore, strengths, weaknesses }` | `public/InterviewRoom.jsx` |
| `GET /api/interview/score/:token` | `server.js` | `Candidate.findOne()` | Reads evaluation fields from candidate | `{ status, score, questionFeedback, overallSummary, strengths, weaknesses, finalRecommendation }` or `{ status: "pending" }` | `public/InterviewRoom.jsx` |

## Database / Schema Connectivity

### Model-Level Connectivity

| Model / Schema File | Relationships | Written By | Read By | Main Purpose |
|---|---|---|---|---|
| `Backend/Backend/PDP_Backend/models/HRAdmin.js` | No explicit Mongoose refs except auth ownership through `Job.adminId` | `routes/auth.js` register, forgot-password, reset-password | `routes/auth.js` login and password flows | HR account storage. |
| `Backend/Backend/PDP_Backend/models/Job.js` | `adminId` references `HRAdmin` | `routes/jobs.js` create and update | `routes/jobs.js` public listing, details, dashboard; `server.js` upload-resume job validation | Stores job metadata and ownership. |
| `Backend/Backend/PDP_Backend/models/Candidate.js` | `appliedJobId` references `Job` | `server.js` upload-resume, verify, chat, proctoring, snapshot, evaluation; `routes/jobs.js` delete | `routes/jobs.js` dashboard and candidates; `server.js` verify/chat/score; `HrCandidates.jsx` review page | Central candidate record from application to final review. |

### Candidate Field-Level Connectivity

| Candidate Field(s) | Written In | Read In | What It Supports |
|---|---|---|---|
| `name`, `email`, `phone`, `appliedJobId` | `Backend/Backend/PDP_Backend/server.js` in `POST /api/upload-resume` | `HrDashboard.jsx`, `HrCandidates.jsx`, `public/InterviewRoom.jsx` | Candidate identity and job linkage. |
| `resumeText` | `server.js` after `pdf-extraction` | `server.js` Gemini question generation and evaluation | Resume-based question generation and evaluation context. |
| `atsMatchScore` | `server.js` after Python ATS response | `routes/jobs.js` dashboard stats and candidate leaderboard; `HrDashboard.jsx`; `HrCandidates.jsx` | ATS score display and shortlist decision. |
| `interviewToken` | `server.js` when `aiScore >= 50` | `server.js` verify/chat/score/proctoring/snapshot routes | Secure interview-link verification. |
| `preGeneratedQuestions`, `currentQuestionIndex` | `server.js` during `/api/interview/chat` | same handler | Tracks generated questions and which one is next. |
| `interviewTranscript[]` | `server.js` during `/api/interview/chat` | `server.js` evaluation stage; `HrCandidates.jsx` | Stores question-answer pairs for review and final evaluation. |
| `interviewScore`, `evaluationStatus` | `server.js` background evaluation and score polling | `public/InterviewRoom.jsx`, `HrCandidates.jsx` | Candidate result page and HR review state. |
| `questionFeedback`, `overallSummary`, `strengths`, `weaknesses`, `finalRecommendation` | `server.js` background Gemini evaluation | `public/InterviewRoom.jsx`, `HrCandidates.jsx` | Final structured interview result. |
| `proctoringEvents[]` | `server.js` in `POST /api/interview/proctoring/:token` | `HrCandidates.jsx` | Raw suspicious-event log for HR review. |
| `proctoringSummary` | `server.js` in `POST /api/interview/proctoring/:token` | `HrCandidates.jsx` | Aggregated warning/critical counts and face-detection count. |
| `interviewSnapshot.imageData`, `interviewSnapshot.capturedAt` | `server.js` in `POST /api/interview/snapshot/:token` | `HrCandidates.jsx` | Stored still frame from interview webcam. |
| `status` | Schema default only in `Candidate.js` | `HrCandidates.jsx` | UI badge. Important note: the main code never changes it from the default `Applied`. |

### Where Transcript, Result, and Proctoring Are Stored

| Item | Storage Location |
|---|---|
| Transcript | `Backend/Backend/PDP_Backend/models/Candidate.js` -> `interviewTranscript[]` |
| Final interview score | `Candidate.interviewScore` |
| Question-wise feedback | `Candidate.questionFeedback[]` |
| Overall summary | `Candidate.overallSummary` |
| Strengths / weaknesses | `Candidate.strengths[]`, `Candidate.weaknesses[]` |
| Final recommendation | `Candidate.finalRecommendation` |
| Proctoring raw events | `Candidate.proctoringEvents[]` |
| Proctoring summary counts | `Candidate.proctoringSummary` |
| Interview face snapshot | `Candidate.interviewSnapshot.imageData` and `capturedAt` |

## Python ATS Service Connectivity

### Actual Connection Path

```text
Frontend/src/app/pages/public/JobApplication.jsx
  -> Frontend/src/app/services/api.js::submitApplication()
  -> Backend/Backend/PDP_Backend/server.js::POST /api/upload-resume
  -> axios.post("http://127.0.0.1:8001/api/match", {
       job_description,
       resume_text
     })
  -> Candidate.atsMatchScore
  -> shortlist token generation and HR dashboard/candidate views
```

### Exact Connectivity

| Question | Answer |
|---|---|
| Where does backend connect to Python ATS server? | `Backend/Backend/PDP_Backend/server.js` inside the `/api/upload-resume` handler. |
| What payload is sent? | `{ job_description: jobExists.description, resume_text: extractedText }` |
| What response shape is expected? | `pythonResponse.data.success` and `pythonResponse.data.match_score` |
| What happens if Python is down? | The backend catches the error, logs a warning, leaves `aiScore = 0`, still saves the candidate, and the candidate does not get shortlisted. |
| Is the Python server code in this repo? | No. There are no `.py` files in this repository. |

## Gemini / AI Integration Connectivity

### Gemini Entry Points

| Purpose | Backend File | Input Data | Output Data | Stored In |
|---|---|---|---|---|
| Question generation | `Backend/Backend/PDP_Backend/server.js` in `/api/interview/chat` | `Candidate.resumeText` truncated to `shortResume` | Array of generated technical questions | `Candidate.preGeneratedQuestions` |
| Final evaluation | `Backend/Backend/PDP_Backend/server.js` background task after interview completion | full `Candidate.interviewTranscript`, `shortResume`, candidate name | JSON with `score`, `questionFeedback`, `overallSummary`, `strengths`, `weaknesses`, `finalRecommendation` | corresponding `Candidate` fields |

### Gemini Model and Fallback Flow

- Gemini SDK is imported in `Backend/Backend/PDP_Backend/server.js`.
- Shared helper: `callGeminiWithModelFallback({ modelOptionsArray, chatOptions, prompt })`.
- Question generation model order:
  - `gemini-2.5-flash`
  - `gemini-2.5-flash-lite`
  - `gemini-1.5-flash`
- Evaluation model order:
  - `gemini-2.5-pro`
  - `gemini-2.5-flash`
  - `gemini-2.5-flash-lite`
- Rate limiting is controlled with `p-queue` in `server.js`.
- If JSON parsing fails, the backend falls back to hardcoded questions or fallback evaluation values.

## Email / SMTP Connectivity

| Trigger | Frontend Origin | Backend Trigger File | Email Transport File | Data Used | Result |
|---|---|---|---|---|---|
| Shortlisted candidate interview link | `Frontend/src/app/pages/public/JobApplication.jsx` | `Backend/Backend/PDP_Backend/server.js` in `POST /api/upload-resume` | `Backend/Backend/PDP_Backend/utils/email.js` | candidate email, generated `secureToken`, job title, `CLIENT_URL` or hardcoded `http://localhost:3000/interview/<token>` | Sends interview magic link email. |
| HR forgot password | `Frontend/src/app/pages/hr/HrForgotPassword.jsx` | `Backend/Backend/PDP_Backend/routes/auth.js` | `utils/email.js` | admin email, generated reset token, `CLIENT_URL` | Sends password reset link email. |

### SMTP Variables Used

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SENDER_EMAIL`

## Proctoring and Monitoring Connectivity

### Main Application Proctoring Path

```text
Frontend/src/app/pages/public/InterviewRoom.jsx
  -> useInterviewProctoring({ token, videoRef, enabled, interviewComplete })
  -> analyzeFace(predictions, videoWidth)
  -> queueProctoringEvent(token, event)
  -> POST /api/interview/proctoring/:token
  -> saveProctoringSummary(token, summary)
  -> POST /api/interview/proctoring/:token
  -> saveInterviewSnapshot(token, imageData)
  -> POST /api/interview/snapshot/:token
  -> Candidate.proctoringEvents / proctoringSummary / interviewSnapshot
  -> Frontend/src/app/pages/hr/HrCandidates.jsx
```

### What the Main App Detects

| Signal Type | Generated In | Saved By | Reviewed In |
|---|---|---|---|
| `NO_FACE` | `Frontend/src/app/utils/proctoring/faceAnalysis.js` | `Backend/Backend/PDP_Backend/server.js` -> `Candidate.proctoringEvents` | `Frontend/src/app/pages/hr/HrCandidates.jsx` |
| `MULTIPLE_FACES` | same | same | same |
| `LOOKING_AWAY` | same | same | same |
| `TOO_FAR` / `TOO_CLOSE` | same | same | same |
| `TAB_SWITCH` | `Frontend/src/app/hooks/useInterviewProctoring.js` via `visibilitychange` | same | same |
| `WINDOW_BLUR` | `useInterviewProctoring.js` via `window.blur` | same | same |
| `ANALYSIS_ERROR` | `useInterviewProctoring.js` | same | same |
| Snapshot image | `useInterviewProctoring.js` | `POST /api/interview/snapshot/:token` | `HrCandidates.jsx` |

### Standalone Proctoring Project Connectivity

The `interview_face_procturing` folder has its **own** React frontend and **own** Express backend:

```text
interview_face_procturing/src/App.jsx
  -> src/components/Proctoring.jsx
  -> src/utils/faceAnalysis.js
  -> src/utils/eventReporter.js
  -> server/server.js or server/server-advanced.js
  -> in-memory proctorEvents / proctorSessions
```

This path is **not** called by the main `Frontend/src/app/routes.jsx` app.

## End-to-End Data Flow

### 1. Job Publishing Flow

```text
HrLogin.jsx
  -> POST /api/auth/login
  -> JWT cookie set
  -> HrJobs.jsx
  -> POST /api/jobs
  -> Job model
  -> JobBoard.jsx reads GET /api/jobs
```

### 2. Candidate Application and ATS Flow

```text
JobBoard.jsx
  -> navigate("/jobs/:jobId")
  -> JobDescription.jsx
  -> navigate("/jobs/:jobId/apply")
  -> JobApplication.jsx
  -> api.submitApplication(FormData)
  -> Backend server.js /api/upload-resume
  -> Job.findById(jobId)
  -> pdf-extraction(req.file.buffer)
  -> axios POST 127.0.0.1:8001/api/match
  -> Candidate.save({
       name, email, phone, appliedJobId,
       resumeText, atsMatchScore, interviewToken?
     })
  -> if atsMatchScore >= 50:
       transporter.sendMail(interview link)
```

### 3. Interview Flow

```text
Candidate opens /interview/:token
  -> public/InterviewRoom.jsx
  -> GET /api/interview/verify/:token
  -> server.js resets interview state in Candidate document
  -> webcam + speech recognition + proctoring start
  -> candidate answer
  -> POST /api/interview/chat
  -> transcript save in Candidate.interviewTranscript
  -> if needed, Gemini generates questions
  -> currentQuestionIndex increments
  -> after last question:
       evaluationStatus = pending
       background Gemini evaluation starts
  -> InterviewRoom.jsx polls GET /api/interview/score/:token
  -> candidate sees final report
```

### 4. Proctoring Flow

```text
public/InterviewRoom.jsx
  -> useInterviewProctoring.js
  -> TensorFlow face detector estimates faces
  -> faceAnalysis.js generates alerts
  -> eventReporter.js batches and sends events
  -> server.js writes Candidate.proctoringEvents
  -> summary sync writes Candidate.proctoringSummary
  -> snapshot sync writes Candidate.interviewSnapshot
```

### 5. HR Review Flow

```text
HrDashboard.jsx
  -> GET /api/jobs/stats/dashboard
  -> aggregate Job + Candidate data

HrCandidates.jsx
  -> GET /api/jobs/:jobId/candidates
  -> Candidate array sorted by atsMatchScore desc
  -> expand candidate row
  -> render transcript, Gemini evaluation,
     proctoring summary, raw events, snapshot
```

## How Pages and Modules Connect to Each Other

### Candidate Journey

1. `Frontend/src/main.jsx` mounts `Frontend/src/app/App.jsx`.
2. `App.jsx` loads `Frontend/src/app/routes.jsx`.
3. `/jobs` loads `Frontend/src/app/pages/public/JobBoard.jsx`.
4. A job card routes to `Frontend/src/app/pages/public/JobDescription.jsx`.
5. Apply routes to `Frontend/src/app/pages/public/JobApplication.jsx`.
6. Submission goes through `Frontend/src/app/services/api.js` to `Backend/Backend/PDP_Backend/server.js`.
7. If shortlisted, SMTP email points the candidate to `/interview/:token`.
8. `/interview/:token` loads `Frontend/src/app/pages/public/InterviewRoom.jsx`.
9. `InterviewRoom.jsx` directly calls backend verify/chat/score endpoints and also mounts `useInterviewProctoring.js`.
10. Final result appears in the same page, and the same stored data later appears inside `HrCandidates.jsx`.

### HR Journey

1. `/hr/login`, `/hr/register`, `/hr/forgot-password`, and `/hr/reset-password/:token` use the forms in `Frontend/src/app/pages/hr/*`.
2. Successful login sets the JWT cookie in `Backend/Backend/PDP_Backend/routes/auth.js`.
3. `Frontend/src/app/components/ProtectedRoute.jsx` validates auth by calling `GET /api/jobs/stats/dashboard`.
4. `/hr/dashboard` loads `HrDashboard.jsx` for analytics.
5. `/hr/jobs` loads `HrJobs.jsx` for create/edit/delete flows.
6. Candidate review from a selected job loads `HrCandidates.jsx`.
7. `HrCandidates.jsx` is the final connected review surface for ATS score, interview score, transcript, question feedback, proctoring, and snapshot.

## Where Each Critical Feature Is Connected

| Critical Feature | Exact Frontend File(s) | Exact Backend File(s) | Database / Storage | Notes |
|---|---|---|---|---|
| ATS score checker | `Frontend/src/app/pages/public/JobApplication.jsx`, `Frontend/src/app/pages/hr/HrDashboard.jsx`, `Frontend/src/app/pages/hr/HrCandidates.jsx` | `Backend/Backend/PDP_Backend/server.js`, `Backend/Backend/PDP_Backend/routes/jobs.js` | `Candidate.atsMatchScore` in `models/Candidate.js` | Score is calculated during resume upload and later shown on HR pages. |
| Python server connection | none in frontend directly | `Backend/Backend/PDP_Backend/server.js` | no in-repo Python storage | Backend posts to `http://127.0.0.1:8001/api/match`; Python code is missing from this repo. |
| Resume parsing | `Frontend/src/app/pages/public/JobApplication.jsx`, `Frontend/src/app/services/api.js` | `Backend/Backend/PDP_Backend/server.js` | `Candidate.resumeText` | Multer reads the PDF and `pdf-extraction` converts it to text. |
| Shortlist logic | indirect from `JobApplication.jsx` | `Backend/Backend/PDP_Backend/server.js` | `Candidate.interviewToken`, `Candidate.atsMatchScore` | Only candidates with `aiScore >= 50` get a token and interview email. |
| Gemini question generation | `Frontend/src/app/pages/public/InterviewRoom.jsx` | `Backend/Backend/PDP_Backend/server.js` | `Candidate.preGeneratedQuestions`, `Candidate.currentQuestionIndex` | Happens in `/api/interview/chat` when generated questions are still empty. |
| Gemini evaluation | `Frontend/src/app/pages/public/InterviewRoom.jsx`, `Frontend/src/app/pages/hr/HrCandidates.jsx` | `Backend/Backend/PDP_Backend/server.js` | `Candidate.interviewScore`, `questionFeedback`, `overallSummary`, `strengths`, `weaknesses`, `finalRecommendation` | Runs asynchronously after last interview answer. |
| Transcript save flow | `Frontend/src/app/pages/public/InterviewRoom.jsx` | `Backend/Backend/PDP_Backend/server.js` | `Candidate.interviewTranscript[]` | Each candidate answer is pushed into Mongo before next question logic continues. |
| Interview token / link verification | email opens `/interview/:token` in `Frontend/src/app/pages/public/InterviewRoom.jsx` | `Backend/Backend/PDP_Backend/server.js` | `Candidate.interviewToken` | Verification also resets interview session state for that candidate. |
| Email sending | `Frontend/src/app/pages/public/JobApplication.jsx`, `Frontend/src/app/pages/hr/HrForgotPassword.jsx` | `Backend/Backend/PDP_Backend/server.js`, `Backend/Backend/PDP_Backend/routes/auth.js`, `Backend/Backend/PDP_Backend/utils/email.js` | SMTP transport | Used for shortlist emails and password reset emails. |
| Proctoring snapshot / event logging | `Frontend/src/app/pages/public/InterviewRoom.jsx`, `Frontend/src/app/hooks/useInterviewProctoring.js`, `Frontend/src/app/utils/proctoring/eventReporter.js` | `Backend/Backend/PDP_Backend/server.js` | `Candidate.proctoringEvents`, `Candidate.proctoringSummary`, `Candidate.interviewSnapshot` | This is the live app path, not the standalone `interview_face_procturing` backend. |
| Final result generation | `Frontend/src/app/pages/public/InterviewRoom.jsx` | `Backend/Backend/PDP_Backend/server.js` | `Candidate` evaluation fields | Candidate polls until `evaluationStatus` becomes `complete`. |
| HR review dashboard | `Frontend/src/app/pages/hr/HrDashboard.jsx`, `Frontend/src/app/pages/hr/HrCandidates.jsx` | `Backend/Backend/PDP_Backend/routes/jobs.js` | `Job`, `Candidate` | Dashboard is summary-level; candidate page is evidence-level. |

## Environment Variables and Setup

### Main Frontend

| Variable | Used In | Purpose |
|---|---|---|
| `VITE_API_URL` | `Frontend/src/app/services/api.js`, `Frontend/src/app/utils/proctoring/eventReporter.js` | Base URL for backend API helpers and proctoring network requests. |

Important note: `Frontend/src/app/pages/public/InterviewRoom.jsx` currently hardcodes `http://localhost:8000` and does not use `VITE_API_URL` for verify/chat/score calls.

### Main Backend

| Variable | Used In | Purpose |
|---|---|---|
| `MONGO_URI` | `Backend/Backend/PDP_Backend/server.js`, `test-token.js` | MongoDB connection string. |
| `JWT_SECRET` | `routes/auth.js`, `middleware/verifyToken.js` | Sign and verify HR admin JWTs. |
| `CLIENT_URL` | `server.js`, `routes/auth.js` | Used in CORS and reset-link construction. |
| `SMTP_HOST` | `utils/email.js` | SMTP host. |
| `SMTP_PORT` | `utils/email.js` | SMTP port. |
| `SMTP_USER` | `utils/email.js` | SMTP username. |
| `SMTP_PASS` | `utils/email.js` | SMTP password. |
| `SENDER_EMAIL` | `server.js`, `routes/auth.js` | From-address for emails. |
| `GEMINI_MAIN_KEY` | `server.js` | Runtime Gemini API key. |
| `PORT` | `server.js` | Backend port, default `8000`. |
| `NODE_ENV` | `routes/auth.js` | Controls secure cookie behavior. |

### Standalone Proctoring Project

| Variable | Used In | Purpose |
|---|---|---|
| `VITE_API_URL` | `interview_face_procturing/.env.example` and docs | Prototype frontend API URL. |
| `PORT` | `interview_face_procturing/server/server.js`, `server-advanced.js` | Prototype backend port, default `5000`. |
| `JWT_SECRET` | `interview_face_procturing/server/auth.js` | Standalone prototype JWT signing. |
| `MONGODB_URI` | `interview_face_procturing/server/database.js` example | Optional Mongo connection for the standalone prototype. |

## Run Instructions

### 1. Run the Main Frontend

```bash
cd Frontend
npm install
npm run dev
```

This starts Vite on port `3000` because `Frontend/vite.config.js` sets `strictPort: true` and `port: 3000`.

### 2. Run the Main Backend

```bash
cd Backend/Backend/PDP_Backend
npm install
npm run dev
```

This starts the Express backend on port `8000` unless `PORT` overrides it.

### 3. Provide MongoDB

Run Mongo locally or use Atlas, then set `MONGO_URI`.

### 4. Provide the External Python ATS Service

The backend expects:

```text
POST http://127.0.0.1:8001/api/match
```

Expected request body:

```json
{
  "job_description": "job text",
  "resume_text": "resume text"
}
```

Expected response shape:

```json
{
  "success": true,
  "match_score": 78
}
```

If this service is absent, applications still save, but ATS score remains `0` and no shortlist email is sent.

### 5. Provide SMTP and Gemini

For the full shortlist and interview flow to work:

- SMTP must be configured, otherwise shortlist email sending will fail.
- `GEMINI_MAIN_KEY` must be configured, otherwise question generation and evaluation will fail.

### 6. Optional: Run the Standalone Proctoring Prototype

```bash
cd interview_face_procturing
npm install
npm run dev
```

That launches its own frontend and backend and is separate from the main routed app.

## Viva Questions with Exact File References

| Viva Question | Short Answer | Exact File References |
|---|---|---|
| Where is frontend routing defined? | In the React router config. | `Frontend/src/app/routes.jsx` |
| Which file actually handles the live interview page? | The public interview page, not the legacy one. | `Frontend/src/app/pages/public/InterviewRoom.jsx`, routed from `Frontend/src/app/routes.jsx` |
| Which interview page is legacy or unused? | The older interview page under `pages/interview`. | `Frontend/src/app/pages/interview/InterviewRoom.jsx` |
| Where does the candidate application start? | On the application form page and shared API client. | `Frontend/src/app/pages/public/JobApplication.jsx`, `Frontend/src/app/services/api.js` |
| Where is the resume PDF parsed? | Inside the backend upload handler. | `Backend/Backend/PDP_Backend/server.js` |
| Where does the backend connect to the Python ATS service? | In the upload handler using Axios to `127.0.0.1:8001/api/match`. | `Backend/Backend/PDP_Backend/server.js` |
| Where is the shortlist logic implemented? | The backend checks `aiScore >= 50`, generates `secureToken`, and emails the link. | `Backend/Backend/PDP_Backend/server.js`, `Backend/Backend/PDP_Backend/models/Candidate.js` |
| Where is Gemini used to generate interview questions? | In the `/api/interview/chat` handler before serving technical questions. | `Backend/Backend/PDP_Backend/server.js` |
| Where is Gemini used to evaluate the final interview? | In the background evaluation stage after interview completion. | `Backend/Backend/PDP_Backend/server.js` |
| Where is the transcript stored? | In the candidate document. | `Backend/Backend/PDP_Backend/models/Candidate.js`, written from `Backend/Backend/PDP_Backend/server.js` |
| Where are final score and recommendation stored? | In candidate evaluation fields. | `Backend/Backend/PDP_Backend/models/Candidate.js`, written from `Backend/Backend/PDP_Backend/server.js` |
| Where are proctoring events and snapshot stored? | In the same candidate document. | `Backend/Backend/PDP_Backend/models/Candidate.js`, written from `Backend/Backend/PDP_Backend/server.js`, triggered by `Frontend/src/app/hooks/useInterviewProctoring.js` |
| Where is email sending triggered? | In shortlist email flow and password reset flow. | `Backend/Backend/PDP_Backend/server.js`, `Backend/Backend/PDP_Backend/routes/auth.js`, `Backend/Backend/PDP_Backend/utils/email.js` |
| Where does HR review the final result? | In the candidate leaderboard detail panel. | `Frontend/src/app/pages/hr/HrCandidates.jsx` |
| Which files connect frontend proctoring to backend persistence? | The hook, reporter utility, and backend ingestion endpoints. | `Frontend/src/app/hooks/useInterviewProctoring.js`, `Frontend/src/app/utils/proctoring/eventReporter.js`, `Backend/Backend/PDP_Backend/server.js` |
| Is the `interview_face_procturing` folder the live app backend? | No, it is a separate standalone codebase. | `interview_face_procturing/src/App.jsx`, `interview_face_procturing/server/server.js`, `interview_face_procturing/server/server-advanced.js` |

## Developer Handoff Notes

- `Frontend/src/app/pages/public/InterviewRoom.jsx` bypasses `Frontend/src/app/services/api.js` and hardcodes `http://localhost:8000` for interview endpoints.
- `Frontend/src/app/services/api.js::hrLogout()` clears `document.cookie` but does not call `POST /api/auth/logout`; that matters because the real auth cookie is `HttpOnly`.
- `Frontend/src/app/services/api.js` still contains interview helpers that do not match the live interview page. The routed page uses direct `axios` instead.
- `Frontend/src/app/services/mockApi.js` is dead code in the current runtime path.
- `Frontend/src/app/pages/hr/HrJobs.jsx` lists jobs using the public `GET /api/jobs` endpoint, so the list is not admin-scoped even though create/update/delete use authenticated routes.
- `Backend/Backend/PDP_Backend/routes/jobs.js` returns `recentActivity` candidate objects, but `HrDashboard.jsx` expects `a.jobTitle`, which is never populated, so the UI falls back to “Linked role information unavailable”.
- `Candidate.status` supports `Applied`, `Shortlisted`, and `Rejected`, but the main code never updates it beyond the default `Applied`.

## Summary Answer for Viva

If asked to explain the project end-to-end in one pass:

1. `Frontend/src/app/routes.jsx` connects candidates to the public job flow and HR users to the protected HR flow.
2. Public applications go from `JobApplication.jsx` through `Frontend/src/app/services/api.js` into `Backend/Backend/PDP_Backend/server.js`.
3. The backend parses the PDF, calls the external Python ATS server, stores the candidate in MongoDB, and only then generates and emails an interview token if the score is high enough.
4. The interview link opens `Frontend/src/app/pages/public/InterviewRoom.jsx`, which verifies the token, starts webcam, speech recognition, and browser-side proctoring, and sends answers to `/api/interview/chat`.
5. `Backend/Backend/PDP_Backend/server.js` stores transcript entries, generates Gemini questions, evaluates the final transcript with Gemini, and stores the final score plus structured feedback back into the `Candidate` document.
6. Proctoring events, summary counts, and one snapshot are also stored in the same `Candidate` document.
7. HR later opens `Frontend/src/app/pages/hr/HrCandidates.jsx`, which pulls the candidate record through `GET /api/jobs/:jobId/candidates` and displays ATS score, interview score, transcript, question feedback, proctoring review, and snapshot in one place.

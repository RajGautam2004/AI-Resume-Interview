# AI Screener Project (Backend)

An Intelligent Applicant Tracking System (ATS) and AI Interviewer Backend.

## Overview
This backend powers an automated recruitment platform that parses candidate resumes, computes matching scores against job descriptions using a Python microservice, and seamlessly orchestrates automated technical interviews via Google Gemini AI for candidates who pass the initial screening threshold.

## Key Features & Impactful Resume Points

### 1. Robust AI-Driven Recruitment Pipeline
- **Microservices Architecture:** Engineered an Express.js backend that interfaces with a Python AI microservice (via Axios) to compute real-time application-to-JD match scores using natural language processing.
- **Automated Document Parsing:** Implemented multi-part file-handling using `Multer` and `pdf-extraction` to parse in-memory candidate PDFs seamlessly without overhead disk I/O operations.

### 2. Autonomous Generative AI Interviewer
- **Gemini 2.5 Flash Integration:** Developed a dynamic context-aware technical interviewing system using the updated Google Generative AI SDK, maintaining conversation state and enforcing configurable interview lengths (e.g., 7-question constraints).
- **Automated Candidate Assessment:** The conversational model generates automated post-interview scoring, strengths, and weakness reports based on real-time candidate data.

### 3. Automated Magic Link & Workflow Trigger
- **Secure Auto-Shortlisting:** Programmed the backend to dynamically generate Cryptographically-secure Magic Links (`crypto`) for candidates surpassing a predefined ATS threshold.
- **Immediate Candidate Notification:** Integrated `Nodemailer` for seamless SMTP email deliveries to candidates the moment their resume is successfully shortlisted.

### 4. Resilient Security & Optimization
- **Traffic Throttling & DDoS Prevention:** Enforced IP-based upload rate-limiting using `express-rate-limit` to heavily restrict spam and prevent malicious API exploitation.
- **Graceful Error Handling:** Handled potential points of failure (e.g., Python AI server timeouts) dynamically, gracefully failing open to ensure candidates can still upload profiles.

## Tech Stack
- **Environment:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **AI Integration:** Google Generative AI (`gemini-2.5-flash`)
- **Key Libraries:** `crypto`, `multer`, `pdf-extraction`, `nodemailer`, `axios`, `express-rate-limit`, `cors`

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-extraction');
const cookieParser = require('cookie-parser');

const crypto = require('crypto');         // <-- NEW: Secure token generator
const axios = require('axios'); // <-- NEW: To talk to Python

const PQueue = require('p-queue').default;
const queue = new PQueue({
  interval: 60000,
  intervalCap: 9 // safe buffer under 10 RPM limit
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function retryWithBackoff(fn, retries = 3) {
  let delay = 2000;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err; // throw on last attempt
      if (!err.message.includes('429')) throw err; // only backoff for 429 quota limits
      console.log(`⏳ 429 Quota Exceeded. Retrying in ${delay / 1000}s...`);
      await sleep(delay);
      delay *= 2;
    }
  }
}

// Import your Models and Routes
const Candidate = require('./models/Candidate');
const Job = require('./models/Job');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');

// 1. INITIALIZE THE APP FIRST
const app = express();
app.set('trust proxy', 1); // for railways
// 2. NOW APPLY YOUR MIDDLEWARE
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser()); 

// 3. DEFINE YOUR ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => console.log("Database Connection Failed: ", err));

// ==========================================
// CONFIGURING EMAIL TRANSPORTER
// ==========================================
const transporter = require('./utils/email');

// ==========================================
// CONFIGURING MULTER (The File Interceptor)
// ==========================================
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const rateLimit = require('express-rate-limit');

// Limit IP addresses to 5 resume uploads every 15 minutes
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { error: "Too many resumes uploaded from this IP. Please try again in 15 minutes." }
});
// ==========================================
// THE API: Upload PDF, Extract Text & Email Link
// ==========================================
app.post('/api/upload-resume',uploadLimiter, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded!" });
    }

    if (!req.body.jobId) {
      return res.status(400).json({ error: "Job ID is required to apply!" });
    }

    // Verify the job exists in the database
    const jobExists = await Job.findById(req.body.jobId);
    if (!jobExists) {
      return res.status(404).json({ error: "The specified Job ID does not exist!" });
    }
    // temporary
    console.log("DEBUG: What is pdfParse?", typeof pdfParse, pdfParse);
    // 1. Parse the PDF
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    console.log("SUCCESS! Extracted text preview: \n", extractedText.substring(0, 100) + "...\n");
    // 2. Generate the Secure Magic Link Token
    // ==========================================
    // NEW: THE AI BRIDGE 
    // Send the text to the Python Microservice
    // ==========================================
    let aiScore = 0; 
    try {
      console.log("Sending data to Python AI Server...");
      const pythonResponse = await axios.post('http://127.0.0.1:8001/api/match', {
        job_description: jobExists.description, // We grab the JD from the database
        resume_text: extractedText              // We send the parsed PDF text
      });
      
      if (pythonResponse.data.success) {
        aiScore = pythonResponse.data.match_score;
        console.log(`AI Score Received: ${aiScore}%`);
      }
    } catch (aiError) {
      console.error("Warning: Python AI Server is down or failed.", aiError.message);
      // We don't crash the whole upload if Python is down, we just leave the score at 0
    }

    // ==========================================
    // INTERVIEW GATEKEEPER LOGIC
    // ==========================================
    let secureToken = undefined;
    
    // Only generate the token if the candidate scored 50% or higher
    if (aiScore >= 50) {
      secureToken = crypto.randomBytes(16).toString('hex');
    }

    // 3. Save Candidate to Database
    const newCandidate = new Candidate({
      name: req.body.name || "Test Candidate",
      email: req.body.email || "test@example.com",
      phone: req.body.phone || "9988776655",
      appliedJobId: req.body.jobId, 
      resumeText: extractedText,
      interviewToken: secureToken, // undefined if < 50
      atsMatchScore: aiScore,
      status: aiScore >= 50 ? 'Shortlisted' : 'Applied'
    });

    await newCandidate.save();

    // 4. Send the Magic Link via Email ONLY if they passed
    if (aiScore >= 50) {
      const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');
      const interviewUrl = `${clientUrl}/interview/${secureToken}`;

      console.log('Preparing ATS interview invite email:', {
        to: newCandidate.email,
        candidateId: String(newCandidate._id),
        interviewUrl
      });
      
      const mailOptions = {
        from: `"${transporter.senderName}" <${transporter.senderEmail}>`,
        replyTo: transporter.senderEmail,
        to: newCandidate.email, 
        subject: `HireAI Interview Invitation - ${jobExists.title}`,
        text: `Hello ${newCandidate.name},\n\nCongratulations. You have cleared the ATS screening for ${jobExists.title}.\n\nUse this secure interview link to start your HireAI interview:\n${interviewUrl}\n\nBest regards,\n${jobExists.companyName || 'Hiring Team'}\nHireAI`
      };

      const mailInfo = await transporter.sendMail(mailOptions);
      console.log('ATS interview invite email sent:', {
        to: newCandidate.email,
        candidateId: String(newCandidate._id),
        interviewUrl,
        messageId: mailInfo.messageId,
        response: mailInfo.response,
        accepted: mailInfo.accepted,
        rejected: mailInfo.rejected
      });

      res.status(201).json({
        message: "Resume successfully parsed, saved, and interview link emailed.",
        candidateId: newCandidate._id
      });
    } else {
      res.status(201).json({
        message: "Resume successfully parsed and saved. Score did not meet the interview threshold.",
        candidateId: newCandidate._id
      });
    }

  } catch (error) {
    console.error("Error processing application: ", error);
    res.status(500).json({ error: "Failed to process the application and send email." });
  }
});

// ==========================================
// INTERVIEW VERIFICATION ROUTE
// ==========================================
app.get('/api/interview/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const candidate = await Candidate.findOne({ interviewToken: token });
    
    if (!candidate) {
      return res.status(404).json({ isValid: false, message: "Invalid or expired token." });
    }

    // ==========================================
    // RESET INTERVIEW SESSION STATE
    // Ensures every page load starts with a clean slate.
    // Prevents old Q&A data from corrupting a new session.
    // ==========================================
    await Candidate.findByIdAndUpdate(candidate._id, {
      $set: {
        preGeneratedQuestions: [],
        currentQuestionIndex:  0,
        interviewTranscript:   [],
        interviewScore:        null,
        evaluationStatus:      null,
        questionFeedback:      [],
        overallSummary:        null,
        strengths:             [],
        weaknesses:            [],
        finalRecommendation:   null,
        proctoringEvents:      [],
        proctoringSummary: {
          faceDetectionCount: 0,
          warningCount: 0,
          alertCount: 0,
          criticalCount: 0,
          lastUpdatedAt: null
        },
        interviewSnapshot: {
          imageData: null,
          capturedAt: null
        },
        proctoringEvidenceSnapshots: [],
        proctoringAlertState: {
          lastMultipleFacesEvidenceAt: null,
          lastMultipleFacesEmailAt: null
        }
      }
    });
    console.log(`[DB RESET] Session reset for candidate: ${candidate.name} (${candidate._id})`);

    res.status(200).json({ 
      isValid: true, 
      candidateName: candidate.name 
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ isValid: false, error: "Server error during verification." });
  }
});

// ==========================================
// ==========================================
// INTERVIEW GEMINI AI CHAT ROUTE (FIXED)
// ==========================================

app.post('/api/interview/proctoring/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const candidate = await Candidate.findOne({ interviewToken: token }).select('_id name');

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found. Invalid token.' });
    }

    const rawEvents = Array.isArray(req.body.events) ? req.body.events : [req.body];
    const events = rawEvents
      .map(normalizeProctoringEvent)
      .filter(Boolean)
      .slice(0, 25);
    const summary = req.body.summary ? normalizeProctoringSummary(req.body.summary) : null;

    if (events.length === 0 && !summary) {
      return res.status(400).json({ error: 'At least one valid proctoring event or summary is required.' });
    }

    const update = {};

    if (events.length > 0) {
      update.$push = {
        proctoringEvents: {
          $each: events,
          $slice: -200
        }
      };
    }

    if (summary) {
      update.$set = {
        proctoringSummary: summary
      };
    }

    await Candidate.findByIdAndUpdate(candidate._id, update);

    console.log(`[DB WRITE] Saved ${events.length} proctoring event(s) for ${candidate.name}${summary ? ' with summary' : ''}`);

    res.status(201).json({
      success: true,
      recorded: events.length,
      summarySaved: Boolean(summary)
    });
  } catch (error) {
    console.error('Proctoring ingestion error:', error.message);
    res.status(500).json({ error: 'Failed to record proctoring events.' });
  }
});

const responseCache = new Map(); // Global in-memory cache for repeated answers
const TOTAL_INTERVIEW_QUESTION_COUNT = 3;
const INTRO_QUESTION = "Can you briefly introduce your background?";
const GENERATED_INTERVIEW_QUESTION_COUNT = Math.max(TOTAL_INTERVIEW_QUESTION_COUNT - 1, 1);
const MAX_SNAPSHOT_DATA_LENGTH = 250000;
const MAX_PROCTORING_EVIDENCE_ITEMS = 4;
const HR_MULTIPLE_FACES_ALERT_COOLDOWN_MS = 10 * 60 * 1000;

const PROCTORING_EVENT_SEVERITY = {
  TAB_SWITCH: 'critical',
  WINDOW_BLUR: 'warning',
  MULTIPLE_FACES: 'critical',
  NO_FACE: 'critical',
  LOOKING_AWAY: 'warning',
  TOO_FAR: 'warning',
  TOO_CLOSE: 'info',
  WINDOW_FOCUS: 'info',
  ANALYSIS_ERROR: 'warning'
};

function normalizeProctoringTimestamp(rawTimestamp) {
  const parsedTimestamp =
    typeof rawTimestamp === 'number'
      ? new Date(rawTimestamp)
      : rawTimestamp
        ? new Date(rawTimestamp)
        : new Date();

  return Number.isNaN(parsedTimestamp.getTime()) ? new Date() : parsedTimestamp;
}

function getSafeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function normalizeProctoringEvent(rawEvent = {}) {
  const eventType = String(rawEvent.eventType || rawEvent.event || '').trim().toUpperCase();

  if (!eventType) {
    return null;
  }

  return {
    eventType,
    severity: PROCTORING_EVENT_SEVERITY[eventType] || rawEvent.severity || 'info',
    message: rawEvent.message || null,
    timestamp: normalizeProctoringTimestamp(rawEvent.timestamp),
    details: getSafeObject(rawEvent.details) || getSafeObject(rawEvent.metadata) || {}
  };
}

function normalizeProctoringSummary(rawSummary = {}) {
  const toSafeNumber = (value) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : 0;
  };

  return {
    faceDetectionCount: toSafeNumber(rawSummary.faceDetectionCount),
    warningCount: toSafeNumber(rawSummary.warningCount),
    alertCount: toSafeNumber(rawSummary.alertCount),
    criticalCount: toSafeNumber(rawSummary.criticalCount),
    lastUpdatedAt: new Date()
  };
}

function extractValidSnapshotImage(rawImageData) {
  const imageData = typeof rawImageData === 'string' ? rawImageData.trim() : '';
  if (!imageData.startsWith('data:image/')) {
    return null;
  }

  if (imageData.length > MAX_SNAPSHOT_DATA_LENGTH) {
    return null;
  }

  return imageData;
}

function normalizeInterviewSnapshot(rawSnapshot = {}) {
  const imageData = extractValidSnapshotImage(rawSnapshot.imageData);

  if (!imageData) {
    return null;
  }

  return {
    imageData,
    capturedAt: new Date()
  };
}

function normalizeProctoringEvidenceSnapshot(rawSnapshot = {}) {
  const imageData = extractValidSnapshotImage(rawSnapshot.imageData);
  const eventType = String(rawSnapshot.eventType || rawSnapshot.event || '').trim().toUpperCase();

  if (!imageData || !eventType) {
    return null;
  }

  const trimmedMessage = typeof rawSnapshot.message === 'string' ? rawSnapshot.message.trim() : '';

  return {
    eventType,
    message: trimmedMessage || null,
    imageData,
    capturedAt: normalizeProctoringTimestamp(rawSnapshot.timestamp),
    details: getSafeObject(rawSnapshot.details) || getSafeObject(rawSnapshot.metadata) || {}
  };
}

function buildSnapshotAttachment(imageData, filenameBase) {
  const matches = imageData.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!matches) {
    return null;
  }

  const mimeType = matches[1];
  const extension = mimeType.includes('png') ? 'png' : 'jpg';

  return {
    filename: `${filenameBase}.${extension}`,
    content: matches[2],
    encoding: 'base64',
    contentType: mimeType
  };
}

async function sendMultipleFacesAlertEmail({ candidate, job, evidenceSnapshot }) {
  const recruiterEmail = job?.hrEmail || job?.adminId?.email || null;

  if (!candidate || !job || !recruiterEmail) {
    return false;
  }

  const companyName = job.companyName || job.adminId?.companyName || 'Hiring Team';
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');
  const recruiterReviewUrl = `${clientUrl}/hr/jobs/${job._id}/candidates`;
  const faceCount = Number(evidenceSnapshot.details?.faceCount) || 0;
  const attachment = buildSnapshotAttachment(
    evidenceSnapshot.imageData,
    `multiple-faces-${candidate._id}-${Date.now()}`
  );
  const mailOptions = {
    from: `"${transporter.senderName}" <${transporter.senderEmail}>`,
    replyTo: transporter.senderEmail,
    to: recruiterEmail,
    subject: `HireAI Proctoring Alert - Multiple faces detected for ${candidate.name}`,
    text:
      `Hello,\n\n` +
      `HireAI detected multiple faces during a live interview session.\n\n` +
      `Candidate: ${candidate.name}\n` +
      `Candidate Email: ${candidate.email}\n` +
      `Role: ${job.title || 'Unknown role'}\n` +
      `Company: ${companyName}\n` +
      `Detected At: ${new Date(evidenceSnapshot.capturedAt).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}\n` +
      `${faceCount > 0 ? `Detected Faces: ${faceCount}\n` : ''}` +
      `${evidenceSnapshot.message ? `Reason: ${evidenceSnapshot.message}\n` : ''}\n` +
      `Review candidate evidence here:\n${recruiterReviewUrl}\n\n` +
      `The captured evidence image is attached to this email.\n\n` +
      `Best regards,\nHireAI`
  };

  if (attachment) {
    mailOptions.attachments = [attachment];
  }

  try {
    const mailInfo = await transporter.sendMail(mailOptions);
    console.log('Multiple faces HR alert email sent:', {
      to: recruiterEmail,
      candidateId: String(candidate._id),
      jobId: String(job._id),
      messageId: mailInfo.messageId,
      accepted: mailInfo.accepted,
      rejected: mailInfo.rejected
    });
    return true;
  } catch (error) {
    console.error('Failed to send multiple faces HR alert email:', error.message);
    return false;
  }
}

app.post('/api/interview/snapshot/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const candidate = await Candidate.findOne({ interviewToken: token }).select('_id name');

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found. Invalid token.' });
    }

    const snapshot = normalizeInterviewSnapshot(req.body);

    if (!snapshot) {
      return res.status(400).json({ error: 'A valid interview snapshot image is required.' });
    }

    await Candidate.findByIdAndUpdate(candidate._id, {
      $set: {
        interviewSnapshot: snapshot
      }
    });

    console.log(`[DB WRITE] Saved interview snapshot for ${candidate.name}`);

    res.status(201).json({
      success: true,
      capturedAt: snapshot.capturedAt
    });
  } catch (error) {
    console.error('Interview snapshot ingestion error:', error.message);
    res.status(500).json({ error: 'Failed to save interview snapshot.' });
  }
});

app.post('/api/interview/evidence/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const candidate = await Candidate.findOne({ interviewToken: token })
      .select('_id name email appliedJobId proctoringAlertState');

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found. Invalid token.' });
    }

    const evidenceSnapshot = normalizeProctoringEvidenceSnapshot(req.body);

    if (!evidenceSnapshot) {
      return res.status(400).json({ error: 'A valid suspicious evidence snapshot is required.' });
    }

    const update = {
      $push: {
        proctoringEvidenceSnapshots: {
          $each: [evidenceSnapshot],
          $slice: -MAX_PROCTORING_EVIDENCE_ITEMS
        }
      }
    };

    if (evidenceSnapshot.eventType === 'MULTIPLE_FACES') {
      update.$set = {
        'proctoringAlertState.lastMultipleFacesEvidenceAt': evidenceSnapshot.capturedAt
      };
    }

    await Candidate.findByIdAndUpdate(candidate._id, update);

    let hrAlertSent = false;

    if (evidenceSnapshot.eventType === 'MULTIPLE_FACES') {
      const lastAlertAt = candidate.proctoringAlertState?.lastMultipleFacesEmailAt
        ? new Date(candidate.proctoringAlertState.lastMultipleFacesEmailAt)
        : null;
      const canSendAlert =
        !lastAlertAt ||
        Number.isNaN(lastAlertAt.getTime()) ||
        Date.now() - lastAlertAt.getTime() >= HR_MULTIPLE_FACES_ALERT_COOLDOWN_MS;

      if (canSendAlert) {
        const job = await Job.findById(candidate.appliedJobId).populate('adminId', 'email companyName');

        if (job) {
          hrAlertSent = await sendMultipleFacesAlertEmail({
            candidate,
            job,
            evidenceSnapshot
          });
        }

        if (hrAlertSent) {
          await Candidate.findByIdAndUpdate(candidate._id, {
            $set: {
              'proctoringAlertState.lastMultipleFacesEmailAt': new Date()
            }
          });
        }
      }
    }

    console.log(`[DB WRITE] Saved ${evidenceSnapshot.eventType} evidence snapshot for ${candidate.name}`);

    res.status(201).json({
      success: true,
      capturedAt: evidenceSnapshot.capturedAt,
      hrAlertSent
    });
  } catch (error) {
    console.error('Proctoring evidence ingestion error:', error.message);
    res.status(500).json({ error: 'Failed to save suspicious evidence snapshot.' });
  }
});

async function callGeminiWithModelFallback({ modelOptionsArray, chatOptions, prompt }) {
  let lastError;
  const apiKey = process.env.GEMINI_MAIN_KEY; // Only ONE API key

  if (!apiKey) throw new Error("GEMINI_MAIN_KEY is not configured.");

  for (let i = 0; i < modelOptionsArray.length; i++) {
    const modelOptions = modelOptionsArray[i];

    try {
      console.log(`\n🤖 Trying Gemini model: '${modelOptions.model}'`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel(modelOptions);

      if (chatOptions) {
        const chat = model.startChat(chatOptions);
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        return response.text();
      } else {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      }
    } catch (error) {
      lastError = error;
      const msg = String(error.message || "").toLowerCase();

      // Rotate models only for rate limits or demand spikes, NOT invalid keys/auth issues
      const shouldRotate =
        msg.includes("429") ||
        msg.includes("503") ||
        msg.includes("quota");

      console.log(`❌ Model '${modelOptions.model}' failed: ${error.message}`);

      if (!shouldRotate) {
        throw error;
      }
    }
  }

  throw new Error(`All fallback models exhausted. Last error: ${lastError?.message || "Unknown error"}`);
}

app.post('/api/interview/chat', async (req, res) => {
  try {
    const candidateMessage = req.body.candidateMessage;
    const chatHistory = req.body.chatHistory;
    const token = req.body.token;
    
    // Look up the candidate using the token from the frontend
    let candidate = await Candidate.findOne({ interviewToken: token });
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found. Invalid token." });
    }
    
    const shortResume = candidate.resumeText ? candidate.resumeText.substring(0, 1000) : "";

    // ==========================================
    // STAGE 0: Save Transcript to Database
    // ==========================================
    if (candidateMessage && candidateMessage.trim() !== "") {
      let previousQuestion = "";
      // If we haven't generated yet, they just answered the intro question
      if (!candidate.preGeneratedQuestions || candidate.preGeneratedQuestions.length === 0) {
        previousQuestion = INTRO_QUESTION;
      } else {
        // They are answering the question we previously served
        if (candidate.currentQuestionIndex > 0) {
          previousQuestion = candidate.preGeneratedQuestions[candidate.currentQuestionIndex - 1];
        } else {
          previousQuestion = candidate.preGeneratedQuestions[0];
        }
      }

      // Check for duplication (best-effort: uses in-memory snapshot fetched at request start)
      const isDuplicate = candidate.interviewTranscript.length > 0 &&
        candidate.interviewTranscript[candidate.interviewTranscript.length - 1].candidateAnswer === candidateMessage;

      if (!isDuplicate) {
        const transcriptEntry = {
          question: previousQuestion,
          candidateAnswer: candidateMessage,
          aiRating: null,
          aiFeedback: null
        };
        // ATOMIC $push — safe against concurrent saves overwriting the array
        await Candidate.findByIdAndUpdate(
          candidate._id,
          { $push: { interviewTranscript: transcriptEntry } },
          { new: false }
        );
        // Keep in-memory copy in sync so duplicate check works within same request
        candidate.interviewTranscript.push(transcriptEntry);
        console.log(`[DB WRITE] Transcript entry saved for ${candidate.name}: "${candidateMessage.substring(0, 60)}..."`);
      } else {
        console.log(`[DB SKIP] Duplicate answer detected for ${candidate.name} — skipping transcript save.`);
      }
    }
    
    // ==========================================
    // STAGE 1: Pre-Generate Questions (Call 1)
    // ==========================================
    if (!candidate.preGeneratedQuestions || candidate.preGeneratedQuestions.length === 0) {
      console.log(`\n======================================`);
      console.log(`🤖 INITIALIZING PRE-GENERATION FOR ${candidate.name}`);
      console.log(`======================================`);
      
      const generationPrompt = `You are an expert HR technical interviewer.
Based on this resume, generate exactly ${GENERATED_INTERVIEW_QUESTION_COUNT} medium-length, resume-based technical interview questions.

Rules:
- Each question must be directly based on a skill, project, internship, tool, or achievement mentioned in the resume.
- Each question must be exactly one sentence and should feel natural when spoken aloud in a real interview.
- Keep each question moderately detailed: not too short, not too long, and ideally around 16 to 28 words.
- Include enough context from the resume so the candidate knows exactly which project, tool, or experience you are referring to.
- Ask one clear technical follow-up in each question.
- Use exactly one sentence per question.
- Do not make the question vague, overly generic, or like a long paragraph.
- Do not ask for a general introduction or background.
- Do not repeat the same topic in multiple questions.

Return ONLY a valid JSON array of ${GENERATED_INTERVIEW_QUESTION_COUNT} strings and nothing else.
Example: ${JSON.stringify(Array.from({ length: GENERATED_INTERVIEW_QUESTION_COUNT }, (_, index) => `Q${index + 1}`))}

Resume:
${shortResume}`;

      const generateModels = [
        { model: "gemini-2.5-flash" },
        { model: "gemini-2.5-flash-lite" },
        { model: "gemini-1.5-flash" }
      ];

      try {
        let generatedText = await queue.add(() => callGeminiWithModelFallback({
          modelOptionsArray: generateModels,
          chatOptions: null,
          prompt: generationPrompt
        }));

        let questions = [];
        const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        }
        
        // Fallback if parsing fails
        if (!questions || questions.length < GENERATED_INTERVIEW_QUESTION_COUNT) throw new Error("JSON generation failed");
        
        candidate.preGeneratedQuestions = questions.slice(0, GENERATED_INTERVIEW_QUESTION_COUNT); // keep in-memory for STAGE 2
      } catch (err) {
        console.error("Failed to generate questions:", err.message);
        candidate.preGeneratedQuestions = [
          "Looking at the projects on your resume, which one best demonstrates your strongest technical contribution, and what exactly did you build in it?",
          "In that same project, what was the most difficult technical problem you solved, and how did you approach the solution?",
          "Among the technologies listed on your resume, which one are you most confident using today, and how have you applied it in practice?"
        ].slice(0, GENERATED_INTERVIEW_QUESTION_COUNT);
      }

      candidate.currentQuestionIndex = 0; // keep in-memory for STAGE 2

      // ATOMIC $set — avoids overwriting transcript that was just $push'd above
      await Candidate.findByIdAndUpdate(candidate._id, {
        $set: {
          preGeneratedQuestions: candidate.preGeneratedQuestions,
          currentQuestionIndex: 0
        }
      });
      console.log(`[DB WRITE] ${candidate.preGeneratedQuestions.length} questions saved for ${candidate.name}, index reset to 0`);
    }

    // ==========================================
    // STAGE 2: Sequentially Serve Questions
    // ==========================================
    const isDone = candidate.currentQuestionIndex >= candidate.preGeneratedQuestions.length;
    let aiResponseText = "";

    if (isDone) {
      aiResponseText = "This concludes the technical portion of our interview. Thank you for your time, the HR team will review your responses and explicitly reach out to you shortly.";
      
      // Mark evaluation as pending BEFORE firing background task (atomic — does not touch transcript)
      await Candidate.findByIdAndUpdate(candidate._id, {
        $set: { evaluationStatus: 'pending' }
      });
      console.log(`[DB WRITE] evaluationStatus set to 'pending' for ${candidate.name}`);

      // ==========================================
      // STAGE 3: Final Background Evaluation (Call 2)
      // ==========================================
      setTimeout(async () => {
        try {
          console.log(`\n[BACKGROUND] Initiating Evaluation for ${candidate.name}...`);
          
          // Re-fetch candidate to ensure we have the absolute final transcript array saved
          const finalCandidateData = await Candidate.findById(candidate._id);
          const transcriptText = finalCandidateData.interviewTranscript.map((entry, idx) => 
            `[Q${idx + 1}] Interviewer: ${entry.question}\n[A${idx + 1}] Candidate: ${entry.candidateAnswer}`
          ).join("\n\n");

          const evalPrompt = `You are an expert technical interviewer. Evaluate the following interview transcript for candidate: ${finalCandidateData.name}.

Resume Summary:
${shortResume}

Full Interview Transcript:
${transcriptText}

Your task is to provide a comprehensive evaluation. Return ONLY a valid JSON object with EXACTLY this schema and no other text:
{
  "score": 85,
  "questionFeedback": [
    {
      "question": "Exact question text",
      "candidateAnswer": "Candidate's answer text",
      "feedback": "Specific, constructive feedback for this answer in 2-3 sentences"
    }
  ],
  "overallSummary": "A 3-4 sentence paragraph summarizing the candidate's overall performance, technical depth, and communication style.",
  "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
  "weaknesses": ["Specific area for improvement 1", "Specific area for improvement 2"],
  "finalRecommendation": "A concise recruiter-style hiring recommendation of 2-3 sentences."
}`;

          const evalModels = [
            { model: "gemini-2.5-pro" },
            { model: "gemini-2.5-flash" },
            { model: "gemini-2.5-flash-lite" }
          ];

          queue.add(async () => {
              const evalText = await callGeminiWithModelFallback({
                modelOptionsArray: evalModels,
                chatOptions: null, 
                prompt: evalPrompt
              });
              
              const jsonMatch = evalText.match(/\{[\s\S]*\}/);
              
              // Safe fallback defaults
              let finalScore = 70;
              let finalQuestionFeedback = [];
              let finalOverallSummary = "The interview has been evaluated.";
              let finalStrengths = [];
              let finalWeaknesses = [];
              let finalRecommendation = "Please review the interview transcript for further details.";

              if (jsonMatch) {
                try {
                  const evalObj = JSON.parse(jsonMatch[0]);
                  finalScore              = evalObj.score              ?? finalScore;
                  finalQuestionFeedback  = evalObj.questionFeedback   ?? finalQuestionFeedback;
                  finalOverallSummary    = evalObj.overallSummary     ?? finalOverallSummary;
                  finalStrengths         = evalObj.strengths          ?? finalStrengths;
                  finalWeaknesses        = evalObj.weaknesses         ?? finalWeaknesses;
                  finalRecommendation    = evalObj.finalRecommendation ?? finalRecommendation;
                } catch (parseErr) {
                  console.error("[BACKGROUND] JSON parse failed, using fallback values.", parseErr.message);
                }
              }

              // Persist all fields atomically
              await Candidate.findByIdAndUpdate(candidate._id, {
                interviewScore:      finalScore,
                questionFeedback:    finalQuestionFeedback,
                overallSummary:      finalOverallSummary,
                strengths:           finalStrengths,
                weaknesses:          finalWeaknesses,
                finalRecommendation: finalRecommendation,
                evaluationStatus:    'complete'
              });
              console.log(`[BACKGROUND] ✅ Full evaluation complete. Score: ${finalScore}`);
          }).catch(async (evalErr) => {
              console.error("[BACKGROUND] Evaluation queue failed: ", evalErr.message);
              await Candidate.findByIdAndUpdate(candidate._id, {
                interviewScore:      70,
                overallSummary:      "Evaluation could not be completed at this time.",
                finalRecommendation: "Please review the transcript manually.",
                evaluationStatus:    'complete'
              });
          });

        } catch (evalErr) {
          console.error("[BACKGROUND] Evaluation wrapper failed: ", evalErr.message);
          // BUG FIX: evaluationFeedback no longer exists — use overallSummary
          await Candidate.findByIdAndUpdate(candidate._id, {
            $set: {
              interviewScore:      70,
              overallSummary:      "Evaluation could not be completed at this time.",
              finalRecommendation: "Please review the transcript manually.",
              evaluationStatus:    'complete'
            }
          });
          console.log(`[DB WRITE] Fallback evaluation saved for ${candidate.name} (outer catch).`);
        }
      }, 100);

    } else {
      aiResponseText = candidate.preGeneratedQuestions[candidate.currentQuestionIndex];
      const nextIndex = candidate.currentQuestionIndex + 1;
      // ATOMIC $inc — prevents double-increment if two requests race
      await Candidate.findByIdAndUpdate(candidate._id, {
        $inc: { currentQuestionIndex: 1 }
      });
      console.log(`[DB WRITE] Question index incremented to ${nextIndex} for ${candidate.name} — served Q${nextIndex}`);
    }

    if (isDone) {
      console.log(`[Metrics] Interview Complete!`);
    }

    res.status(200).json({ 
        nextQuestion: aiResponseText,
        isInterviewComplete: isDone,
        finalScore: candidate.interviewScore || null,
        strengths: [],
        weaknesses: []
    });

  } catch (error) {
    console.error("Route Error:", error.message);
    res.status(500).json({ error: "Failed to process interview flow.", details: error.message });
  }
});

// ==========================================
// INTERVIEW SCORE POLLING ENDPOINT
// ==========================================
app.get('/api/interview/score/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const candidate = await Candidate.findOne({ interviewToken: token });

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found." });
    }

    if (candidate.evaluationStatus === 'complete') {
      return res.status(200).json({
        status:              'complete',
        score:               candidate.interviewScore,
        feedback:            candidate.overallSummary || "Interview evaluated successfully.", // backward compat key
        questionFeedback:    candidate.questionFeedback    || [],
        overallSummary:      candidate.overallSummary      || "Interview evaluated successfully.",
        strengths:           candidate.strengths           || [],
        weaknesses:          candidate.weaknesses          || [],
        finalRecommendation: candidate.finalRecommendation || ""
      });
    }

    // Still running (pending or not started)
    return res.status(200).json({ status: 'pending' });

  } catch (error) {
    console.error("Score poll error:", error.message);
    res.status(500).json({ error: "Failed to fetch score." });
  }
});

// ==========================================
// START SERVER
// ===========================================
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`AI Screener Backend running on port ${PORT}`);
});

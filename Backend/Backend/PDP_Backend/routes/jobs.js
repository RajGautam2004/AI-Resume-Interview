const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
// Import the Candidate model at the very top of routes/jobs.js
const Candidate = require('../models/Candidate');
const HRAdmin = require('../models/HRAdmin');
const transporter = require('../utils/email');

// 1. Import your bouncer (Middleware)
const verifyToken = require('../middleware/verifyToken'); 
const TECHNICAL_INTERVIEW_THRESHOLD = 15;

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function formatJobForClient(jobDoc) {
  const job = typeof jobDoc.toObject === 'function' ? jobDoc.toObject() : jobDoc;
  const owner =
    job.adminId && typeof job.adminId === 'object' && !Array.isArray(job.adminId)
      ? job.adminId
      : null;

  return {
    ...job,
    adminId: owner?._id || job.adminId,
    companyName: job.companyName || owner?.companyName || 'Independent Hiring Team',
    hrEmail: job.hrEmail || owner?.email || null
  };
}

async function getOwnedJob(jobId, adminId) {
  return Job.findOne({ _id: jobId, adminId });
}

function formatScheduledDateTime(dateValue) {
  return new Date(dateValue).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short'
  });
}

// 2. The POST route to create a new job
router.post('/', verifyToken, async (req, res) => {
  try {
    if (!req.body.title || !req.body.description) {
      return res.status(400).json({ error: "Title and description are required." });
    }

    const admin = await HRAdmin.findById(req.admin.adminId).select('companyName email');
    if (!admin) {
      return res.status(404).json({ error: "HR Admin account not found." });
    }

    const newJob = new Job({
      title: req.body.title,
      description: req.body.description,
      requiredSkills: normalizeStringArray(req.body.requiredSkills),
      interviewTopics: normalizeStringArray(req.body.interviewTopics),
      companyName: admin.companyName || null,
      hrEmail: admin.email || null,
      adminId: req.admin.adminId // Safely grabbing from the verified cookie
    });

    await newJob.save();
    res.status(201).json({ message: "Job successfully created!", job: formatJobForClient(newJob) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create job." });
  }
});
// GET /api/jobs - Fetch all active jobs for the public career page
router.get('/', async (req, res) => {
  try {
    // .sort({ createdAt: -1 }) puts the newest jobs at the top
    const jobs = await Job.find()
      .populate('adminId', 'companyName email')
      .sort({ createdAt: -1 });
    res.status(200).json(jobs.map(formatJobForClient));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs." });
  }
});

// GET /api/jobs/stats/dashboard - Get HR Analytics
router.get('/stats/dashboard', verifyToken, async (req, res) => {
  try {
    const adminId = req.admin.adminId;

    // 1. Find all jobs created by this specific HR Admin
    const myJobs = await Job.find({ adminId: adminId }).sort({ createdAt: -1 });
    const jobIds = myJobs.map(job => job._id);
    const jobTitleMap = new Map(
      myJobs.map((job) => [job._id.toString(), { title: job.title, companyName: job.companyName }])
    );

    // 2. Find all candidates who applied to ANY of those jobs
    const candidates = await Candidate.find({ appliedJobId: { $in: jobIds } }).sort({ appliedAt: -1 });

    // 3. Calculate the stats
    const totalJobs = myJobs.length;
    const totalApplicants = candidates.length;
    
    // Calculate average ATS Match Score (ignoring candidates who haven't been scored yet)
    const scoredCandidates = candidates.filter(c => c.atsMatchScore !== null);
    let avgScore = 0;
    if (scoredCandidates.length > 0) {
      const totalScore = scoredCandidates.reduce((sum, c) => sum + c.atsMatchScore, 0);
      avgScore = (totalScore / scoredCandidates.length).toFixed(1);
    }

    res.status(200).json({
      totalJobs,
      totalApplicants,
      averageMatchScore: avgScore,
      recentActivity: candidates.slice(0, 5).map((candidate) => {
        const linkedJob = jobTitleMap.get(candidate.appliedJobId.toString());
        return {
          ...candidate.toObject(),
          jobTitle: linkedJob?.title || null,
          companyName: linkedJob?.companyName || null
        };
      })
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load analytics dashboard." });
  }
});

// GET /api/jobs/mine - Fetch only jobs owned by the logged-in HR admin
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const jobs = await Job.find({ adminId: req.admin.adminId })
      .populate('adminId', 'companyName email')
      .sort({ createdAt: -1 });

    res.status(200).json(jobs.map(formatJobForClient));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch your jobs." });
  }
});

// GET /api/jobs/:jobId - Fetch a single job's details
router.get('/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('adminId', 'companyName email');
    if (!job) {
      return res.status(404).json({ error: "Job not found." });
    }
    res.status(200).json(formatJobForClient(job));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch job details." });
  }
});
// GET /api/jobs/:jobId/candidates - Fetch the ranked leaderboard
router.get('/:jobId/candidates', verifyToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const ownedJob = await getOwnedJob(jobId, req.admin.adminId);

    if (!ownedJob) {
      return res.status(403).json({ error: "Unauthorized to view candidates for this job." });
    }

    // Find all candidates who applied for this specific job
    // .sort({ atsMatchScore: -1 }) puts the highest scores at the very top!
    const candidates = await Candidate.find({ appliedJobId: jobId })
      .select('-resumeText') // We exclude the massive resume text to make the API faster
      .sort({ atsMatchScore: -1 });

    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch candidates." });
  }
});

// POST /api/jobs/:jobId/candidates/:candidateId/technical-invite - Accept candidate for company technical round
router.post('/:jobId/candidates/:candidateId/technical-invite', verifyToken, async (req, res) => {
  try {
    const { jobId, candidateId } = req.params;
    const ownedJob = await getOwnedJob(jobId, req.admin.adminId);

    if (!ownedJob) {
      return res.status(403).json({ error: "Unauthorized to manage candidates for this job." });
    }

    const candidate = await Candidate.findOne({ _id: candidateId, appliedJobId: jobId });
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found for this job." });
    }

    if (candidate.evaluationStatus !== 'complete' || candidate.interviewScore === null || candidate.interviewScore === undefined) {
      return res.status(400).json({ error: "This candidate has not completed the AI interview evaluation yet." });
    }

    if (candidate.interviewScore < TECHNICAL_INTERVIEW_THRESHOLD) {
      return res.status(400).json({ error: `Only candidates with interview scores of ${TECHNICAL_INTERVIEW_THRESHOLD} or above can be accepted for the company technical round.` });
    }

    const scheduledAtRaw = typeof req.body.scheduledAt === 'string' ? req.body.scheduledAt.trim() : '';
    const location = typeof req.body.location === 'string' ? req.body.location.trim() : '';

    if (!scheduledAtRaw || !location) {
      return res.status(400).json({ error: "Interview date/time and place are required." });
    }

    const scheduledAt = new Date(scheduledAtRaw);
    if (Number.isNaN(scheduledAt.getTime())) {
      return res.status(400).json({ error: "A valid interview date and time are required." });
    }

    const companyName = ownedJob.companyName || 'Hiring Team';
    const recruiterEmail = ownedJob.hrEmail || null;
    const formattedSchedule = formatScheduledDateTime(scheduledAt);

    const mailOptions = {
      from: `"${transporter.senderName}" <${transporter.senderEmail}>`,
      replyTo: recruiterEmail || transporter.senderEmail,
      to: candidate.email,
      subject: `HireAI Technical Round Invitation - ${ownedJob.title}`,
      text:
        `Hello ${candidate.name},\n\n` +
        `Congratulations. You have been selected for the company technical interview round for the role of ${ownedJob.title}.\n\n` +
        `Company: ${companyName}\n` +
        `Date and Time: ${formattedSchedule}\n` +
        `Place: ${location}\n` +
        `${recruiterEmail ? `Recruiter Contact: ${recruiterEmail}\n` : ''}\n` +
        `Please arrive on time and contact the recruiter if you need any clarification.\n\n` +
        `Best regards,\n${companyName}\nHireAI`
    };

    const mailInfo = await transporter.sendMail(mailOptions);
    console.log('Technical interview invitation email sent:', {
      to: candidate.email,
      candidateId: String(candidate._id),
      jobId: String(ownedJob._id),
      messageId: mailInfo.messageId,
      accepted: mailInfo.accepted,
      rejected: mailInfo.rejected
    });

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidate._id,
      {
        $set: {
          status: 'Technical Interview Scheduled',
          technicalInterviewInvitation: {
            scheduledAt,
            location,
            invitedAt: new Date(),
            companyName,
            recruiterEmail
          }
        }
      },
      { new: true }
    ).select('-resumeText');

    res.status(200).json({
      message: "Technical interview invitation sent successfully.",
      candidate: updatedCandidate
    });
  } catch (error) {
    console.error("Technical interview invitation error:", error.message);
    res.status(500).json({ error: "Failed to send the technical interview invitation." });
  }
});

// PUT /api/jobs/:jobId - Update a job posting
router.put('/:jobId', verifyToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ error: "Job not found." });

    // Security Check: Make sure this admin actually owns this job
    if (job.adminId.toString() !== req.admin.adminId) {
      return res.status(403).json({ error: "Unauthorized to edit this job." });
    }

    const admin = await HRAdmin.findById(req.admin.adminId).select('companyName email');
    if (!admin) {
      return res.status(404).json({ error: "HR Admin account not found." });
    }

    // Only update fields that were actually submitted.
    const allowedUpdates = {
      companyName: admin.companyName || null,
      hrEmail: admin.email || null
    };

    if (Object.prototype.hasOwnProperty.call(req.body, 'title')) {
      allowedUpdates.title = req.body.title;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
      allowedUpdates.description = req.body.description;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'requiredSkills')) {
      allowedUpdates.requiredSkills = normalizeStringArray(req.body.requiredSkills);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'interviewTopics')) {
      allowedUpdates.interviewTopics = normalizeStringArray(req.body.interviewTopics);
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.jobId, 
      { $set: allowedUpdates }, 
      { new: true }
    );
    res.status(200).json({ message: "Job updated!", job: formatJobForClient(updatedJob) });
  } catch (error) {
    res.status(500).json({ error: "Failed to update job." });
  }
});

// DELETE /api/jobs/:jobId - Delete a job posting
router.delete('/:jobId', verifyToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ error: "Job not found." });

    if (job.adminId.toString() !== req.admin.adminId) {
      return res.status(403).json({ error: "Unauthorized to delete this job." });
    }

    await Job.findByIdAndDelete(req.params.jobId);
    res.status(200).json({ message: "Job successfully deleted." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete job." });
  }
});
// DELETE /api/jobs/:jobId/candidates/:candidateId — Remove a candidate record
router.delete('/:jobId/candidates/:candidateId', verifyToken, async (req, res) => {
  try {
    const { jobId, candidateId } = req.params;
    const ownedJob = await getOwnedJob(jobId, req.admin.adminId);

    if (!ownedJob) {
      return res.status(403).json({ error: "Unauthorized to manage candidates for this job." });
    }

    // Confirm the candidate actually belongs to this job (prevent cross-job deletion)
    const candidate = await Candidate.findOne({ _id: candidateId, appliedJobId: jobId });
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found for this job." });
    }

    await Candidate.findByIdAndDelete(candidateId);
    console.log(`[DB DELETE] Candidate '${candidate.name}' (${candidateId}) deleted by admin ${req.admin.adminId}`);

    res.status(200).json({ message: "Candidate successfully deleted.", candidateId });
  } catch (error) {
    console.error("[DB DELETE] Error deleting candidate:", error.message);
    res.status(500).json({ error: "Failed to delete candidate." });
  }
});

// IMPORTANT: You must export the router so server.js can read it!
module.exports = router;

// Mock API service to simulate backend calls
// In a real app, this would be replaced with actual API calls to Node.js backend

const STORAGE_KEYS = {
  HR_AUTH: 'hr_auth_token',
  JOBS: 'jobs_data',
  CANDIDATES: 'candidates_data',
  INTERVIEWS: 'interviews_data'
};

// Initialize mock data
const initializeMockData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
    const mockJobs = [
    {
      _id: 'job1',
      title: 'Senior React Developer',
      description: 'We are looking for an experienced React developer to join our team. You will work on building scalable web applications using modern React patterns, Redux for state management, and TypeScript.',
      requiredSkills: ['React', 'Redux', 'TypeScript', 'JavaScript', 'CSS'],
      interviewTopics: ['State Management', 'Component Architecture', 'Performance Optimization'],
      createdAt: new Date('2026-03-01').toISOString(),
      isActive: true
    },
    {
      _id: 'job2',
      title: 'Full Stack JavaScript Engineer',
      description: 'Join our dynamic team as a full stack engineer. Work with Node.js, Express, MongoDB on the backend and React on the frontend. Build RESTful APIs and modern web applications.',
      requiredSkills: ['Node.js', 'Express', 'MongoDB', 'React', 'REST API'],
      interviewTopics: ['API Design', 'Database Modeling', 'Authentication'],
      createdAt: new Date('2026-03-10').toISOString(),
      isActive: true
    },
    {
      _id: 'job3',
      title: 'Frontend UI/UX Developer',
      description: 'Create beautiful, responsive user interfaces. Strong skills in HTML, CSS, JavaScript, and modern CSS frameworks required. Experience with Tailwind CSS is a plus.',
      requiredSkills: ['HTML', 'CSS', 'JavaScript', 'Tailwind CSS', 'Figma'],
      interviewTopics: ['Responsive Design', 'CSS Architecture', 'Accessibility'],
      createdAt: new Date('2026-03-15').toISOString(),
      isActive: true
    }];

    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(mockJobs));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CANDIDATES)) {
    const mockCandidates = [
    // Job 1 candidates
    {
      _id: 'cand1',
      name: 'Rishu Kumar',
      email: 'rishu@example.com',
      jobId: 'job1',
      atsMatchScore: 92,
      interviewScore: 85,
      resumeText: 'Experienced React developer with 5 years of experience...',
      status: 'interviewed',
      appliedAt: new Date('2026-03-20').toISOString(),
      magicToken: 'token_rishu_123'
    },
    {
      _id: 'cand2',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      jobId: 'job1',
      atsMatchScore: 88,
      interviewScore: 90,
      resumeText: 'Senior React developer specializing in Redux...',
      status: 'interviewed',
      appliedAt: new Date('2026-03-21').toISOString(),
      magicToken: 'token_priya_456'
    },
    {
      _id: 'cand3',
      name: 'Amit Patel',
      email: 'amit@example.com',
      jobId: 'job1',
      atsMatchScore: 78,
      interviewScore: 75,
      resumeText: 'React developer with TypeScript experience...',
      status: 'interviewed',
      appliedAt: new Date('2026-03-22').toISOString(),
      magicToken: 'token_amit_789'
    },
    {
      _id: 'cand4',
      name: 'Sneha Reddy',
      email: 'sneha@example.com',
      jobId: 'job1',
      atsMatchScore: 65,
      interviewScore: null,
      resumeText: 'Junior React developer looking to grow...',
      status: 'pending',
      appliedAt: new Date('2026-03-23').toISOString(),
      magicToken: 'token_sneha_012'
    },
    // Job 2 candidates
    {
      _id: 'cand5',
      name: 'Rahul Verma',
      email: 'rahul@example.com',
      jobId: 'job2',
      atsMatchScore: 95,
      interviewScore: 88,
      resumeText: 'Full stack engineer with Node.js and MongoDB expertise...',
      status: 'interviewed',
      appliedAt: new Date('2026-03-18').toISOString(),
      magicToken: 'token_rahul_345'
    },
    {
      _id: 'cand6',
      name: 'Anjali Singh',
      email: 'anjali@example.com',
      jobId: 'job2',
      atsMatchScore: 82,
      interviewScore: 80,
      resumeText: 'Backend specialist with Express and REST API experience...',
      status: 'interviewed',
      appliedAt: new Date('2026-03-19').toISOString(),
      magicToken: 'token_anjali_678'
    },
    // Job 3 candidates
    {
      _id: 'cand7',
      name: 'Neha Gupta',
      email: 'neha@example.com',
      jobId: 'job3',
      atsMatchScore: 90,
      interviewScore: 92,
      resumeText: 'UI/UX developer with strong Tailwind CSS skills...',
      status: 'interviewed',
      appliedAt: new Date('2026-03-17').toISOString(),
      magicToken: 'token_neha_901'
    }];

    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(mockCandidates));
  }
};

// Initialize on load
initializeMockData();

// Simulate network delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API functions
export const mockApi = {
  // Auth APIs
  async hrLogin(email, password) {
    await delay();
    // Mock authentication - accept any email/password for demo
    if (email && password) {
      const token = 'mock_hr_token_' + Date.now();
      localStorage.setItem(STORAGE_KEYS.HR_AUTH, token);
      return { success: true, token };
    }
    throw new Error('Invalid credentials');
  },

  async hrLogout() {
    localStorage.removeItem(STORAGE_KEYS.HR_AUTH);
    return { success: true };
  },

  async checkHrAuth() {
    const token = localStorage.getItem(STORAGE_KEYS.HR_AUTH);
    return !!token;
  },

  // Job APIs
  async getJobs() {
    await delay();
    const jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]');
    return jobs.filter((job) => job.isActive);
  },

  async getJobById(jobId) {
    await delay();
    const jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]');
    return jobs.find((job) => job._id === jobId);
  },

  async createJob(jobData) {
    await delay();
    const jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]');
    const newJob = {
      _id: 'job_' + Date.now(),
      ...jobData,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    jobs.push(newJob);
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    return newJob;
  },

  async updateJob(jobId, updates) {
    await delay();
    const jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]');
    const index = jobs.findIndex((job) => job._id === jobId);
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
      return jobs[index];
    }
    throw new Error('Job not found');
  },

  async deleteJob(jobId) {
    await delay();
    const jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]');
    const filtered = jobs.filter((job) => job._id !== jobId);
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(filtered));
    return { success: true };
  },

  // Dashboard Stats
  async getDashboardStats() {
    await delay();
    const jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]');
    const candidates = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANDIDATES) || '[]');

    const activeJobs = jobs.filter((job) => job.isActive);
    const totalApplicants = candidates.length;
    const averageMatchScore = candidates.length > 0 ?
    (candidates.reduce((sum, c) => sum + c.atsMatchScore, 0) / candidates.length).toFixed(1) :
    '0';

    const recentActivity = candidates.
    sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)).
    slice(0, 5).
    map((c) => ({
      ...c,
      jobTitle: jobs.find((j) => j._id === c.jobId)?.title || 'Unknown Job'
    }));

    return {
      totalJobs: activeJobs.length,
      totalApplicants,
      averageMatchScore,
      recentActivity
    };
  },

  // Candidate APIs
  async getCandidatesByJob(jobId) {
    await delay();
    const candidates = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANDIDATES) || '[]');
    return candidates.
    filter((c) => c.jobId === jobId).
    sort((a, b) => b.atsMatchScore - a.atsMatchScore); // Highest score first
  },

  async submitApplication(formData) {
    await delay(1000); // Longer delay to simulate AI processing

    const candidates = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANDIDATES) || '[]');

    // Simulate AI scoring (random score between 50-95)
    const aiScore = Math.floor(Math.random() * 45) + 50;

    const newCandidate = {
      _id: 'cand_' + Date.now(),
      name: formData.get('name'),
      email: formData.get('email'),
      jobId: formData.get('jobId'),
      atsMatchScore: aiScore,
      interviewScore: null,
      resumeText: 'Resume text would be extracted here...',
      status: aiScore >= 60 ? 'pending' : 'rejected',
      appliedAt: new Date().toISOString(),
      magicToken: 'token_' + Math.random().toString(36).substr(2, 9)
    };

    candidates.push(newCandidate);
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));

    return {
      success: true,
      aiScore,
      magicToken: newCandidate.magicToken,
      shouldInterview: aiScore >= 60
    };
  },

  // Interview APIs
  async verifyMagicToken(token) {
    await delay();
    const candidates = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANDIDATES) || '[]');
    const candidate = candidates.find((c) => c.magicToken === token);

    if (!candidate) {
      return { isValid: false };
    }

    const jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]');
    const job = jobs.find((j) => j._id === candidate.jobId);

    return {
      isValid: true,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      jobTitle: job?.title || 'Unknown Position',
      jobDescription: job?.description || '',
      interviewTopics: job?.interviewTopics || [],
      resumeText: candidate.resumeText
    };
  },

  async sendChatMessage(candidateToken, message, chatHistory) {
    await delay(800); // Simulate AI thinking time

    // Simple mock Gemini responses
    const mockResponses = [
    "That's interesting. Can you elaborate on how you implemented that feature?",
    "Great! Now, tell me about a challenging bug you encountered and how you solved it.",
    "How do you ensure code quality and maintainability in your projects?",
    "Can you explain your approach to state management in complex applications?",
    "What testing strategies do you use for your React components?",
    "How do you handle performance optimization in React applications?",
    "Tell me about a time you had to refactor legacy code. What was your approach?"];


    const questionCount = chatHistory.filter((msg) => msg.role === 'assistant').length;

    // End interview after 5 questions
    if (questionCount >= 5) {
      // Calculate final score based on chat history (mock)
      const finalScore = Math.floor(Math.random() * 30) + 70; // 70-100

      return {
        nextQuestion: `Thank you for your time! Based on our conversation, I've assessed your technical skills. You demonstrated strong knowledge in ${['React', 'JavaScript', 'problem-solving'][Math.floor(Math.random() * 3)]}. Your interview is now complete.`,
        isInterviewComplete: true,
        finalScore,
        strengths: ['Clear communication', 'Strong technical knowledge', 'Problem-solving approach'],
        weaknesses: ['Could improve on edge case handling', 'More focus on testing']
      };
    }

    const nextQuestion = mockResponses[questionCount % mockResponses.length];

    return {
      nextQuestion,
      isInterviewComplete: false
    };
  },

  async submitInterviewResult(candidateToken, finalScore, malpracticeDetected = false) {
    await delay();
    const candidates = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANDIDATES) || '[]');
    const index = candidates.findIndex((c) => c.magicToken === candidateToken);

    if (index !== -1) {
      candidates[index].interviewScore = malpracticeDetected ? 0 : finalScore;
      candidates[index].status = malpracticeDetected ? 'disqualified' : 'interviewed';
      candidates[index].malpracticeDetected = malpracticeDetected;
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
      return { success: true };
    }

    throw new Error('Candidate not found');
  }
};
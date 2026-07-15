const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }], // Array of strings (e.g., ["React", "Node.js"])
  interviewTopics: [{ type: String }], // Array of strings (e.g., ["Database Indexing", "State Management"])
  companyName: { type: String, default: null },
  hrEmail: { type: String, default: null },
  
  // Later, we will link this to the specific HR Admin who created the job
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'HRAdmin' },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);

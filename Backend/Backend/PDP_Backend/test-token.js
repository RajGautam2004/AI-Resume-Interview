require('dotenv').config();
const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const candidate = await Candidate.findOne({ interviewToken: { $exists: true, $ne: null } });
  console.log(candidate ? candidate.interviewToken : "No token found");
  process.exit(0);
});

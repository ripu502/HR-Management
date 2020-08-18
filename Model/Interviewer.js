const mongoose = require("mongoose");
const interviewerSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
  },
  profile: {
    type: Array,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: {
    type: String,
  },
});
module.exports = mongoose.model("Interviewer", interviewerSchema);

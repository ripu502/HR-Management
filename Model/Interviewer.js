const mongoose = require("mongoose");
const interviewerSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
  },
  profile: {
    type: String,
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
});
module.exports = mongoose.model("Interview", interviewerSchema);

const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
  },
  mobileNo: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10,
    validate(value) {
      if (!validator.isMobilePhone(value, ["en-IN"])) {
        throw new Error("Please Enter a valid mobile number");
      }
    },
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    uniqueCaseInsensitive: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Please enter a proper email");
      }
    },
  },
  companyId: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  jobName: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  currentDesignation: {
    type: String,
  },
  cCTC: {
    type: String,
  },
  eCTC: {
    type: String,
  },
  noticePeriod: {
    type: String,
    required: true,
  },
  skills: {
    type: String,
  },
  resumeUrl: {
    type: String,
  },
  status: {
    type: String,
  },
  feedback: {
    type: String,
  },
});
module.exports = mongoose.model("User", userSchema);

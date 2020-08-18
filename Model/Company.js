const mongoose = require("mongoose");
const validator = require("validator");

const companySchema = new mongoose.Schema({
  // _id: { type: String },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  hrFirstName: {
    type: String,
    required: true,
  },
  hrLastName: {
    type: String,
  },
  mobileNo: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10,
    unique: true,
    validate(value) {
      if (!validator.isMobilePhone(value, ["en-IN"])) {
        throw new Error("Please Enter a valid mobile number");
      }
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    uniqueCaseInsensitive: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Please enter a proper email");
      }
    },
  },
  password: {
    required: true,
    type: String,
  },
  version: {
    type: String,
  },
  resetToken: {
    type: String,
  },
});
module.exports = mongoose.model("Company", companySchema);

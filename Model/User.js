const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mobileNo: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 10,
        unique: true,
        validate(value) {
            if (!validator.isMobilePhone(value, ['en-IN'])) {
                throw new Error('Please Enter a valid mobile number')
            }
        }
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        uniqueCaseInsensitive: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Please enter a proper email');
            }
        }
    },
    companyId: {
        type: String,
        required: true,
    },
    job: {
        type: String,
        required: true,
    },
    resume: {
        type: String,
    }
})
module.exports = mongoose.model('User', userSchema);
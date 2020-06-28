const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    }
})
module.exports = mongoose.model('Job', jobSchema);
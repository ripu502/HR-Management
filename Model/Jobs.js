const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    jobName: {
        type: String,
        required: true
    },
    companyid: {
        type: String,
        required: true
    },
    vacancy: {
        type: String,
        required: true
    },
    skills: {
        type: String,
        // required: true,
    },
    datefrom: {
        type: String,
        required: true,
    },
    dateto: {
        type: String,
        required: true,
    },
    timefrom: {
        type: String,
        required: true,
    },
    timeto: {
        type: String,
        required: true,
    }
})
module.exports = mongoose.model('Job', jobSchema);
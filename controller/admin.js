const Company = require('../Model/Company');
const Job = require('../Model/Jobs');
const User = require('../Model/User');


// get the list of all the client companies
module.exports.getCompanies = (req, res, next) => {
    Company.find()
        .then(companies => {
            res.status(200).json(companies);
        }).catch(err => {
            res.status(500).json(
                {
                    status: 'Failed',
                    msg: 'Opps try again',
                    err: err,
                })
        })
}


// get the list of jobs posted by all the companies
module.exports.getJobs = (req, res, next) => {
    Job.find().then(jobs => {
        if (jobs != null) {
            res.status(200).json(jobs);
        }
    }).catch(err => {
        res.status(500).json({
            status: 'Failed',
            msg: 'Try again',
            err: err
        })
    })
}


// get the list of all the applicant


module.exports.getVisiter = (req, res, next) => {
    User.find().then(applications => {
        if(applications != null)
        {
            res.status(200).json(applications);
        }else{
            res.json({msg : "NO applications"})
        }
    }).catch(err => {
        res.status(500).json(
            {
                status: 'Failed',
                msg: 'Try againn',
                err: err,
            })
    })
}



// change the plan of the company
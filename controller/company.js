const Company = require('../Model/Company');
const Job = require('../Model/Jobs');

module.exports.register = (req, res, next) => {
    const {
        name,
        type,
        email,
        password,
        version,
        mobileNo
    } = req.body;
    const company = new Company({
        name: name,
        type: type,
        mobileNo: mobileNo,
        email: email,
        password: password,
        version: version,
    });
    company.save().then(result => {
        res.status(200).json({
            status: 'OK',
            'msg': 'Company is Registered'
        })
    }).catch(err => {
        res.status(500).json({
            status: 'Failed',
            msg: 'Company is not Registered',
            err: err
        })
    })
}

module.exports.login = (req, res, next) => {
    const { email, password } = req.body;
    Company.findOne({ email: email }).then(com => {
        if (com != null) {
            console.log(com.password, password)
            if (com.password === password) {
                console.log('login true');
            } else {
                console.log('wrong password')
            }
        } else {
            console.log('not registered');
        }
    }).catch(err => {
        console.log('some err', err);
    })
}


module.exports.addJobs = (req, res, next) => {
    const { email, job } = req.body;
    const newjob = new Job({ email: email, name: job })
    newjob.save().then(result => {
        res.status(200).json({
            status: 'OK',
            'msg': 'Job is Saved'
        })
    }).catch(err => {
        res.status(500).json({
            status: 'Failed',
            'msg': 'Job is not Saved',
            err: err
        })
    })
}

module.exports.getJobs = (req, res, next) => {
    const email = 'abctr@gmail.com';
    Job.find({ email: email })
        .then(jobs => {
            if(jobs != null)
            {
                res.status(200).json(jobs);

            }
        })
        .catch(err => {
            res.status(500).json({
                status: 'Failed',
                msg: 'Try again',
                err: err
            })
        });
}
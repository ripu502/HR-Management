const Company = require('../Model/Company');
const Job = require('../Model/Jobs');
const { models } = require('mongoose');
const User = require('../Model/User');
const jwt = require('jsonwebtoken');
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)
const { validationResult } = require('express-validator');



// Register a Company
module.exports.register = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
    }
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
        noVerified: 'No'
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

module.exports.getMsg = (req, res, next) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const phoneNo = authData.mobileNo;
            // let data = await 
            client
                .verify
                .services(process.env.SERVICE_ID)
                .verifications
                .create({
                    to: `+91${phoneNo}`,
                    channel: 'sms'
                })
            res.status(200).json({
                msg: 'Hope that the Code is send. Pending!',
            })
            // .then(data => {
            //     // sending the data when the otp send and when prob
            //     console.log(data);
            //     res.status(200).json({
            //         // status: 'OK',
            //         ...data
            //     })
            // if (data.status === 'approved') {
            // } else {
            //     res.status(401).json({
            //         status: 'Failed',
            //         ...data
            //     })
            // }
            // })
            // .catch(err => {
            //     res.status(401).json({
            //         status: 'Failed',
            //         msg: 'Some err occured',
            //         err: err
            //     })
            // })
        }
    })
}


// send the code with token
module.exports.postCode = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
    }
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            let code = req.body.code;
            client
                .verify
                .services(process.env.SERVICE_ID)
                .verificationChecks
                .create({
                    to: `+91${authData.mobileNo}`,
                    code: code
                }).then(data => {
                    if (data.status === "approved") {
                        Company.findById(authData.id).then(company => {
                            company.noVerified = 'Yes';
                            company.save().then(done => {
                                res.status(200).json({
                                    status: 'Done',
                                    msg: 'Number is verified',
                                    data: done,
                                })
                            }).catch(err => {
                                res.status(401).json({
                                    status: 'Failed',
                                    msg: 'Some backend issue',
                                    err: err
                                })
                            })
                        }).catch(err => {
                            console.log('some err');
                            res.status(401).json({
                                status: 'Failed',
                                msg: 'Some backend issue',
                                err: err
                            })
                        })
                    } else {
                        res.status(401).json({
                            status: 'Failed',
                            msg: 'Looks like wrong code',
                            // err: err
                        })
                    }
                }).catch(err => {
                    res.status(401).json({
                        status: 'Failed',
                        msg: 'Some err occured',
                        err: err
                    })
                })
        }
    })
}

// Login the Company and signing the token for 1 year
module.exports.login = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
    }
    const { email, password } = req.body;
    Company.findOne({ email: email }).then(com => {
        if (com != null) {
            console.log(com.password, password)
            if (com.password === password) {
                jwt.sign({ email: com.email, id: com._id, mobileNo: com.mobileNo }, 'secretkey', { expiresIn: '1y' }, (err, token) => {
                    if (err) {
                        console.log(`some err occured ${err}`);
                        res.status(500).json({
                            msg: "Failed pls Try again",
                            status: "Failed",
                        })
                    } else {
                        res.json({
                            status: 'OK',
                            token: token,
                            validity: '1y',
                        })
                        console.log(token);
                    }
                })
                console.log('login true');
            } else {
                res.json({
                    status: 'Failed',
                    'msg': 'Wrong password',
                })
                console.log('wrong password')
            }
        } else {
            res.json({
                status: "Failed",
                msg: 'Not Registered'
            })
            console.log('not registered');
        }
    }).catch(err => {
        res.json(
            {
                status: 'Failed',
                msg: 'Some issuse Occured'
            }
        )
        console.log('some err', err);
    })
}


// Company adds the jobs
module.exports.addJobs = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
    }
    const { email, job, token } = req.body;
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            console.log(err);
            res.sendStatus(403);
            return;
        }
        else {
            // console.log(authData)
            const newjob = new Job({ email: authData.email, name: job, id: authData.id })
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
    })
}

// Company Get the Jobs which were added by it. require login
module.exports.getJobs = (req, res, next) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
            return;
        } else {
            // console.log(authData)
            const id = authData.id;
            Job.find({ id: id })
                .then(jobs => {
                    if (jobs != null) {
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
    })
}


// applicant apply for the job
module.exports.addApplication = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
    }
    const { name, mobileNo, email, companyId, job, resume } = req.body;
    const user = new User({ name, mobileNo, email, companyId, job, resume });
    user.save()
        .then(usr => {
            res.status(200).json({
                status: 'OK',
                msg: 'Application Saved',
            });

        }).catch(err => {
            res.status(500).json(
                {
                    status: 'Failed',
                    msg: 'Application Failed',
                    err: err,
                })
        })
}



// comapany review the application requires login of company
module.exports.getVisiter = (req, res, next) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
            return;
        } else {
            // console.log(authData)
            const id = authData.id;
            User.findById(id).then(applications => {
                if (applications != null) {
                    res.status(200).json(applications);
                } else {
                    res.json({ msg: "NO applications" })
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
    })
}


// company delete job
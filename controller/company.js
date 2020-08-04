const Company = require("../Model/Company");
const Job = require("../Model/Jobs");
const { models } = require("mongoose");
const User = require("../Model/User");
const jwt = require("jsonwebtoken");
const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
var xoauth2 = require("xoauth2");
const { CompositionList } = require("twilio/lib/rest/video/v1/composition");
const Interviwer = require("../Model/Interviewer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  access_type: "offline",
  auth: {
    type: "OAuth2",
    user: "ripu502@gmail.com",
    clientId: process.env.ClientId,
    clientSecret: process.env.ClientSecret,
    refreshToken: process.env.RefreshToken,
    accessToken: process.env.accessToken,
  },
});

// Register a Company
module.exports.register = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  const { name, hrFirstName, hrLastName, email, password, address } = req.body;
  const company = {
    name: name,
    hrFirstName: hrFirstName,
    hrLastName: hrLastName,
    email: email,
    password: password,
    address: address,
  };
  jwt.sign(
    { user: company },
    "secretkey",
    { expiresIn: "1y" },
    (err, token) => {
      if (err) {
        // console.log(`some err occured ${err}`);
        res.status(403).json({
          msg: "try again",
          err: err,
        });
      } else {
        const mailOptions = {
          from: "ripu502@gmail.com",
          to: email, // send mail Id sending mail to myself
          subject: `Mail by contact form from`, // Subject line
          html: `<p><b>${token}</b><br></p>`, // plain text body
        };
        transporter.sendMail(mailOptions, function (err, result) {
          if (err) {
            console.log(err);
            res.status(403).json({
              msg: "try again",
              err: err,
            });
          } else {
            // console.log('Email Sent');
            res.status(200).json({
              msg: "Email is sent",
            });
          }
        });
        // console.log(token);
      }
    }
  );
};

// company get msg
module.exports.getMsg = (req, res, next) => {
  const { phoneNo } = req.body;
  // let data = await
  client.verify
    .services(process.env.SERVICE_ID)
    .verifications.create({
      to: `+91${phoneNo}`,
      channel: "sms",
    })
    .then((data) => {
      console.log(data);
      res.status(200).json({
        msg: "Hope that the Code is send. Pending!",
      });
    })
    .catch((err) => console.log(err));
};

// company send code
module.exports.postCode = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }

  let code = req.body.code;
  let mobileNo = req.body.mobileNo;
  client.verify
    .services(process.env.SERVICE_ID)
    .verificationChecks.create({
      to: `+91${mobileNo}`,
      code: code,
    })
    .then((data) => {
      if (data.status === "approved") {
        const token = req.body.token;

        jwt.verify(token, "secretkey", (err, authData) => {
          if (err) {
            res.sendStatus(403);
          } else {
            let com = authData.user;
            com["mobileNo"] = mobileNo;
            console.log(com);
            const company = new Company(com);
            company
              .save()
              .then((result) => {
                res.status(200).json({
                  status: "OK",
                  msg: "Company is Registered",
                });
              })
              .catch((err) => {
                res.status(500).json({
                  status: "Failed",
                  msg: "Company is not Registered",
                  err: err,
                });
              });
          }
        });
      } else {
        res.status(401).json({
          status: "Failed",
          msg: "Looks like wrong code",
          // err: err
        });
      }
    })
    .catch((err) => {
      res.status(401).json({
        status: "Failed",
        msg: "Some err occured",
        err: err,
      });
    });
};
///////////////// COMPANY REGISTRATION ENDS /////////////////////////////////////

// Login the Company and signing the token for 1 year
module.exports.login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  const { email, password } = req.body;
  Company.findOne({ email: email })
    .then((com) => {
      if (com != null) {
        console.log(com.password, password);
        if (com.password === password) {
          jwt.sign(
            {
              email: com.email,
              id: com._id,
              mobileNo: com.mobileNo,
              verify: com.noVerified,
            },
            "secretkey",
            { expiresIn: "1y" },
            (err, token) => {
              if (err) {
                console.log(`some err occured ${err}`);
                res.status(500).json({
                  msg: "Failed pls Try again",
                  status: "Failed",
                });
              } else {
                res.json({
                  companyId: com._id,
                  status: "OK",
                  token: token,
                  validity: "1y",
                });
                console.log(token);
              }
            }
          );
          console.log("login true");
        } else {
          res.json({
            status: "Failed",
            msg: "Wrong password",
          });
          console.log("wrong password");
        }
      } else {
        res.json({
          status: "Failed",
          msg: "Not Registered",
        });
        console.log("not registered");
      }
    })
    .catch((err) => {
      res.json({
        status: "Failed",
        msg: "Some issuse Occured",
      });
      console.log("some err", err);
    });
};

// Company adds the jobs
module.exports.addJobs = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  const {
    jobName,
    datefrom,
    dateto,
    timefrom,
    timeto,
    skills,
    vacancy,
  } = req.body;
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      console.log(err);
      res.sendStatus(403);
      return;
    } else {
      // console.log(authData)
      const newjob = new Job({
        companyid: authData.id,
        jobName,
        datefrom,
        dateto,
        timefrom,
        timeto,
        skills,
        vacancy,
      });
      newjob
        .save()
        .then((result) => {
          res.status(200).json({
            status: "OK",
            msg: "Job is Saved",
          });
        })
        .catch((err) => {
          res.status(500).json({
            status: "Failed",
            msg: "Job is not Saved",
            err: err,
          });
        });
    }
  });
};

// Company Get the Jobs which were added by it. require id
module.exports.getJobs = (req, res, next) => {
  const companyid = req.params.id;
  // // console.log(typeof idc);
  // console.log(`${companyid}  5f0b73dc92f70f41c875e738`)
  Job.find({ companyid })
    .then((jobs) => {
      console.log(jobs);
      if (jobs != null) {
        res.status(200).json(jobs);
      }
    })
    .catch((err) => {
      res.status(500).json({
        status: "Failed",
        msg: "Try again",
        err: err,
      });
    });
};

// applicant apply for the job set 1
module.exports.addApplication = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  const {
    fname,
    lname,
    jobName,
    skills,
    eCTC,
    cCTC,
    email,
    companyId,
    resumeUrl,
    address,
    currentDesignation,
    source,
    noticePeriod,
  } = req.body;
  const usr = {
    fname,
    lname,
    email,
    companyId,
    jobName,
    resumeUrl,
    skills,
    eCTC,
    cCTC,
    address,
    currentDesignation,
    source,
    noticePeriod,
  };
  jwt.sign({ user: usr }, "secretkey", { expiresIn: "1h" }, (err, token) => {
    if (err) {
      // console.log(`some err occured ${err}`);
      res.status(403).json({
        msg: "try again",
        err: err,
      });
    } else {
      const mailOptions = {
        from: "ripu502@gmail.com",
        to: email, // send mail Id sending mail to myself
        subject: `Mail by contact form from`, // Subject line
        html: `<p><b>${token}</b><br></p>`, // plain text body
      };
      transporter.sendMail(mailOptions, function (err, result) {
        if (err) {
          console.log(err);
          res.status(403).json({
            msg: "try again",
            err: err,
          });
        } else {
          // console.log('Email Sent');
          res.status(200).json({
            msg: "Email is sent",
          });
        }
      });
    }
  });
};

// get msg step 2 use same function

// save the application with opt and token

module.exports.postcodeAppli = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  let code = req.body.code;
  let mobileNo = req.body.mobileNo;
  client.verify
    .services(process.env.SERVICE_ID)
    .verificationChecks.create({
      to: `+91${mobileNo}`,
      code: code,
    })
    .then((data) => {
      if (data.status === "approved") {
        const token = req.body.token;

        jwt.verify(token, "secretkey", (err, authData) => {
          if (err) {
            res.sendStatus(403);
          } else {
            let usr = authData.user;
            usr["mobileNo"] = mobileNo;
            usr["status"] = "Not Seen";
            // console.log(usr);
            const user = new User(usr);
            user
              .save()
              .then((result) => {
                res.status(200).json({
                  status: "OK",
                  msg: "Application is Registered",
                  result,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  status: "Failed",
                  msg: "Application is not Registered",
                  err: err,
                });
              });
          }
        });
      } else {
        res.status(401).json({
          status: "Failed",
          msg: "Looks like wrong code",
          // err: err
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(401).json({
        status: "Failed",
        msg: "Some err occured",
        err: err,
      });
    });
};

// comapany review the application requires login of company
module.exports.getVisiter = (req, res, next) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
      return;
    } else {
      // console.log(authData)
      const id = authData.id;
      User.find({ companyId: id.toString() })
        .then((applications) => {
          if (applications != null) {
            res.status(200).json(applications);
          } else {
            res.json({ msg: "NO applications" });
          }
        })
        .catch((err) => {
          res.status(500).json({
            status: "Failed",
            msg: "Try againn",
            err: err,
          });
        });
    }
  });
};

module.exports.addInterviwer = (req, res, next) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(authData);
      let companyId = authData.id;
      const { email, profile } = req.body;
      const InterviewerData = {
        email: email,
        profile: profile,
        companyId: companyId,
      };
      jwt.sign(
        { user: InterviewerData },
        "secretkey",
        { expiresIn: "1h" },
        (err, token) => {
          if (err) {
            console.log(`some err occured ${err}`);
          } else {
            const mailOptions = {
              from: "ripu502@gmail.com",
              to: email, // send mail Id sending mail to myself
              subject: `Mail by contact form from`, // Subject line
              html: `<p><b>${token}</b><br></p>`, // plain text body
            };
            transporter.sendMail(mailOptions, function (err, result) {
              if (err) {
                console.log(err);
                res.status(403).json({
                  msg: "try again",
                  err: err,
                });
              } else {
                // console.log('Email Sent');
                res.status(200).json({
                  msg: "Email is sent",
                });
              }
            });
          }
        }
      );
    }
  });
};

module.exports.registerInterviewer = (req, res, next) => {
  const interviewerRegisterToken = req.body.token;
  const password = req.body.password;
  jwt.verify(interviewerRegisterToken, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(authData);
      const interviwerInfo = authData.user;
      interviwerInfo["password"] = password;
      const interviewer = new Interviwer(interviwerInfo);
      interviewer
        .save()
        .then((result) => {
          res.status(200).json({
            status: "OK",
            id: result._id,
            msg: "Interview is Registered",
          });
        })
        .catch((err) => {
          res.status(500).json({
            status: "Failed",
            msg: "Interviewer is not Registered",
            err: err,
          });
        });
    }
  });
};

module.exports.loginInterviewer = (req, res, next) => {
  const { id, password } = req.body;
  //   const errors = validationResult(req);
  //   if (!errors.isEmpty()) {
  //     return res.status(422).json({
  //       errors: errors.array(),
  //     });
  //   }
  Interviwer.findOne({ _id: id })
    .then((interviewer) => {
      if (interviewer != null) {
        console.log(interviewer.password, password);
        if (interviewer.password === password) {
          jwt.sign(
            {
              companyId: interviewer.companyId,
              profile: interviewer.profile,
            },
            "secretkey",
            { expiresIn: "1y" },
            (err, token) => {
              if (err) {
                console.log(`some err occured ${err}`);
                res.status(500).json({
                  msg: "Failed pls Try again",
                  status: "Failed",
                });
              } else {
                res.json({
                  interviewerId: interviewer._id,
                  status: "OK",
                  token: token,
                  validity: "1y",
                });
                console.log(token);
              }
            }
          );
          console.log("login true");
        } else {
          res.json({
            status: "Failed",
            msg: "Wrong password",
          });
          console.log("wrong password");
        }
      } else {
        res.json({
          status: "Failed",
          msg: "Not Registered",
        });
        console.log("not registered");
      }
    })
    .catch((err) => {
      res.json({
        status: "Failed",
        msg: "Some issuse Occured",
      });
      console.log("some err", err);
    });
};

module.exports.interviewerApplicant = (req, res, next) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
      return;
    } else {
      // console.log(authData)
      const id = authData.companyId;
      const profile = authData.profile;
      User.find({ companyId: id.toString(), jobName: profile })
        .then((applications) => {
          if (applications != null) {
            res.status(200).json(applications);
          } else {
            res.json({ msg: "NO applications" });
          }
        })
        .catch((err) => {
          res.status(500).json({
            status: "Failed",
            msg: "Try againn",
            err: err,
          });
        });
    }
  });
};

module.exports.interviewerAddReview = (req, res, next) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(authData);
      const { status, feedback, applicatantId } = req.body;
      User.findOne({ _id: applicatantId }).then((applicant) => {
        applicant.status = status;
        applicant.feedback = feedback;
        applicant
          .save()
          .then((application) => {
            res.status(200).json(application);
          })
          .catch((err) => {
            res.status(500).json({
              status: "Failed",
              msg: "Try againn",
              err: err,
            });
          });
      });
    }
  });
};
// company delete job

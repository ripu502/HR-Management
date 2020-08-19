const Company = require("../Model/Company");
const Job = require("../Model/Jobs");
const User = require("../Model/User");
const jwt = require("jsonwebtoken");
const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

const Interviwer = require("../Model/Interviewer");
const { models } = require("mongoose");
const {
  ModelBuildContext,
} = require("twilio/lib/rest/autopilot/v1/assistant/modelBuild");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  access_type: "offline",
  auth: {
    type: "OAuth2",
    user: process.env.email,
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
          from: process.env.email,
          to: email, // send mail Id sending mail to myself
          subject: `Register the company Hr`, // Subject line
          html: `You can comfirm your Email by <a href="${process.env.hrUrl}${token}">Clicking here.</a> You will be redirected to your registration process.`, // plain text body
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
    jobName: jobName.split("$")[0],
    jobName_id: jobName.split("$")[1],
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
        from: process.env.email,
        to: email, // send mail Id sending mail to myself
        subject: `Applicant Registry`, // Subject line
        html: `You can comfirm your Email by <a href="${process.env.candidateUrl}${token}">Clicking here.</a> You will be redirected to continue your application`, // plain text body
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
            usr["feedback"] = "";
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

// company review the application requires login of company
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(authData);
      let companyId = authData.id;
      const { email, profile } = req.body;
      const InterviewerData = {
        email: email,
        profile: [profile],
        companyId: companyId,
      };
      Interviwer.findOne({ email: email })
        .then((interviewer) => {
          if (interviewer) {
            console.log("printing profile");
            console.log(interviewer.profile);
            let updatedProfile = interviewer.profile;
            updatedProfile.push(profile);
            interviewer.profile = updatedProfile;
            interviewer
              .save()
              .then((updatedInterviewer) => {
                const mailOptions = {
                  from: process.env.email,
                  to: email, // send mail Id sending mail to myself
                  subject: `Interview is assigned new profile`, // Subject line
                  html: `<p><b>you are added for ${profile} profile</b><br></p>`, // plain text body
                };
                transporter.sendMail(mailOptions, function (err, result) {
                  if (err) {
                    console.log(err);
                    res.status(422).json({
                      msg: "try again from mail",
                      err: err,
                    });
                  } else {
                    // console.log('Email Sent');
                    res.status(200).json({
                      msg: "Email is sent",
                    });
                  }
                });
              })
              .catch((err) => {
                res.status(422).json({
                  msg: "try again cant update",
                  err: err,
                });
              });
          } else {
            jwt.sign(
              { user: InterviewerData },
              "secretkey",
              { expiresIn: "15m" },
              (err, token) => {
                if (err) {
                  console.log(`some err occured ${err}`);
                } else {
                  const mailOptions = {
                    from: process.env.email,
                    to: email, // send mail Id sending mail to myself
                    subject: `Added new Interviewer`, // Subject line
                    html: `You can comfirm your Interviewer request by <a href="${process.env.interviewerUrl}${token}">Clicking here.</a> You will be redirected to generate your password.`, // plain text body
                  };
                  transporter.sendMail(mailOptions, function (err, result) {
                    if (err) {
                      console.log(err);
                      res.status(403).json({
                        msg: "try again from mail 2",
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
        })
        .catch((err) => {
          res.status(403).json({
            msg: "try again from last one",
            err: err,
          });
        });
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
  const { email, password } = req.body;
  //   const errors = validationResult(req);
  //   if (!errors.isEmpty()) {
  //     return res.status(422).json({
  //       errors: errors.array(),
  //     });
  //   }
  Interviwer.findOne({ email: email })
    .then((interviewer) => {
      if (interviewer != null) {
        console.log(interviewer.password, password);
        if (interviewer.password === password) {
          jwt.sign(
            {
              companyId: interviewer.companyId,
              id: interviewer._id,
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
      const profile = req.body.profile;
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
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

module.exports.interviewerProfiles = (req, res, next) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      Interviwer.findOne({ _id: authData.id }, { profile: 1, _id: 0 })
        .then((interviewerDetails) => {
          res.status(200).json(interviewerDetails);
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

module.exports.getInterviewer = (req, res, next) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const id = authData.id;
      Interviwer.find({ companyId: id.toString() })
        .then((result) => {
          res.status(200).json({
            status: "OK",
            interviewer: result,
          });
        })
        .catch((err) => {
          res.status(500).json({
            status: "Failed",
            err: err,
          });
        });
    }
  });
};

module.exports.information = (req, res, next) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const id = authData.id;
      Company.find(
        { _id: id.toString() },
        { password: 0, vesion: 0, resetToken: 0 }
      )
        .then((result) => {
          res.status(200).json({
            status: "OK",
            Details: result,
          });
        })
        .catch((err) => {
          res.status(500).json({
            status: "Failed",
            err: err,
          });
        });
    }
  });
};

module.exports.forgetPassCompany = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  let { email } = req.body;
  Company.findOne({ email: email })
    .then((company) => {
      if (company != null) {
        jwt.sign(
          {
            user: company._id,
          },
          "secretkey",
          {
            expiresIn: "20m",
          },
          (err, token) => {
            if (err) {
              console.log(`some err occured ${err}`);
              return res.status(500).json({
                status: "Failed",
                err: err,
              });
            } else {
              company.resetToken = token;
              company
                .save()
                .then((result) => {
                  const mailOptions = {
                    from: process.env.email,
                    to: email, // send mail Id sending mail to myself
                    subject: `Mail for reset Password`, // Subject line
                    html: `You can reset you password by using this one time recovery link. <a href="${process.env.forgetCompany}${token}">Clicking here.</a> You will be redirected to your Reset process.`, // plain text body
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
                })
                .catch((err) => {
                  res.status(500).json({
                    status: "Failed",
                    err: err,
                  });
                });
            }
          }
        );
      } else {
        return res.status(500).json({
          status: "Failed",
          err: `Company not registered, or ${email} is not your email address.`,
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        status: "Failed",
        err: err,
      });
    });
};

module.exports.forgetPassInterviewer = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  let { email } = req.body;
  Interviwer.findOne({ email: email })
    .then((interviewer) => {
      if (interviewer != null) {
        jwt.sign(
          {
            user: interviewer._id,
          },
          "secretkey",
          {
            expiresIn: "20m",
          },
          (err, token) => {
            if (err) {
              console.log(`some err occured ${err}`);
              return res.status(500).json({
                status: "Failed",
                err: err,
              });
            } else {
              interviewer.resetToken = token;
              interviewer
                .save()
                .then((result) => {
                  const mailOptions = {
                    from: process.env.email,
                    to: email, // send mail Id sending mail to myself
                    subject: `Mail for reset Password`, // Subject line
                    html: `You can reset you password by using this one time recovery link. <a href="${process.env.forgetInterviewer}${token}">Clicking here.</a> You will be redirected to your Reset process.`, // plain text body
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
                })
                .catch((err) => {
                  res.status(500).json({
                    status: "Failed",
                    err: err,
                  });
                });
            }
          }
        );
      } else {
        return res.status(500).json({
          status: "Failed",
          err: `Interviewer not registered, or ${email} is not your email address.`,
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        status: "Failed",
        err: err,
      });
    });
};

module.exports.resetPassCompany = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  const password = req.body.password;
  const token = req.body.token;
  jwt.verify(token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(authData.user);
      Company.findOne({ _id: authData.user })
        .then((company) => {
          if (company.resetToken === token) {
            company.resetToken = "";
            company.password = password;
            company
              .save()
              .then((result) => {
                res.status(200).json({
                  status: "OK",
                  msg: "Password Reset Successfully",
                });
              })
              .catch((err) => {
                res.status(500).json({
                  status: "Failed",
                  err: err,
                });
              });
          } else {
            return res
              .status(422)
              .json({ msg: "RESET link Failed", status: "Failed" });
          }
        })
        .catch((err) => {
          res.status(500).json({ status: "Failed", err: err });
        });
    }
  });
};

module.exports.resetPassInterviewer = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  const password = req.body.password;
  const token = req.body.token;
  jwt.verify(token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(authData.user);
      Interviwer.findOne({ _id: authData.user })
        .then((interviewer) => {
          if (company.resetToken === token) {
            interviewer.resetToken = "";
            interviewer.password = password;
            interviewer
              .save()
              .then((result) => {
                res.status(200).json({
                  status: "OK",
                  msg: "Password Reset Successfully",
                });
              })
              .catch((err) => {
                res.status(500).json({
                  status: "Failed",
                  err: err,
                });
              });
          } else {
            return res
              .status(422)
              .json({ msg: "RESET link Failed", status: "Failed" });
          }
        })
        .catch((err) => {
          res.status(500).json({ status: "Failed", err: err });
        });
    }
  });
};

module.exports.deleteInterviewer = (req, res, next) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      let id = req.body.id;
      Interviwer.findByIdAndDelete(id)
        .then((result) => {
          res.status(200).json({
            status: "OK",
            msg: "Interviewer is Deleted.",
          });
        })
        .catch((err) => {
          res.status(500).json({
            status: "Failed",
            err: err,
          });
        });
    }
  });
};

// company delete job

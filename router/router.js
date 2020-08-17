const router = require("express").Router();
const { check } = require("express-validator");
const Company = require("../Model/Company");

const adminHandler = require("../controller/admin");
const companyComtroller = require("../controller/company");

/**
 * Comapany
 */

router.post(
  "/company/register",
  [
    check("name").isLength({ min: 1 }).withMessage("Name is Empty"),
    check("address")
      .isLength({ min: 4 })
      .withMessage("Address is Invalid or Empty"),
    check("hrFirstName")
      .isLength({ min: 1 })
      .withMessage("First name is Empty"),

    check("email")
      .isEmail()
      .withMessage("Issue in email")
      .custom((value) => {
        return Company.findOne({ email: value }).then((com) => {
          if (com) return Promise.reject("Email address is not Valid");
        });
      })
      .normalizeEmail(),

    check("password")
      .isLength({ min: 8 })
      .withMessage("Password is empty or short"),

    check("cpassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
  ],
  companyComtroller.register
);

router.post(
  "/getMsg",
  check("phoneNo")
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile Number is not Valid"),
  companyComtroller.getMsg
);

router.post(
  "/postCode",
  [
    check("code").isLength({ min: 4, max: 4 }).withMessage("Code is wrong"),
    check("mobileNo")
      .isLength({ min: 10, max: 10 })
      .withMessage("Mobile Number is Invalid"),
  ],
  companyComtroller.postCode
);

router.post(
  "/company/login",
  [
    check("email").isEmail().withMessage("Issue in email").normalizeEmail(),

    check("password").isLength({ min: 8 }).withMessage("Incorrect password"),
  ],
  companyComtroller.login
);

router.post(
  "/addJobs",
  [
    check("jobName").isLength({ min: 1 }).withMessage("Issue in job Name"),

    check("vacancy").isNumeric().withMessage("Issue in No. of vacancy"),

    check("datefrom")
      .isLength({ min: 8, max: 10 })
      .withMessage("Issue in datefrom"),

    check("dateto")
      .isLength({ min: 8, max: 10 })
      .withMessage("Issue in dateto"),

    check("timefrom")
      .isLength({ min: 4, max: 5 })
      .withMessage("Issue in timefrom"),

    check("timeto").isLength({ min: 4, max: 5 }).withMessage("Issue in timeto"),
  ],
  verifyToken,
  companyComtroller.addJobs
);

router.post(
  "/company/add/interviewer",
  [
    check("email")
      .isEmail()
      .withMessage("Email is not correct")
      .normalizeEmail(),
    check("profile").isLength({ min: 1 }).withMessage("Profile is empty"),
  ],
  verifyToken,
  companyComtroller.addInterviwer
);

router.get(
  "/company/get/interviewers",
  verifyToken,
  companyComtroller.getInterviewer
);

router.get(
  "/company/get/information",
  verifyToken,
  companyComtroller.information
);

router.post(
  "/company/delete/interviewer",
  verifyToken,
  companyComtroller.deleteInterviewer
);

router.get("/visiter", verifyToken, companyComtroller.getVisiter);

router.get("/comapanyjobs:id", companyComtroller.getJobs);

/**
 * Visiter / applicant / Candidate
 */
router.post(
  "/visiter",
  [
    check("email").isEmail().withMessage("Issue in email").normalizeEmail(),

    check("fname").isLength({ min: 1 }).withMessage("Issue in fname"),

    check("companyId")
      .isLength({ min: 24, max: 24 })
      .withMessage("Issue in companyId"),

    check("jobName").isLength({ min: 1 }).withMessage("Issue in job"),

    check("address").isLength({ min: 4 }).withMessage("Issue in Address"),

    check("resumeUrl").isURL().withMessage("Issue in the Resume"),

    check("noticePeriod")
      .isLength({ min: 1 })
      .withMessage("Issue in the Notice Period"),

    check("source").isLength({ min: 3 }).withMessage("Issue in the Source"),
  ],
  companyComtroller.addApplication
);

router.post(
  "/save/application",
  [
    check("code")
      .isLength({ min: 4, max: 4 })
      .withMessage("Code is wrong from Basic validity"),

    check("mobileNo")
      .isNumeric()
      .isLength({ min: 10, max: 10 })
      .withMessage("Issue in mobileNo"),
  ],
  companyComtroller.postcodeAppli
);

/**
 * Interviewer
 */
router.post(
  "/interviewer/register",
  [
    check("password").isLength({ min: 6 }).withMessage("Password is too short"),
    check("token").isLength({ min: 10 }).withMessage("Token is Invalid"),
  ],
  companyComtroller.registerInterviewer
);

router.post(
  "/interviewer/login",
  [
    check("email")
      .isEmail()
      .withMessage("Email is not correct")
      .normalizeEmail(),
    check("password").isLength({ min: 6 }).withMessage("Password is Wrong"),
  ],
  companyComtroller.loginInterviewer
);

router.get(
  "/interviewer/getMyProfiles",
  verifyToken,
  companyComtroller.interviewerProfiles
);

router.post(
  "/intervier/get/applications",
  [check("profile").isLength({ min: 1 }).withMessage("profile is not present")],
  verifyToken,
  companyComtroller.interviewerApplicant
);

router.post(
  "/interviewer/post/review",
  verifyToken,
  [check("status").isLength({ min: 1 }).withMessage("Status is Required")],
  companyComtroller.interviewerAddReview
);

/**
 * Admin Super
 */
router.get("/admin/visiter", adminHandler.getVisiter);

router.get("/admin/jobs", adminHandler.getJobs);

router.get("/admin/company", adminHandler.getCompanies);
/**
 * 404 Page not found
 */

router.use(
  "/",
  // verifyToken,
  (req, res) => {
    res.status(404).json({
      msg: "Bad req",
    });
  }
);

module.exports = router;

/**
 * Helper for JWT token AUTH
 */
function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

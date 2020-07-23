const router = require("express").Router();
const { check } = require("express-validator");
const Company = require("../Model/Company");

const adminHandler = require("../controller/admin");
const companyComtroller = require("../controller/company");

router.post(
  "/registerCompany",
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
  //     .custom((value) => {
  //         return Company.findOne({ mobileNo: value })
  //             .then(com => {
  //                 if (com)
  //                     return Promise.reject('Student already exist : mobileNo');
  //             })
  //     }),
  companyComtroller.getMsg
);

router.post(
  "/postCode",
  [
    check("code")
      .isLength({ min: 4, max: 4 })
      .withMessage("Code is wrong"),
    check("mobileNo")
      .isLength({ min: 10, max: 10 })
      .withMessage("Mobile Number is Invalid"),
  ],
  companyComtroller.postCode
);

router.post(
  "/loginCompany",
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

router.get("/comapanyjobs:id", companyComtroller.getJobs);

// add the applicatent step 1
router.post(
  "/visiter",
  [
    check("email").isEmail().withMessage("Issue in email").normalizeEmail(),

    check("fname").isLength({ min: 1 }).withMessage("Issue in fname"),

    // check('mobileNo').isLength({ min: 10, max: 10 }).withMessage('Issue in mobileNo'),

    check("companyId")
      .isLength({ min: 24, max: 24 })
      .withMessage("Issue in companyId"),

    check("jobName").isLength({ min: 1 }).withMessage("Issue in job"),

    check("address").isLength({ min: 4 }).withMessage("Issue in Address"),

    check("resumeUrl").isURL().withMessage("Issue in the Resume"),

    check("noticePeroid")
      .isLength({ min: 1 })
      .withMessage("Issue in the Notice Period"),

    check("source").isLength({ min: 3 }).withMessage("Issue in the Source"),
  ],
  companyComtroller.addApplication
);

// visiter get the code from the compamy create getmsg()

// saving of application
router.post(
  "/saveapplication",
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

router.get("/visiter", verifyToken, companyComtroller.getVisiter);

// router.get('/companylogout', verifyToken, companyComtroller.logout)

// Super admin routes

router.get(
  "/admin/visiter",
  // verifyToken,
  adminHandler.getVisiter
);

router.get(
  "/admin/jobs",
  // verifyToken,
  adminHandler.getJobs
);

router.get(
  "/admin/company",
  // verifyToken,
  adminHandler.getCompanies
);

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

// making the helper for verify the presence of the jwt token
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

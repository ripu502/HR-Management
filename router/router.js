const router = require('express').Router();
const { check } = require('express-validator');
const Company = require('../Model/Company');

const adminHandler = require('../controller/admin');
const companyComtroller = require('../controller/company');

router.post('/registerCompany',
    [
        check('email')
            .isEmail()
            .withMessage('Issue in email')
            .custom((value) => {
                return Company.findOne({ email: value })
                    .then(com => {
                        if (com)
                            return Promise.reject('Company already exist : email');
                    })
            })
            .normalizeEmail(),

        check('name')
            .isLength({ min: 1 })
            .withMessage('Issue in name'),

        check('mobileNo')
            .isLength({ min: 10, max: 10 })
            .withMessage('Issue in mobileNo')
            .custom((value) => {
                return Company.findOne({ mobileNo: value })
                    .then(com => {
                        if (com)
                            return Promise.reject('Student already exist : mobileNo');
                    })
            }),

        check('password')
            .isLength({ min: 8 })
            .withMessage('Password is empty or short'),

        check('cpassword')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password confirmation does not match password');
                }
                return true;
            })
    ],
    companyComtroller.register)

router.post('/loginCompany',
    [
        check('email').isEmail().withMessage('Issue in email').normalizeEmail(),

        check('password').isLength({ min: 8 }).withMessage('Incorrect password'),

    ],
    companyComtroller.login)

router.post('/addJobs',
    [
        check('email').isEmail().withMessage('Issue in email').normalizeEmail(),

        check('job').isLength({ min: 1 }).withMessage('Issue in job'),

    ],
    verifyToken,
    companyComtroller.addJobs)

router.get('/jobs',
    verifyToken,
    companyComtroller.getJobs)

router.get('/getMsg',
    verifyToken,
    companyComtroller.getMsg);

router.post('/postCode',
    [check('code').isLength({ min: 4, max: 4 }).withMessage('Code is wrong from Basic validity'),],
    verifyToken,
    companyComtroller.postCode);

router.get('/visiter',
    verifyToken,
    companyComtroller.getVisiter);

router.post('/visiter',
    [
        check('email').isEmail().withMessage('Issue in email')
            .normalizeEmail(),

        check('name').isLength({ min: 1 }).withMessage('Issue in name'),

        check('mobileNo').isLength({ min: 10, max: 10 }).withMessage('Issue in mobileNo'),

        check('companyId').isLength({ min: 24, max: 24 }).withMessage('Issue in companyId'),

        check('job').isLength({ min: 1 }).withMessage('Issue in job'),


    ],
    companyComtroller.addApplication)


// Super admin routes 

router.get('/admin/visiter',
    // verifyToken,
    adminHandler.getVisiter);

router.get('/admin/jobs',
    // verifyToken,
    adminHandler.getJobs)

router.get('/admin/company',
    // verifyToken,
    adminHandler.getCompanies)

module.exports = router;


// making the helper for verify the presence of the jwt token
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}
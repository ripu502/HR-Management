const router = require('express').Router();

router.get('/', (req, res, next) => {
    res.status(200).json(
        {
            status: "working"
        })
})


module.exports = router;

// const controller = require('../controller/function');
// const { check } = require('express-validator');
// const jwt = require('jsonwebtoken');

// const Student = require('../models/Student');
// const User = require('../models/User');

// router.post('/auth', (req, res, next) => {
//     const { username, password } = req.body;
//     User.findOne({ username: username })
//         .then(user => {
//             if (user.username === username && user.password === password) {
//                 jwt.sign({ user: user }, 'secretkey', { expiresIn: '1h' }, (err, token) => {
//                     if (err) {
//                         console.log(`some err occured ${err}`);
//                     } else {
//                         res.json(
//                             {
//                                 token: token
//                             });
//                     }
//                 })
//             } else {
//                 res.json({ token: "failed" });
//             }
//         })
//         .catch(err => {
//             console.log(`some err occured at /auth ${err}`);
//             res.json({ data: "failed" });
//         })
// })


// router.post('/register',
//     [
//         check('email').isEmail().withMessage('Issue in email')
//             .custom((value) => {
//                 return Student.findOne({ email: value })
//                     .then(student => {
//                         if (student)
//                             return Promise.reject('Student already exist : email');
//                     })
//             }).normalizeEmail(),
//         check('mobileNumber').isLength({ min: 10, max: 10 }).withMessage('Issue in mobileNumber')
//             .custom((value) => {
//                 return Student.findOne({ mobileNumber: value })
//                     .then(student => {
//                         if (student)
//                             return Promise.reject('Student already exist : mobileNumber');
//                     })
//             }),
//         check('studentNumber').isLength({ min: 7, max: 7 }).withMessage('Issue in studentNumber')
//             .custom((value) => {
//                 return Student.findOne({ studentNumber: value })
//                     .then(student => {
//                         if (student)
//                             return Promise.reject('Student already exist : studentNumber');
//                     })
//             }),
//         check('branch').isLength({ min: 1, max: 4 }).withMessage('Issue in branch'),
//         check('fullName').isLength({ min: 1 }).withMessage('Issue in fullName'),
//         check('gender').isLength({ min: 1, max: 7 }).withMessage('Issue in gender'),
//         check('hosteler').isLength({ min: 1, max: 3 }).withMessage('Issue in hosteler'),
//         check('year').isLength({ min: 1, max: 1 }).withMessage('Issue in year'),
//         check('sport').isLength({ min: 1 }).withMessage('Issue in sport')
//     ], controller.register);

// router.post('/schedules', verifyToken, [
//     check('sportName').isLength({ min: 1 }).withMessage('Issue in sportName'),
//     check('branch1').isLength({ max: 4 }).withMessage('Issue in branch1'),
//     check('branch2').isLength({ max: 4 }).withMessage('Issue in branch2'),
//     check('venue').isLength({ min: 1 }).withMessage('Issue in venue'),
//     check('date').isLength({ min: 10, max: 10 }).withMessage('Issue in Date'),
//     check('timeStart').isLength({ min: 4, max: 4 }).withMessage('Issue in timeStart'),
//     check('timeEnd').isLength({ min: 4, max: 4 }).withMessage('Issue in timeEnd')
// ], controller.schedule);

// router.get('/schedules', controller.getSchedule);

// router.post('/medal', verifyToken, [
//     check('branch1').isLength({ min: 1, max: 4 }).withMessage('Issue in branch'),
//     check('silver').isLength({ min: 1, max: 2 }).withMessage('Issue in silver'),
//     check('gold').isLength({ min: 1, max: 2 }).withMessage('Issue in gold'),
//     check('bronze').isLength({ min: 1, max: 2 }).withMessage('Issue in bronze')
// ], controller.medal);

// router.get('/medal', controller.getMedal);

// router.post('/news', verifyToken, [
//     check('sportName').isLength({ min: 1 }).withMessage('Issue in sportName'),
//     check('summary').isLength({ min: 1 }).withMessage('Issue in summary'),
//     check('image').isLength({ min: 1 }).withMessage('Issue in image'),
//     check('date').isLength({ min: 10, max: 10 }).withMessage('Issue in date')
// ], controller.news);

// router.post('/poll', controller.poll);

// router.get('/poll', controller.getPoll);

// router.get('/news', controller.getNews);

// router.get('/register', controller.getStudent);

// router.use('/', controller.error);

// Verify Token
function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Next middleware
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }

}
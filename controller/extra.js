// let transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true,
//     auth: {
//         type: 'OAuth2',
//         user: 'user@example.com',
//         clientId: '000000000000-xxx0.apps.googleusercontent.com',
//         clientSecret: 'XxxxxXXxX0xxxxxxxx0XXxX0',
//         refreshToken: '1/XXxXxsss-xxxXXXXXxXxx0XXXxxXXx0x00xxx',
//         accessToken: 'ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x',
//         expires: 1484314697598
//     }
// });
// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     service: 'gmail',
//     port: 25,
//     secure: false,
//     auth: {
//         xoauth2: xoauth2.createXOAuth2Generator({
//             user: 'ripu502@gmail.com',
//             clientId: process.env.ClientId,
//             clientSecret: process.env.ClientSecret,
//             refreshToken: process.env.RefreshToken,
//         })
//     },
//     tls: {
//         rejectUnauthorized: false
//     }
// });

// company.save().then(result => {
//     res.status(200).json({
//         status: 'OK',
//         'msg': 'Company is Registered'
//     })
// }).catch(err => {
//     res.status(500).json({
//         status: 'Failed',
//         msg: 'Company is not Registered',
//         err: err
//     })
// })



// Company.findById(authData.id).then(company => {
//     company.noVerified = 'Yes';
//     company.save().then(done => {
//         res.status(200).json({
//             status: 'Done',
//             msg: 'Number is verified',
//             data: done,
//         })
//     }).catch(err => {
//         res.status(401).json({
//             status: 'Failed',
//             msg: 'Some backend issue',
//             err: err
//         })
//     })
// }).catch(err => {
//     console.log('some err');
//     res.status(401).json({
//         status: 'Failed',
//         msg: 'Some backend issue',
//         err: err
//     })
// })


// jwt.verify(req.token, 'secretkey', (err, authData) => {
//     if (err) {
//         res.sendStatus(403);
//         return;
//     } else {
//         // console.log(authData)
//         if (authData.verify != 'Yes') {
//             return res.status(401).json({
//                 status: "Failed",
//                 msg: 'Number not Verified'
//             })
//         }

//     }
// })


module.exports.logout = (req, res, next) => {
    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            // console.log(authData)
            await jwt.destroy(req.token);
            res.status(200).json({
                msg: 'Campany logout Success'
            })
        }
    })
}
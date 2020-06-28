const Company = require('../Model/Company');

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
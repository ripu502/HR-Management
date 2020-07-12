const express = require('express');
const mongoose = require('mongoose');
const app = express();

const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');


const { keys } = require('./keys');
const router = require('./router/router');


const port = process.env.PORT || 5000;
app.use(helmet());
app.use(compression())
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors())
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})
app.use(router);


mongoose.connect(keys.mongoUri,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(res => {
        console.log('connected');
        app.listen(port, () => {
            console.log(`server is running at http://localhost:${port}`);
        })
    })
    .catch(err => {
        console.log(`some err occured ${err}`);
    })
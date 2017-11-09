'use strict';

const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();


const corsOptions = {
    origin: '*',
    methods:'GET,PUT,POST,DELETE,OPTIONS',
    headers:'Content-Type',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

//------------- Start web api
app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());

const webPromotions = require('./promotions');
const webUsers = require('./users');
const webShops = require('./shops');

app.use("/web/promotions",webPromotions);
app.use("/web/users",webUsers);
app.use("/web/shops",webShops);

const webApi = functions.https.onRequest(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error(req.path+' Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send({code: err.status || 500, data: err.message});
    // res.render('error');
});
//------------- End web api

module.exports = webApi
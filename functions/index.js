'use strict';
const admin = require('firebase-admin');
const serviceAccount = require("./key/qzy-project-d298a91c4ae0.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://qzy-project.firebaseio.com",
    storageBucket: "qzy-project.appspot.com"
});

const firebaseKeyConfig = require("./key/firebaseKeyConfig.json");
const firebase = require('firebase');
firebase.initializeApp(firebaseKeyConfig);

const mobileApi = require('./routers/mobile/main');
const webApi = require('./routers/web/main');



module.exports = {
    mobileApi,
    webApi
};
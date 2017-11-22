const admin = require('firebase-admin');
require("babel-polyfill");

async function authenticate(req){
    const token = req.header("Authorization");
    const verifyToken = await admin.auth().verifyIdToken(token);
    return verifyToken.uid;
}

module.exports = {
    authenticate
};
const express = require('express');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const auth = require('../../services/authenticationService_transpile')
const _ = require('lodash');


const router = express.Router();

const rootUserPath = "users/web";

const mailTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: '',
        pass: ''
    }
});

const db = admin.database();

router.post('/login', function(req, res, next) {
    let params = JSON.parse(req.body);
    console.log(params);
    const firebase = require('firebase');
    firebase.auth().signInWithEmailAndPassword(params.email,params.password).catch(error => {
        console.log('Error while authenticating: ',error);
        res.send({message:error});
    }).then(loginObject => {
        if(loginObject){
            console.log('Authenticate Success!!');
            firebase.auth().currentUser.getIdToken(true).then(
                function(idToken){
                    db.ref(rootUserPath+"/"+loginObject.uid).once("value",(snapshot) => {
                        let user = snapshot.val();
                        console.log("User found: ",user);
                        if(user){
                            res.send({
                                full_name: user.full_name,
                                email: user.email,
                                birthdate: user.birthdate,
                                gender: user.gender,
                                mobile_number: user.mobile_number,
                                token: idToken,
                                role:user.role
                            });
                        }else{
                            console.log("User not found")
                            res.send({result:false});
                        }
                    });
                });
        }else{
            console.log('Oops, something went wrong while authenticating:', loginObject);
            res.send({message:error});
        }
    });
});

router.post('/signup',function(req,res,next){
    let params = JSON.parse(req.body);
    // console.log("params: ",params);
    // console.log("params.password.length: ",params.password.length);
    // console.log("params.password: ",params.password);
    // console.log("params.confirmPassword: ",params.confirmPassword);
    if(params.password.length >= 8 && params.password === params.confirmPassword){

        admin.auth().createUser({
            email: params.email,
            emailVerified: false,
            password: params.password,
            displayName: params.email,
            disabled: false
        }).then(function(userRecord){
            console.log("Create user success and send welcome to "+userRecord.email+" displayName: "+userRecord.displayName);
            
            //-------- Send welcome e-mail
            // sendWelcomeEmail(userRecord.email,userRecord.displayName);
            
            let userRef = db.ref(rootUserPath).child(userRecord.uid);
            userRef.set({
                email: params.email,
                mobile_number: params.mobile_number,
                full_name: params.full_name,
                gender: params.gender,
                birthdate: params.birthdate,
                role:params.role
            },error => {
                if(error){
                    console.log("Found error while save to database: ",error);
                    res.send({message:error});
                }
                res.send({result:true});
            });
    
        }).catch(function(error){
            console.log("Found error while create user in authen: ",error);
            res.send({message:error});
        });   
    }else{
        res.send({message:"Password not valid please try again"})
    } 
    
});

router.post('/sendFCMKey',function(req,res,next){
    
});

router.get('/searchAllUserForManagement', function(req, res, next) {
    auth.authenticate(req).then(
        function(uid){
            console.log("uid: ",uid);
            let userRef = db.ref(rootUserPath)
            let userInfo = [];
            userRef.once("value",(snapshot) => {
                let userResults = snapshot.val();
                console.log("userResults: ",userResults);
                userInfo = _.map(userResults,function(userResult){
                    let user = {};
                    user.full_name = userResult.full_name;
                    user.user_status = "O";
                    user.mobile_number = userResult.mobile_number;
                    user.email = userResult.email;
                    return user;
                });;
                res.send({result:userInfo});  
            });
            
        }
    );
});

router.post('/listUserPoint', function(req, res, next) {
    let params = req.body;
    let listUserPointResult = {};
    let result_list = [];
    let result = {};
    result.shop_id = 1234,
    result.user_point_amount = 10;
    result.is_fav = false;
    result_list.push(result);

    result = {};
    result.shop_id = 1235,
    result.user_point_amount = 15;
    result.is_fav = true;
    result_list.push(result);

    listUserPointResult.result_list = result_list;
    res.send(listUserPointResult);
});

router.post('/listFavouriteShops', function(req, res, next) {
    let params = req.body;
    let listUserFavouriteShopResult = {};
    let result_list = [];
    let result = {};
    result.shop_id = 1235,
    result.user_point_amount = 15;
    result_list.push(result);

    result = {};
    result.shop_id = 1236,
    result.user_point_amount = 20;
    result_list.push(result);
    listUserFavouriteShopResult.result_list = result_list;

    res.send(listUserFavouriteShopResult);
});

function sendWelcomeEmail(email, displayName) {
    const mailOptions = {
        from: `${APP_NAME} <noreply@firebase.com>`,
        to: email
    };
    
    // The user subscribed to the newsletter.
    mailOptions.subject = `Welcome to ${APP_NAME}!`;
    mailOptions.text = `Hey ${displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our service.`;
    return mailTransport.sendMail(mailOptions).then(() => {
        console.log('New welcome email sent to:', email);
    });
}



module.exports = router;
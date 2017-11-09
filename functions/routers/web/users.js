const express = require('express');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const router = express.Router();



const mailTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'nitipat.bank2016@gmail.com',
        pass: 'P@ssw0rd!1;ikoomNbank'
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
            firebase.auth().currentUser.getIdToken(true).then(function(idToken){
                db.ref("users/"+loginObject.uid).once("value",(snapshot) => {
                    let user = snapshot.val();
                    console.log("User found: ",user);
                    if(user){
                        res.send({
                            full_name: user.email,
                            email: user.email,
                            birthdate: user.birthdate,
                            gender: user.gender,
                            mobile_number: user.mobile_number,
                            token: idToken
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
    if(params.password.length >= 8 && params.password === params.comfirmPassword){

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
    
            let userRef = db.ref('users').child(userRecord.uid);
            userRef.set({
                email: params.email,
                mobile_number: params.mobile_number,
                nickname: params.nickname,
                full_name: params.full_name,
                gender: params.gender,
                birthdate: params.birthdate
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
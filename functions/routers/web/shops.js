const express = require('express');
const admin = require('firebase-admin');
const auth = require('../../services/authenticationService_transpile')
const is = require('is_js');
const _ = require('lodash');
const moment = require('moment');

const router = express.Router();


const db = admin.database();


router.post('/saveShop', function(req, res, next) {
    auth.authenticate(req).then(
        function(uid){
            let params = JSON.parse(req.body);
            let shopRef = db.ref('shops')
            let shopId;
            if(is.not.empty(params.shop_id)){
                shopId = params.shop_id;
            }else{
                shopId = shopRef.push().key;
                params.shop_id = shopId;
            }
            shopRef.child(shopId).set({
                shop_id: shopId,
                shop_name: params.shop_name,
                shop_category: params.category,
                shop_tel: params.telephone,
                shop_email: params.email,
                shop_status: "C",
                shop_owner: uid
            },error => {
                if(error){
                    console.log("Found error while save to database: ",error);
                    res.send({message:error});
                }
                res.send({shop_info:params});
            });
        }
    );
});

router.post('/searchShop', function(req, res, next) {
    auth.authenticate(req).then(
        function(uid){
            let shopRef = db.ref('shops')
            let shopInfo = {};
            shopRef.orderByChild("shop_owner").equalTo(uid).once("value",(snapshot) => {
                let shopInfo = snapshot.val();
                console.log("shopInfo: ",shopInfo);
                let shopResult = _.map(shopInfo,function(shop){
                    let result = {};
                    result.shop_category = shop.shop_category;
                    result.shop_name = shop.shop_name;
                    result.shop_owner = shop.shop_owner;
                    result.shop_id = shop.shop_id;
                    return result;
                });
                res.send({shop_info:shopResult})  ;  
            });
            
        }
    );
});

router.get('/searchAllShopForManagement', function(req, res, next) {
    auth.authenticate(req).then(
        function(uid){
            console.log("uid: ",uid);
            let shopRef = db.ref('shops')
            let shopInfo = [];
            shopRef.once("value",(snapshot) => {
                let shopResults = snapshot.val();
                console.log("shopResults: ",shopResults);
                shopInfo = _.map(shopResults,function(shopResult){
                    let shop = {};
                    shop.shop_id = shopResult.shop_id;
                    shop.shop_name = shopResult.shop_name;
                    shop.shop_status = shopResult.shop_status;
                    shop.shop_tel = shopResult.shop_tel;
                    shop.shop_email = shopResult.shop_email;
                    return shop;
                });;
                res.send({result:shopInfo});  
            });
            
        }
    );
});

module.exports = router;
const express = require('express');
const admin = require('firebase-admin');
const is = require('is_js');
const _ = require('lodash');
const moment = require('moment');
const path = require('path');
const os = require('os');
const qr = require('qr-image');
const fs = require("fs");
const shopWithPromotionService = require('../../services/shopWithPromotionService_transpile')
const auth = require('../../services/authenticationService_transpile')
const fileService = require('../../services/fileService_transpile')

const router = express.Router();
const db = admin.database();
const constant_promotions = "promotions";

router.get('/listImageNewestPropmotions/:current_date', function(req, res, next) {
    let result = {};
    let promoList = [];
    const currentDate = moment(req.params.current_date,'YYYYMMDD').unix();
    shopWithPromotionService.findPromotionByCurrentDate(currentDate).then(
        function(promotions){
            if(is.not.empty(promotions)){
                promoList = _.map(promotions,function(promo){
                                let promotion = {};
                                promotion.promo_image_path = promo.promo_image_path;
                                promotion.promo_code = promo.promo_code;
                                promotion.shop_id = promo.shop_id;
                                promotion.promo_id = promo.promo_id;
                                promotion.is_fav = false;
                                return promotion;
                            });
            }        
            result.promoList = promoList;
            res.send(result);
        }
    );
});

router.get('/listAllShopWithNewestPromotion/:current_date', function(req, res, next) {
    let result = {};
    const currentDate = moment(req.params.current_date,'YYYYMMDD').unix();

    shopWithPromotionService.shopInfoWithPromotion(currentDate).then(
        function(data){
            result.promoList = data;
            // console.log(data);
            res.send(result);
        }
    );
});


/*
*  Mobile prepare qr code for web request
*/
router.post('/prepareUsePromotions', function(req, res, next) {
    let params = JSON.parse(req.body);
    // shop_id
    // promo_id
    // user_id
    let result = {};
    const token = req.header("Authorization");
    let currentDate = moment();
    console.log("current_date",currentDate);
    console.log("current_date in unix: ",currentDate.unix());
    auth.authenticate(req).then(
        function(uid){
            shopWithPromotionService.findPromotionByPromoId(params.promo_id).then(
                function(promotion){
                    const epoch = currentDate.unix();
                    const redeemCode = new Buffer(params.shop_id+":"+params.promo_id+":"+uid+":"+epoch).toString('base64');
                    let preparedUrl = req.protocol + '://' + req.get('host') + 
                                      "/webApi/web/promotions/saveUsedPromotion/" +
                                      redeemCode;
                    console.log("preparedUrl: ",preparedUrl);
                    const qrFileName = redeemCode + "_" + epoch + ".png";
                    const tempFilePath = path.join(os.tmpdir(), qrFileName);
                    console.log("tempFilePath: ",tempFilePath);
                    const qr_svg = qr.image(preparedUrl, { type: 'png' });
                    qr_svg.pipe(fs.createWriteStream(tempFilePath));
                    
                    // const svg_string = qr.imageSync(preparedUrl, { type: 'png' });
                    let qrParams = {}
                    qrParams.fileName = qrFileName;
                    qrParams.fileUploadPath = path.join("qr_code",qrFileName);
                    fileService.uploadFileWithStream(qrParams).then(
                        function(url){
                            result.qr_image_path = url;
                            result.promo_redeem_code = promotion.promo_code;
                            res.send(result);
                        }
                    );
                }
            );
        }
    );
});


/*
*  Mobile read qr from web and reqest to this method
*/
router.post('/saveUsedPromotion/:redeemCode', function(req, res, next) {
    //----- redeem code => shopId:promoId:salt(date-time in epoch)
    auth.authenticate(req).then(
        function(uid){
            if(is.not.empty(uid) && is.not.null(uid)){
                const redeemCodeEncode = req.params.redeemCode;
                if(is.not.empty(redeemCodeEncode)){
                    const redeemCode = new Buffer(redeemCodeEncode,"base64").toString('ascii');
                    const shopId = redeemCode.split(":")[0];
                    const promoId = redeemCode.split(":")[1];
                    console.log("shopId: ",shopId);
                    console.log("promoId: ",promoId);
                    // find user from uid
                    // find promoId from promoId
                    // find shopId from shopId
                    let userRef = db.ref('users/customer');
                    userRef.child(uid).once("value", (snap) =>{
                        let user = snap.val();
                        console.log("user: ",user);
                        shopWithPromotionService.findPromotionByPromoId(promoId).then(
                            function(promotion){
                                let user_point_amount = user.user_point + promotion.promo_point;
                                userRef.child(uid).update({
                                    user_point: user_point_amount
                                },error => {
                                    if(error){
                                        console.log("Found error while save to database: ",error);
                                        res.send({message:error});
                                    }
                                    let result = {};
                                    result.user_point_amount = user_point_amount;
                                    res.send(result);
                                });
                            }
                        );
                    });
                    
                }
            }else{
                res.send({message:"User not found"})
            }
        }
    );
});

router.get('/listAllShopPromotions/:shop_id', function(req, res, next) {
    let shopId = req.params.shop_id;
    if(is.not.empty(shopId) && is.not.null(shopId)){
        let shopPromotion = {};
        let promoList = [];
        shopWithPromotionService.findShopFromShopId(shopId).then(
            function(shop){
                if(is.not.null(shop)){
                    shopPromotion.shop_id = shop.shop_id;
                    shopPromotion.shop_name = shop.shop_name;
                    shopPromotion.is_fav = true;
                    shopWithPromotionService.findAllPromotionByShopId(shopId).then(
                        function(promotions){
                            promoList = _.map(promotions,function(promo){
                                            let promotion = {};
                                            promotion.promo_id = promo.promo_id;
                                            promotion.promo_code = promo.promo_code;
                                            promotion.promo_description = promo.promo_description;
                                            promotion.promo_image_path = promo.promo_image_path;
                                            return promotion;
                                        });

                            shopPromotion.promoList = promoList;            
                            res.send(shopPromotion);
                        }
                    );
                }
            }
        );
    }
});

router.get('/findPromotionDetail/:shop_id/:promo_id', function(req, res, next) {
    let shopId = req.params.shop_id;
    let promoId = req.params.promo_id;
    console.log("shopId: "+shopId+" promoId: "+promoId);
    if(!_.isNil(shopId) && !_.isNil(promoId)){
        shopWithPromotionService.findShopFromShopId(shopId).then(
            function(shop){
                shopWithPromotionService.findPromotionByPromoId(promoId).then(
                    function(promotion){
                        let promotionDetail = {};
                        promotionDetail.shop_id = shop.shop_id;
                        promotionDetail.shop_name = shop.shop_name;
                        promotionDetail.promo_id = promotion.promo_id;
                        promotionDetail.promo_image_path = promotion.promo_image_path;
                        promotionDetail.promo_code = promotion.promo_code;
                        promotionDetail.promo_start = promotion.promo_start;
                        promotionDetail.promo_end = promotion.promo_end;
                        promotionDetail.promo_description = promotion.promo_description;
                        promotionDetail.promo_detail = promotion.promo_detail;
                    
                        res.send(promotionDetail);
                    }
                );
            }
        );
    }
});


module.exports = router;
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

const savePromotion = function(params,res,promotionRef){
    promotionRef.child(params.promo_id).set({
        promo_id: params.promo_id,
        promo_image_path: params.downloadUrl,
        promo_code: params.promo_code,
        promo_start: params.promo_start,
        promo_end: params.promo_end,
        promo_description: params.promo_description,
        promo_detail: params.promo_detail,
        shop_id: params.shop_id,
        promo_point: params.promo_point,
        promo_createDate: moment().unix()
    },error => {
        if(error){
            console.log("Found error while save to database: ",error);
            res.send({message:error});
        }
        params.file_upload = "";
        res.send({promo_info:params});
    });
}

router.post('/savePromotion', function(req, res, next) {
    auth.authenticate(req).then(
        function(uid){
            // console.log("uid: ",uid);
            if(is.not.undefined(uid) && is.not.empty(uid)){
                let params = JSON.parse(req.body);
                console.log("params: ",params);
                let promotionId;
                let promotionRef = db.ref(constant_promotions);
                if(is.not.empty(params.promo_id)){
                    promotionId = params.promo_id;
                }else{
                    promotionId = promotionRef.push().key;
                    params.promo_id = promotionId;
                }
                let downloadUrl = "";
                // console.log("fileParam.fileUpload: ",fileParam.fileUpload);
                // console.log("fileParam.fileName: ",fileParam.fileName);
                const fileUpload = params.file_upload;
                params.downloadUrl = "";
                if(is.not.empty(fileUpload)){
                    // console.log("fileUpload: ",fileUpload);
                    // console.log("fileUpload.filename: ",fileUpload.filename);
                    // console.log("constant_promotions: ",constant_promotions);
                    // console.log("params.shop_id: ",params.shop_id);
                    // console.log("promotionId: ",promotionId);
                    const fileUploadPath = path.join(constant_promotions,params.shop_id,promotionId,fileUpload.filename);
                    let fileParam = {};
                    fileParam.fileUpload = fileUpload.base64;
                    fileParam.fileName = fileUpload.filename;
                    fileParam.fileUploadPath = fileUploadPath;
                    fileService.uploadFileWithBase64(fileParam).then(
                        function(url){
                            // console.log("downloadUrl: ",url);
                            params.downloadUrl = url;
                            savePromotion(params,res,promotionRef);
                        }
                    );
                }else{
                    savePromotion(params,res,promotionRef);
                }
            }else{
                res.send({result:"User not found"});
            }
        }
    );
});

router.post('/findPromotions',function(req, res){
    auth.authenticate(req).then(
        function(uid){
            let params = JSON.parse(req.body);
            let shopId = params.shop_id;
            if(is.not.empty(shopId)){
                let promotionRef = db.ref(constant_promotions);
                let paramPromoCode = "";
                let paramPromoDescription = "";
                promotionRef.orderByChild('shop_id').equalTo(shopId).once("value",(snapshot) => {
                    let promoList = [];
                    let promotions = snapshot.val();
                    console.log("promotions: ",promotions);
                    promoList = _.map(promotions,function(promo){
                        let promotion = {};
                        promotion.promo_id = promo.promo_id;
                        promotion.promo_code = promo.promo_code;
                        promotion.promo_start = promo.promo_start;
                        promotion.promo_end = promo.promo_end;
                        promotion.promo_description = promo.promo_description;
                        promotion.shop_id = promo.shop_id;
                        promotion.promo_point = promo.promo_point;
                        return promotion;
                    });
                    res.send({promo_list:promoList})    
                });
            }
        }
    );
});

router.get('/findPromotionById/:promoId',function(req, res){
    auth.authenticate(req).then(
        function(uid){
            let promoId = req.params.promoId;
            if(is.not.empty(promoId)){
                let promotionRef = db.ref(constant_promotions);
                let paramPromoCode = "";
                let paramPromoDescription = "";
                promotionRef.child(promoId).once("value",(snapshot) => {
                    let promotion = snapshot.val();
                    console.log("promotion: ",promotion);
                    res.send({promotion:promotion})    
                });
            }
        }
    );
});

/*
*  Web prepare qr code for mobile request
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
                    const redeemCode = new Buffer(params.shop_id+":"+params.promo_id+":"+epoch).toString('base64');
                    let preparedUrl = req.protocol + '://' + req.get('host') + 
                                      "/mobileApi/mobile/promotions/saveUsedPromotion/" +
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
*  Web read qr from mobile and reqest to this method
*/
router.post('/saveUsedPromotion/:redeemCode', function(req, res, next) {
    //----- redeem code => shopId:promoId:uid:salt(date-time in epoch)
    auth.authenticate(req).then(
        function(uid){
            if(is.not.empty(uid) && is.not.null(uid)){
                const redeemCodeEncode = req.params.redeemCode;
                if(is.not.empty(redeemCodeEncode)){
                    const redeemCode = new Buffer(redeemCodeEncode,"base64").toString('ascii');
                    const shopId = redeemCode.split(":")[0];
                    const promoId = redeemCode.split(":")[1];
                    const user_uid = redeemCode.split(":")[2];
                    console.log("shopId: ",shopId);
                    console.log("promoId: ",promoId);
                    // find user from uid
                    // find promoId from promoId
                    // find shopId from shopId
                    let userRef = db.ref('users/customer');
                    userRef.child(user_uid).once("value", (snap) =>{
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



module.exports = router;
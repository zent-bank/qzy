const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();


const db = admin.database();

router.get('/listImageNewestPropmotions/:current_date', function(req, res, next) {
    
    const bucket = admin.storage().bucket();
    const file = bucket.file('promotion1.jpg');
    const config = {
        action: 'read',
        expires: '12-31-2025'
    };
    let currentDate = req.params.current_date;
    let result = {};
    let promoList = [];
    let promotion = {};

    file.getSignedUrl(config,function(err, url){
        if(err){
            console.log("Found error read storage: ",err);
            return;
        }

        promotion.promo_image_path = url;
        promotion.shop_id = 123;
        promotion.promo_code = "ABC123";
        promotion.is_fav = false;
        promoList.push(promotion);
    
        promotion = {};
        promotion.promo_image_path = url;
        promotion.shop_id = 124;
        promotion.promo_code = "DEF123";
        promotion.is_fav = true;
        promoList.push(promotion);
    
        result.promoList = promoList;
        res.send(result);
    });

    
});

router.get('/listAllShopWithNewestPromotion/:current_date', function(req, res, next) {
    let currentDate = req.params.current_date;
    let result = {};
    let promoList = [];
    let promotion = {};
    
    promotion.shop_id = 123;
    promotion.shop_name = "shop_test1";
    promotion.promo_code = "ABC123";
    promotion.promo_description = "ส่วนลด";
    promotion.is_fav = false;
    promoList.push(promotion);

    promotion = {};
    promotion.shop_id = 124;
    promotion.shop_name = "shop_test2";
    promotion.promo_code = "DEF123";
    promotion.promo_description = "ส่วนลด";
    promotion.is_fav = true;
    promoList.push(promotion);
    
    result.promoList = promoList;
    res.send(result);
});

router.get('/listAllShopPromotions/:shop_id', function(req, res, next) {
    let shopId = req.params.shop_id;
    let shopPromotion = {};

    let promoList = [];
    let promotion = {};
    shopPromotion.shop_id = 1234;
    shopPromotion.shop_name = "shop_test1";
    shopPromotion.user_point_amount = 10;
    shopPromotion.is_fav = true;
    
    promotion.promo_id = 12345;
    promotion.promo_code = "ABC123";
    promotion.promo_description = "ส่วนลด";
    promotion.promo_image_path = "";
    promoList.push(promotion);

    promotion = {};
    promotion.promo_id = 12346;
    promotion.promo_code = "DEF123";
    promotion.promo_description = "ส่วนลด";
    promotion.promo_image_path = "";
    promoList.push(promotion);

    shopPromotion.promoList = promoList;

    res.send(shopPromotion);
});

router.get('/findPromotionDetail/:shop_id/:promo_id', function(req, res, next) {
    let shopId = req.params.shop_id;
    let promoId = req.params.promo_id;
    console.log("shopId: "+shopId+" promoId: "+promoId);

    let promotionDetail = {};
    promotionDetail.shop_id = 1234;
    promotionDetail.shop_name = "shop test1";
    promotionDetail.user_point_amount = 10;
    promotionDetail.promo_id = 12345;
    promotionDetail.promo_image_path = "";
    promotionDetail.promo_code = "ABC123";
    promotionDetail.promo_start = "01/01/2017";
    promotionDetail.promo_end = "31/10/2017";
    promotionDetail.promo_description = "ส่วนลด";
    promotionDetail.promo_detail = "รายละเอียด Promotion";

    res.send(promotionDetail);
});

router.post('/prepareUsePromotions', function(req, res, next) {
    let params = req.body;
    let result = {};
    result.qr_image_path = "";
    result.promo_redeem_code = "X123456789";
    res.send(result);
});

router.post('/saveUsedPromotion', function(req, res, next) {
    let params = req.body;
    let result = {};
    result.user_point_amount = 10;
    res.send(result);
});


module.exports = router;
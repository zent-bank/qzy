const express = require('express');
const admin = require('firebase-admin');
const is = require('is_js');
const _ = require('lodash');
const moment = require('moment');

const router = express.Router();
const db = admin.database();
const constant_promotions = "promotions";
const constant_shops = "shops";
const promotionRef = db.ref(constant_promotions);
const shopRef = db.ref(constant_shops);
require("babel-polyfill");

async function shopInfoWithPromotion(currentDate){
    let promoList = [];
    let promotionInfo = await promotionRef.orderByChild("promo_createDate").startAt(currentDate).once("value");
    for(let [key,value] of Object.entries(promotionInfo.val())){
        
        let shopId = value.shop_id;
        // console.log("shopId: ",shopId);
        const shopInfo = await shopRef.child(shopId).once("value");
        // console.log("shopInfo.val(): ",shopInfo.val());
        let promotion = {};
        promotion.shop_id = shopId;
        promotion.shop_name = shopInfo.val().shop_name;
        promotion.promo_code = value.promo_code;
        promotion.promo_description = value.promo_description;
        promotion.promo_id = value.promo_id;
        promotion.is_fav = false;
        
        promoList.push(promotion);
    }
   
    return promoList;
   
}

async function findPromotionByCurrentDate(currentDate){
    let promotions = await promotionRef.orderByChild("promo_createDate").startAt(currentDate).once("value");
    return promotions.val();
}

async function findAllPromotionByShopId(shopId){
    let promotions= await promotionRef.orderByChild("shop_id").startAt(shopId).once("value");
    return promotions.val();
}

async function findPromotionByPromoId(promoId){
    let promotion = await promotionRef.child(promoId).once("value");
    return promotion.val();
}

async function findShopFromShopId(shopId){
    let shop = await shopRef.child(shopId).once("value");
    return shop.val();
}

module.exports = {
    shopInfoWithPromotion,
    findPromotionByCurrentDate,
    findAllPromotionByShopId,
    findPromotionByPromoId,
    findShopFromShopId
};